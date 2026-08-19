import { Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useBallStore } from '../store/useBallStore';

/**
 * Primary scoring action — commits the current pin state as the next ball.
 * Also reads the selected ball label from useBallStore and includes it in
 * the shot payload (logged here now; sent to Supabase once wired up).
 *
 * Hidden while the game is complete — SessionControls takes over at that
 * point with New Game / Save / Discard options.
 */
export function SubmitBallButton() {
  const submitBall = useScoringStore((state) => state.submitBall);
  const isGameComplete = useScoringStore((state) => state.isGameComplete);
  const selectedBall = useBallStore((s) => s.selectedBall);
  const clearSelectedBall = useBallStore((s) => s.clearSelectedBall);

  if (isGameComplete) return null;

  const handleSubmit = () => {
    // TODO: include selectedBall in Supabase shot payload, e.g.:
    // supabase.from('shots').insert({ ...shotData, ball: selectedBall })
    console.log('[SubmitBall] ball selected:', selectedBall ?? 'none');

    submitBall();
    clearSelectedBall();
  };

  return (
    <WebButton
      onPress={handleSubmit}
      style={{
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#22d3ee',
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontWeight: '700', color: '#000000' }}>Submit Ball</Text>
    </WebButton>
  );
}
