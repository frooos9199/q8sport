import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { colors } from '../lib/theme';
import Shimmer from './Shimmer';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

type Props = {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  fallback?: ReactNode;
  placeholderColor?: string;
  showWatermark?: boolean;
  watermarkText?: string;
};

export default function FastAdImage({
  uri,
  style,
  fallback,
  placeholderColor = colors.metal,
  showWatermark = true,
  watermarkText = 'Q8SPORTCAR.COM',
}: Props) {
  const safeUri = useMemo(() => {
    if (typeof uri !== 'string') return null;
    const trimmed = uri.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^file:\/\//i.test(trimmed)) return trimmed;
    return null;
  }, [uri]);

  const opacity = useRef(new Animated.Value(safeUri ? 0 : 1)).current;
  const [showPlaceholder, setShowPlaceholder] = useState(Boolean(safeUri));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setShowPlaceholder(Boolean(safeUri));
    opacity.setValue(safeUri ? 0 : 1);
  }, [opacity, safeUri]);

  const flattenedStyle = useMemo(() => StyleSheet.flatten(style) || {}, [style]);
  const borderRadius = typeof flattenedStyle.borderRadius === 'number' ? flattenedStyle.borderRadius : 0;

  if (!safeUri || hasError) {
    return (
      <View style={[s.container, style, { backgroundColor: placeholderColor }]}>
        {fallback}
      </View>
    );
  }

  return (
    <View style={[s.container, style, { backgroundColor: placeholderColor }]}>
      {showPlaceholder ? (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Shimmer width="100%" height="100%" borderRadius={borderRadius} />
        </View>
      ) : null}

      <AnimatedFastImage
        source={{
          uri: safeUri,
          cache: FastImage.cacheControl.immutable,
          priority: FastImage.priority.high,
        }}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => {
          setHasError(true);
          setShowPlaceholder(false);
        }}
        onLoadEnd={() => {
          Animated.timing(opacity, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
          }).start(() => setShowPlaceholder(false));
        }}
        style={[StyleSheet.absoluteFillObject, s.image, { opacity }]}
      />

      {showWatermark ? (
        <View style={s.watermark} pointerEvents="none">
          <Text style={s.watermarkText}>{watermarkText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  watermark: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  watermarkText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    opacity: 0.85,
  },
});
