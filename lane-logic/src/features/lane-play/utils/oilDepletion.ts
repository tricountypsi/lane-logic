import type { BallSurface } from '../types';

/**
 * NOTE: this is the core of the patent-pending lane model — the "Kinetic
 * Depletion" formula. It treats each shot as a kinetic-energy transfer from
 * the ball to the lane surface, so the oil volume behaves as a synthetic
 * friction model rather than an arbitrary countdown. Keep all tuning
 * constants here, in one place, rather than duplicated across components.
 *
 * Per-shot, the Oil Displacement Coefficient is:
 *
 *   D_c = (RPM / 150) x Shell Multiplier (M)
 *
 * and the lane's remaining oil volume (V) updates as:
 *
 *   V_new = V_old - D_c
 *
 * `RPM` is the bowler's rev rate (e.g. 450 for Power, 320 for Tweener, 250
 * for Stroker) and `150` is a fixed divisor scaling the math to the app's
 * 0-100% "battery" range — `RPM_DEPLETION_DIVISOR` below.
 *
 * `M`, the Shell Multiplier, accounts for how aggressively a coverstock
 * interacts with the oil: Solid (1.4) has the highest porosity and displaces
 * oil fastest; Pearl (0.7) skids further and displaces less; Urethane (0.5)
 * displaces the least, pushing oil into the track rather than absorbing it.
 * `SURFACE_DEPLETION_MULTIPLIER` below holds these as M.
 *
 * This is the same formula a ball manufacturer would recognize as a
 * quantitative friction/wear model — e.g. if users consistently trigger the
 * coach's "Transition Confirmed" alert faster on a given manufacturer's
 * Solid ball, that's a real, measurable product-performance signal.
 */
const SURFACE_DEPLETION_MULTIPLIER: Record<BallSurface, number> = {
  Solid: 1.4,
  Pearl: 0.7,
  Urethane: 0.5,
};

/** Divisor converting raw RPM into a baseline depletion-per-shot figure (the "150" in the Kinetic Depletion formula). */
const RPM_DEPLETION_DIVISOR = 150;

/**
 * Calculates the oil volume remaining on the lane after a single shot, by
 * applying the Kinetic Depletion formula: D_c = (RPM / 150) x M, then
 * V_new = V_old - D_c.
 *
 * @param currentVolume - Oil volume (0-100) before this shot. This is V_old.
 * @param bowlerRpm - The bowler's rev rate profile, in RPM.
 * @param ballSurface - The surface of the ball just thrown, used to look up M.
 * @returns The new oil volume (V_new), clamped to a minimum of 0.
 */
export function calculateOilDepletion(
  currentVolume: number,
  bowlerRpm: number,
  ballSurface: BallSurface
): number {
  // D_c = (RPM / 150) x M
  const oilDisplacementCoefficient =
    (bowlerRpm / RPM_DEPLETION_DIVISOR) * SURFACE_DEPLETION_MULTIPLIER[ballSurface];

  // V_new = V_old - D_c
  return Math.max(0, currentVolume - oilDisplacementCoefficient);
}
