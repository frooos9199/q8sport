import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../services/apiClient';
import API_CONFIG from '../config/api';

const REPORT_REASONS = [
  { value: 'SPAM', label: 'محتوى غير مرغوب (Spam)' },
  { value: 'HARASSMENT', label: 'تحرش أو مضايقة' },
  { value: 'HATE_SPEECH', label: 'خطاب كراهية' },
  { value: 'VIOLENCE', label: 'عنف أو تهديدات' },
  { value: 'SEXUAL_CONTENT', label: 'محتوى جنسي' },
  { value: 'FALSE_INFORMATION', label: 'معلومات خاطئة' },
  { value: 'SCAM', label: 'احتيال أو نصب' },
  { value: 'ILLEGAL_ACTIVITY', label: 'نشاط غير قانوني' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'انتهاك حقوق ملكية' },
  { value: 'IMPERSONATION', label: 'انتحال شخصية' },
  { value: 'OTHER', label: 'أخرى' },
];

const ReportButton = ({ contentType, contentId, reportedUserId, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('خطأ', 'يرجى اختيار سبب البلاغ');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.MODERATION_REPORT, {
        contentType,
        contentId,
        reportedUserId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      Alert.alert(
        'تم إرسال البلاغ',
        'شكراً لك! سيتم مراجعة البلاغ خلال 24 ساعة.',
        [{ text: 'حسناً', onPress: () => setModalVisible(false) }]
      );

      setSelectedReason('');
      setDetails('');
    } catch (error) {
      const message = error?.response?.data?.error || 'فشل إرسال البلاغ';
      Alert.alert('خطأ', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.reportButton, style]}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="flag-outline" size={20} color="#ff4444" />
        <Text style={styles.reportButtonText}>إبلاغ</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إبلاغ عن محتوى</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>سبب البلاغ *</Text>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason.value && styles.reasonOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedReason === reason.value && styles.radioButtonSelected,
                    ]}
                  >
                    {selectedReason === reason.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.reasonText}>{reason.label}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.label, { marginTop: 20 }]}>تفاصيل إضافية (اختياري)</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="اكتب تفاصيل إضافية تساعد في المراجعة..."
                value={details}
                onChangeText={setDetails}
                textAlign="right"
              />

              <View style={styles.infoBox}>
                <Icon name="information-outline" size={20} color="#2196F3" />
                <Text style={styles.infoText}>
                  سيتم مراجعة البلاغ من قبل فريقنا خلال 24 ساعة. جميع البلاغات سرية.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>إرسال البلاغ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  reportButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  reasonOptionSelected: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioButtonSelected: {
    borderColor: '#DC2626',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  reasonText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 10,
    textAlign: 'right',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ReportButton;
