import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface ProfileData {
  display_name: string;
  ball_1: string;
  ball_2: string;
  ball_3: string;
  ball_4: string;
  ball_5: string;
  ball_6: string;
}

const EMPTY_PROFILE: ProfileData = {
  display_name: '',
  ball_1: '',
  ball_2: '',
  ball_3: '',
  ball_4: '',
  ball_5: '',
  ball_6: '',
};

interface ProfileStore {
  profile: ProfileData;
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  error: string | null;
  /** Fetch the user's profile from Supabase. Call after login. */
  loadProfile: (userId: string) => Promise<void>;
  /** Update a single field locally (does not save to Supabase yet). */
  updateField: (field: keyof ProfileData, value: string) => void;
  /** Persist all profile fields to Supabase. Returns error string or null. */
  saveProfile: (userId: string) => Promise<string | null>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: EMPTY_PROFILE,
  loading: false,
  saving: false,
  saveSuccess: false,
  error: null,

  loadProfile: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows found" — that just means the profile is blank
      set({ loading: false, error: error.message });
      return;
    }

    set({
      loading: false,
      profile: {
        display_name: data?.display_name ?? '',
        ball_1: data?.ball_1 ?? '',
        ball_2: data?.ball_2 ?? '',
        ball_3: data?.ball_3 ?? '',
        ball_4: data?.ball_4 ?? '',
        ball_5: data?.ball_5 ?? '',
        ball_6: data?.ball_6 ?? '',
      },
    });
  },

  updateField: (field, value) =>
    set((state) => ({
      profile: { ...state.profile, [field]: value },
      saveSuccess: false,
    })),

  saveProfile: async (userId) => {
    const { profile } = get();
    set({ saving: true, error: null, saveSuccess: false });

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: profile.display_name || null,
      ball_1: profile.ball_1 || null,
      ball_2: profile.ball_2 || null,
      ball_3: profile.ball_3 || null,
      ball_4: profile.ball_4 || null,
      ball_5: profile.ball_5 || null,
      ball_6: profile.ball_6 || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      set({ saving: false, error: error.message });
      return error.message;
    }

    set({ saving: false, saveSuccess: true });
    return null;
  },
}));
