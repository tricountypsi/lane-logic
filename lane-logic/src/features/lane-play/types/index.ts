/**
 * Domain types for the Lane Play feature: lane condition tracking, ball
 * arsenal management, and the virtual coaching engine.
 *
 * These types are the contract between the pure algorithm functions in
 * `utils/` and everything else (store, components). Keep them in sync with
 * the algorithm's actual inputs/outputs — if the product strategist
 * changes the math, this file is usually the first thing that needs to
 * change too.
 */

/** Ball surface material, which determines how quickly it removes oil from the lane. */
export type BallSurface = 'Solid' | 'Pearl' | 'Urethane';

/**
 * The bowler's throwing hand. Drives the *direction* of the coach's
 * lane-transition move call — a right-handed bowler reads the pattern
 * breaking down from the same side a left-hander's would be building up
 * on, so the corrective move is mirrored between the two.
 */
export type BowlingHand = 'Right' | 'Left';

/** A bowler's rev rate profile, used as an input to the oil depletion model. */
export interface BowlerProfile {
  /** Display label shown in the profile selector, e.g. "Power Player (450 RPM)". */
  label: string;
  /** Average revolutions per minute for this profile. */
  rpm: number;
}

/** Pin state for a single shot, indexed 0-9 matching standard pin numbering (1-10). */
export type PinRack = boolean[];

/**
 * A single logged shot, capturing both the player's inputs (board targets,
 * ball speed, ball surface) and the computed lane state immediately after
 * the shot (remaining oil volume).
 */
export interface ShotRecord {
  shotNumber: number;
  /**
   * "Strike" when a freshly-racked 10 pins is cleared in one ball, "Spare"
   * when a later ball in the same frame clears whatever pins were already
   * standing (the `scoring` feature is responsible for relabeling these —
   * this store has no frame concept of its own), or a comma-separated list
   * of standing pin numbers, e.g. "7, 10".
   */
  leave: string;
  /** The board the bowler intended to play. */
  targetBoard: number;
  /** The board the ball actually tracked through, as read by the bowler. */
  actualBoard: number;
  /** Ball speed at release, in mph. */
  speedMph: number;
  ballSurface: BallSurface;
  /** Estimated remaining oil volume (0-100) on the lane after this shot. */
  oilVolumeRemaining: number;
  /**
   * Whether this shot carries a weak-side corner-pin energy-loss read —
   * true on the ball that actually left that corner pin standing (the 10
   * pin for a right-handed bowler, the 7 pin for a left-handed bowler,
   * mirrored per `BowlingHand`), and carried forward by the `scoring`
   * feature onto later balls in the same frame (e.g. the ball that closes
   * the spare).
   *
   * This is deliberately a separate field from `leave` rather than parsed
   * out of it: most bowlers log a whole frame's balls only after they've
   * thrown both, so by the time the spare-closing ball is entered, `leave`
   * already reads "Spare" — the friction symptom the corner-pin leave
   * pointed to is still physically true about the lane, so the coach needs
   * a signal that survives the conversion instead of one that vanishes the
   * moment the frame closes out.
   */
  frictionAlert: boolean;
}

/** Severity/category of feedback the virtual coach is currently giving. */
export type CoachStatusType = 'state-neutral' | 'state-warn' | 'state-danger' | 'state-safe';

/** The virtual coach's current recommendation, derived from the latest shot and lane state. */
export interface CoachFeedback {
  status: string;
  message: string;
  type: CoachStatusType;
  /**
   * 0-100 score reflecting how consistently the bowler is hitting their
   * target board over the recent shot window. Low scores mean execution
   * variance is masking lane reads — the coach surfaces this before
   * offering adjustment advice, since a bowler missing their target by
   * 5+ boards can't reliably diagnose whether the lane moved or they did.
   */
  confidenceScore: number;
}
