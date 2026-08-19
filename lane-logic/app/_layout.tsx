import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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

/**
 * Watches the Supabase auth state and redirects between the auth screen
 * and the main tab navigator whenever the session changes.
 */
function AuthGate() {
  const { session, initialized, setSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Subscribe to Supabase auth state changes once on mount
  useEffect(() => {
    // Fetch the current session immediately on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Keep the store in sync with Supabase's auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on session state
  useEffect(() => {
    if (!initialized) return;

    const inAuthScreen = segments[0] === 'auth';

    if (!session && !inAuthScreen) {
      // Not logged in — send to auth
      router.replace('/auth');
    } else if (session && inAuthScreen) {
      // Logged in — send to the app
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return null;
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
        <AuthGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/[gameId]" options={{ headerShown: true, title: 'Game' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </AppRoot>
  );
}
