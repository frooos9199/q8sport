import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FloatingAddButton = ({ onPress, focused }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.85,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}>
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}>
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [{ rotate }],
              },
            ]}>
            <Ionicons name="add" size={34} color="#fff" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#000',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default FloatingAddButton;
