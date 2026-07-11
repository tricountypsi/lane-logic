import { View, Pressable, Text } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';
import { BOWLER_PROFILES } from '../store/useLanePlayStore';

/**
 * Segmented selector for the bowler's rev-rate profile. A custom Pressable
 * row rather than a native picker, since this list is short, fixed, and
 * benefits from staying visible/comparable at a glance (matches the
 * product strategist's original always-visible design).
 */
export function BowlerProfileSelector() {
  const bowlerRpm = useLanePlayStore((state) => state.bowlerRpm);
  const setBowlerRpm = useLanePlayStore((state) => state.setBowlerRpm);

  return (
    <View className="gap-2">
      {BOWLER_PROFILES.map((profile) => {
        const selected = profile.rpm === bowlerRpm;
        return (
          <Pressable
            key={profile.rpm}
            onPress={() => setBowlerRpm(profile.rpm)}
            className={`rounded-lg border px-3 py-2 ${
              selected ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-[#2d2d3d]'
            }`}
          >
            <Text className={selected ? 'text-cyan-400' : 'text-white/70'}>{profile.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
