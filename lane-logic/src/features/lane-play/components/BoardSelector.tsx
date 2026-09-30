import { View, Text, TouchableOpacity } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';

/** Minimum and maximum valid board numbers on a standard lane. */
const MIN_BOARD = 1;
const MAX_BOARD = 39;

interface BoardStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Single labeled +/- stepper for one board value (target or actual).
 * Clamps at MIN_BOARD / MAX_BOARD so the store never holds an out-of-range
 * number.
 */
function BoardStepper({ label, value, onChange }: BoardStepperProps) {
  const btnStyle = {
    height: 36,
    width: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#2d2d3d',
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ width: 112, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => onChange(Math.max(MIN_BOARD, value - 1))} activeOpacity={0.8} style={btnStyle}>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>−</Text>
        </TouchableOpacity>
        <Text style={{ width: 40, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#ffffff' }}>
          {value}
        </Text>
        <TouchableOpacity onPress={() => onChange(Math.min(MAX_BOARD, value + 1))} activeOpacity={0.8} style={btnStyle}>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Board tracking input: logs the target board and foot position for each shot.
 */
export function BoardSelector() {
  const targetBoard = useLanePlayStore((s) => s.targetBoard);
  const footPosition = useLanePlayStore((s) => s.footPosition);
  const setTargetBoard = useLanePlayStore((s) => s.setTargetBoard);
  const setFootPosition = useLanePlayStore((s) => s.setFootPosition);

  return (
    <View style={{ gap: 12 }}>
      <BoardStepper label="Target Board" value={targetBoard} onChange={setTargetBoard} />

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

      <BoardStepper label="Foot Position" value={footPosition} onChange={setFootPosition} />
    </View>
  );
}
