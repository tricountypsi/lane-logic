import { View, Text, Pressable } from 'react-native';

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
  const canAddGame = !isSessionComplete; // Practice always true

  const progressLabel =
    limit !== null
      ? `Game ${gameNumber} of ${limit}`
      : `Game ${gameNumber}`;

  return (
    <View className="gap-3 rounded-xl border border-white/5 bg-[#242430] p-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs uppercase text-[#8e8eaf]">Game Complete</Text>
        <Text className="text-xs text-white/40">{progressLabel}</Text>
      </View>

      {latestGame && (
        <View className="items-center py-2">
          <Text className="text-5xl font-extrabold text-cyan-300">{latestGame.finalScore}</Text>
          <Text className="mt-1 text-xs text-white/50">Final Score</Text>
        </View>
      )}

      {isSessionComplete && (
        <View className="rounded-lg bg-cyan-400/10 px-3 py-2">
          <Text className="text-center text-sm font-semibold text-cyan-400">
            {sessionType} session complete
          </Text>
          {currentSessionGames.length > 1 && (
            <Text className="text-center text-xs text-cyan-400/70 mt-0.5">
              Avg:{' '}
              {Math.round(
                currentSessionGames.reduce((s, g) => s + g.finalScore, 0) /
                  currentSessionGames.length,
              )}
            </Text>
          )}
        </View>
      )}

      <View className="gap-2">
        {canAddGame && (
          <Pressable
            onPress={startNewGame}
            className="items-center rounded-lg bg-cyan-400 py-3"
          >
            <Text className="font-bold text-black">
              {limit !== null ? `Game ${gameNumber + 1} of ${limit}` : 'New Game'}
            </Text>
          </Pressable>
        )}

        <View className="flex-row gap-2">
          <Pressable
            onPress={saveSession}
            className="flex-1 items-center rounded-lg border border-emerald-400 bg-emerald-400/10 py-3"
          >
            <Text className="font-semibold text-emerald-400">Save Session</Text>
          </Pressable>
          <Pressable
            onPress={discardSession}
            className="flex-1 items-center rounded-lg border border-white/10 bg-white/5 py-3"
          >
            <Text className="font-semibold text-white/50">Discard</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
