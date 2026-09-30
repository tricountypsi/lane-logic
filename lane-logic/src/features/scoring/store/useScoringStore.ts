import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { useLanePlayStore } from '@/features/lane-play';
import { supabase } from '@/lib/supabase';
import { calculateScores } from '../utils/scoreCalculator';
import { isFrameComplete, pinsStandingForNextRoll, FRAME_COUNT, PINS_PER_RACK } from '../utils/frameRules';
import type { CompletedGame, BowlingSession, SessionType } from '../types';
import { SESSION_GAME_LIMIT } from '../types';

/** Cross-platform alert — browser window.alert on web (always visible), Alert.alert on native. */
function showAlert(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
}

const FULL_RACK = (): boolean[] => Array(PINS_PER_RACK).fill(true);
const EMPTY_GAME = (): number[][] => Array.from({ length: FRAME_COUNT }, () => []);

interface ScoringState {
  /** Raw pinfall per ball, grouped by frame. Single source of truth — scores derived via calculateScores. */
  frames: number[][];
  currentFrameIndex: number;
  isGameComplete: boolean;

  /**
   * Snapshot of the shared lane-play PinRack taken right before the ball
   * about to be thrown. submitBall diffs the rack's current state against
   * this snapshot to derive pinfall.
   */
  pinsStandingBeforeBall: boolean[];

  /**
   * Edit mode — when non-null the user is correcting a past frame.
   * submitBall routes into the edit path instead of the normal path.
   */
  editingFrameIndex: number | null;
  /** Balls entered so far during the current edit session. */
  editingRolls: number[];

  /** Session management */
  sessionType: SessionType;
  /** Games completed in the current active session (not yet saved or discarded). */
  currentSessionGames: CompletedGame[];
  /** All sessions the bowler has chosen to save. Newest first. */
  savedSessions: BowlingSession[];
  /** Non-null when the last saveSession call hit a Supabase error. */
  lastSaveError: string | null;

  /** Records this ball's pinfall, advances frame/game state, and re-racks pins. */
  submitBall: () => void;
  /** Starts the next game within the current session. */
  startNewGame: () => void;
  /** Switch session type. Locked while a session is in progress. */
  setSessionType: (type: SessionType) => void;
  /**
   * Enter edit mode for a completed frame. Resets the pin rack so the user
   * re-enters every ball for that frame from scratch. Delivery metrics stored
   * in useDeliveryStore for that frame index are shown automatically.
   */
  setEditingFrame: (index: number) => void;
  /** Cancel an in-progress edit without committing any changes. */
  cancelEditing: () => void;
  /** Commit the current session to Supabase, then clear local state. */
  saveSession: () => Promise<void>;
  /** Abandon the current session without saving. */
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
      editingFrameIndex: null,
      editingRolls: [],
      sessionType: 'Practice',
      currentSessionGames: [],
      savedSessions: [],
      lastSaveError: null,

      submitBall: () => {
        const {
          frames,
          currentFrameIndex,
          isGameComplete,
          pinsStandingBeforeBall,
          editingFrameIndex,
          editingRolls,
        } = get();

        // Block normal play once game is done; editing past frames is still allowed.
        if (isGameComplete && editingFrameIndex === null) return;

        const lanePlay = useLanePlayStore.getState();
        const standingBefore = pinsStandingBeforeBall.filter(Boolean).length;
        const standingAfter = lanePlay.pins.filter(Boolean).length;
        const pinfall = Math.max(0, standingBefore - standingAfter);

        // ── EDIT MODE ──────────────────────────────────────────────────────────
        if (editingFrameIndex !== null) {
          const newEditRolls = [...editingRolls, pinfall];
          const isContinuationBall = editingRolls.length > 0;

          lanePlay.logShot(false, isContinuationBall);

          // Patch spare label / carry friction alert (same logic as normal mode).
          const isSpareClose = standingAfter === 0 && standingBefore !== PINS_PER_RACK;
          const previousBallInFrame = isContinuationBall
            ? useLanePlayStore.getState().shotLog[1]
            : undefined;
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

          const editFrameDone = isFrameComplete(editingFrameIndex, newEditRolls);

          if (editFrameDone) {
            // Commit corrected rolls into the frames array.
            const updatedFrames = frames.map((f, i) =>
              i === editingFrameIndex ? newEditRolls : f
            );

            // Re-check whether the 10th frame is still complete after the edit.
            const gameStillComplete = isFrameComplete(
              FRAME_COUNT - 1,
              updatedFrames[FRAME_COUNT - 1]
            );

            // Keep currentSessionGames in sync if a completed game was already logged.
            let updatedSessionGames = get().currentSessionGames;
            if (isGameComplete || gameStillComplete) {
              const results = calculateScores(updatedFrames);
              const finalScore = results[FRAME_COUNT - 1].cumulativeScore ?? 0;
              updatedSessionGames = updatedSessionGames.map((g, i) =>
                i === updatedSessionGames.length - 1
                  ? { ...g, frames: updatedFrames, finalScore }
                  : g
              );
            }

            // Reset pin rack to all-dark for the frame the bowler is actually on.
            useLanePlayStore.setState({ pins: Array(10).fill(false) });

            set({
              frames: updatedFrames,
              editingFrameIndex: null,
              editingRolls: [],
              isGameComplete: gameStillComplete,
              pinsStandingBeforeBall: FULL_RACK(),
              currentSessionGames: updatedSessionGames,
            });
          } else {
            // More balls needed in this edit frame — set up rack for next ball.
            const pinsNowStanding = useLanePlayStore.getState().pins;
            const nextPinsNeeded = pinsStandingForNextRoll(editingFrameIndex, newEditRolls);
            useLanePlayStore.setState({ pins: Array(10).fill(false) });
            set({
              editingRolls: newEditRolls,
              pinsStandingBeforeBall:
                nextPinsNeeded === PINS_PER_RACK ? FULL_RACK() : pinsNowStanding,
            });
          }
          return;
        }

        // ── NORMAL MODE ────────────────────────────────────────────────────────
        const updatedFrames = frames.map((rolls, i) =>
          i === currentFrameIndex ? [...rolls, pinfall] : rolls
        );
        const updatedRolls = updatedFrames[currentFrameIndex];

        const isContinuationBall = frames[currentFrameIndex].length > 0;
        lanePlay.logShot(false, isContinuationBall);

        const isSpareClose = standingAfter === 0 && standingBefore !== PINS_PER_RACK;
        const previousBallInFrame = isContinuationBall
          ? useLanePlayStore.getState().shotLog[1]
          : undefined;
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

        const pinsNowStanding = useLanePlayStore.getState().pins;

        if (needsFreshRack) {
          useLanePlayStore.setState({ pins: Array(10).fill(false) });
        } else if (!gameDone) {
          useLanePlayStore.setState({ pins: Array(10).fill(false) });
        }

        set({
          frames: updatedFrames,
          currentFrameIndex:
            frameDone && !isLastFrame ? currentFrameIndex + 1 : currentFrameIndex,
          isGameComplete: gameDone,
          pinsStandingBeforeBall: needsFreshRack ? FULL_RACK() : pinsNowStanding,
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

      setEditingFrame: (index) => {
        // Ball 1 of any edit is always a fresh full rack.
        useLanePlayStore.setState({ pins: Array(10).fill(false) });
        set({
          editingFrameIndex: index,
          editingRolls: [],
          pinsStandingBeforeBall: FULL_RACK(),
        });
      },

      cancelEditing: () => {
        useLanePlayStore.setState({ pins: Array(10).fill(false) });
        set({
          editingFrameIndex: null,
          editingRolls: [],
          pinsStandingBeforeBall: FULL_RACK(),
        });
      },

      startNewGame: () => {
        useLanePlayStore.getState().startNewGame();
        set({
          frames: EMPTY_GAME(),
          currentFrameIndex: 0,
          isGameComplete: false,
          pinsStandingBeforeBall: FULL_RACK(),
          editingFrameIndex: null,
          editingRolls: [],
        });
      },

      setSessionType: (type) => {
        if (get().currentSessionGames.length > 0) return;
        set({ sessionType: type });
      },

      saveSession: async () => {
        const { currentSessionGames, sessionType } = get();
        if (currentSessionGames.length === 0) return;

        const total = currentSessionGames.reduce((sum, g) => sum + g.finalScore, 0);
        const averageScore = Math.round(total / currentSessionGames.length);
        const completedAt = new Date().toISOString();

        const session: BowlingSession = {
          id: `${Date.now()}`,
          type: sessionType,
          completedAt,
          games: currentSessionGames,
          averageScore,
        };

        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user?.id) {
          const msg = authError?.message ?? 'No authenticated user found. Please sign in again.';
          set({ lastSaveError: `Auth error: ${msg}` });
          showAlert('Sign-in Required', msg);
          return;
        }

        const { error: insertError } = await supabase.from('game_sessions').insert({
          user_id: userData.user.id,
          type: sessionType,
          completed_at: completedAt,
          average_score: averageScore,
          games: currentSessionGames,
        });

        if (insertError) {
          const msg = `${insertError.message} (code: ${insertError.code})`;
          set({ lastSaveError: msg });
          showAlert('Failed to Save Session', msg);
        } else {
          set({ lastSaveError: null });
        }

        useLanePlayStore.getState().resetSession();
        set((state) => ({
          savedSessions: [session, ...state.savedSessions],
          currentSessionGames: [],
          frames: EMPTY_GAME(),
          currentFrameIndex: 0,
          isGameComplete: false,
          pinsStandingBeforeBall: FULL_RACK(),
          editingFrameIndex: null,
          editingRolls: [],
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
          editingFrameIndex: null,
          editingRolls: [],
          lastSaveError: null,
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
        lastSaveError: state.lastSaveError,
        editingFrameIndex: state.editingFrameIndex,
        editingRolls: state.editingRolls,
      }),
    }
  )
);
