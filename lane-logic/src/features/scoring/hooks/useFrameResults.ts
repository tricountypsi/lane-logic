import { useMemo } from 'react';

import { useScoringStore } from '../store/useScoringStore';
import { calculateScores } from '../utils/scoreCalculator';
import type { FrameResult } from '../types';

/**
 * Derives per-frame and running-total scores from the raw roll data.
 * Kept as a memoized selector rather than its own piece of store state, so
 * `frames` (the source of truth) and what's rendered can never drift apart.
 */
export function useFrameResults(): FrameResult[] {
  const frames = useScoringStore((state) => state.frames);
  return useMemo(() => calculateScores(frames), [frames]);
}
