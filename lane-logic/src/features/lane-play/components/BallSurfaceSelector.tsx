import { View, Pressable, Text } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';
import type { BallSurface } from '../types';

const SURFACES: BallSurface[] = ['Solid', 'Pearl', 'Urethane'];

/** Segmented selector for the ball surface used on the next logged shot. */
export function BallSurfaceSelector() {
  const ballSurface = useLanePlayStore((state) => state.ballSurface);
  const setBallSurface = useLanePlayStore((state) => state.setBallSurface);

  return (
    <View className="flex-row gap-2">
      {SURFACES.map((surface) => {
        const selected = surface === ballSurface;
        return (
          <Pressable
            key={surface}
            onPress={() => setBallSurface(surface)}
            className={`flex-1 items-center rounded-lg border px-3 py-2 ${
              selected ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-[#2d2d3d]'
            }`}
          >
            <Text className={selected ? 'text-cyan-400' : 'text-white/70'}>{surface}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
