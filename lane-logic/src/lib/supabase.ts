import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Storage adapter that works in all three environments:
 *  - Node.js (Expo static pre-render): window is undefined → no-op, returns null
 *  - Web browser: uses localStorage
 *  - Native (iOS/Android): uses AsyncStorage
 *
 * Using AsyncStorage directly on web causes "window is not defined" during
 * Expo's server-side pre-render step, so we swap it out per platform.
 */
const webStorage =
  typeof window !== 'undefined'
    ? {
        getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) =>
          Promise.resolve(localStorage.setItem(key, value)),
        removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
      }
    : {
        // SSR / Node.js — no-op so the pre-render doesn't crash
        getItem: (_key: string) => Promise.resolve(null),
        setItem: (_key: string, _value: string) => Promise.resolve(),
        removeItem: (_key: string) => Promise.resolve(),
      };

const nativeStorage =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Platform.OS !== 'web' ? require('@react-native-async-storage/async-storage').default : null;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : nativeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
