import { View, Text, Pressable } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';

/** Primary "Log Shot" action button plus a scrollable history of past shots. */
export function ShotLogPanel() {
  const logShot = useLanePlayStore((state) => state.logShot);
  const shotLog = useLanePlayStore((state) => state.shotLog);

  return (
    <View style={{ gap: 12 }}>
      <Pressable
        onPress={() => logShot()}
        style={{
          alignItems: 'center',
          borderRadius: 8,
          backgroundColor: '#22d3ee',
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontWeight: '700', color: '#000000' }}>Log Shot</Text>
      </Pressable>

      {shotLog.length > 0 && (
        <View style={{ gap: 4 }}>
          {shotLog.slice(0, 5).map((shot) => (
            <View
              key={shot.shotNumber}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.05)',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                #{shot.shotNumber} — {shot.leave}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {shot.oilVolumeRemaining} oil
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
