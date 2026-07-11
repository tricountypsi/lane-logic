import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLanePlayStore } from '@/features/lane-play';

import { calculateScores } from '../utils/scoreCalculator';
import { isFrameComplete, pinsStandingForNextRoll, FRAME_COUNT, PINS_PER_RACK } from '../utils/frameRules';
import type { CompletedGame, BowlingSession, SessionType } from '../types';
import { SESSION_GAME_LIMIT } from '../types';

const FULL_RACK = (): boolean[] => Array(PINS_PER_RACK).fill(true);
const EMPTY_GAME = (): number[][] => Array.from({ length: FRAME_COUNT }, () => []);

interface ScoringState {
  /** Raw pinfall per ball, grouped by frame. The single source of truth — frame/cumulative scores are always derived from this via `calculateScores`, never stored. */
  frames: number[][];
  currentFrameIndex: number;
  isGameComplete: boolean;

  /**
   * Snapshot of the shared `lane-play` PinRack taken right before the ball
   * about to be thrown. `submitBall` diffs the rack's *current* state
   * against this snapshot to derive how many pins fell on that one ball —
   * the rack itself only ever represents "what's standing right now", so
   * pinfall has to be inferred rather than read directly.
   */
  pinsStandingBeforeBall: boolean[];

  /** Session management */
  sessionType: SessionType;
  /** Games completed in the current active session (not yet saved or discarded). */
  currentSessionGames: CompletedGame[];
  /** All sessions the bowler has chosen to save. Newest first. */
  savedSessions: BowlingSession[];

  /** Reads the shared PinRack, records this ball's pinfall against the current frame, advances frame/game state, and re-racks the shared pins when a frame (or a 10th-frame fill ball) calls for it. */
  submitBall: () => void;
  /** Starts the next game within the current session — resets frames, oil, shots, and boards but preserves `currentSessionGames`. */
  startNewGame: () => void;
  /** Switch session type. Locked while a session is in progress (currentSessionGames.length > 0). */
  setSessionType: (type: SessionType) => void;
  /** Commit the current session to history. Resets everything for the next session. */
  saveSession: () => void;
  /** Abandon the current session without saving. Resets everything. */
  discardSession: () => void;
  /** Wipe all saved session history. */
  clearHistory: () => void;
}

export const useScoringStore = create<ScoringState>()(
  persist(
    (set, get) => ({
      frames: EMPTY_GAME(),
      currentFrameIndex: 0,
      isGameComplete: false,
      pinsStandingBeforeBall: FULL_RACK(),
      sessionType: 'Practice',
      currentSessionGames: [],
      savedSessions: [],

      submitBall: () => {
        const { frames, currentFrameIndex, isGameComplete, pinsStandingBeforeBall } = get();
        if (isGameComplete) return;

        const lanePlay = useLanePlayStore.getState();

        const standingBefore = pinsStandingBeforeBall.filter(Boolean).length;
        const standingAfter = lanePlay.pins.filter(Boolean).length;
        const pinfall = Math.max(0, standingBefore - standingAfter);

        const updatedFrames = frames.map((rolls, i) =>
          i === currentFrameIndex ? [...rolls, pinfall] : rolls
        );
        const updatedRolls = updatedFrames[currentFrameIndex];

        // Spare shots (any ball after the first in a frame) don't deplete oil —
        // the bowler aims directly at remaining pins rather than driving through
        // the oil pattern the way a strike ball does.
        const isContinuationBall = frames[currentFrameIndex].length > 0;
        lanePlay.logShot(false, isContinuationBall);

        // Two patches to the entry `logShot` just created, both only
        // relevant for ball 2+ of a frame (a fresh first ball is always
        // correctly labeled already):
        //
        // 1. `logShot` always labels an all-clear rack as "Strike", which is
        //    only actually true when the ball was thrown at a freshly-racked
        //    10 pins. Clearing out whatever was left standing from a prior
        //    ball is a spare conversion, not a strike.
        // 2. If the *previous* ball in this same frame carried a
        //    `frictionAlert` (it left the weak-side corner pin standing —
        //    10 for a right-handed bowler, 7 for a left-handed bowler),
        //    that signal needs to survive onto this ball too — most bowlers
        //    log a whole frame's balls only after they've thrown both, so
        //    by the time this entry exists the coach needs to already see
        //    the friction read rather than losing it the moment "Spare"
        //    overwrites the leave text.
        const isSpareClose = standingAfter === 0 && standingBefore !== PINS_PER_RACK;
        const previousBallInFrame = isContinuationBall ? useLanePlayStore.getState().shotLog[1] : undefined;
        const carryFrictionForward = Boolean(previousBallInFrame?.frictionAlert);

        if (isSpareClose || carryFrictionForward) {
          useLanePlayStore.setState((state) => ({
            shotLog: state.shotLog.map((shot, i) =>
              i === 0
                ? {
                    ...shot,
                    ...(isSpareClose ? { leave: 'Spare' } : {}),
                    frictionAlert: shot.frictionAlert || carryFrictionForward,
                  }
                : shot
            ),
          }));
        }

        const frameDone = isFrameComplete(currentFrameIndex, updatedRolls);
        const isLastFrame = currentFrameIndex === FRAME_COUNT - 1;
        const gameDone = isLastFrame && frameDone;

        const needsFreshRack = frameDone
          ? !gameDone
          : pinsStandingForNextRoll(currentFrameIndex, updatedRolls) === PINS_PER_RACK;

        if (needsFreshRack) {
          useLanePlayStore.setState({ pins: FULL_RACK() });
        }

        set({
          frames: updatedFrames,
          currentFrameIndex: frameDone && !isLastFrame ? currentFrameIndex + 1 : currentFrameIndex,
          isGameComplete: gameDone,
          pinsStandingBeforeBall: needsFreshRack ? FULL_RACK() : useLanePlayStore.getState().pins,
        });

        if (gameDone) {
          const results = calculateScores(updatedFrames);
          const finalScore = results[FRAME_COUNT - 1].cumulativeScore ?? 0;
          const completedGame: CompletedGame = {
            id: `${Date.now()}`,
            playedAt: new Date().toISOString(),
            frames: updatedFrames,
            finalScore,
          };
          set((state) => ({
            currentSessionGames: [...state.currentSessionGames, completedGame],
          }));
        }
      },

      startNewGame: () => {
        // Reset the lane condition for a fresh game within the session.
        useLanePlayStore.getState().resetSession();
        set({
          frames: EMPTY_GAME(),
          currentFrameIndex: 0,
          isGameComplete: false,
          pinsStandingBeforeBall: FULL_RACK(),
          // currentSessionGames intentionally preserved — the session continues.
        });
      },

      setSessionType: (type) => {
        // Guard: don't allow switching mid-session.
        if (get().currentSessionGames.length > 0) return;
        set({ sessionType: type });
      },

      saveSession: () => {
        const { currentSessionGames, sessionType } = get();
        if (currentSessionGames.length === 0) return;

        const total = currentSessionGames.reduce((sum, g) => sum + g.finalScore, 0);
        const averageScore = Math.round(total / currentSessionGames.length);

        const session: BowlingSession = {
          id: `${Date.now()}`,
          type: sessionType,
          completedAt: new Date().toISOString(),
          games: currentSessionGames,
          averageScore,
        };

        // Save session, clear in-progress data, reset for next session.
        useLanePlayStore.getState().resetSession();
        set((state) => ({
          savedSessions: [session, ...state.savedSessions],
          currentSessionGames: [],
          frames: EMPTY_GAME(),
          currentFrameIndex: 0,
          isGameComplete: false,
          pinsStandingBeforeBall: FULL_RACK(),
        }));
      },

      discardSession: () => {
        useLanePlayStore.getState().resetSession();
        set({
          currentSessionGames: [],
          frames: EMPTY_GAME(),
          currentFrameIndex: 0,
          isGameComplete: false,
          pinsStandingBeforeBall: FULL_RACK(),
        });
      },

      clearHistory: () => set({ savedSessions: [] }),
    }),
    {
      name: 'scoring-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        frames: state.frames,
        currentFrameIndex: state.currentFrameIndex,
        isGameComplete: state.isGameComplete,
        sessionType: state.sessionType,
        currentSessionGames: state.currentSessionGames,
        savedSessions: state.savedSessions,
      }),
    }
  )
);
