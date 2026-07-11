import { View, Text } from 'react-native';

/**
 * Route for the analytics tab. UI should be composed from
 * `src/features/analytics/components` once that feature is built out.
 */
export default function AnalyticsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg text-gray-700">Analytics feature placeholder</Text>
    </View>
  );
}
