import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BurnoutLoader = ({ text = 'جاري التحميل...' }) => {
  const smokeAnim = useRef(new Animated.Value(0)).current;
  const fireAnim = useRef(new Animated.Value(0)).current;
  const carShake = useRef(new Animated.Value(0)).current;
  const wheelSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // دخان يطلع - تحسين: مدة أقصر
    Animated.loop(
      Animated.sequence([
        Animated.timing(smokeAnim, {
          toValue: 1,
          duration: 1000, // تقليل من 1500 إلى 1000
          useNativeDriver: true,
        }),
        Animated.timing(smokeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // نار تشتعل - تحسين: مدة أقصر
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnim, {
          toValue: 1,
          duration: 200, // تقليل من 300 إلى 200
          useNativeDriver: true,
        }),
        Animated.timing(fireAnim, {
          toValue: 0,
          duration: 200, // تقليل من 300 إلى 200
          useNativeDriver: true,
        }),
      ])
    ).start();

    // السيارة تهتز - تحسين: أقل اهتزاز
    Animated.loop(
      Animated.sequence([
        Animated.timing(carShake, {
          toValue: 3, // تقليل من 5 إلى 3
          duration: 40, // تقليل من 50 إلى 40
          useNativeDriver: true,
        }),
        Animated.timing(carShake, {
          toValue: -3, // تقليل من -5 إلى -3
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(carShake, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // الإطارات تدور - تحسين: دوران أسرع
    Animated.loop(
      Animated.timing(wheelSpin, {
        toValue: 1,
        duration: 600, // تقليل من 800 إلى 600
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const smokeOpacity = smokeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.4, 0],
  });

  const smokeScale = smokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const smokeTranslateY = smokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const fireScale = fireAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1],
  });

  const wheelRotate = wheelSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* الخلفية */}
      <View style={styles.road} />

      {/* السيارة */}
      <Animated.View
        style={[
          styles.carContainer,
          {
            transform: [{ translateX: carShake }],
          },
        ]}>
        {/* جسم السيارة */}
        <View style={styles.car}>
          <Text style={styles.carEmoji}>🏎️</Text>
        </View>

        {/* الإطارات */}
        <View style={styles.wheelsContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{ rotate: wheelRotate }],
              },
            ]}>
            <Text style={styles.wheelText}>⚙️</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{ rotate: wheelRotate }],
              },
            ]}>
            <Text style={styles.wheelText}>⚙️</Text>
          </Animated.View>
        </View>

        {/* النار من الإطارات */}
        <Animated.View
          style={[
            styles.fireContainer,
            {
              transform: [{ scale: fireScale }],
            },
          ]}>
          <Text style={styles.fire}>🔥</Text>
          <Text style={styles.fire}>🔥</Text>
        </Animated.View>

        {/* الدخان */}
        <Animated.View
          style={[
            styles.smokeContainer,
            {
              opacity: smokeOpacity,
              transform: [
                { scale: smokeScale },
                { translateY: smokeTranslateY },
              ],
            },
          ]}>
          <Text style={styles.smoke}>💨</Text>
          <Text style={styles.smoke}>💨</Text>
          <Text style={styles.smoke}>💨</Text>
        </Animated.View>
      </Animated.View>

      {/* النص */}
      <View style={styles.textContainer}>
        <Text style={styles.loadingText}>{text}</Text>
        <View style={styles.dotsContainer}>
          <Animated.Text style={[styles.dot, { opacity: smokeAnim }]}>
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: smokeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}>
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: smokeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0, 1],
                }),
              },
            ]}>
            •
          </Animated.Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  road: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 3,
    borderTopColor: '#DC2626',
  },
  carContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  car: {
    marginBottom: -20,
  },
  carEmoji: {
    fontSize: 120,
  },
  wheelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
    marginTop: -30,
  },
  wheel: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 30,
  },
  fireContainer: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    gap: 20,
  },
  fire: {
    fontSize: 40,
  },
  smokeContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    gap: 15,
  },
  smoke: {
    fontSize: 50,
    color: '#666',
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    color: '#DC2626',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default BurnoutLoader;
