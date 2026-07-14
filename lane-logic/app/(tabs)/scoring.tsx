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
        <Text style={label}>Session</Text>
        <SessionTypeSelector />
      </View>

      <View style={card}>
        <Text style={label}>Scoreboard</Text>
        <FrameScoreboard />
      </View>

      <View style={card}>
        <Text style={label}>Current Ball</Text>
        <PinRack />
        <BoardSelector />
        <SubmitBallButton />
      </View>

      {/* SessionControls appears only when a game has just finished */}
      <SessionControls />

      <View style={card}>
        <Text style={label}>Live Lane Condition</Text>
        <OilDepletionChart />
      </View>

      <View style={card}>
        <Text style={label}>Virtual Coach</Text>
        <VirtualCoachCard />
      </View>

      <View style={card}>
        <Text style={label}>Session History</Text>
        <GameHistoryList />
      </View>

    </ScrollView>
  );
}
