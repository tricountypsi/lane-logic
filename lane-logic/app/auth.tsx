import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const PRIVACY_POLICY_URL = 'https://lane-logic-eight.vercel.app/privacy-policy.html';

/**
 * Email + password login / sign-up screen.
 * Shown whenever the user doesn't have an active session.
 * The root layout's auth listener handles the redirect away from
 * this screen once a session is established.
 */
export default function AuthScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup' && !agreedToPolicy) {
      setError('Please agree to the Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    const err =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    backgroundColor: '#242430',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1a1a24' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          padding: 28,
          gap: 0,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / title */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#22d3ee', letterSpacing: -1 }}>
            Lane Logic
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </Text>
        </View>

        {/* Card */}
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
            backgroundColor: '#242430',
            padding: 24,
            gap: 14,
          }}
        >
          {/* Email */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, textTransform: 'uppercase', color: '#8e8eaf' }}>
              Email
            </Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, textTransform: 'uppercase', color: '#8e8eaf' }}>
              Password
            </Text>
            <TextInput
              style={inputStyle}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry
            />
          </View>

          {/* Privacy Policy checkbox — only on signup */}
          {mode === 'signup' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <WebButton
                onPress={() => setAgreedToPolicy(!agreedToPolicy)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: agreedToPolicy ? '#22d3ee' : 'rgba(255,255,255,0.25)',
                  backgroundColor: agreedToPolicy ? '#22d3ee' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {agreedToPolicy && (
                  <Text style={{ color: '#000', fontSize: 13, fontWeight: '800', lineHeight: 16 }}>
                    ✓
                  </Text>
                )}
              </WebButton>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  I agree to the
                </Text>
                <WebButton onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                  <Text style={{ fontSize: 13, color: '#22d3ee', fontWeight: '600' }}>
                    Privacy Policy
                  </Text>
                </WebButton>
              </View>
            </View>
          )}

          {/* Error / success message */}
          {error && (
            <Text style={{ fontSize: 13, color: '#f87171', textAlign: 'center' }}>{error}</Text>
          )}
          {successMsg && (
            <Text style={{ fontSize: 13, color: '#34d399', textAlign: 'center' }}>{successMsg}</Text>
          )}

          {/* Submit */}
          <WebButton
            onPress={handleSubmit}
            disabled={loading}
            style={{
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: loading ? 'rgba(34,211,238,0.4)' : '#22d3ee',
              paddingVertical: 14,
              marginTop: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000' }}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </WebButton>
        </View>

        {/* Toggle mode */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 4 }}>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </Text>
          <WebButton onPress={() => { setError(null); setSuccessMsg(null); setAgreedToPolicy(false); setMode(mode === 'signin' ? 'signup' : 'signin'); }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#22d3ee' }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Text>
          </WebButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
