import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useLanePlayStore } from '@/features/lane-play';
import { useScoringStore } from '../store/useScoringStore';

/**
 * Quick-action STRIKE and SPARE buttons.
 *
 * Both buttons set all pins to knocked-down (false) and immediately call
 * submitBall(). The scoring engine determines strike vs spare from the
 * resulting pinfall — these are purely a UX shortcut.
 *
 * Works in both normal play and edit mode.
 * Hidden only when a game is complete AND no frame is being edited.
 */
export function StrikeSpareButtons() {
  const isGameComplete = useScoringStore((s) => s.isGameComplete);
  const submitBall = useScoringStore((s) => s.submitBall);
  const currentFrameIndex = useScoringStore((s) => s.currentFrameIndex);
  const frames = useScoringStore((s) => s.frames);
  const editingFrameIndex = useScoringStore((s) => s.editingFrameIndex);
  const editingRolls = useScoringStore((s) => s.editingRolls);

  // Hide when game is complete and not editing a past frame.
  if (isGameComplete && editingFrameIndex === null) return null;

  // In edit mode, check how many balls have been entered for the edit frame.
  // In normal play, check balls in the current frame.
  const isFirstBallOfFrame =
    editingFrameIndex !== null
      ? editingRolls.length === 0
      : frames[currentFrameIndex].length === 0;

  const handleStrike = () => {
    useLanePlayStore.setState({ pins: Array(10).fill(false) });
    submitBall();
  };

  const handleSpare = () => {
    useLanePlayStore.setState({ pins: Array(10).fill(false) });
    submitBall();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {/* STRIKE — full rack clear on first ball */}
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

      {/* SPARE — clears remaining pins on ball 2+ */}
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
