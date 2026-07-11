import { Link } from 'expo-router';
import { View, Text } from 'react-native';

import { BowlingBallIcon, GearIcon } from '@/components/ui/icons';

/**
 * Home / title screen. Uses expo-router <Link> (renders as <a> on web)
 * instead of router.push() so navigation works reliably in the static
 * web export without any pointer-event or JavaScript-handler quirks.
 * SVG gradient removed in favour of plain Views to avoid react-native-svg
 * swallowing pointer events on mobile web browsers.
 */
export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f14' }}>
      {/* Subtle radial glow — pure View, no SVG, no pointer-event risk */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#2a2a38',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '10%',
          alignSelf: 'center',
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: '#22d3ee',
          opacity: 0.07,
        }}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>

        {/* Wordmark */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 60,
              fontWeight: '900',
              letterSpacing: 2,
              color: '#ffffff',
              textShadowColor: '#22d3ee',
              textShadowRadius: 16,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            L<Text style={{ color: '#67e8f9' }}>A</Text>NE
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8 }}>
            <Text
              style={{
                fontSize: 60,
                fontWeight: '900',
                letterSpacing: 2,
                color: '#ffffff',
                textShadowColor: '#22d3ee',
                textShadowRadius: 16,
                textShadowOffset: { width: 0, height: 0 },
              }}
            >
              L
            </Text>
            <View style={{ marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' }}>
              <BowlingBallIcon size={44} color="#1d6fe0" holeColor="#d9eaff" />
            </View>
            <Text
              style={{
                fontSize: 60,
                fontWeight: '900',
                letterSpacing: 2,
                color: '#ffffff',
                textShadowColor: '#22d3ee',
                textShadowRadius: 16,
                textShadowOffset: { width: 0, height: 0 },
              }}
            >
              GIC
            </Text>
          </View>
        </View>

        {/* Navigation buttons — Link renders as <a> on web, always clickable */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 64, width: '100%', maxWidth: 360 }}>

          {/* Settings */}
          <Link href="/profile" asChild style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#22d3ee',
                paddingHorizontal: 24,
                paddingVertical: 16,
                backgroundColor: 'rgba(34,211,238,0.1)',
                shadowColor: '#22d3ee',
                shadowOpacity: 0.8,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <GearIcon size={18} />
              <Text style={{ color: '#0a1f23', fontWeight: '900', fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' }}>
                Settings
              </Text>
            </View>
          </Link>

          {/* Bowl */}
          <Link href="/scoring" asChild style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#22d3ee',
                paddingHorizontal: 24,
                paddingVertical: 16,
                backgroundColor: 'rgba(13,148,136,0.4)',
                shadowColor: '#22d3ee',
                shadowOpacity: 0.8,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <BowlingBallIcon size={18} color="#1d6fe0" holeColor="#d9eaff" />
              <Text style={{ color: '#0a1f23', fontWeight: '900', fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' }}>
                Bowl
              </Text>
            </View>
          </Link>

        </View>
      </View>

      {/* Decorative corner accent */}
      <Text style={{ position: 'absolute', bottom: 24, right: 24, fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>
        ✦
      </Text>
    </View>
  );
}
