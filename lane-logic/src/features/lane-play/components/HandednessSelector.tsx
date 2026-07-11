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
    <View className="flex-row gap-2">
      {HANDS.map((hand) => {
        const selected = hand === bowlerHand;
        return (
          <Pressable
            key={hand}
            onPress={() => setBowlerHand(hand)}
            className={`flex-1 items-center rounded-lg border px-3 py-2 ${
              selected ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-[#2d2d3d]'
            }`}
          >
            <Text className={selected ? 'text-cyan-400' : 'text-white/70'}>{hand}-Handed</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
