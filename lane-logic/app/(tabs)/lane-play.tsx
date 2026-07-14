import { ScrollView, View, Text } from 'react-native';

import {
  PinRack,
  BowlerProfileSelector,
  HandednessSelector,
  BallSurfaceSelector,
  BoardSelector,
  OilDepletionChart,
  VirtualCoachCard,
  ShotLogPanel,
} from '@/features/lane-play';

/**
 * Lane Play screen — composes the lane condition tracker, ball arsenal
 * selectors, live oil depletion chart, and virtual coach into one view.
 * All business logic lives in the `lane-play` feature; this screen is
 * purely layout.
 */
export default function LanePlayScreen() {
  const card = {
    gap: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#242430',
    padding: 24,
  };
  const label = { fontSize: 12, textTransform: 'uppercase' as const, color: '#8e8eaf' };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#1a1a24' }}
      contentContainerStyle={{ gap: 24, padding: 24 }}
    >
      <View style={card}>
        <Text style={label}>Input Telemetry</Text>
        <BowlerProfileSelector />
        <HandednessSelector />
        <PinRack />
        <BallSurfaceSelector />
        <BoardSelector />
        <ShotLogPanel />
      </View>

      <View style={card}>
        <Text style={label}>Live Analytics</Text>
        <OilDepletionChart />
      </View>

      <View style={card}>
        <Text style={label}>Virtual Coach</Text>
        <VirtualCoachCard />
      </View>
    </ScrollView>
  );
}
