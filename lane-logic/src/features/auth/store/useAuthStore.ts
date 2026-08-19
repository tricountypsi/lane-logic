import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  session: Session | null;
  user: User | null;
  /** False until the initial session check from Supabase resolves. */
  initialized: boolean;

  /** Sign in with email + password. Returns an error message string, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Create a new account. Returns an error message string, or null on success. */
  signUp: (email: string, password: string) => Promise<string | null>;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
  /** Called by the root layout's auth listener to keep the store in sync. */
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  initialized: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null, initialized: true }),

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    // Supabase may require email confirmation — surface that to the caller
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
