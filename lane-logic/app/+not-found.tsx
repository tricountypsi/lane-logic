import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg text-gray-700">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 text-brand-500">
          Go to home screen
        </Link>
      </View>
    </>
  );
}
