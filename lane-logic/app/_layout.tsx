import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Splash screen only makes sense on native. On web it leaves a transparent
// pointer-capturing overlay that silently blocks every tap on the page.
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

  // On web: always render immediately — no splash screen to wait for.
  // On native: hold until fonts are ready.
  if (Platform.OS !== 'web' && !fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/[gameId]" options={{ headerShown: true, title: 'Game' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
