import { View, Pressable, Text } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';
import type { BowlingHand } from '../types';

const HANDS: BowlingHand[] = ['Right', 'Left'];

/**
 * Segmented selector for the bowler's throwing hand. Purely a mirror for
 * the virtual coach's transition move call (right moves left, left moves
 * right) — it doesn't affect the oil depletion math.
 */
export function HandednessSelector() {
  const bowlerHand = useLanePlayStore((state) => state.bowlerHand);
  const setBowlerHand = useLanePlayStore((state) => state.setBowlerHand);

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {HANDS.map((hand) => {
        const selected = hand === bowlerHand;
        return (
          <Pressable
            key={hand}
            onPress={() => setBowlerHand(hand)}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 8,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderColor: selected ? '#22d3ee' : 'rgba(255,255,255,0.1)',
              backgroundColor: selected ? 'rgba(34,211,238,0.1)' : '#2d2d3d',
            }}
          >
            <Text style={{ color: selected ? '#22d3ee' : 'rgba(255,255,255,0.7)' }}>
              {hand}-Handed
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
