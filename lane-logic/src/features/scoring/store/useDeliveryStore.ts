import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Per-frame delivery metrics.
 *
 * Steppers (number | null):  speed, pi, po
 *   — null = blank in Frame 1, shown as "—". First + tap initialises to default.
 *   — Carried forward to next frame so the bowler only adjusts what changed.
 *
 * Toggles (boolean):  fl, hi, bk
 *   — Reset to false each frame (these are per-shot events, not persistent state).
 */
export interface DeliveryMetrics {
  // Steppers
  speed: number | null;
  pi:    number | null;
  po:    number | null;
  // Toggles
  fl: boolean;
  hi: boolean;
  bk: boolean;
}

/** Config for the stepper metrics only. */
export const STEPPER_CONFIG: Record<
  'speed' | 'pi' | 'po',
  { label: string; min: number; max: number; initial: number }
> = {
  speed: { label: 'Speed', min: 10, max: 24, initial: 17 },
  pi:    { label: 'PI',    min: 1,  max: 39, initial: 15 },
  po:    { label: 'PO',    min: 1,  max: 39, initial: 15 },
};

/** Config for the toggle metrics only. */
export const TOGGLE_CONFIG: Record<
  'fl' | 'hi' | 'bk',
  { label: string }
> = {
  fl: { label: 'FL' },
  hi: { label: 'HI' },
  bk: { label: 'BK' },
};

const FRAME_COUNT = 10;

const BLANK = (): DeliveryMetrics => ({
  speed: null, pi: null, po: null,
  fl: false, hi: false, bk: false,
});

interface DeliveryStore {
  /** One metrics object per frame. Index matches scoring store's currentFrameIndex. */
  frameMetrics: (DeliveryMetrics | null)[];

  /** Update a stepper metric for the given frame. */
  setStepperMetric: (frameIndex: number, key: 'speed' | 'pi' | 'po', value: number | null) => void;

  /** Toggle a boolean metric for the given frame. */
  toggleMetric: (frameIndex: number, key: 'fl' | 'hi' | 'bk') => void;

  /**
   * Called when the scoring store advances to a new frame.
   * Carries stepper values forward; resets toggles to false (they're per-shot events).
   */
  carryForward: (toFrameIndex: number) => void;

  /** Wipe all frame metrics (called on game reset / discard). */
  reset: () => void;
}

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set, get) => ({
      frameMetrics: Array.from({ length: FRAME_COUNT }, () => null),

      setStepperMetric: (frameIndex, key, value) =>
        set((state) => {
          const updated = [...state.frameMetrics];
          const current = updated[frameIndex] ?? BLANK();
          updated[frameIndex] = { ...current, [key]: value };
          return { frameMetrics: updated };
        }),

      toggleMetric: (frameIndex, key) =>
        set((state) => {
          const updated = [...state.frameMetrics];
          const current = updated[frameIndex] ?? BLANK();
          updated[frameIndex] = { ...current, [key]: !current[key] };
          return { frameMetrics: updated };
        }),

      carryForward: (toFrameIndex) => {
        const { frameMetrics } = get();
        if (toFrameIndex <= 0 || frameMetrics[toFrameIndex] !== null) return;
        const prev = frameMetrics[toFrameIndex - 1];
        if (!prev) return;
        set((state) => {
          const updated = [...state.frameMetrics];
          // Carry steppers forward; reset toggles — they're per-shot events
          updated[toFrameIndex] = {
            speed: prev.speed,
            pi:    prev.pi,
            po:    prev.po,
            fl: false,
            hi: false,
            bk: false,
          };
          return { frameMetrics: updated };
        });
      },

      reset: () =>
        set({ frameMetrics: Array.from({ length: FRAME_COUNT }, () => null) }),
    }),
    {
      name: 'delivery-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
