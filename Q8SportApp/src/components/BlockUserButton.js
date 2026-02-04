import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../services/apiClient';
import API_CONFIG from '../config/api';

const BlockUserButton = ({ userId, userName, style, onBlocked }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    Alert.alert(
      'تأكيد الحظر',
      `هل أنت متأكد من حظر ${userName}؟\n\nلن تتمكن من:\n• رؤية منشوراته\n• التواصل معه\n• استقبال إشعارات منه`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حظر',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.post(API_CONFIG.ENDPOINTS.MODERATION_BLOCK, {
                blockedUserId: userId,
                reason: reason.trim() || undefined,
              });

              Alert.alert(
                'تم الحظر',
                `تم حظر ${userName} بنجاح.`,
                [
                  {
                    text: 'حسناً',
                    onPress: () => {
                      setModalVisible(false);
                      onBlocked?.();
                    },
                  },
                ]
              );

              setReason('');
            } catch (error) {
              const message = error?.response?.data?.error || 'فشل حظر المستخدم';
              Alert.alert('خطأ', message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.blockButton, style]}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="block-helper" size={20} color="#ff4444" />
        <Text style={styles.blockButtonText}>حظر</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="block-helper" size={40} color="#ff4444" />
              <Text style={styles.modalTitle}>حظر مستخدم</Text>
            </View>

            <Text style={styles.modalDescription}>
              أنت على وشك حظر <Text style={styles.boldText}>{userName}</Text>
            </Text>

            <View style={styles.warningBox}>
              <Icon name="alert-circle-outline" size={20} color="#ff9800" />
              <Text style={styles.warningText}>
                بعد الحظر لن تتمكن من رؤية محتواه أو التواصل معه.
              </Text>
            </View>

            <Text style={styles.label}>سبب الحظر (اختياري)</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              placeholder="مثال: محتوى مسيء، مزعج، احتيال..."
              value={reason}
              onChangeText={setReason}
              textAlign="right"
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.blockButtonMain, loading && styles.buttonDisabled]}
                onPress={handleBlock}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="block-helper" size={18} color="#fff" />
                    <Text style={styles.blockButtonMainText}>حظر المستخدم</Text>
                  </>
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
  blockButton: {
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
  blockButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    marginLeft: 10,
    textAlign: 'right',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
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
  blockButtonMain: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  blockButtonMainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default BlockUserButton;
