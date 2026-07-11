import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// GestureHandlerRootView is required on native but on web it registers
// pointer-event interceptors that can silently swallow all taps/clicks,
// making the entire app non-interactive. Use a plain View on web instead.
const AppRoot = Platform.OS === 'web'
  ? ({ style, children }: { style: object; children: React.ReactNode }) => (
      <View style={style}>{children}</View>
    )
  : GestureHandlerRootView;

// Splash screen only makes sense on native.
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({});

  useEffect(() => {
    if (Platform.OS !== 'web' && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (Platform.OS !== 'web' && !fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppRoot style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/[gameId]" options={{ headerShown: true, title: 'Game' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </AppRoot>
  );
}
