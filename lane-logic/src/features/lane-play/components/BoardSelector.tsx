import { View, Text, Pressable } from 'react-native';

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
  return (
    <View className="flex-row items-center justify-between">
      <Text className="w-28 text-sm text-white/60">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(Math.max(MIN_BOARD, value - 1))}
          className="h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#2d2d3d]"
        >
          <Text className="text-lg text-white/70">−</Text>
        </Pressable>
        <Text className="w-10 text-center text-lg font-bold text-white">{value}</Text>
        <Pressable
          onPress={() => onChange(Math.min(MAX_BOARD, value + 1))}
          className="h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#2d2d3d]"
        >
          <Text className="text-lg text-white/70">+</Text>
        </Pressable>
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
    miss === 0 ? 'text-emerald-400' : miss <= 2 ? 'text-amber-400' : 'text-red-400';

  return (
    <View className="gap-3">
      <BoardStepper label="Target Board" value={targetBoard} onChange={setTargetBoard} />
      <BoardStepper label="Actual Board" value={actualBoard} onChange={setActualBoard} />
      <View className="flex-row justify-end">
        {miss > 0 ? (
          <Text className={`text-xs font-semibold ${missColor}`}>
            {miss} board{miss !== 1 ? 's' : ''} off target
          </Text>
        ) : (
          <Text className="text-xs font-semibold text-emerald-400">On target</Text>
        )}
      </View>
    </View>
  );
}
