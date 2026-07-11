import Svg, { Circle } from 'react-native-svg';

interface BowlingBallIconProps {
  /** Width/height of the square icon, in dp. */
  size?: number;
  /** Fill color of the ball body. */
  color?: string;
  /** Color of the three finger-hole dots. */
  holeColor?: string;
}

/**
 * Minimal bowling-ball glyph (solid circle + three finger holes) used as a
 * decorative accent next to "BOWL"-style call-to-actions. Pure react-native-svg
 * primitives — no image asset required.
 */
export function BowlingBallIcon({ size = 20, color = '#0a1f23', holeColor = '#e5fbff' }: BowlingBallIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill={color} />
      <Circle cx="9" cy="8" r="1.4" fill={holeColor} />
      <Circle cx="13" cy="7" r="1.4" fill={holeColor} />
      <Circle cx="11" cy="11" r="1.4" fill={holeColor} />
    </Svg>
  );
}
