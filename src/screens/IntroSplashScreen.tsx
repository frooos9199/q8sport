import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';

import { colors } from '../lib/theme';

type IntroSplashScreenProps = {
  onDone: () => void;
};

export default function IntroSplashScreen({ onDone }: IntroSplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const [isReady, setIsReady] = React.useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = React.useState(width / Math.max(height, 1));

  const videoFrame = React.useMemo(() => {
    const safeAspectRatio = videoAspectRatio || width / Math.max(height, 1);
    const screenAspectRatio = width / Math.max(height, 1);

    if (safeAspectRatio >= screenAspectRatio) {
      return {
        width,
        height: width / safeAspectRatio,
      };
    }

    return {
      width: height * safeAspectRatio,
      height,
    };
  }, [height, videoAspectRatio, width]);

  return (
    <View style={styles.container}>
      <View style={styles.videoStage}>
        <Video
          source={require('../assets/videos/splash.mp4')}
          style={videoFrame}
          resizeMode="contain"
          paused={false}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoad={(event: any) => {
            const naturalWidth = Number(event?.naturalSize?.width) || 0;
            const naturalHeight = Number(event?.naturalSize?.height) || 0;

            if (naturalWidth > 0 && naturalHeight > 0) {
              setVideoAspectRatio(naturalWidth / naturalHeight);
            }

            setIsReady(true);
          }}
          onEnd={onDone}
          onError={onDone}
        />
      </View>

      <View style={styles.overlay}>
        {!isReady ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>جاري تشغيل الافتتاحية</Text>
          </View>
        ) : null}

        <TouchableOpacity activeOpacity={0.88} onPress={onDone} style={styles.skipButton}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  videoStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 36,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  loadingWrap: {
    alignSelf: 'center',
    marginTop: 32,
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  loadingText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  skipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  skipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
});