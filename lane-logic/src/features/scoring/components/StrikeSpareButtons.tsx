import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useLanePlayStore } from '@/features/lane-play';
import { useScoringStore } from '../store/useScoringStore';

/**
 * Quick-action STRIKE and SPARE buttons.
 *
 * Both buttons set all pins to knocked-down (false) and immediately call
 * submitBall(). The scoring engine determines strike vs spare from the
 * resulting pinfall count — these buttons are purely a UX shortcut.
 *
 * Hidden once the game is complete (SessionControls takes over).
 */
export function StrikeSpareButtons() {
  const isGameComplete = useScoringStore((s) => s.isGameComplete);
  const submitBall = useScoringStore((s) => s.submitBall);
  const currentFrameIndex = useScoringStore((s) => s.currentFrameIndex);
  const frames = useScoringStore((s) => s.frames);

  if (isGameComplete) return null;

  const isFirstBallOfFrame = frames[currentFrameIndex].length === 0;

  const handleStrike = () => {
    // All pins down → pinfall = pinsStandingBefore (10 on first ball = strike)
    useLanePlayStore.setState({ pins: Array(10).fill(false) });
    submitBall();
  };

  const handleSpare = () => {
    // All remaining pins down → pinfall = whatever was standing = spare
    useLanePlayStore.setState({ pins: Array(10).fill(false) });
    submitBall();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {/* STRIKE — only useful on first ball */}
      <WebButton
        onPress={handleStrike}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          paddingVertical: 18,
          backgroundColor: '#22d3ee',
          opacity: isFirstBallOfFrame ? 1 : 0.35,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#000', letterSpacing: -0.5 }}>
          STRIKE
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(0,0,0,0.55)', marginTop: 2 }}>
          X
        </Text>
      </WebButton>

      {/* SPARE — only useful on ball 2+ */}
      <WebButton
        onPress={handleSpare}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          paddingVertical: 18,
          borderWidth: 2,
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34,211,238,0.08)',
          opacity: !isFirstBallOfFrame ? 1 : 0.35,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#22d3ee', letterSpacing: -0.5 }}>
          SPARE
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(34,211,238,0.55)', marginTop: 2 }}>
          /
        </Text>
      </WebButton>
    </View>
  );
}
