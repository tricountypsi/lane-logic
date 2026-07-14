import { View, Text, TouchableOpacity } from 'react-native';

import { useScoringStore } from '../store/useScoringStore';
import { SESSION_GAME_LIMIT } from '../types';

/**
 * Shown after a game completes. Displays the just-finished game's score,
 * session progress (e.g. "Game 2 of 3"), and action buttons:
 *
 *  • New Game — available when the session limit hasn't been reached yet
 *    (or always for Practice).
 *  • Save Session — commits all games in the current session to history.
 *  • Discard — throws away the current session without saving.
 */
export function SessionControls() {
  const isGameComplete = useScoringStore((s) => s.isGameComplete);
  const sessionType = useScoringStore((s) => s.sessionType);
  const currentSessionGames = useScoringStore((s) => s.currentSessionGames);
  const startNewGame = useScoringStore((s) => s.startNewGame);
  const saveSession = useScoringStore((s) => s.saveSession);
  const discardSession = useScoringStore((s) => s.discardSession);

  if (!isGameComplete) return null;

  const latestGame = currentSessionGames[currentSessionGames.length - 1];
  const gameNumber = currentSessionGames.length;
  const limit = SESSION_GAME_LIMIT[sessionType];
  const isSessionComplete = limit !== null && gameNumber >= limit;
  const canAddGame = !isSessionComplete;

  const progressLabel =
    limit !== null ? `Game ${gameNumber} of ${limit}` : `Game ${gameNumber}`;

  return (
    <View
      style={{
        gap: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#242430',
        padding: 24,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, textTransform: 'uppercase', color: '#8e8eaf' }}>
          Game Complete
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{progressLabel}</Text>
      </View>

      {latestGame && (
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#67e8f9' }}>
            {latestGame.finalScore}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Final Score
          </Text>
        </View>
      )}

      {isSessionComplete && (
        <View
          style={{
            borderRadius: 8,
            backgroundColor: 'rgba(34,211,238,0.1)',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#22d3ee' }}>
            {sessionType} session complete
          </Text>
          {currentSessionGames.length > 1 && (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: 'rgba(34,211,238,0.7)',
                marginTop: 2,
              }}
            >
              Avg:{' '}
              {Math.round(
                currentSessionGames.reduce((s, g) => s + g.finalScore, 0) /
                  currentSessionGames.length,
              )}
            </Text>
          )}
        </View>
      )}

      <View style={{ gap: 8 }}>
        {canAddGame && (
          <TouchableOpacity
            onPress={startNewGame}
            activeOpacity={0.8}
            style={{
              alignItems: 'center',
              borderRadius: 8,
              backgroundColor: '#22d3ee',
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontWeight: '700', color: '#000000' }}>
              {limit !== null ? `Game ${gameNumber + 1} of ${limit}` : 'New Game'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={saveSession}
            activeOpacity={0.8}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#34d399',
              backgroundColor: 'rgba(52,211,153,0.1)',
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontWeight: '600', color: '#34d399' }}>Save Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={discardSession}
            activeOpacity={0.8}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Discard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
