import { View, Text, Pressable } from 'react-native';

import { useScoringStore } from '../store/useScoringStore';
import type { BowlingSession } from '../types';

const TYPE_COLOR: Record<BowlingSession['type'], string> = {
  Practice: 'text-white/50',
  League: 'text-cyan-400',
  Tournament: 'text-amber-400',
};

const TYPE_BADGE: Record<BowlingSession['type'], string> = {
  Practice: 'border-white/10 bg-white/5',
  League: 'border-cyan-400/30 bg-cyan-400/10',
  Tournament: 'border-amber-400/30 bg-amber-400/10',
};

function SessionRow({ session }: { session: BowlingSession }) {
  const date = new Date(session.completedAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View className="gap-2 rounded-lg border border-white/5 bg-white/5 p-3">
      {/* Header row */}
      <View className="flex-row items-center justify-between">
        <View className={`rounded border px-2 py-0.5 ${TYPE_BADGE[session.type]}`}>
          <Text className={`text-xs font-semibold ${TYPE_COLOR[session.type]}`}>
            {session.type}
          </Text>
        </View>
        <Text className="text-xs text-white/40">{dateLabel}</Text>
      </View>

      {/* Individual game scores */}
      <View className="flex-row gap-2">
        {session.games.map((game, i) => (
          <View
            key={game.id}
            className="flex-1 items-center rounded bg-white/5 py-1.5"
          >
            <Text className="text-xs text-white/40">G{i + 1}</Text>
            <Text className="text-sm font-bold text-white">{game.finalScore}</Text>
          </View>
        ))}
      </View>

      {/* Average (only meaningful when more than 1 game) */}
      {session.games.length > 1 && (
        <View className="flex-row justify-end">
          <Text className="text-xs text-white/40">
            Avg{' '}
            <Text className="font-semibold text-cyan-300">{session.averageScore}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

/** Scrollable-by-parent list of saved sessions, newest first. */
export function GameHistoryList() {
  const savedSessions = useScoringStore((s) => s.savedSessions);
  const clearHistory = useScoringStore((s) => s.clearHistory);

  if (savedSessions.length === 0) {
    return (
      <Text className="text-sm text-white/40">
        No saved sessions yet — finish a game and tap Save Session.
      </Text>
    );
  }

  return (
    <View className="gap-3">
      {savedSessions.map((session) => (
        <SessionRow key={session.id} session={session} />
      ))}

      <Pressable
        onPress={clearHistory}
        className="mt-1 items-center rounded-lg border border-red-400/30 bg-red-400/5 py-2.5"
      >
        <Text className="text-sm font-semibold text-red-400">Clear All History</Text>
      </Pressable>
    </View>
  );
}
