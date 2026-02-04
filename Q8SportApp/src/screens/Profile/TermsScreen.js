import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TermsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-right" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>شروط الاستخدام</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. مقدمة</Text>
          <Text style={styles.text}>
            مرحباً بك في Q8 Sport Car. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. محتوى المستخدم</Text>
          <Text style={styles.text}>
            أنت مسؤول عن أي محتوى تنشره على التطبيق. يجب أن يكون المحتوى:
          </Text>
          <Text style={styles.bulletText}>• قانوني ولا يخالف الأنظمة</Text>
          <Text style={styles.bulletText}>• محترم ولا يحتوي على إساءة</Text>
          <Text style={styles.bulletText}>• دقيق وغير مضلل</Text>
          <Text style={styles.bulletText}>• لا ينتهك حقوق الآخرين</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. المحتوى المحظور</Text>
          <Text style={styles.text}>
            يُمنع منعاً باتاً نشر المحتوى التالي:
          </Text>
          <Text style={styles.bulletText}>• المحتوى الجنسي أو الإباحي</Text>
          <Text style={styles.bulletText}>• خطاب الكراهية والعنصرية</Text>
          <Text style={styles.bulletText}>• التحرش والتنمر</Text>
          <Text style={styles.bulletText}>• العنف والتهديدات</Text>
          <Text style={styles.bulletText}>• الاحتيال والخداع</Text>
          <Text style={styles.bulletText}>• المعلومات المضللة</Text>
          <Text style={styles.bulletText}>• السب والشتم</Text>
          <Text style={styles.bulletText}>• الأنشطة غير القانونية</Text>
        </View>

        <View style={[styles.section, styles.criticalSection]}>
          <View style={styles.criticalHeader}>
            <Icon name="alert-octagon" size={28} color="#d32f2f" />
            <Text style={styles.criticalTitle}>4. سياسة عدم التسامح</Text>
          </View>
          
          <Text style={styles.criticalText}>
            نتبع سياسة صارمة تجاه المخالفات. أي محتوى مخالف سيتم:
          </Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ حذفه فوراً</Text>
            <Text style={styles.warningText}>⚠️ إيقاف حساب الناشر مؤقتاً</Text>
            <Text style={styles.warningText}>⚠️ حظر نهائي عند التكرار</Text>
            <Text style={styles.warningText}>⚠️ إبلاغ الجهات المختصة (للمخالفات القانونية)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. الإبلاغ عن المحتوى</Text>
          <Text style={styles.text}>
            يمكنك الإبلاغ عن أي محتوى مخالف باستخدام زر "إبلاغ" الموجود في كل منشور.
          </Text>
          <View style={styles.infoBox}>
            <Icon name="check-circle" size={20} color="#4caf50" />
            <Text style={styles.infoText}>
              نلتزم بمراجعة جميع البلاغات خلال 24 ساعة
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. حظر المستخدمين</Text>
          <Text style={styles.text}>
            يمكنك حظر أي مستخدم لمنع رؤية محتواه والتواصل معه. الحظر يحميك من:
          </Text>
          <Text style={styles.bulletText}>• المحتوى المزعج</Text>
          <Text style={styles.bulletText}>• المضايقات المتكررة</Text>
          <Text style={styles.bulletText}>• الرسائل غير المرغوبة</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. الحسابات المزيفة</Text>
          <Text style={styles.text}>
            يُحظر إنشاء حسابات مزيفة أو انتحال شخصية الآخرين. يجب أن تكون معلوماتك حقيقية ودقيقة.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. الخصوصية</Text>
          <Text style={styles.text}>
            نحن نحترم خصوصيتك ونحمي بياناتك الشخصية. لن نشارك معلوماتك مع أطراف ثالثة دون إذنك.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. حقوق الملكية الفكرية</Text>
          <Text style={styles.text}>
            يجب عدم نشر محتوى محمي بحقوق الطبع والنشر دون إذن. صورك ومنشوراتك تبقى ملكك الخاص.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. التعديلات</Text>
          <Text style={styles.text}>
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات مهمة.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. الاتصال بنا</Text>
          <Text style={styles.text}>
            إذا كان لديك أي استفسارات حول هذه الشروط، يمكنك التواصل معنا عبر البريد الإلكتروني:
          </Text>
          <Text style={styles.emailText}>support@q8sportcar.com</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            آخر تحديث: 4 فبراير 2026
          </Text>
          <Text style={styles.footerText}>
            الإصدار: 1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    textAlign: 'right',
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    textAlign: 'right',
    marginLeft: 10,
    marginTop: 4,
  },
  criticalSection: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d32f2f',
  },
  criticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  criticalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  criticalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    textAlign: 'right',
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'right',
  },
  emailText: {
    fontSize: 15,
    color: '#007AFF',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
});

export default TermsScreen;
