/**
 * A single frame's score, derived from its raw rolls. `frameScore` and
 * `cumulativeScore` are `null` until enough *future* rolls exist to resolve
 * a strike/spare bonus (e.g. frame 3's score can't be known until the bowler
 * has thrown the next one or two balls) — the UI should render a blank/dash
 * for `null` rather than a 0.
 */
export interface FrameResult {
  rolls: number[];
  frameScore: number | null;
  cumulativeScore: number | null;
  isStrike: boolean;
  isSpare: boolean;
}

/** A finished game, kept per-session so history and analytics can read it later. */
export interface CompletedGame {
  id: string;
  playedAt: string;
  frames: number[][];
  finalScore: number;
}

/**
 * The type of bowling session, which controls how many games it contains.
 * League conditions typically run 3 games; tournament conditions run 6.
 * Practice is open-ended — the bowler decides when to end the session.
 */
export type SessionType = 'Practice' | 'League' | 'Tournament';

/**
 * Maximum games per session type. `null` = unlimited (Practice).
 * Once a League/Tournament session reaches its limit the UI stops offering
 * "New Game" and prompts to save or discard instead.
 */
export const SESSION_GAME_LIMIT: Record<SessionType, number | null> = {
  Practice: null,
  League: 3,
  Tournament: 6,
};

/** A saved bowling session — one or more completed games under the same lane condition. */
export interface BowlingSession {
  id: string;
  type: SessionType;
  completedAt: string;
  games: CompletedGame[];
  /** Mean final score across all games in the session, rounded to nearest integer. */
  averageScore: number;
}
