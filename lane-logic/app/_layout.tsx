import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the native splash screen visible until fonts are ready, so the user
// never sees a flash of unstyled/default-font content on cold start.
SplashScreen.preventAutoHideAsync();

/**
 * Root layout for the entire app.
 *
 * Responsibilities kept deliberately narrow:
 * 1. Import `global.css` exactly once so NativeWind's compiled styles are
 *    registered before any screen renders.
 * 2. Set up app-wide providers (safe area, gesture handler root) that every
 *    feature depends on but shouldn't have to set up itself.
 * 3. Declare the top-level navigation stack. Feature-specific navigation
 *    (e.g. the tab bar) is configured in its own nested `_layout.tsx`.
 *
 * Business logic, Zustand store wiring, and feature UI all live under
 * `src/features/*` — this file should stay thin.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add custom fonts here, e.g.:
    // Inter: require('../assets/fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
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
