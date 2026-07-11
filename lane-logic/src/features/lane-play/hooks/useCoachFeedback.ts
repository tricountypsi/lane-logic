import { useMemo } from 'react';

import { useLanePlayStore } from '../store/useLanePlayStore';
import { evaluateCoachStatus } from '../utils/coachEngine';
import type { CoachFeedback } from '../types';

/**
 * Derives the virtual coach's current feedback from the lane play store.
 * Recomputed only when the shot log or oil volume actually changes, so
 * components consuming this hook don't re-run the coach logic on every
 * unrelated re-render.
 */
export function useCoachFeedback(): CoachFeedback {
  const shotLog = useLanePlayStore((state) => state.shotLog);
  const oilVolume = useLanePlayStore((state) => state.oilVolume);
  const bowlerHand = useLanePlayStore((state) => state.bowlerHand);

  return useMemo(
    () => evaluateCoachStatus(shotLog, oilVolume, bowlerHand),
    [shotLog, oilVolume, bowlerHand]
  );
}
