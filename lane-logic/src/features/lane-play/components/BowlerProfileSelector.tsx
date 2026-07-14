import { View, TouchableOpacity, Text } from 'react-native';

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
    <View style={{ gap: 8 }}>
      {BOWLER_PROFILES.map((profile) => {
        const selected = profile.rpm === bowlerRpm;
        return (
          <TouchableOpacity
            key={profile.rpm}
            onPress={() => setBowlerRpm(profile.rpm)}
            activeOpacity={1}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderColor: selected ? '#22d3ee' : 'rgba(255,255,255,0.1)',
              backgroundColor: selected ? 'rgba(34,211,238,0.1)' : '#2d2d3d',
            }}
          >
            <Text style={{ color: selected ? '#22d3ee' : 'rgba(255,255,255,0.7)' }}>
              {profile.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
