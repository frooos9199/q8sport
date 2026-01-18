import ReactNativeBiometrics from 'react-native-biometrics';
import { StorageService } from '../utils/storage';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

class BiometricService {
  /**
   * التحقق من توفر المصادقة البيومترية على الجهاز
   */
  static async checkAvailability() {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      return {
        available,
        type: biometryType, // 'FaceID', 'TouchID', or 'Biometrics'
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, type: null };
    }
  }

  /**
   * تفعيل المصادقة البيومترية للمستخدم
   */
  static async enableBiometric(email, password) {
    try {
      const { available } = await this.checkAvailability();
      
      if (!available) {
        Alert.alert(
          'غير متاح',
          'المصادقة البيومترية غير متوفرة على هذا الجهاز'
        );
        return false;
      }

      // حفظ بيانات الاعتماد بشكل آمن
      await StorageService.saveBiometricCredentials(email, password);
      await StorageService.setBiometricEnabled(true);
      
      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  /**
   * تسجيل الدخول باستخدام البصمة/الوجه
   */
  static async authenticate() {
    try {
      const { available, type } = await this.checkAvailability();
      
      if (!available) {
        Alert.alert(
          'غير متاح',
          'المصادقة البيومترية غير متوفرة على هذا الجهاز'
        );
        return null;
      }

      // التحقق من تفعيل البيومترية
      const isEnabled = await StorageService.isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      // عرض واجهة المصادقة البيومترية
      const promptMessage = type === 'FaceID' 
        ? 'قم بمسح وجهك للدخول'
        : type === 'TouchID'
        ? 'قم بمسح بصمة الإصبع للدخول'
        : 'استخدم المصادقة البيومترية للدخول';

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'إلغاء',
      });

      if (success) {
        // استرجاع بيانات الاعتماد المحفوظة
        const credentials = await StorageService.getBiometricCredentials();
        return credentials;
      }

      return null;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      Alert.alert('خطأ', 'فشلت عملية المصادقة');
      return null;
    }
  }

  /**
   * تعطيل المصادقة البيومترية
   */
  static async disableBiometric() {
    try {
      await StorageService.removeBiometricCredentials();
      await StorageService.setBiometricEnabled(false);
      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  }

  /**
   * التحقق من تفعيل البيومترية
   */
  static async isEnabled() {
    try {
      return await StorageService.isBiometricEnabled();
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }
}

export default BiometricService;
