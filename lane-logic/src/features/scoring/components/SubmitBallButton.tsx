import { Pressable, Text } from 'react-native';

import { useScoringStore } from '../store/useScoringStore';

/**
 * Primary scoring action — commits whatever's toggled on the shared PinRack
 * as the next ball. Hidden while the game is complete (SessionControls takes
 * over at that point with New Game / Save / Discard options).
 */
export function SubmitBallButton() {
  const submitBall = useScoringStore((state) => state.submitBall);
  const isGameComplete = useScoringStore((state) => state.isGameComplete);

  if (isGameComplete) return null;

  return (
    <Pressable
      onPress={submitBall}
      style={{
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#22d3ee',
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontWeight: '700', color: '#000000' }}>Submit Ball</Text>
    </Pressable>
  );
}
