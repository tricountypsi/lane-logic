import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useDeliveryStore, EXECUTION_OPTIONS, REACTION_OPTIONS } from '../store/useDeliveryStore';

const CYAN = '#22d3ee';

/**
 * Delivery Metrics — two rows of single-select toggle pills.
 *
 * Row 1 (Execution): GR · PO · PI · SP
 * Row 2 (Reaction):  FL · HI · LI · BK
 *
 * Tapping an active pill deselects it. Both rows reset each frame.
 */
export function DeliveryMetricsInput() {
  const currentFrameIndex = useScoringStore((s) => s.currentFrameIndex);
  const { frameMetrics, setExecution, setReaction } = useDeliveryStore();

  const metrics = frameMetrics[currentFrameIndex] ?? { execution: null, reaction: null };

  const pillStyle = (active: boolean) => ({
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: active ? CYAN : 'rgba(255,255,255,0.1)',
    backgroundColor: active ? CYAN : 'rgba(255,255,255,0.03)',
  });

  const pillText = (active: boolean) => ({
    fontSize: 13,
    fontWeight: '700' as const,
    color: active ? '#000000' : 'rgba(255,255,255,0.4)',
  });

  return (
    <View style={{ gap: 8 }}>
      {/* Row 1: Execution */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 10, textTransform: 'uppercase' as const, color: '#8e8eaf', letterSpacing: 0.5 }}>
          Execution
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {EXECUTION_OPTIONS.map((opt) => {
            const active = metrics.execution === opt.key;
            return (
              <WebButton
                key={opt.key}
                onPress={() => setExecution(currentFrameIndex, opt.key)}
                style={pillStyle(active)}
              >
                <Text style={pillText(active)}>{opt.label}</Text>
              </WebButton>
            );
          })}
        </View>
      </View>

      {/* Row 2: Reaction */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 10, textTransform: 'uppercase' as const, color: '#8e8eaf', letterSpacing: 0.5 }}>
          Reaction
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {REACTION_OPTIONS.map((opt) => {
            const active = metrics.reaction === opt.key;
            return (
              <WebButton
                key={opt.key}
                onPress={() => setReaction(currentFrameIndex, opt.key)}
                style={pillStyle(active)}
              >
                <Text style={pillText(active)}>{opt.label}</Text>
              </WebButton>
            );
          })}
        </View>
      </View>
    </View>
  );
}
