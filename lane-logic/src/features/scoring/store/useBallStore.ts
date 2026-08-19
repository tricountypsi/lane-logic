import { create } from 'zustand';

/**
 * Lightweight store for the currently selected ball.
 * Kept separate from useScoringStore so it can be read by both
 * BallSelector and SubmitBallButton without coupling them together.
 *
 * When Supabase is wired up, SubmitBallButton reads `selectedBall`
 * from here and includes it in the shot payload.
 */
interface BallStore {
  selectedBall: string | null;
  setSelectedBall: (ball: string | null) => void;
  clearSelectedBall: () => void;
}

export const useBallStore = create<BallStore>((set) => ({
  selectedBall: null,
  setSelectedBall: (ball) => set({ selectedBall: ball }),
  clearSelectedBall: () => set({ selectedBall: null }),
}));
