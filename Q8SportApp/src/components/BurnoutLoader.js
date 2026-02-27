import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BurnoutLoader = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(barAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#000000', '#0a0000', '#000000']}
      style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}>
        <View style={styles.logoBox}>
          <LinearGradient
            colors={['#DC2626', '#B91C1C', '#7F1D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}>
            <Text style={styles.logoText}>Q8</Text>
          </LinearGradient>
        </View>

        <Text style={styles.appName}>Sport Car</Text>
        <Text style={styles.subtitle}>قطع غيار السيارات الأمريكية</Text>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: barWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made in Kuwait 🇰🇼</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 140,
    height: 140,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 60,
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    width: 250,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#444',
    letterSpacing: 1,
  },
});

export default BurnoutLoader;
