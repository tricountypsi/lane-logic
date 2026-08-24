import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Per-frame delivery metrics — fully toggle-based, no steppers.
 *
 * Row 1 (Execution): single-select — GR · PO · PI · SP
 * Row 2 (Reaction):  single-select — FL · HI · LI · BK
 *
 * Both groups reset to null each frame (these are per-shot events).
 */
export interface DeliveryMetrics {
  execution: 'GR' | 'PO' | 'PI' | 'SP' | null;
  reaction:  'FL' | 'HI' | 'LI' | 'BK' | null;
}

export const EXECUTION_OPTIONS: { key: 'GR' | 'PO' | 'PI' | 'SP'; label: string; tooltip: string }[] = [
  { key: 'GR', label: 'GR', tooltip: 'Hit Mark' },
  { key: 'PO', label: 'PO', tooltip: 'Pushed Out' },
  { key: 'PI', label: 'PI', tooltip: 'Pulled In' },
  { key: 'SP', label: 'SP', tooltip: 'Speed Issue' },
];

export const REACTION_OPTIONS: { key: 'FL' | 'HI' | 'LI' | 'BK'; label: string; tooltip: string }[] = [
  { key: 'FL', label: 'FL', tooltip: 'Flush' },
  { key: 'HI', label: 'HI', tooltip: 'High' },
  { key: 'LI', label: 'LI', tooltip: 'Light' },
  { key: 'BK', label: 'BK', tooltip: 'Brooklyn' },
];

const FRAME_COUNT = 10;
const BLANK = (): DeliveryMetrics => ({ execution: null, reaction: null });

interface DeliveryStore {
  frameMetrics: (DeliveryMetrics | null)[];

  /** Set or clear the execution toggle for a frame (tapping active = deselects). */
  setExecution: (frameIndex: number, key: 'GR' | 'PO' | 'PI' | 'SP') => void;
  /** Set or clear the reaction toggle for a frame (tapping active = deselects). */
  setReaction: (frameIndex: number, key: 'FL' | 'HI' | 'LI' | 'BK') => void;

  /** Wipe all frame metrics (called on game reset / discard). */
  reset: () => void;
}

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set, get) => ({
      frameMetrics: Array.from({ length: FRAME_COUNT }, () => null),

      setExecution: (frameIndex, key) =>
        set((state) => {
          const updated = [...state.frameMetrics];
          const current = updated[frameIndex] ?? BLANK();
          // Tapping the active selection deselects it
          updated[frameIndex] = {
            ...current,
            execution: current.execution === key ? null : key,
          };
          return { frameMetrics: updated };
        }),

      setReaction: (frameIndex, key) =>
        set((state) => {
          const updated = [...state.frameMetrics];
          const current = updated[frameIndex] ?? BLANK();
          updated[frameIndex] = {
            ...current,
            reaction: current.reaction === key ? null : key,
          };
          return { frameMetrics: updated };
        }),

      reset: () =>
        set({ frameMetrics: Array.from({ length: FRAME_COUNT }, () => null) }),
    }),
    {
      name: 'delivery-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
