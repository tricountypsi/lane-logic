import { View, Text } from 'react-native';

/**
 * Route for the profile tab. UI should be composed from
 * `src/features/profile/components` once that feature is built out.
 */
export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg text-gray-700">Profile feature placeholder</Text>
    </View>
  );
}
