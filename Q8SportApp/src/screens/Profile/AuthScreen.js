import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';

const { height } = Dimensions.get('window');

const AuthScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../../../assets/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            <Text style={styles.titleRed}>Q8</Text>
            <Text style={styles.titleWhite}> Sport Car</Text>
          </Text>
          <Text style={styles.subtitle}>سجل الدخول للوصول لكامل المميزات</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>عرض تفاصيل المنتجات</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>إضافة منتجات للبيع</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>التواصل مع البائعين</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>إدارة حسابك الشخصي</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.secondaryButtonText}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingBottom: 120, // مسافة كافية لتجنب الشريط السفلي
  },
  content: {
    paddingVertical: 60,
    paddingBottom: 40, // مسافة إضافية للأزرار
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: height * 0.05,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  titleRed: {
    color: '#DC2626',
  },
  titleWhite: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  features: {
    paddingHorizontal: 30,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureIcon: {
    fontSize: 24,
    marginLeft: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    marginTop: 30,
    marginBottom: 40, // مسافة إضافية لتجنب الشريط السفلي
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  secondaryButtonText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AuthScreen;
