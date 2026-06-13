import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';

import { colors } from '../lib/theme';

export type ShareWatermarkHandle = {
  captureAll: (imageUrls: string[]) => Promise<string[]>;
};

type Props = {
  watermarkText?: string;
  isSold?: boolean;
  soldLabel?: string;
};

const DEFAULT_WATERMARK_TEXT = 'Q8SPORTCAR.COM';

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export default forwardRef<ShareWatermarkHandle, Props>(function ShareWatermarkRenderer(
  { watermarkText = DEFAULT_WATERMARK_TEXT, isSold = false, soldLabel = 'مباع' }: Props,
  ref,
) {
  const viewShotRef = useRef<ViewShotRef | null>(null);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const onLoadResolveRef = useRef<(() => void) | null>(null);
  const loadStatusRef = useRef<'idle' | 'ok' | 'error'>('idle');

  const waitForLoad = () => new Promise<void>((resolve) => {
    onLoadResolveRef.current = resolve;
  });

  const onLoadEnd = () => {
    loadStatusRef.current = 'ok';
    onLoadResolveRef.current?.();
    onLoadResolveRef.current = null;
  };

  const onLoadError = () => {
    loadStatusRef.current = 'error';
    onLoadResolveRef.current?.();
    onLoadResolveRef.current = null;
  };

  const captureOne = async (uri: string): Promise<string | null> => {
    const trimmed = String(uri || '').trim();
    if (!trimmed) return null;

    const loadPromise = waitForLoad();
    loadStatusRef.current = 'idle';
    setActiveUri(trimmed);

    // Wait for the image to finish loading into the view.
    await loadPromise;

    if (loadStatusRef.current !== 'ok') {
      return null;
    }

    // Give RN a frame to paint before capture.
    await nextFrame();
    await nextFrame();

    try {
      const shot = viewShotRef.current;
      if (!shot?.capture) return null;

      const outUri = await shot.capture();
      return outUri || null;
    } catch {
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    captureAll: async (imageUrls: string[]) => {
      const list = Array.isArray(imageUrls) ? imageUrls : [];
      const unique = Array.from(new Set(list.map(u => String(u || '').trim()).filter(Boolean))).slice(0, 10);

      const results: string[] = [];
      for (const uri of unique) {
        const captured = await captureOne(uri);
        if (captured) results.push(captured);
      }

      setActiveUri(null);
      return results;
    },
  }), []);

  return (
    <View pointerEvents="none" style={s.hiddenHost} collapsable={false}>
      <ViewShot
        ref={(r) => {
          viewShotRef.current = r;
        }}
        options={{
          format: 'jpg',
          // Keep it Instagram-friendly but lighter (base64/data-uri can be memory heavy on iOS).
          quality: 0.86,
          result: 'data-uri',
          width: 720,
          height: 900,
        }}
        style={s.canvas}
        collapsable={false}
      >
        {activeUri ? (
          <FastImage
            source={{
              uri: activeUri,
              cache: FastImage.cacheControl.immutable,
              priority: FastImage.priority.high,
            }}
            style={s.image}
            resizeMode={FastImage.resizeMode.cover}
            onLoadEnd={onLoadEnd}
            onError={onLoadError}
          />
        ) : (
          <View style={s.image} />
        )}

        {isSold ? (
          <View style={s.soldOverlay}>
            <View style={s.soldBadge}>
              <Text style={s.soldText}>{soldLabel}</Text>
            </View>
          </View>
        ) : null}

        <View style={s.watermark}>
          {String(watermarkText || '').trim().toUpperCase() === DEFAULT_WATERMARK_TEXT ? (
            <Text
              style={s.watermarkText}
              numberOfLines={1}
              ellipsizeMode="clip"
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              allowFontScaling={false}
            >
              <Text style={s.watermarkBrand}>Q8</Text>
              SPORTCAR
              <Text style={s.watermarkBrand}>.COM</Text>
            </Text>
          ) : (
            <Text
              style={s.watermarkText}
              numberOfLines={1}
              ellipsizeMode="clip"
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              allowFontScaling={false}
            >
              {watermarkText}
            </Text>
          )}
        </View>
      </ViewShot>
    </View>
  );
});

const s = StyleSheet.create({
  hiddenHost: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.01,
    zIndex: -1,
  },
  canvas: {
    width: 360,
    height: 450, // 4:5 ratio proxy, upscaled via ViewShot options
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dark,
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldBadge: {
    backgroundColor: 'rgba(227,30,36,0.94)',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  soldText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  watermark: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  watermarkText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  watermarkBrand: {
    color: colors.primary,
  },
});
