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
 * Board tracking input: lets the bowler log the board they intended to play
 * (Target) and the board the ball actually tracked through (Actual). The
 * difference drives the virtual coach's Confidence Score — large or
 * consistent misses signal execution inconsistency and lower the coach's
 * reliability rating before it offers adjustment advice.
 */
export function BoardSelector() {
  const targetBoard = useLanePlayStore((s) => s.targetBoard);
  const actualBoard = useLanePlayStore((s) => s.actualBoard);
  const setTargetBoard = useLanePlayStore((s) => s.setTargetBoard);
  const setActualBoard = useLanePlayStore((s) => s.setActualBoard);

  const miss = Math.abs(targetBoard - actualBoard);
  const missColor =
    miss === 0 ? '#34d399' : miss <= 2 ? '#fbbf24' : '#f87171';

  return (
    <View style={{ gap: 12 }}>
      <BoardStepper label="Target Board" value={targetBoard} onChange={setTargetBoard} />
      <BoardStepper label="Actual Board" value={actualBoard} onChange={setActualBoard} />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {miss > 0 ? (
          <Text style={{ fontSize: 12, fontWeight: '600', color: missColor }}>
            {miss} board{miss !== 1 ? 's' : ''} off target
          </Text>
        ) : (
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#34d399' }}>On target</Text>
        )}
      </View>
    </View>
  );
}
