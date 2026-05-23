import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../lib/theme';

interface Props {
  width: number | string;
  height: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export default function Shimmer({ width: w, height, style, borderRadius = radius.md }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: w as any, height, borderRadius, backgroundColor: colors.metal, opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) },
        style,
      ]}
    />
  );
}

export function CarCardSkeleton() {
  return (
    <View style={sk.card}>
      <Shimmer width="100%" height={180} borderRadius={0} />
      <View style={sk.body}>
        <Shimmer width="70%" height={16} />
        <Shimmer width="50%" height={12} style={{ marginTop: 8 }} />
        <Shimmer width="40%" height={20} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

export function ListCardSkeleton() {
  return (
    <View style={sk.listCard}>
      <Shimmer width={110} height={100} borderRadius={0} />
      <View style={sk.listBody}>
        <Shimmer width="80%" height={14} />
        <Shimmer width="60%" height={11} style={{ marginTop: 8 }} />
        <Shimmer width="45%" height={18} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  card: { width: 280, borderRadius: radius.xl, backgroundColor: colors.darkCard, overflow: 'hidden', marginRight: 14 },
  body: { padding: 14 },
  listCard: { flexDirection: 'row', backgroundColor: colors.darkCard, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 12 },
  listBody: { flex: 1, padding: 14, justifyContent: 'center' },
});
