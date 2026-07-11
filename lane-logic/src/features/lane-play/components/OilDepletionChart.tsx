import { View, Text } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';

import { useLanePlayStore } from '../store/useLanePlayStore';

/**
 * Oil depletion line chart built with react-native-svg so it renders
 * correctly on both native and web. (react-native-gifted-charts pulls in
 * react-native-linear-gradient which is native-only and breaks web hydration.)
 */
export function OilDepletionChart() {
  const shotLog = useLanePlayStore((state) => state.shotLog);

  const points = [
    { value: 100, label: '0' },
    ...shotLog
      .slice()
      .reverse()
      .map((shot) => ({ value: shot.oilVolumeRemaining, label: String(shot.shotNumber) })),
  ];

  const W = 320;
  const H = 160;
  const PAD_LEFT = 32;
  const PAD_RIGHT = 12;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 28;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const toX = (i: number) =>
    PAD_LEFT + (points.length > 1 ? (i / (points.length - 1)) * chartW : chartW / 2);
  const toY = (v: number) => PAD_TOP + ((100 - v) / 100) * chartH;

  const polylinePoints = points.map((p, i) => `${toX(i)},${toY(p.value)}`).join(' ');

  const yTicks = [0, 25, 50, 75, 100];

  if (points.length <= 1) {
    return (
      <Text className="mt-2 text-center text-xs text-white/30">
        Log a shot to start tracking oil volume.
      </Text>
    );
  }

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => (
          <Line
            key={`grid-${tick}`}
            x1={PAD_LEFT}
            y1={toY(tick)}
            x2={W - PAD_RIGHT}
            y2={toY(tick)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}
        {yTicks.map((tick) => (
          <SvgText
            key={`label-${tick}`}
            x={PAD_LEFT - 4}
            y={toY(tick) + 4}
            fontSize={9}
            fill="rgba(255,255,255,0.35)"
            textAnchor="end"
          >
            {tick}
          </SvgText>
        ))}

        {/* X-axis */}
        <Line
          x1={PAD_LEFT}
          y1={H - PAD_BOTTOM}
          x2={W - PAD_RIGHT}
          y2={H - PAD_BOTTOM}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />

        {/* Data line */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle
            key={`dot-${i}`}
            cx={toX(i)}
            cy={toY(p.value)}
            r={3}
            fill="#22d3ee"
          />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          const show = i === 0 || i === points.length - 1 || (points.length < 10 && i % 2 === 0);
          if (!show) return null;
          return (
            <SvgText
              key={`xlabel-${i}`}
              x={toX(i)}
              y={H - PAD_BOTTOM + 14}
              fontSize={9}
              fill="rgba(255,255,255,0.35)"
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
