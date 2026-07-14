import { View, Text, Pressable } from 'react-native';

import { useScoringStore } from '../store/useScoringStore';
import type { BowlingSession } from '../types';

const TYPE_COLOR: Record<BowlingSession['type'], string> = {
  Practice: 'rgba(255,255,255,0.5)',
  League: '#22d3ee',
  Tournament: '#fbbf24',
};

const TYPE_BORDER: Record<BowlingSession['type'], string> = {
  Practice: 'rgba(255,255,255,0.1)',
  League: 'rgba(34,211,238,0.3)',
  Tournament: 'rgba(251,191,36,0.3)',
};

const TYPE_BG: Record<BowlingSession['type'], string> = {
  Practice: 'rgba(255,255,255,0.05)',
  League: 'rgba(34,211,238,0.1)',
  Tournament: 'rgba(251,191,36,0.1)',
};

function SessionRow({ session }: { session: BowlingSession }) {
  const date = new Date(session.completedAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View
      style={{
        gap: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: TYPE_BORDER[session.type],
            backgroundColor: TYPE_BG[session.type],
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: TYPE_COLOR[session.type] }}>
            {session.type}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{dateLabel}</Text>
      </View>

      {/* Individual game scores */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {session.games.map((game, i) => (
          <View
            key={game.id}
            style={{
              flex: 1,
              alignItems: 'center',
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.05)',
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>G{i + 1}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>
              {game.finalScore}
            </Text>
          </View>
        ))}
      </View>

      {/* Average (only meaningful when more than 1 game) */}
      {session.games.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Avg{' '}
            <Text style={{ fontWeight: '600', color: '#67e8f9' }}>{session.averageScore}</Text>
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
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
        No saved sessions yet — finish a game and tap Save Session.
      </Text>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {savedSessions.map((session) => (
        <SessionRow key={session.id} session={session} />
      ))}

      <Pressable
        onPress={clearHistory}
        style={{
          marginTop: 4,
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(248,113,113,0.3)',
          backgroundColor: 'rgba(248,113,113,0.05)',
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#f87171' }}>Clear All History</Text>
      </Pressable>
    </View>
  );
}
