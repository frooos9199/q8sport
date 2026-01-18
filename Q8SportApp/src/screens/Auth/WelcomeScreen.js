import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';

const { height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>
          <Text style={styles.brandNameRed}>Q8</Text>
          <Text style={styles.brandNameWhite}> Sport Car</Text>
        </Text>
        <View style={styles.taglineContainer}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>KUWAIT</Text>
          <View style={styles.taglineLine} />
        </View>
        <Text style={styles.subtitle}>سوق السيارات الرياضية الأول</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🏎️</Text>
          </View>
          <Text style={styles.featureTitle}>قطع أصلية</Text>
          <Text style={styles.featureDesc}>منتجات معتمدة</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>⚡</Text>
          </View>
          <Text style={styles.featureTitle}>توصيل سريع</Text>
          <Text style={styles.featureDesc}>خدمة متميزة</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🔒</Text>
          </View>
          <Text style={styles.featureTitle}>دفع آمن</Text>
          <Text style={styles.featureDesc}>حماية كاملة</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>إنشاء حساب جديد</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('GuestHome')}
          activeOpacity={0.6}>
          <Text style={styles.guestText}>تصفح كزائر</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  brandNameRed: {
    color: '#DC2626',
  },
  brandNameWhite: {
    color: '#fff',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: '#DC2626',
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  featuresSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  guestText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
