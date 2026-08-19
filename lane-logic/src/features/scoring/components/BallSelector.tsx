import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useBallStore } from '../store/useBallStore';

const BALLS = ['Ball 1', 'Ball 2', 'Ball 3', 'Ball 4', 'Ball 5', 'Ball 6'];

/**
 * Single-select row of 6 static ball buttons.
 * Tapping a ball highlights it; tapping again deselects.
 * The selected label is stored in useBallStore and included
 * in the Supabase shot payload when Submit Ball is pressed.
 */
export function BallSelector() {
  const selectedBall = useBallStore((s) => s.selectedBall);
  const setSelectedBall = useBallStore((s) => s.setSelectedBall);

  const handlePress = (ball: string) => {
    // Tap same ball again → deselect
    setSelectedBall(selectedBall === ball ? null : ball);
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 12, textTransform: 'uppercase', color: '#8e8eaf' }}>
        Ball
      </Text>

      {/* Two rows of 3 */}
      {[BALLS.slice(0, 3), BALLS.slice(3, 6)].map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((ball) => {
            const selected = ball === selectedBall;
            return (
              <WebButton
                key={ball}
                onPress={() => handlePress(ball)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderRadius: 8,
                  borderWidth: 1,
                  paddingVertical: 10,
                  borderColor: selected ? '#22d3ee' : 'rgba(255,255,255,0.1)',
                  backgroundColor: selected
                    ? 'rgba(34,211,238,0.15)'
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selected ? '700' : '400',
                    color: selected ? '#22d3ee' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {ball}
                </Text>
              </WebButton>
            );
          })}
        </View>
      ))}
    </View>
  );
}
