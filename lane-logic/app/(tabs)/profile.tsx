import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { WebButton } from '@/shared/WebButton';

const BALLS = [
  { key: 'ball_1' as const, label: 'Ball 1' },
  { key: 'ball_2' as const, label: 'Ball 2' },
  { key: 'ball_3' as const, label: 'Ball 3' },
  { key: 'ball_4' as const, label: 'Ball 4' },
  { key: 'ball_5' as const, label: 'Ball 5' },
  { key: 'ball_6' as const, label: 'Ball 6' },
];

const PLACEHOLDERS = [
  'e.g., Phaze II',
  'e.g., Hyroad',
  'e.g., Proton',
  'e.g., Iq Tour',
  'e.g., Marvel Pearl',
  'e.g., Spare Ball',
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { profile, loading, saving, saveSuccess, error, loadProfile, updateField, saveProfile } =
    useProfileStore();

  useEffect(() => {
    if (user?.id) loadProfile(user.id);
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    await saveProfile(user.id);
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    backgroundColor: '#1a1a24',
    color: '#ffffff',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flex: 1,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a24', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#22d3ee" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a24' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: -0.5,
            marginBottom: 4,
          }}
        >
          My Profile
        </Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          {user?.email}
        </Text>

        {/* Arsenal card */}
        <View
          style={{
            backgroundColor: '#242430',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
            padding: 20,
            gap: 14,
          }}
        >
          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#22d3ee', marginBottom: 2 }}>
              Ball Arsenal
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              Name each ball slot so your scoring history makes sense at a glance.
            </Text>
          </View>

          {BALLS.map((ball, index) => (
            <View key={ball.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {/* Slot label pill */}
              <View
                style={{
                  width: 52,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: 'rgba(34,211,238,0.1)',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#22d3ee' }}>
                  {ball.label}
                </Text>
              </View>

              {/* Text input */}
              <TextInput
                style={inputStyle}
                value={profile[ball.key]}
                onChangeText={(val) => updateField(ball.key, val)}
                placeholder={PLACEHOLDERS[index]}
                placeholderTextColor="rgba(255,255,255,0.2)"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          ))}

          {/* Feedback messages */}
          {error && (
            <Text style={{ fontSize: 13, color: '#f87171', textAlign: 'center' }}>{error}</Text>
          )}
          {saveSuccess && (
            <Text style={{ fontSize: 13, color: '#34d399', textAlign: 'center' }}>
              Arsenal saved!
            </Text>
          )}

          {/* Save button */}
          <WebButton
            onPress={handleSave}
            disabled={saving}
            style={{
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: saving ? 'rgba(34,211,238,0.4)' : '#22d3ee',
              paddingVertical: 14,
              marginTop: 4,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#000' }}>
                Save Arsenal
              </Text>
            )}
          </WebButton>
        </View>

        {/* Sign out */}
        <WebButton
          onPress={() => useAuthStore.getState().signOut()}
          style={{ alignItems: 'center', marginTop: 32, paddingVertical: 10 }}
        >
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Sign Out</Text>
        </WebButton>
      </ScrollView>
    </SafeAreaView>
  );
}
