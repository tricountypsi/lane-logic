import { View, Text, Pressable } from 'react-native';

import { useScoringStore } from '../store/useScoringStore';
import type { SessionType } from '../types';

const TYPES: SessionType[] = ['Practice', 'League', 'Tournament'];

const TYPE_SUBTITLE: Record<SessionType, string> = {
  Practice: 'Open',
  League: '3 games',
  Tournament: '6 games',
};

/**
 * Segmented selector for the current session type. Locks once a session is
 * in progress (at least one completed game) — the bowler must save or
 * discard before switching formats.
 */
export function SessionTypeSelector() {
  const sessionType = useScoringStore((s) => s.sessionType);
  const setSessionType = useScoringStore((s) => s.setSessionType);
  const currentSessionGames = useScoringStore((s) => s.currentSessionGames);

  const isLocked = currentSessionGames.length > 0;

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {TYPES.map((type) => {
          const selected = type === sessionType;
          return (
            <Pressable
              key={type}
              onPress={() => setSessionType(type)}
              disabled={isLocked}
              style={{
                flex: 1,
                alignItems: 'center',
                borderRadius: 8,
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 8,
                borderColor: selected ? '#22d3ee' : 'rgba(255,255,255,0.1)',
                backgroundColor: selected ? 'rgba(34,211,238,0.1)' : '#2d2d3d',
                opacity: isLocked && !selected ? 0.4 : 1,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? '#22d3ee' : 'rgba(255,255,255,0.7)' }}>
                {type}
              </Text>
              <Text style={{ fontSize: 12, color: selected ? 'rgba(34,211,238,0.7)' : 'rgba(255,255,255,0.4)' }}>
                {TYPE_SUBTITLE[type]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isLocked && (
        <Text style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Save or discard this session to switch formats
        </Text>
      )}
    </View>
  );
}
