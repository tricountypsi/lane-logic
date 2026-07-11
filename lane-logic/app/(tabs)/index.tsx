import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { GlowButton } from '@/components/ui';
import { BowlingBallIcon, GearIcon } from '@/components/ui/icons';

/**
 * Home / title screen — first thing the bowler sees on launch. Styled to
 * match the approved title-screen reference: a dark backdrop with a glowing
 * cyan wordmark and two neon-outlined pill buttons.
 *
 * Background gradient is achieved with react-native-svg (already a project
 * dependency, works in Expo Go without a dev-client rebuild) rather than
 * react-native-linear-gradient (which requires native linking).
 *
 * Settings routes to the `profile` tab until a dedicated settings screen
 * exists; Bowl routes to `scoring`, where a game actually starts.
 */
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f14' }}>
      {/* Full-screen SVG gradient layer — sits behind all content */}
      <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="35%" r="70%">
            <Stop offset="0%" stopColor="#2a2a38" stopOpacity={1} />
            <Stop offset="100%" stopColor="#0f0f14" stopOpacity={1} />
          </RadialGradient>
          <RadialGradient id="glow" cx="50%" cy="38%" r="45%">
            <Stop offset="0%" stopColor="#22d3ee" stopOpacity={0.28} />
            <Stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>

      <View className="flex-1 items-center justify-center px-6">
        {/* Wordmark */}
        <View className="items-center">
          <Text
            className="text-6xl font-extrabold tracking-wide text-white"
            style={{
              textShadowColor: '#22d3ee',
              textShadowRadius: 16,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            L<Text className="text-cyan-300">A</Text>NE
          </Text>

          <View className="-mt-2 flex-row items-center">
            <Text
              className="text-6xl font-extrabold tracking-wide text-white"
              style={{
                textShadowColor: '#22d3ee',
                textShadowRadius: 16,
                textShadowOffset: { width: 0, height: 0 },
              }}
            >
              L
            </Text>
            <View className="mx-1 items-center justify-center">
              <BowlingBallIcon size={44} color="#1d6fe0" holeColor="#d9eaff" />
            </View>
            <Text
              className="text-6xl font-extrabold tracking-wide text-white"
              style={{
                textShadowColor: '#22d3ee',
                textShadowRadius: 16,
                textShadowOffset: { width: 0, height: 0 },
              }}
            >
              GIC
            </Text>
          </View>
        </View>

        {/* Call-to-action buttons */}
        <View className="mt-16 w-full max-w-sm flex-row gap-4">
          <View className="flex-1">
            <GlowButton
              label="Settings"
              icon={<GearIcon size={18} />}
              onPress={() => router.push('/profile')}
            />
          </View>
          <View className="flex-1">
            <GlowButton
              label="Bowl"
              icon={<BowlingBallIcon size={18} />}
              variant="filled"
              onPress={() => router.push('/scoring')}
            />
          </View>
        </View>
      </View>

      {/* Decorative corner accent matching the reference */}
      <Text className="absolute bottom-6 right-6 text-lg text-white/20">✦</Text>
    </View>
  );
}
