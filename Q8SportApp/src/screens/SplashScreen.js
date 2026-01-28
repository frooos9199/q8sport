import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 1000); // تقليل مدة شاشة التحميل إلى ثانية واحدة فقط

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.6],
              }),
            },
          ]}
        />

        <Text style={styles.title}>
          <Text style={styles.titleRed}>Q8</Text>
          <Text style={styles.titleWhite}> Sport Car</Text>
        </Text>

        <View style={styles.taglineContainer}>
          <View style={styles.line} />
          <Text style={styles.tagline}>KUWAIT</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.subtitle}>سوق السيارات الرياضية</Text>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingBar,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#DC2626',
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  titleRed: {
    color: '#DC2626',
  },
  titleWhite: {
    color: '#fff',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: '#DC2626',
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    width: '60%',
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DC2626',
  },
});

export default SplashScreen;
