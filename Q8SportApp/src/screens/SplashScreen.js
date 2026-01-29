import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import BurnoutLoader from '../components/BurnoutLoader';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <BurnoutLoader text="Q8 Sport Car" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default SplashScreen;
