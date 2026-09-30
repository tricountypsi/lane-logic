import { ScrollView, View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useFrameResults } from '../hooks/useFrameResults';
import { FRAME_COUNT } from '../utils/frameRules';

/**
 * Renders a single ball's pinfall as the traditional scoreboard glyph:
 * "X" for a strike, "/" for a spare, "-" for a gutter, otherwise the count.
 */
function rollLabel(rolls: number[], rollIndex: number): string {
  const pins = rolls[rollIndex];
  if (pins === undefined) return '';
  if (pins === 10) return 'X';

  if (rollIndex > 0) {
    const previous = rolls[rollIndex - 1];
    if (previous !== 10 && previous + pins === 10) return '/';
  }

  return pins === 0 ? '-' : String(pins);
}

/**
 * Classic horizontally-scrolling ten-frame scoreboard.
 *
 * Completed frames are tappable — tapping one enters edit mode for that
 * frame (amber highlight). A "Cancel edit" banner appears above the
 * scoreboard while editing so the user can bail without committing.
 */
export function FrameScoreboard() {
  const currentFrameIndex = useScoringStore((s) => s.currentFrameIndex);
  const isGameComplete = useScoringStore((s) => s.isGameComplete);
  const editingFrameIndex = useScoringStore((s) => s.editingFrameIndex);
  const setEditingFrame = useScoringStore((s) => s.setEditingFrame);
  const cancelEditing = useScoringStore((s) => s.cancelEditing);
  const results = useFrameResults();

  return (
    <View style={{ gap: 8 }}>
      {/* ── Cancel-edit banner ── */}
      {editingFrameIndex !== null && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 8,
            backgroundColor: 'rgba(251,191,36,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(251,191,36,0.35)',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: '#fbbf24', fontWeight: '600' }}>
            Editing Frame {editingFrameIndex + 1} — re-enter all balls
          </Text>
          <WebButton onPress={cancelEditing}>
            <Text style={{ fontSize: 12, color: '#fbbf24', fontWeight: '700' }}>✕ Cancel</Text>
          </WebButton>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {results.map((frame, index) => {
            const isCurrent = index === currentFrameIndex && !isGameComplete && editingFrameIndex === null;
            const isEditing = index === editingFrameIndex;
            // A frame is tappable once it has been played (has rolls or the game moved past it).
            const isCompleted = index < currentFrameIndex || isGameComplete;
            const ballSlots = index === FRAME_COUNT - 1 ? 3 : 2;

            let borderColor = 'rgba(255,255,255,0.1)';
            let bgColor = 'rgba(255,255,255,0.05)';
            if (isCurrent) { borderColor = '#22d3ee'; bgColor = 'rgba(34,211,238,0.1)'; }
            if (isEditing) { borderColor = '#fbbf24'; bgColor = 'rgba(251,191,36,0.12)'; }

            const inner = (
              <View
                style={{
                  width: 56,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: bgColor,
                  padding: 6,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 10,
                    color: isEditing ? '#fbbf24' : isCurrent ? '#22d3ee' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {index + 1}
                </Text>

                <View style={{ marginTop: 4, flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
                  {Array.from({ length: ballSlots }).map((_, ballIndex) => (
                    <Text
                      key={ballIndex}
                      style={{ width: 14, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#fff' }}
                    >
                      {rollLabel(frame.rolls, ballIndex)}
                    </Text>
                  ))}
                </View>

                <Text
                  style={{
                    marginTop: 6,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: '700',
                    color: isEditing ? '#fbbf24' : '#67e8f9',
                  }}
                >
                  {frame.cumulativeScore ?? '—'}
                </Text>

                {/* Edit hint dot on completed frames */}
                {isCompleted && editingFrameIndex === null && (
                  <Text style={{ textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                    ✎
                  </Text>
                )}
              </View>
            );

            // Wrap completed (and not currently being edited) frames in a tap target.
            if (isCompleted && !isEditing) {
              return (
                <WebButton key={index} onPress={() => setEditingFrame(index)}>
                  {inner}
                </WebButton>
              );
            }

            return <View key={index}>{inner}</View>;
          })}
        </View>
      </ScrollView>
    </View>
  );
}
