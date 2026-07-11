import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BallSurface, BowlerProfile, BowlingHand, PinRack, ShotRecord } from '../types';
import { calculateOilDepletion } from '../utils/oilDepletion';

export const BOWLER_PROFILES: BowlerProfile[] = [
  { label: 'Power Player (450 RPM)', rpm: 450 },
  { label: 'Tweener (320 RPM)', rpm: 320 },
  { label: 'Stroker (250 RPM)', rpm: 250 },
];

const STARTING_OIL_VOLUME = 100;

interface LanePlayState {
  pins: PinRack;
  bowlerRpm: number;
  /**
   * Throwing hand, used purely to mirror the direction of the virtual
   * coach's "move your feet" call on a confirmed transition (right-handed
   * bowlers move left, left-handed bowlers move right) — it has no effect
   * on the oil depletion math itself.
   */
  bowlerHand: BowlingHand;
  targetBoard: number;
  actualBoard: number;
  ballSpeedMph: number;
  ballSurface: BallSurface;
  oilVolume: number;
  shotLog: ShotRecord[];

  togglePin: (index: number) => void;
  setBowlerRpm: (rpm: number) => void;
  setBowlerHand: (hand: BowlingHand) => void;
  setTargetBoard: (board: number) => void;
  setActualBoard: (board: number) => void;
  setBallSpeedMph: (speed: number) => void;
  setBallSurface: (surface: BallSurface) => void;
  /**
   * Logs the current pin/board/speed inputs as a shot and applies the oil
   * depletion model.
   *
   * `autoResetPins` defaults to `true`, which resets the pin rack for the
   * next shot — this preserves the Lane Play tab's existing "one shot, one
   * reset" practice flow. The `scoring` feature calls `logShot(false)` for
   * ball 2 of a non-strike frame, since the pin rack must keep reflecting
   * standing pins until the frame closes out; the scoring store owns
   * clearing pins itself once that happens.
   *
   * `skipOilDepletion` defaults to `false`. Pass `true` for spare balls —
   * a bowler aiming directly at remaining pin(s) doesn't drive through the
   * oil pattern the way a strike ball does, so spare shots should not
   * advance the oil depletion model.
   */
  logShot: (autoResetPins?: boolean, skipOilDepletion?: boolean) => void;
  /** Clears all logged shots and resets the lane to a fresh oil volume. Use when starting a new game/session. */
  resetSession: () => void;
}

/**
 * Global store for the Lane Play feature: current shot inputs, the running
 * shot log, and derived lane state (oil volume). Persisted to AsyncStorage
 * so an in-progress session survives an app restart.
 *
 * Only this store should own `shotLog`/`oilVolume` — components read via
 * this hook rather than recomputing lane state locally, so there's a
 * single source of truth other features (e.g. analytics) can also read
 * from later.
 */
export const useLanePlayStore = create<LanePlayState>()(
  persist(
    (set, get) => ({
      pins: Array(10).fill(true),
      bowlerRpm: BOWLER_PROFILES[0].rpm,
      bowlerHand: 'Right',
      targetBoard: 15,
      actualBoard: 15,
      ballSpeedMph: 17.5,
      ballSurface: 'Solid',
      oilVolume: STARTING_OIL_VOLUME,
      shotLog: [],

      togglePin: (index) =>
        set((state) => {
          const pins = [...state.pins];
          pins[index] = !pins[index];
          return { pins };
        }),

      setBowlerRpm: (rpm) => set({ bowlerRpm: rpm }),
      setBowlerHand: (hand) => set({ bowlerHand: hand }),
      setTargetBoard: (board) => set({ targetBoard: board }),
      setActualBoard: (board) => set({ actualBoard: board }),
      setBallSpeedMph: (speed) => set({ ballSpeedMph: speed }),
      setBallSurface: (surface) => set({ ballSurface: surface }),

      logShot: (autoResetPins = true, skipOilDepletion = false) => {
        const {
          pins,
          bowlerRpm,
          bowlerHand,
          targetBoard,
          actualBoard,
          ballSpeedMph,
          ballSurface,
          oilVolume,
          shotLog,
        } = get();

        const standingPins = pins
          .map((standing, i) => (standing ? i + 1 : null))
          .filter((pin): pin is number => pin !== null);
        const leave = standingPins.length === 0 ? 'Strike' : standingPins.join(', ');

        // Spare shots don't deplete oil — the bowler aims directly at the
        // remaining pin(s) rather than driving through the pattern.
        const newVolume = skipOilDepletion
          ? oilVolume
          : calculateOilDepletion(oilVolume, bowlerRpm, ballSurface);

        // The corner pin that signals lane friction/energy loss is mirrored
        // by hand: a right-handed ball deflects off the weak side leaving
        // the 10 pin, a left-handed ball mirrors that and leaves the 7 pin.
        const weakSideCornerPin = bowlerHand === 'Right' ? 10 : 7;

        const newShot: ShotRecord = {
          shotNumber: shotLog.length + 1,
          leave,
          targetBoard,
          actualBoard,
          speedMph: ballSpeedMph,
          ballSurface,
          oilVolumeRemaining: Number(newVolume.toFixed(1)),
          // Independent shots (this store has no frame concept) — true
          // exactly when this one ball left the hand-appropriate weak-side
          // corner pin (10 for right-handed, 7 for left-handed) standing.
          // The `scoring` feature carries this forward onto later balls in
          // the same frame, since it's the only feature that knows where
          // frames start and end.
          frictionAlert: standingPins.includes(weakSideCornerPin),
        };

        set({
          shotLog: [newShot, ...shotLog],
          oilVolume: newVolume,
          ...(autoResetPins ? { pins: Array(10).fill(true) } : {}),
        });
      },

      resetSession: () =>
        set({
          shotLog: [],
          oilVolume: STARTING_OIL_VOLUME,
          pins: Array(10).fill(true),
        }),
    }),
    {
      name: 'lane-play-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
