/**
 * Frame-structure rules for standard ten-pin bowling, independent of how a
 * frame's score is *totalled* (see `scoreCalculator.ts`). These functions
 * answer "what's allowed to happen next" — how many balls a frame gets and
 * how many pins are standing for the next roll — which the scoring store
 * uses to decide when to advance frames and when the shared pin rack
 * (owned by the `lane-play` feature) needs to be reset to a fresh 10.
 */

export const FRAME_COUNT = 10;
export const PINS_PER_RACK = 10;

function frameRollTotal(rolls: number[]): number {
  return rolls.reduce((sum, pins) => sum + pins, 0);
}

/**
 * Whether a frame has received every roll it's entitled to.
 *
 * Frames 1-9 close after a strike (1 roll) or after 2 rolls otherwise.
 * Frame 10 grants a 3rd "fill" roll whenever the first two rolls strike or
 * spare — that's the one frame where a great frame earns extra balls
 * instead of just bonus points on the next frame.
 */
export function isFrameComplete(frameIndex: number, rolls: number[]): boolean {
  if (frameIndex === FRAME_COUNT - 1) {
    if (rolls.length < 2) return false;
    const earnedFillBall = rolls[0] === 10 || frameRollTotal(rolls.slice(0, 2)) === 10;
    return earnedFillBall ? rolls.length === 3 : rolls.length === 2;
  }
  return rolls.length === 1 ? rolls[0] === 10 : rolls.length === 2;
}

/**
 * How many pins should be standing for the *next* roll in this (still open)
 * frame. Returns `PINS_PER_RACK` when the next roll needs a freshly reset
 * rack — true at the start of any frame, and also mid-frame-10 after a
 * strike or spare, since real lanes re-rack for a fill ball.
 */
export function pinsStandingForNextRoll(frameIndex: number, rolls: number[]): number {
  if (rolls.length === 0) return PINS_PER_RACK;

  const isLastFrame = frameIndex === FRAME_COUNT - 1;

  if (isLastFrame) {
    if (rolls.length === 1) {
      return rolls[0] === 10 ? PINS_PER_RACK : PINS_PER_RACK - rolls[0];
    }
    if (rolls.length === 2) {
      const total = frameRollTotal(rolls);
      return total >= 10 ? PINS_PER_RACK : PINS_PER_RACK - total;
    }
  }

  // Frames 1-9 only ever have one prior roll to account for — a strike
  // already closes the frame, so this branch is reached only after an
  // open (non-strike) first ball.
  return PINS_PER_RACK - rolls[rolls.length - 1];
}
