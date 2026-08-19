import React, { useRef, useEffect, ReactNode } from 'react';
import { Platform, TouchableOpacity, View, ViewStyle } from 'react-native';

interface WebButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
  activeOpacity?: number;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Cross-platform pressable that works correctly on web.
 *
 * On web, react-native-web's responder system is broken with React 19 —
 * onPress never fires. This component bypasses it entirely by attaching
 * a native DOM 'click' event listener via a ref. On native it falls back
 * to the standard TouchableOpacity so nothing changes there.
 */
export function WebButton({
  onPress,
  style,
  activeOpacity = 0.8,
  disabled,
  children,
}: WebButtonProps) {
  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={style}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <WebClickView onPress={onPress} style={style} disabled={disabled}>
      {children}
    </WebClickView>
  );
}

function WebClickView({
  onPress,
  style,
  disabled,
  children,
}: {
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  children: ReactNode;
}) {
  const viewRef = useRef<any>(null);
  const onPressRef = useRef(onPress);

  // Keep ref current so the click handler always calls the latest onPress
  useEffect(() => {
    onPressRef.current = onPress;
  });

  useEffect(() => {
    const el = viewRef.current;
    if (!el || disabled) return;
    const handler = () => {
      onPressRef.current?.();
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [disabled]);

  return (
    <View
      ref={viewRef}
      pointerEvents={disabled ? 'none' : 'auto'}
      // @ts-ignore — cursor is a web-only style property
      style={[style, { cursor: disabled ? 'default' : 'pointer' }]}
    >
      {children}
    </View>
  );
}
