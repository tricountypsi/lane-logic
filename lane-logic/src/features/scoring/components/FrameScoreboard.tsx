import { ScrollView, View, Text } from 'react-native';

import { useScoringStore } from '../store/useScoringStore';
import { useFrameResults } from '../hooks/useFrameResults';
import { FRAME_COUNT } from '../utils/frameRules';

/**
 * Renders a single ball's pinfall as the traditional scoreboard glyph:
 * "X" for a strike, "/" for a spare (relative to the immediately preceding
 * roll in the same frame), "-" for a gutter/miss, otherwise the pin count.
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
 * Classic horizontally-scrolling ten-frame scoreboard. Each frame shows its
 * individual rolls up top and the running cumulative score below — scores
 * render blank until `calculateScores` can resolve a strike/spare's bonus
 * from future rolls, rather than showing a misleading 0.
 */
export function FrameScoreboard() {
  const currentFrameIndex = useScoringStore((state) => state.currentFrameIndex);
  const isGameComplete = useScoringStore((state) => state.isGameComplete);
  const results = useFrameResults();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {results.map((frame, index) => {
          const isCurrent = index === currentFrameIndex && !isGameComplete;
          const ballSlots = index === FRAME_COUNT - 1 ? 3 : 2;

          return (
            <View
              key={index}
              className={`w-16 rounded-lg border p-2 ${
                isCurrent ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <Text className="text-center text-[10px] text-white/40">{index + 1}</Text>

              <View className="mt-1 flex-row justify-center gap-1">
                {Array.from({ length: ballSlots }).map((_, ballIndex) => (
                  <Text key={ballIndex} className="w-4 text-center text-xs font-bold text-white">
                    {rollLabel(frame.rolls, ballIndex)}
                  </Text>
                ))}
              </View>

              <Text className="mt-2 text-center text-sm font-bold text-cyan-300">
                {frame.cumulativeScore ?? '—'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
