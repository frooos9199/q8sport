import React, { useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, shadows } from '../lib/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'whatsapp';
  icon?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function PremiumButton({ title, onPress, variant = 'primary', icon, style, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const gradientColors = variant === 'primary' ? colors.gradient.primary as [string, string]
    : variant === 'whatsapp' ? [colors.whatsapp, colors.whatsappDark] as [string, string]
    : [colors.metal, colors.metalLight] as [string, string];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style, disabled && { opacity: 0.6 }]}>
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.85}
        onPress={disabled ? undefined : onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
      >
        <View style={[s.btn, variant === 'primary' && shadows.glow]}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnFill} />
          <Text style={s.text}>{icon ? `${icon} ` : ''}{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 16, paddingHorizontal: 28, borderRadius: radius.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  btnFill: { ...StyleSheet.absoluteFillObject },
  text: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
