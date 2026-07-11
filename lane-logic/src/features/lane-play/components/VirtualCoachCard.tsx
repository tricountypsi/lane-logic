import { View, Text } from 'react-native';

import { useCoachFeedback } from '../hooks/useCoachFeedback';
import type { CoachStatusType } from '../types';

const BORDER_COLOR: Record<CoachStatusType, string> = {
  'state-neutral': 'border-cyan-400',
  'state-warn': 'border-amber-400',
  'state-danger': 'border-red-400',
  'state-safe': 'border-emerald-400',
};

/**
 * Virtual coach card — renders the heuristic engine's current status,
 * predictive message, and a confidence bar derived from the bowler's
 * recent target/actual telemetry consistency.
 */
export function VirtualCoachCard() {
  const feedback = useCoachFeedback();
  const borderColor = BORDER_COLOR[feedback.type];
  const score = feedback.confidenceScore;

  const confidenceTextColor =
    score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';
  const confidenceBarColor =
    score >= 70 ? 'bg-emerald-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';

  // Don't render the confidence bar on the initial "SYSTEM READY" state —
  // a 0% score before any shots are logged is misleading.
  const showConfidence = feedback.status !== 'SYSTEM READY';

  return (
    <View className={`border-l-4 bg-white/5 p-4 ${borderColor}`}>
      <Text className="font-bold text-white">{feedback.status}</Text>
      <Text className="mt-2 text-sm text-white/70">{feedback.message}</Text>

      {showConfidence && (
        <View className="mt-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs uppercase tracking-wide text-white/40">
              Confidence
            </Text>
            <Text className={`text-xs font-bold ${confidenceTextColor}`}>
              {score}%
            </Text>
          </View>
          <View className="mt-1.5 h-1 w-full rounded-full bg-white/10">
            <View
              className={`h-1 rounded-full ${confidenceBarColor}`}
              style={{ width: `${score}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
