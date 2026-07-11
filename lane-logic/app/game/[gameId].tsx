import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/**
 * Detail route for a single in-progress or completed game, addressed by
 * `gameId`. This is where the scoring feature's per-game UI will mount.
 */
export default function GameDetailScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg text-gray-700">Game {gameId}</Text>
    </View>
  );
}
