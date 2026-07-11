import { View, Text, Pressable } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';

/** Primary "Log Shot" action button plus a scrollable history of past shots. */
export function ShotLogPanel() {
  const logShot = useLanePlayStore((state) => state.logShot);
  const shotLog = useLanePlayStore((state) => state.shotLog);

  return (
    <View className="gap-3">
      <Pressable onPress={logShot} className="items-center rounded-lg bg-cyan-400 py-3">
        <Text className="font-bold text-black">Log Shot</Text>
      </Pressable>

      {shotLog.length > 0 && (
        <View className="gap-1">
          {shotLog.slice(0, 5).map((shot) => (
            <View key={shot.shotNumber} className="flex-row justify-between rounded bg-white/5 px-3 py-2">
              <Text className="text-xs text-white/70">
                #{shot.shotNumber} — {shot.leave}
              </Text>
              <Text className="text-xs text-white/40">{shot.oilVolumeRemaining} oil</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
