import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

interface GlowButtonProps {
  /** Button label, rendered bold/uppercase to match the title-screen treatment. */
  label: string;
  /** Optional leading glyph (e.g. a `GearIcon` or `BowlingBallIcon`). */
  icon?: ReactNode;
  onPress: () => void;
  /**
   * `outline` is a transparent cyan-bordered pill (used for secondary
   * actions like Settings); `filled` is a teal-tinted fill with the same
   * glowing border (used for the primary call-to-action, e.g. Bowl).
   */
  variant?: 'outline' | 'filled';
}

/**
 * Neon-outlined pill button matching the Lane Logic title-screen look: a
 * glowing cyan border (via shadow, since RN has no native `box-shadow`
 * blur-on-border) around a dark, semi-transparent fill, with bold dark text
 * for contrast against the glow.
 */
export function GlowButton({ label, icon, onPress, variant = 'outline' }: GlowButtonProps) {
  const fillClass = variant === 'filled' ? 'bg-teal-600/40' : 'bg-cyan-400/10';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-xl border-2 border-cyan-400 px-6 py-4 ${fillClass}`}
      style={{
        shadowColor: '#22d3ee',
        shadowOpacity: 0.8,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      }}
    >
      {icon}
      <Text className="text-base font-extrabold uppercase tracking-wide text-[#0a1f23]">{label}</Text>
    </Pressable>
  );
}
