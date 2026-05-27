import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageResizeMode, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { colors } from '../lib/theme';
import Shimmer from './Shimmer';

interface Props {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  fallback?: ReactNode;
  placeholderColor?: string;
}

export default function LazyImage({
  uri,
  style,
  resizeMode = 'cover',
  fallback,
  placeholderColor = colors.metal,
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