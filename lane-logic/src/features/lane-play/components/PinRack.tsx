import { View, Pressable, Text } from 'react-native';

import { useLanePlayStore } from '../store/useLanePlayStore';

/**
 * Interactive 10-pin rack. Tapping a pin toggles whether it's standing
 * (included in the next logged shot's "leave") or knocked down. Layout
 * mirrors a standard bowling pin deck: 4-3-2-1 rows from back to front.
 */
export function PinRack() {
  const pins = useLanePlayStore((state) => state.pins);
  const togglePin = useLanePlayStore((state) => state.togglePin);

  const rows = [
    [6, 7, 8, 9], // back row, pins 7-10
    [3, 4, 5], // pins 4-6
    [1, 2], // pins 2-3
    [0], // headpin, pin 1
  ];

  return (
    <View className="items-center gap-2">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-2">
          {row.map((pinIndex) => (
            <Pressable
              key={pinIndex}
              onPress={() => togglePin(pinIndex)}
              className={`h-10 w-10 items-center justify-center rounded-full border ${
                pins[pinIndex] ? 'border-white/20 bg-white/10' : 'border-white/5 bg-black/30'
              }`}
            >
              <Text className={pins[pinIndex] ? 'text-white' : 'text-white/30'}>{pinIndex + 1}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
