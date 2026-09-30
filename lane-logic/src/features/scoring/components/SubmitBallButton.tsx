import { Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useBallStore } from '../store/useBallStore';

/**
 * Primary scoring action — commits the current pin state as the next ball.
 *
 * In normal play: hidden while the game is complete (SessionControls takes over).
 * In edit mode:   always visible; label changes to "Update Frame" so the bowler
 *                 knows they are correcting a past frame, not logging a new ball.
 */
export function SubmitBallButton() {
  const submitBall = useScoringStore((state) => state.submitBall);
  const isGameComplete = useScoringStore((state) => state.isGameComplete);
  const editingFrameIndex = useScoringStore((state) => state.editingFrameIndex);
  const selectedBall = useBallStore((s) => s.selectedBall);
  const clearSelectedBall = useBallStore((s) => s.clearSelectedBall);

  // Hide during a completed game UNLESS the user is actively editing a frame.
  if (isGameComplete && editingFrameIndex === null) return null;

  const isEditing = editingFrameIndex !== null;

  const handleSubmit = () => {
    console.log('[SubmitBall] ball selected:', selectedBall ?? 'none', isEditing ? '(edit mode)' : '');
    submitBall();
    clearSelectedBall();
  };

  return (
    <WebButton
      onPress={handleSubmit}
      style={{
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: isEditing ? '#fbbf24' : '#22d3ee',
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontWeight: '700', color: '#000000' }}>
        {isEditing ? 'Update Frame' : 'Submit Ball'}
      </Text>
    </WebButton>
  );
}
