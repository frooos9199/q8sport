import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { colors } from '../lib/theme';
import Shimmer from './Shimmer';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

type Props = {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  fallback?: ReactNode;
  placeholderColor?: string;
};

export default function FastAdImage({
  uri,
  style,
  fallback,
  placeholderColor = colors.metal,
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
});
