import type { FrameResult } from '../types';

/**
 * Standard USBC/ABC ten-pin scoring: a strike's frame score is 10 plus the
 * next two rolls *thrown anywhere after it* (which may belong to the next
 * frame, or even the one after that if frame 9 strikes), a spare's is 10
 * plus the next single roll, and an open frame is just the sum of its own
 * two rolls. Frame 10 is the one exception — it never looks beyond its own
 * rolls, since there's no "next frame" to borrow from.
 *
 * This is computed fresh from the raw `frames` (rolls only) every time
 * rather than stored, so the derived scores can never drift out of sync
 * with the source-of-truth roll data.
 */
export function calculateScores(frameRolls: number[][]): FrameResult[] {
  const flatRolls: number[] = [];
  frameRolls.forEach((rolls) => rolls.forEach((pins) => flatRolls.push(pins)));

  const results: FrameResult[] = [];
  let flatIndex = 0;
  let cumulative = 0;
  let cumulativeKnown = true;

  for (let frameIndex = 0; frameIndex < frameRolls.length; frameIndex++) {
    const rolls = frameRolls[frameIndex];
    const isLastFrame = frameIndex === frameRolls.length - 1;
    const isStrike = rolls[0] === 10;
    const isSpare = !isStrike && rolls.length >= 2 && rolls[0] + rolls[1] === 10;

    let frameScore: number | null = null;

    if (isLastFrame) {
      const frameComplete = rolls.length === 3 || (rolls.length === 2 && rolls[0] + rolls[1] < 10);
      if (frameComplete) {
        frameScore = rolls.reduce((sum, pins) => sum + pins, 0);
      }
    } else if (isStrike) {
      const next1 = flatRolls[flatIndex + 1];
      const next2 = flatRolls[flatIndex + 2];
      if (next1 !== undefined && next2 !== undefined) {
        frameScore = 10 + next1 + next2;
      }
    } else if (isSpare) {
      const next1 = flatRolls[flatIndex + 2];
      if (next1 !== undefined) {
        frameScore = 10 + next1;
      }
    } else if (rolls.length === 2) {
      frameScore = rolls[0] + rolls[1];
    }

    if (frameScore !== null && cumulativeKnown) {
      cumulative += frameScore;
      results.push({ rolls, frameScore, cumulativeScore: cumulative, isStrike, isSpare });
    } else {
      cumulativeKnown = false;
      results.push({ rolls, frameScore, cumulativeScore: null, isStrike, isSpare });
    }

    flatIndex += rolls.length;
  }

  return results;
}
