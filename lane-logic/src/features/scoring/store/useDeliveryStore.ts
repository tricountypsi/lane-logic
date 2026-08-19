import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Per-frame delivery metrics logged by the bowler alongside each shot.
 * All values start as null in Frame 1 (displayed as "—") and are
 * automatically carried forward to the next frame once set.
 */
export interface DeliveryMetrics {
  speed: number | null;
  fl: number | null;
  pi: number | null;
  po: number | null;
  hi: number | null;
  bk: number | null;
}

/** Config for each metric's display label, range, and first-tap default. */
export const METRIC_CONFIG: Record<
  keyof DeliveryMetrics,
  { label: string; min: number; max: number; initial: number }
> = {
  speed: { label: 'Speed', min: 10, max: 24, initial: 17 },
  fl:    { label: 'FL',    min: 0,  max: 6,  initial: 3  },
  pi:    { label: 'PI',    min: 1,  max: 39, initial: 15 },
  po:    { label: 'PO',    min: 1,  max: 39, initial: 15 },
  hi:    { label: 'HI',    min: 1,  max: 39, initial: 15 },
  bk:    { label: 'BK',   min: 1,  max: 39, initial: 15 },
};

const FRAME_COUNT = 10;
const BLANK = (): DeliveryMetrics => ({
  speed: null, fl: null, pi: null, po: null, hi: null, bk: null,
});

interface DeliveryStore {
  /** One metrics object per frame. Index matches scoring store's currentFrameIndex. */
  frameMetrics: (DeliveryMetrics | null)[];

  /** Update one metric for the given frame. */
  setMetric: (frameIndex: number, key: keyof DeliveryMetrics, value: number | null) => void;

  /**
   * Called when the scoring store advances to a new frame.
   * Copies the previous frame's values as defaults so the bowler
   * only needs to adjust what changed.
   */
  carryForward: (toFrameIndex: number) => void;

  /** Wipe all frame metrics (called on game reset / discard). */
  reset: () => void;
}

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set, get) => ({
      frameMetrics: Array.from({ length: FRAME_COUNT }, () => null),

      setMetric: (frameIndex, key, value) =>
        set((state) => {
          const updated = [...state.frameMetrics];
          const current = updated[frameIndex] ?? BLANK();
          updated[frameIndex] = { ...current, [key]: value };
          return { frameMetrics: updated };
        }),

      carryForward: (toFrameIndex) => {
        const { frameMetrics } = get();
        // Only copy if the destination frame is still blank
        if (toFrameIndex <= 0 || frameMetrics[toFrameIndex] !== null) return;
        const prev = frameMetrics[toFrameIndex - 1];
        if (!prev) return;
        set((state) => {
          const updated = [...state.frameMetrics];
          updated[toFrameIndex] = { ...prev };
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
