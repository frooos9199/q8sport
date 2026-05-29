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

      <AnimatedFastImage
        source={{
          uri,
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
