import { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useBallStore } from '../store/useBallStore';

/**
 * Destructive reset button — wipes the current game, lane state, and all
 * in-progress session data so the bowler can start completely fresh without
 * having to finish or save.
 *
 * Uses a two-tap confirmation so an accidental press doesn't nuke the game.
 * The confirmation resets automatically after 3 seconds of inactivity.
 *
 * Saved session history is NOT cleared — only the current in-progress game.
 */
export function ClearDataButton() {
  const discardSession = useScoringStore((s) => s.discardSession);
  const resetDelivery = useDeliveryStore((s) => s.reset);
  const clearSelectedBall = useBallStore((s) => s.clearSelectedBall);
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cancel confirmation after 3 seconds
  useEffect(() => {
    if (!confirming) return;
    timerRef.current = setTimeout(() => setConfirming(false), 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  const handlePress = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    // Second tap — actually clear everything
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
    discardSession();
    resetDelivery();
    clearSelectedBall();
  };

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <WebButton
        onPress={handlePress}
        style={{
          alignSelf: 'stretch',
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          paddingVertical: 10,
          borderColor: confirming ? '#f87171' : 'rgba(248,113,113,0.3)',
          backgroundColor: confirming ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.05)',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: confirming ? '700' : '500',
            color: confirming ? '#f87171' : 'rgba(248,113,113,0.6)',
          }}
        >
          {confirming ? 'Tap again to confirm reset' : 'Clear Data'}
        </Text>
      </WebButton>

      {confirming && (
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          Cancels automatically in 3s
        </Text>
      )}
    </View>
  );
}
