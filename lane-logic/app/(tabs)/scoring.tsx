import { useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';

import { PinRack, BoardSelector, OilDepletionChart, VirtualCoachCard, useLanePlayStore } from '@/features/lane-play';
import {
  FrameScoreboard,
  SubmitBallButton,
  GameHistoryList,
  SessionTypeSelector,
  SessionControls,
  useScoringStore,
} from '@/features/scoring';

/**
 * Scoring screen — single-bowler frame-by-frame scoring built on the same
 * shared pin rack as Lane Play. Session management (Practice / League /
 * Tournament) lives here too: the bowler picks a format, bowls all games,
 * then saves or discards the session. Every submitted ball also runs through
 * the lane-play oil-depletion model so the Virtual Coach stays current
 * regardless of which tab logged the shot.
 */
export default function ScoringScreen() {
  // If we're sitting at the start of a frame (no rolls thrown yet) when this
  // screen mounts, force the shared rack to a clean 10-pin state. Covers
  // the one gap `useScoringStore`'s own reset logic can't: someone switching
  // here straight from a Lane Play session that left pins toggled off.
  // Harmless no-op if the rack is already full.
  useEffect(() => {
    const { frames, currentFrameIndex } = useScoringStore.getState();
    if (frames[currentFrameIndex].length === 0) {
      useLanePlayStore.setState({ pins: Array(10).fill(true) });
    }
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#1a1a24]" contentContainerClassName="gap-6 p-6">

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Session</Text>
        <SessionTypeSelector />
      </View>

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Scoreboard</Text>
        <FrameScoreboard />
      </View>

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Current Ball</Text>
        <PinRack />
        <BoardSelector />
        <SubmitBallButton />
      </View>

      {/* SessionControls appears only when a game has just finished */}
      <SessionControls />

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Live Lane Condition</Text>
        <OilDepletionChart />
      </View>

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Virtual Coach</Text>
        <VirtualCoachCard />
      </View>

      <View className="gap-4 rounded-xl border border-white/5 bg-[#242430] p-6">
        <Text className="text-xs uppercase text-[#8e8eaf]">Session History</Text>
        <GameHistoryList />
      </View>

    </ScrollView>
  );
}
