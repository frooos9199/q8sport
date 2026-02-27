import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

/**
 * Skeleton Loader سريع وخفيف للمنتجات
 */
const ProductCardSkeleton = () => {
  const animValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      <View style={styles.contentSkeleton}>
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        <Animated.View style={[styles.priceSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

/**
 * Fast Skeleton Grid للصفحة الرئيسية
 */
export const FastSkeletonGrid = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </View>
      <View style={styles.row}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  imageSkeleton: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
  },
  contentSkeleton: {
    padding: 12,
  },
  titleSkeleton: {
    height: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  priceSkeleton: {
    height: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    width: '50%',
  },
});

export default FastSkeletonGrid;
