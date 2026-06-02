import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';

import { colors } from '../lib/theme';

export type ShareWatermarkHandle = {
  captureAll: (imageUrls: string[]) => Promise<string[]>;
};

type Props = {
  watermarkText?: string;
};

const DEFAULT_WATERMARK_TEXT = 'Q8SPORTCAR.COM';

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export default forwardRef<ShareWatermarkHandle, Props>(function ShareWatermarkRenderer(
  { watermarkText = DEFAULT_WATERMARK_TEXT }: Props,
  ref,
) {
  const viewShotRef = useRef<ViewShotRef | null>(null);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const onLoadResolveRef = useRef<(() => void) | null>(null);

  const waitForLoad = () => new Promise<void>((resolve) => {
    onLoadResolveRef.current = resolve;
  });

  const onLoadEnd = () => {
    onLoadResolveRef.current?.();
    onLoadResolveRef.current = null;
  };

  const captureOne = async (uri: string): Promise<string | null> => {
    const trimmed = String(uri || '').trim();
    if (!trimmed) return null;

    const loadPromise = waitForLoad();
    setActiveUri(trimmed);

    // Wait for the image to finish loading into the view.
    await loadPromise;

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
      const unique = Array.from(new Set(list.map(u => String(u || '').trim()).filter(Boolean)));

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
    <View pointerEvents="none" style={s.offscreen}>
      <ViewShot
        ref={(r) => {
          viewShotRef.current = r;
        }}
        options={{
          format: 'jpg',
          quality: 0.92,
          result: 'tmpfile',
          width: 1080,
          height: 1350,
        }}
        style={s.canvas}
      >
        {activeUri ? (
          <Image source={{ uri: activeUri }} style={s.image} resizeMode="cover" onLoadEnd={onLoadEnd} />
        ) : (
          <View style={s.image} />
        )}

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
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
    opacity: 0,
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
