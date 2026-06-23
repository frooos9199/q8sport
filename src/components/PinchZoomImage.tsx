import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, GestureResponderEvent, PanResponder, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';

type Props = {
  uri: string;
  style: StyleProp<ViewStyle>;
  onZoomChange?: (zoomed: boolean) => void;
};

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage as any);
const DOUBLE_TAP_DELAY_MS = 280;
const DOUBLE_TAP_ZOOM = 2.5;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getDistance = (touches: any[]) => {
  if (touches.length < 2) return 0;
  const [a, b] = touches;
  const x = Number(a.pageX || 0) - Number(b.pageX || 0);
  const y = Number(a.pageY || 0) - Number(b.pageY || 0);
  return Math.sqrt(x * x + y * y);
};

export default function PinchZoomImage({ uri, style, onZoomChange }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const currentScale = useRef(1);
  const startScale = useRef(1);
  const startDistance = useRef(0);
  const currentTranslate = useRef({ x: 0, y: 0 });
  const startTranslate = useRef({ x: 0, y: 0 });
  const lastTapAt = useRef(0);
  const touchStart = useRef({ x: 0, y: 0, moved: false });

  const animateTo = useCallback((nextScale: number, nextX = 0, nextY = 0) => {
    currentScale.current = nextScale;
    currentTranslate.current = { x: nextX, y: nextY };
    onZoomChange?.(nextScale > 1.01);
    Animated.parallel([
      Animated.spring(scale, { toValue: nextScale, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: nextX, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: nextY, useNativeDriver: true }),
    ]).start();
  }, [onZoomChange, scale, translateX, translateY]);

  const reset = useCallback(() => {
    animateTo(1);
  }, [animateTo]);

  const toggleDoubleTapZoom = () => {
    if (currentScale.current > 1.01) {
      reset();
      return;
    }
    animateTo(DOUBLE_TAP_ZOOM);
  };

  const handleTouchStart = (evt: GestureResponderEvent) => {
    const touch = evt.nativeEvent.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.pageX, y: touch.pageY, moved: false };
  };

  const handleTouchMove = (evt: GestureResponderEvent) => {
    const touch = evt.nativeEvent.touches[0];
    if (!touch) return;
    const movedX = Math.abs(touch.pageX - touchStart.current.x);
    const movedY = Math.abs(touch.pageY - touchStart.current.y);
    if (movedX > 8 || movedY > 8) {
      touchStart.current.moved = true;
    }
  };

  const handleTouchEnd = (evt: GestureResponderEvent) => {
    if (touchStart.current.moved || evt.nativeEvent.changedTouches.length !== 1) return;
    const now = Date.now();
    if (now - lastTapAt.current <= DOUBLE_TAP_DELAY_MS) {
      lastTapAt.current = 0;
      toggleDoubleTapZoom();
      return;
    }
    lastTapAt.current = now;
  };

  useEffect(() => {
    reset();
  }, [reset, uri]);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: evt => evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.01,
    onStartShouldSetPanResponderCapture: evt => evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.01,
    onMoveShouldSetPanResponderCapture: evt => evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.01,
    onMoveShouldSetPanResponder: evt => evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.01,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: evt => {
      const touches = evt.nativeEvent.touches;
      startScale.current = currentScale.current;
      startDistance.current = getDistance(touches);
      startTranslate.current = currentTranslate.current;
    },
    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length >= 2) {
        const distance = getDistance(touches);
        if (distance <= 0) return;
        if (startDistance.current <= 0) {
          startDistance.current = distance;
          startScale.current = currentScale.current;
          return;
        }
        const nextScale = clamp(startScale.current * (distance / startDistance.current), 1, 4);
        currentScale.current = nextScale;
        onZoomChange?.(nextScale > 1.01);
        scale.setValue(nextScale);
        return;
      }

      if (currentScale.current <= 1.01) return;
      const nextX = startTranslate.current.x + gestureState.dx;
      const nextY = startTranslate.current.y + gestureState.dy;
      currentTranslate.current = { x: nextX, y: nextY };
      translateX.setValue(nextX);
      translateY.setValue(nextY);
    },
    onPanResponderRelease: () => {
      if (currentScale.current <= 1.05) {
        reset();
      }
    },
    onPanResponderTerminate: () => {
      if (currentScale.current <= 1.05) {
        reset();
      }
    },
  }), [onZoomChange, reset, scale, translateX, translateY]);

  return (
    <Animated.View
      {...responder.panHandlers}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={[
        style,
        s.zoomFrame,
      ]}
    >
      <AnimatedFastImage
        source={{ uri, cache: FastImage.cacheControl.immutable, priority: FastImage.priority.high }}
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
          },
        ]}
        resizeMode={FastImage.resizeMode.contain}
      />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  zoomFrame: {
    overflow: 'hidden',
  },
});