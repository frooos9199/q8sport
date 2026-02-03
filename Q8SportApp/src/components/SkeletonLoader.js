import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonLoader = ({ width = '100%', height = 150, borderRadius = 8, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton Card للمنتجات
export const SkeletonProductCard = () => {
  return (
    <View style={styles.cardContainer}>
      <SkeletonLoader height={150} borderRadius={8} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="80%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="50%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={14} borderRadius={4} />
      </View>
    </View>
  );
};

// Grid من Skeleton Cards
export const SkeletonGrid = ({ count = 10 }) => {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <SkeletonProductCard />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#2a2a2a',
  },
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    margin: 5,
  },
  cardContent: {
    padding: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  gridItem: {
    width: '50%',
  },
});

export default SkeletonLoader;
