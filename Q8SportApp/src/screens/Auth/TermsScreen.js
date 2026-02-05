import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const TermsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>شروط الاستخدام وسياسة المحتوى</Text>
        <Text style={styles.lastUpdated}>آخر تحديث: 5 فبراير 2026</Text>

        {/* Section 1: Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. المقدمة</Text>
          <Text style={styles.text}>
            مرحباً بك في Q8 Sport. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
          </Text>
        </View>

        {/* Section 2: Content Policy - CRITICAL for Apple Guideline 1.2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. سياسة المحتوى - لا تسامح مطلقاً</Text>
          <Text style={styles.criticalText}>
            نحن في Q8 Sport لا نتسامح مطلقاً مع أي محتوى مسيء أو غير لائق أو غير قانوني.
          </Text>
          
          <Text style={styles.subsectionTitle}>المحتوى المحظور يشمل:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• المحتوى العنيف أو التهديدي</Text>
            <Text style={styles.listItem}>• خطاب الكراهية أو التمييز</Text>
            <Text style={styles.listItem}>• المحتوى الجنسي أو الإباحي</Text>
            <Text style={styles.listItem}>• المحتوى المزيف أو المضلل</Text>
            <Text style={styles.listItem}>• انتهاك حقوق الملكية الفكرية</Text>
            <Text style={styles.listItem}>• المحتوى غير القانوني</Text>
            <Text style={styles.listItem}>• الاحتيال أو النصب</Text>
            <Text style={styles.listItem}>• التنمر أو المضايقة</Text>
          </View>
        </View>

        {/* Section 3: User Conduct */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. سلوك المستخدم</Text>
          <Text style={styles.text}>
            يتعهد كل مستخدم بما يلي:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• نشر محتوى صادق ودقيق فقط</Text>
            <Text style={styles.listItem}>• احترام المستخدمين الآخرين</Text>
            <Text style={styles.listItem}>• عدم إساءة استخدام أدوات الإبلاغ</Text>
            <Text style={styles.listItem}>• التعاون مع فريق المراجعة</Text>
            <Text style={styles.listItem}>• الالتزام بالقوانين المحلية</Text>
          </View>
        </View>

        {/* Section 4: Content Moderation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. إدارة المحتوى</Text>
          <Text style={styles.text}>
            نحن نستخدم نظام إدارة محتوى متقدم يشمل:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• فلترة تلقائية للكلمات المسيئة</Text>
            <Text style={styles.listItem}>• مراجعة يدوية من فريقنا</Text>
            <Text style={styles.listItem}>• نظام إبلاغ سريع</Text>
            <Text style={styles.listItem}>• إجراءات فورية ضد المخالفين</Text>
          </View>
        </View>

        {/* Section 5: Reporting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. الإبلاغ عن المحتوى المسيء</Text>
          <Text style={styles.text}>
            يمكنك الإبلاغ عن أي محتوى مسيء باستخدام زر "الإبلاغ" 🚩 المتوفر في كل إعلان.
          </Text>
          <Text style={styles.criticalText}>
            نلتزم بمراجعة جميع البلاغات خلال 24 ساعة واتخاذ الإجراءات اللازمة فوراً.
          </Text>
        </View>

        {/* Section 6: Blocking Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. حظر المستخدمين</Text>
          <Text style={styles.text}>
            يمكنك حظر أي مستخدم لا ترغب في التفاعل معه. عند الحظر:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• لن ترى محتوى هذا المستخدم</Text>
            <Text style={styles.listItem}>• لن يستطيع التواصل معك</Text>
            <Text style={styles.listItem}>• يتم إرسال إشعار لفريقنا للمراجعة</Text>
          </View>
        </View>

        {/* Section 7: Consequences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. العقوبات</Text>
          <Text style={styles.text}>
            في حالة انتهاك هذه الشروط، قد نتخذ الإجراءات التالية:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• حذف المحتوى المخالف فوراً</Text>
            <Text style={styles.listItem}>• تعليق الحساب مؤقتاً</Text>
            <Text style={styles.listItem}>• إغلاق الحساب نهائياً</Text>
            <Text style={styles.listItem}>• الإبلاغ للجهات المختصة إذا لزم الأمر</Text>
          </View>
        </View>

        {/* Section 8: Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. الخصوصية</Text>
          <Text style={styles.text}>
            نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقاً لسياسة الخصوصية الخاصة بنا.
          </Text>
        </View>

        {/* Section 9: Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. التواصل</Text>
          <Text style={styles.text}>
            لأي استفسارات أو مخاوف، يمكنك التواصل معنا عبر البريد الإلكتروني أو الواتساب.
          </Text>
        </View>

        <View style={styles.acceptanceBox}>
          <Text style={styles.acceptanceText}>
            بالضغط على "موافق" أو بالتسجيل في التطبيق، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط والأحكام.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>إغلاق</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
    textAlign: 'right',
  },
  criticalText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    textAlign: 'right',
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    fontWeight: '600',
  },
  list: {
    marginTop: 10,
  },
  listItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'right',
    paddingRight: 10,
  },
  acceptanceBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  acceptanceText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TermsScreen;
