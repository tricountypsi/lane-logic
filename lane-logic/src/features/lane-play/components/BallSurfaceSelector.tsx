import { View, Pressable, Text } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';
import type { BallSurface } from '../types';

const SURFACES: BallSurface[] = ['Solid', 'Pearl', 'Urethane'];

/** Segmented selector for the ball surface used on the next logged shot. */
export function BallSurfaceSelector() {
  const ballSurface = useLanePlayStore((state) => state.ballSurface);
  const setBallSurface = useLanePlayStore((state) => state.setBallSurface);

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {SURFACES.map((surface) => {
        const selected = surface === ballSurface;
        return (
          <Pressable
            key={surface}
            onPress={() => setBallSurface(surface)}
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
              {surface}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
