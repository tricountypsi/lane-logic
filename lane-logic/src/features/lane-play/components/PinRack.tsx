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
    <View style={{ alignItems: 'center', gap: 8 }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((pinIndex) => (
            <Pressable
              key={pinIndex}
              onPress={() => togglePin(pinIndex)}
              style={{
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: pins[pinIndex] ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                backgroundColor: pins[pinIndex] ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
              }}
            >
              <Text style={{ color: pins[pinIndex] ? '#ffffff' : 'rgba(255,255,255,0.3)' }}>
                {pinIndex + 1}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
