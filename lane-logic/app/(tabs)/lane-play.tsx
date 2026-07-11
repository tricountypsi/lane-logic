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
  return (
    <ScrollView className="flex-1 bg-[#1a1a24]" contentContainerClassName="gap-6 p-6">
      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Input Telemetry</Text>
        <BowlerProfileSelector />
        <HandednessSelector />
        <PinRack />
        <BallSurfaceSelector />
        <BoardSelector />
        <ShotLogPanel />
      </View>

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Live Analytics</Text>
        <OilDepletionChart />
      </View>

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Virtual Coach</Text>
        <VirtualCoachCard />
      </View>
    </ScrollView>
  );
}
