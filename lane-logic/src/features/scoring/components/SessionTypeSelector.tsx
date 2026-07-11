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
    <View className="gap-2">
      <View className="flex-row gap-2">
        {TYPES.map((type) => {
          const selected = type === sessionType;
          return (
            <Pressable
              key={type}
              onPress={() => setSessionType(type)}
              disabled={isLocked}
              className={`flex-1 items-center rounded-lg border px-2 py-2 ${
                selected
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-white/10 bg-[#2d2d3d]'
              } ${isLocked && !selected ? 'opacity-40' : ''}`}
            >
              <Text
                className={`text-sm font-semibold ${selected ? 'text-cyan-400' : 'text-white/70'}`}
              >
                {type}
              </Text>
              <Text className={`text-xs ${selected ? 'text-cyan-400/70' : 'text-white/40'}`}>
                {TYPE_SUBTITLE[type]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isLocked && (
        <Text className="text-center text-xs text-white/40">
          Save or discard this session to switch formats
        </Text>
      )}
    </View>
  );
}
