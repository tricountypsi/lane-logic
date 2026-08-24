import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';

import { PinRack, BoardSelector, OilDepletionChart, VirtualCoachCard, useLanePlayStore } from '@/features/lane-play';
import {
  FrameScoreboard,
  SubmitBallButton,
  GameHistoryList,
  SessionTypeSelector,
  SessionControls,
  BallSelector,
  DeliveryMetricsInput,
  StrikeSpareButtons,
  useScoringStore,
} from '@/features/scoring';
import { WebButton } from '@/shared/WebButton';

/**
 * Scoring screen — rebuilt for lightning-fast data entry.
 *
 * Layout (top → bottom):
 *  1. STRIKE / SPARE quick-action buttons
 *  2. Pin deck (select pins LEFT STANDING after throw)
 *  3. Ball selector + Delivery metrics
 *  4. Board selector + Submit Ball
 *  5. Session controls (post-game)
 *  6. Oil chart + Virtual Coach
 *  7. Session history
 *  8. End Session button
 */
export default function ScoringScreen() {
  const [endConfirm, setEndConfirm] = useState(false);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Force a clean rack at frame start on mount
  useEffect(() => {
    const { frames, currentFrameIndex } = useScoringStore.getState();
    if (frames[currentFrameIndex].length === 0) {
      useLanePlayStore.setState({ pins: Array(10).fill(true) });
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => () => { if (endTimer.current) clearTimeout(endTimer.current); }, []);

  const handleEndSession = () => {
    if (!endConfirm) {
      setEndConfirm(true);
      endTimer.current = setTimeout(() => setEndConfirm(false), 3000);
    } else {
      setEndConfirm(false);
      if (endTimer.current) clearTimeout(endTimer.current);
      useScoringStore.getState().discardSession();
      useLanePlayStore.getState().resetSession();
    }
  };

  const card = {
    gap: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#242430',
    padding: 20,
  };
  const label = { fontSize: 11, textTransform: 'uppercase' as const, color: '#8e8eaf', letterSpacing: 0.5 };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#1a1a24' }}
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 40 }}
    >
      {/* Session type selector */}
      <View style={card}>
        <Text style={label}>Session</Text>
        <SessionTypeSelector />
      </View>

      {/* Scoreboard */}
      <View style={card}>
        <Text style={label}>Scoreboard</Text>
        <FrameScoreboard />
      </View>

      {/* ── STRIKE / SPARE at the very top of data entry ── */}
      <StrikeSpareButtons />

      {/* Current ball entry card */}
      <View style={card}>
        <Text style={label}>Current Ball</Text>

        {/* Pin deck — tap pins LEFT STANDING after throw */}
        <PinRack />

        <BallSelector />
        <DeliveryMetricsInput />
        <BoardSelector />
        <SubmitBallButton />
      </View>

      {/* Post-game controls (save / new game / discard) */}
      <SessionControls />

      {/* Live lane condition */}
      <View style={card}>
        <Text style={label}>Live Lane Condition</Text>
        <OilDepletionChart />
      </View>

      {/* Virtual Coach */}
      <View style={card}>
        <Text style={label}>Virtual Coach</Text>
        <VirtualCoachCard />
      </View>

      {/* Session History */}
      <View style={card}>
        <Text style={label}>Session History</Text>
        <GameHistoryList />
      </View>

      {/* ── END SESSION ── resets oil graph and clears all series data */}
      <WebButton
        onPress={handleEndSession}
        style={{
          alignItems: 'center',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: endConfirm ? '#f87171' : 'rgba(255,255,255,0.1)',
          backgroundColor: endConfirm ? 'rgba(248,113,113,0.12)' : 'transparent',
          paddingVertical: 16,
          marginTop: 4,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: endConfirm ? '#f87171' : 'rgba(255,255,255,0.35)',
          }}
        >
          {endConfirm ? 'Tap again to confirm — this clears all data' : 'End Session'}
        </Text>
      </WebButton>
    </ScrollView>
  );
}
