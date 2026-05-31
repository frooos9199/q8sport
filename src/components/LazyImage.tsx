import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageResizeMode, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';
import Shimmer from './Shimmer';

interface Props {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  fallback?: ReactNode;
  placeholderColor?: string;
  showWatermark?: boolean;
  watermarkText?: string;
}

export default function LazyImage({
  uri,
  style,
  resizeMode = 'cover',
  fallback,
  placeholderColor = colors.metal,
  showWatermark = true,
  watermarkText = 'Q8SPORTCAR.COM',
}: Props) {
  const opacity = useRef(new Animated.Value(uri ? 0 : 1)).current;
  const [showPlaceholder, setShowPlaceholder] = useState(Boolean(uri));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setShowPlaceholder(Boolean(uri));
    opacity.setValue(uri ? 0 : 1);
  }, [opacity, uri]);

  const flattenedStyle = useMemo(() => StyleSheet.flatten(style) || {}, [style]);
  const borderRadius = typeof flattenedStyle.borderRadius === 'number' ? flattenedStyle.borderRadius : 0;

  if (!uri || hasError) {
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
      <Animated.Image
        source={{ uri }}
        resizeMode={resizeMode}
        onError={() => {
          setHasError(true);
          setShowPlaceholder(false);
        }}
        onLoadEnd={() => {
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
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