import { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useDeliveryStore, METRIC_CONFIG, DeliveryMetrics } from '../store/useDeliveryStore';

/**
 * 2×3 grid of +/− steppers for per-frame delivery metrics:
 *   Speed · FL · PI · PO · HI · BK
 *
 * Frame 1 starts completely blank (shown as "—"). On the first + tap,
 * the metric initialises to its sensible default then increments normally.
 * When the scoring store advances to a new frame, all values carry forward
 * from the previous frame automatically — so the bowler only adjusts
 * what actually changed between frames.
 */
export function DeliveryMetricsInput() {
  const currentFrameIndex = useScoringStore((s) => s.currentFrameIndex);
  const { frameMetrics, setMetric, carryForward } = useDeliveryStore();

  // Detect frame advances and carry previous values forward
  const prevFrameRef = useRef(currentFrameIndex);
  useEffect(() => {
    if (currentFrameIndex !== prevFrameRef.current) {
      carryForward(currentFrameIndex);
      prevFrameRef.current = currentFrameIndex;
    }
  }, [currentFrameIndex, carryForward]);

  const metrics = frameMetrics[currentFrameIndex] ?? {
    speed: null, fl: null, pi: null, po: null, hi: null, bk: null,
  };

  const keys = Object.keys(METRIC_CONFIG) as (keyof DeliveryMetrics)[];
  // Split into two rows of 3
  const rows = [keys.slice(0, 3), keys.slice(3, 6)];

  const handleDecrement = (key: keyof DeliveryMetrics) => {
    const cfg = METRIC_CONFIG[key];
    const cur = metrics[key];
    if (cur === null) return; // nothing to decrement from blank
    setMetric(currentFrameIndex, key, Math.max(cfg.min, cur - 1));
  };

  const handleIncrement = (key: keyof DeliveryMetrics) => {
    const cfg = METRIC_CONFIG[key];
    const cur = metrics[key];
    if (cur === null) {
      // First tap — initialise to the sensible default
      setMetric(currentFrameIndex, key, cfg.initial);
    } else {
      setMetric(currentFrameIndex, key, Math.min(cfg.max, cur + 1));
    }
  };

  const btnStyle = {
    height: 30,
    width: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#2d2d3d',
  };

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 12, textTransform: 'uppercase', color: '#8e8eaf' }}>
        Delivery Metrics
      </Text>

      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((key) => {
            const cfg = METRIC_CONFIG[key];
            const val = metrics[key];
            const isBlank = val === null;

            return (
              <View
                key={key}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.07)',
                  backgroundColor: '#1e1e2a',
                  padding: 8,
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                {/* Label */}
                <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#8e8eaf' }}>
                  {cfg.label}
                </Text>

                {/* Value */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: isBlank ? 'rgba(255,255,255,0.2)' : '#ffffff',
                    minWidth: 28,
                    textAlign: 'center',
                  }}
                >
                  {isBlank ? '—' : val}
                </Text>

                {/* + / − buttons */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <WebButton onPress={() => handleDecrement(key)} style={btnStyle} disabled={isBlank}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: isBlank ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                        lineHeight: 20,
                      }}
                    >
                      −
                    </Text>
                  </WebButton>
                  <WebButton onPress={() => handleIncrement(key)} style={btnStyle}>
                    <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 20 }}>
                      +
                    </Text>
                  </WebButton>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
