import { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';

import { WebButton } from '@/shared/WebButton';
import { useScoringStore } from '../store/useScoringStore';
import { useDeliveryStore, STEPPER_CONFIG, TOGGLE_CONFIG } from '../store/useDeliveryStore';

const CYAN = '#22d3ee';

/**
 * Delivery Metrics input section.
 *
 * Row 1 — Steppers: Speed · PI · PO
 *   Blank (—) in Frame 1; first + tap initialises to a sensible default.
 *   Values carry forward each frame so only small adjustments are needed.
 *
 * Row 2 — Toggles: FL · HI · BK
 *   Simple on/off pills. Reset to off each new frame — these are per-shot
 *   events, not persistent state. Tapping lights them up in cyan.
 */
export function DeliveryMetricsInput() {
  const currentFrameIndex = useScoringStore((s) => s.currentFrameIndex);
  const { frameMetrics, setStepperMetric, toggleMetric, carryForward } = useDeliveryStore();

  // Detect frame advances and carry stepper values forward
  const prevFrameRef = useRef(currentFrameIndex);
  useEffect(() => {
    if (currentFrameIndex !== prevFrameRef.current) {
      carryForward(currentFrameIndex);
      prevFrameRef.current = currentFrameIndex;
    }
  }, [currentFrameIndex, carryForward]);

  const metrics = frameMetrics[currentFrameIndex] ?? {
    speed: null, pi: null, po: null, fl: false, hi: false, bk: false,
  };

  const stepperKeys = Object.keys(STEPPER_CONFIG) as ('speed' | 'pi' | 'po')[];
  const toggleKeys  = Object.keys(TOGGLE_CONFIG)  as ('fl' | 'hi' | 'bk')[];

  const handleDecrement = (key: 'speed' | 'pi' | 'po') => {
    const cfg = STEPPER_CONFIG[key];
    const cur = metrics[key];
    if (cur === null) return;
    setStepperMetric(currentFrameIndex, key, Math.max(cfg.min, cur - 1));
  };

  const handleIncrement = (key: 'speed' | 'pi' | 'po') => {
    const cfg = STEPPER_CONFIG[key];
    const cur = metrics[key];
    if (cur === null) {
      setStepperMetric(currentFrameIndex, key, cfg.initial);
    } else {
      setStepperMetric(currentFrameIndex, key, Math.min(cfg.max, cur + 1));
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

      {/* Row 1: Steppers — Speed, PI, PO */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {stepperKeys.map((key) => {
          const cfg = STEPPER_CONFIG[key];
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
              <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#8e8eaf' }}>
                {cfg.label}
              </Text>
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
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <WebButton onPress={() => handleDecrement(key)} style={btnStyle} disabled={isBlank}>
                  <Text style={{ fontSize: 16, color: isBlank ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', lineHeight: 20 }}>
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

      {/* Row 2: Toggles — FL, HI, BK */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {toggleKeys.map((key) => {
          const cfg = TOGGLE_CONFIG[key];
          const active = metrics[key];

          return (
            <WebButton
              key={key}
              onPress={() => toggleMetric(currentFrameIndex, key)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                borderWidth: 1,
                paddingVertical: 12,
                borderColor: active ? CYAN : 'rgba(255,255,255,0.1)',
                backgroundColor: active ? CYAN : 'rgba(255,255,255,0.03)',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: active ? '#000000' : 'rgba(255,255,255,0.4)',
                }}
              >
                {cfg.label}
              </Text>
            </WebButton>
          );
        })}
      </View>
    </View>
  );
}
