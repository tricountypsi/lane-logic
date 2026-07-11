import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useLanePlayStore } from '../store/useLanePlayStore';

/**
 * Plots remaining oil volume across logged shots. Wraps
 * `react-native-gifted-charts`' LineChart (the RN-compatible replacement
 * for the prototype's `recharts` usage, which is web-only).
 */
export function OilDepletionChart() {
  const shotLog = useLanePlayStore((state) => state.shotLog);

  // shotLog is stored newest-first; the chart should read left-to-right
  // chronologically, plus a starting point at shot 0 / volume 100.
  const chartData = [
    { value: 100, label: '0' },
    ...shotLog
      .slice()
      .reverse()
      .map((shot) => ({ value: shot.oilVolumeRemaining, label: String(shot.shotNumber) })),
  ];

  return (
    <View>
      <LineChart
        data={chartData}
        height={180}
        color="#22d3ee"
        thickness={3}
        dataPointsColor="#22d3ee"
        yAxisColor="rgba(255,255,255,0.1)"
        xAxisColor="rgba(255,255,255,0.1)"
        yAxisTextStyle={{ color: 'rgba(255,255,255,0.4)' }}
        xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.4)' }}
        noOfSections={4}
        maxValue={100}
        initialSpacing={10}
        hideRules
      />
      {chartData.length <= 1 && (
        <Text className="mt-2 text-center text-xs text-white/30">
          Log a shot to start tracking oil volume.
        </Text>
      )}
    </View>
  );
}
