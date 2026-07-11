import type { BowlingHand, CoachFeedback, ShotRecord } from '../types';

// ---------------------------------------------------------------------------
// Tuning constants — all thresholds live here, not scattered across the logic
// ---------------------------------------------------------------------------

/** Oil volume below which the lane is critically dry. */
const CRITICAL_OIL_THRESHOLD = 40;

/**
 * How many recent shots to include in velocity and confidence windows.
 * Smaller = more reactive; larger = more stable but slower to catch changes.
 */
const RECENT_WINDOW = 5;

/** Composite threat score needed to surface a "watch this" warning. */
const THREAT_MONITOR = 25;

/** Composite threat score needed to issue a predictive "prepare to move" alert. */
const THREAT_IMMINENT = 50;

/** Composite threat score needed to issue an immediate "move now" command. */
const THREAT_CONFIRMED = 70;

/**
 * Confidence below this level means execution variance is too high for the
 * coach to trust its own lane reads — it asks the bowler to stabilize first.
 */
const LOW_CONFIDENCE_THRESHOLD = 40;

// ---------------------------------------------------------------------------
// Default feedback (no shots logged yet)
// ---------------------------------------------------------------------------

const DEFAULT_FEEDBACK: CoachFeedback = {
  status: 'SYSTEM READY',
  message: 'Awaiting telemetry. Select a profile and log shots to initialize.',
  type: 'state-neutral',
  confidenceScore: 0,
};

// ---------------------------------------------------------------------------
// Internal factor model
// ---------------------------------------------------------------------------

/**
 * Intermediate coaching factors derived from the shot log. These are the
 * inputs to the multi-factor threat engine — each maps to a sub-score that
 * contributes to a single 0-100 composite threat score, rather than a chain
 * of hard-coded if/else conditions.
 */
interface CoachingFactors {
  /** How many consecutive shots (newest-first) carried a frictionAlert. */
  cornerPinStreak: number;
  /** 0-40: contribution from the corner-pin streak length. */
  cornerPinScore: number;
  /** 0-30: contribution from the current oil depletion rate. */
  velocityScore: number;
  /** 0-30: contribution from how close the lane is to the critical threshold. */
  proximityScore: number;
  /** 0-100: composite threat level across all factors. */
  totalThreat: number;
  /** 0-100: how consistently the bowler is hitting their target board. */
  confidenceScore: number;
  /** Raw average miss in boards (used for message text). */
  avgMiss: number;
  /** Oil units depleted per shot over the recent window. */
  degradationVelocity: number;
  /** Estimated shots remaining before oilVolume hits CRITICAL_OIL_THRESHOLD. */
  framesUntilCritical: number;
}

function computeFactors(
  shotLog: ShotRecord[],
  oilVolume: number,
): CoachingFactors {
  const window = shotLog.slice(0, Math.min(shotLog.length, RECENT_WINDOW));

  // -- Corner-pin streak -------------------------------------------------
  let cornerPinStreak = 0;
  for (const shot of shotLog) {
    if (!shot.frictionAlert) break;
    cornerPinStreak++;
  }
  const cornerPinScore =
    cornerPinStreak >= 3 ? 40
    : cornerPinStreak === 2 ? 25
    : cornerPinStreak === 1 ? 10
    : 0;

  // -- Degradation velocity: ΔOil / shots over the recent window ----------
  let degradationVelocity = 0;
  if (window.length >= 2) {
    const oldest = window[window.length - 1];
    const newest = window[0];
    degradationVelocity = Math.max(
      0,
      (oldest.oilVolumeRemaining - newest.oilVolumeRemaining) / (window.length - 1),
    );
  }
  const velocityScore =
    degradationVelocity >= 3.5 ? 30
    : degradationVelocity >= 2.0 ? 20
    : degradationVelocity >= 1.0 ? 10
    : 0;

  // -- Proximity: estimated shots until critical threshold ----------------
  const framesUntilCritical =
    degradationVelocity > 0.1
      ? Math.max(0, Math.floor((oilVolume - CRITICAL_OIL_THRESHOLD) / degradationVelocity))
      : 999;
  const proximityScore =
    framesUntilCritical < 5 ? 30
    : framesUntilCritical < 10 ? 20
    : framesUntilCritical < 15 ? 10
    : 0;

  // -- Confidence: consistency of target vs actual board over the window --
  const misses = window.map(s => Math.abs(s.targetBoard - s.actualBoard));
  const avgMiss = misses.length > 0 ? misses.reduce((a, b) => a + b, 0) / misses.length : 0;
  // Every board of average miss costs 12 confidence points; clamped 0-100.
  const confidenceScore = Math.round(Math.max(0, Math.min(100, 100 - avgMiss * 12)));

  return {
    cornerPinStreak,
    cornerPinScore,
    velocityScore,
    proximityScore,
    totalThreat: cornerPinScore + velocityScore + proximityScore,
    confidenceScore,
    avgMiss,
    degradationVelocity,
    framesUntilCritical,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Heuristic inference engine for the virtual coach.
 *
 * Rather than a fixed if/else ladder, this derives a composite threat score
 * from three independently-weighted factors (corner-pin streak, degradation
 * velocity, proximity to critical oil) and cross-checks it against an
 * execution confidence score before surfacing any advice. The output speaks
 * in *predictive* terms ("Transition expected within N frames") rather than
 * just reporting the current shot.
 *
 * Evaluation priority (highest to lowest):
 * 1. Execution stability gate — if the bowler is missing their target
 *    consistently, lane reads are unreliable until they stabilize.
 * 2. Surface-specific read — urethane against a friction leave is a distinct
 *    physical signal that supersedes the generic threat model.
 * 3. Multi-factor threat score thresholds — CONFIRMED / IMMINENT / MONITOR.
 * 4. Stable default — still gives a predictive oil-remaining estimate.
 *
 * @param shotLog - All logged shots, most recent first.
 * @param oilVolume - Current estimated oil volume (0-100).
 * @param bowlerHand - Throwing hand; determines direction of move calls and
 *   which corner pin is the weak-side friction indicator.
 */
export function evaluateCoachStatus(
  shotLog: ShotRecord[],
  oilVolume: number,
  bowlerHand: BowlingHand,
): CoachFeedback {
  const latestShot = shotLog[0];
  if (!latestShot) return DEFAULT_FEEDBACK;

  const {
    cornerPinStreak,
    totalThreat,
    confidenceScore,
    avgMiss,
    degradationVelocity,
    framesUntilCritical,
  } = computeFactors(shotLog, oilVolume);

  const weakSidePin = bowlerHand === 'Right' ? 10 : 7;
  const moveDirection = bowlerHand === 'Right' ? 'left' : 'right';

  // Helper: human-readable frames-remaining label
  const proximityLabel =
    framesUntilCritical === 999
      ? 'Oil volume stable at current burn rate.'
      : `~${framesUntilCritical} frame${framesUntilCritical === 1 ? '' : 's'} of stable oil remaining.`;

  // 1. EXECUTION STABILITY GATE ----------------------------------------
  // Lane reads derived from inconsistent telemetry are unreliable. Surface
  // this first so the bowler knows their execution is the variable before
  // they start second-guessing the lane.
  if (confidenceScore < LOW_CONFIDENCE_THRESHOLD) {
    return {
      status: 'EXECUTION UNSTABLE',
      message:
        `Confidence: ${confidenceScore}%. Averaging ${avgMiss.toFixed(1)} boards off target over recent shots. ` +
        `Stabilize your execution line before interpreting lane feedback — ` +
        `adjustment advice is unreliable when the delivery itself is inconsistent.`,
      type: 'state-neutral',
      confidenceScore,
    };
  }

  // 2. SURFACE-SPECIFIC READ -------------------------------------------
  if (latestShot.frictionAlert && latestShot.ballSurface === 'Urethane') {
    return {
      status: 'URETHANE TRANSITION',
      message:
        `Oil pushed into the track. Depletion velocity: ${degradationVelocity.toFixed(1)} units/shot. ` +
        `Move slightly outside or increase ball speed to restore entry angle.`,
      type: 'state-warn',
      confidenceScore,
    };
  }

  // 3. MULTI-FACTOR THREAT ENGINE --------------------------------------
  if (totalThreat >= THREAT_CONFIRMED) {
    return {
      status: 'TRANSITION CONFIRMED',
      message:
        `${cornerPinStreak} consecutive ${weakSidePin}-pins — threat score ${totalThreat}/100. ` +
        `Move 2-1 ${moveDirection} (2 boards feet, 1 board target) immediately.`,
      type: 'state-danger',
      confidenceScore,
    };
  }

  if (totalThreat >= THREAT_IMMINENT) {
    return {
      status: 'TRANSITION IMMINENT',
      message:
        (framesUntilCritical < 999
          ? `Transition expected within ${framesUntilCritical} frames. `
          : 'Transition risk rising. ') +
        `Depletion at ${degradationVelocity.toFixed(1)} units/shot. ` +
        `Prepare to move 2-1 ${moveDirection}.`,
      type: 'state-warn',
      confidenceScore,
    };
  }

  if (totalThreat >= THREAT_MONITOR) {
    return {
      status: 'MONITOR LANE',
      message:
        `Early friction signal detected. ${proximityLabel} ` +
        `Watch for continued ${weakSidePin}-pin leaves before committing to an adjustment.`,
      type: 'state-warn',
      confidenceScore,
    };
  }

  // 4. STABLE — give predictive context anyway -------------------------
  return {
    status: 'OPTIMAL CARRY',
    message: `Line holding. ${proximityLabel} Maintain execution.`,
    type: 'state-safe',
    confidenceScore,
  };
}
