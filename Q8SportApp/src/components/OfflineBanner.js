import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const OfflineBanner = () => {
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ لا يوجد اتصال بالإنترنت</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    padding: 10,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default OfflineBanner;
