import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const PRIORITY_COLORS = {
  CRITICAL: '#d32f2f',
  HIGH: '#f57c00',
  MEDIUM: '#fbc02d',
  LOW: '#388e3c',
};

const STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  REVIEWING: 'قيد المراجعة',
  RESOLVED: 'تم الحل',
  DISMISSED: 'مرفوض',
};

const REASON_LABELS = {
  SPAM: 'محتوى غير مرغوب',
  HARASSMENT: 'تحرش',
  HATE_SPEECH: 'خطاب كراهية',
  VIOLENCE: 'عنف',
  SEXUAL_CONTENT: 'محتوى جنسي',
  FALSE_INFORMATION: 'معلومات خاطئة',
  SCAM: 'احتيال',
  ILLEGAL_ACTIVITY: 'نشاط غير قانوني',
  INTELLECTUAL_PROPERTY: 'انتهاك حقوق',
  IMPERSONATION: 'انتحال شخصية',
  OTHER: 'أخرى',
};

const AdminModerationScreen = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('PENDING');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const res = await apiClient.get(API_CONFIG.ENDPOINTS.MODERATION_REPORT, { params });
      setReports(res.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('خطأ', 'فشل تحميل البلاغات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleAction = async (actionType) => {
    if (!selectedReport) return;

    setProcessing(true);
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.MODERATION_ACTIONS, {
        reportId: selectedReport.id,
        actionType,
        contentType: selectedReport.contentType,
        contentId: selectedReport.contentId,
        targetUserId: selectedReport.reportedUserId,
        note: actionNote.trim() || undefined,
      });

      Alert.alert('تم', 'تم تنفيذ الإجراء بنجاح');
      setActionModal(false);
      setSelectedReport(null);
      setActionNote('');
      fetchReports();
    } catch (error) {
      const message = error?.response?.data?.error || 'فشل تنفيذ الإجراء';
      Alert.alert('خطأ', message);
    } finally {
      setProcessing(false);
    }
  };

  const dismissReport = async (reportId) => {
    Alert.alert('رفض البلاغ', 'هل أنت متأكد من رفض هذا البلاغ؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'رفض',
        onPress: async () => {
          try {
            await apiClient.patch(`${API_CONFIG.ENDPOINTS.MODERATION_REPORT}/${reportId}`, {
              status: 'DISMISSED',
            });
            Alert.alert('تم', 'تم رفض البلاغ');
            fetchReports();
          } catch (error) {
            Alert.alert('خطأ', 'فشل رفض البلاغ');
          }
        },
      },
    ]);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => {
        setSelectedReport(item);
        setActionModal(true);
      }}
    >
      <View style={styles.reportHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority] }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <Text style={styles.reportDate}>
          {new Date(item.createdAt).toLocaleDateString('ar')}
        </Text>
      </View>

      <View style={styles.reportBody}>
        <Text style={styles.reportReason}>{REASON_LABELS[item.reason] || item.reason}</Text>
        <Text style={styles.reportContent}>
          نوع المحتوى: {item.contentType} • ID: {item.contentId}
        </Text>
        {item.details && (
          <Text style={styles.reportDetails} numberOfLines={2}>
            {item.details}
          </Text>
        )}
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.reporterInfo}>
          بواسطة: {item.reporter?.name || 'مستخدم'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#ff9800',
      REVIEWING: '#2196f3',
      RESOLVED: '#4caf50',
      DISMISSED: '#9e9e9e',
    };
    return colors[status] || '#9e9e9e';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إدارة البلاغات</Text>
        <Text style={styles.subtitle}>
          {reports.length} بلاغ
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.filterButtonActive]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[styles.filterText, filter === status && styles.filterTextActive]}
            >
              {STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد بلاغات</Text>
          </View>
        }
      />

      {/* Action Modal */}
      <Modal
        visible={actionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اتخاذ إجراء</Text>
              <TouchableOpacity onPress={() => setActionModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>تفاصيل البلاغ:</Text>
                <Text style={styles.modalText}>
                  السبب: {REASON_LABELS[selectedReport.reason]}
                </Text>
                <Text style={styles.modalText}>
                  المحتوى: {selectedReport.contentType} (ID: {selectedReport.contentId})
                </Text>
                {selectedReport.details && (
                  <Text style={styles.modalText}>التفاصيل: {selectedReport.details}</Text>
                )}

                <Text style={[styles.modalLabel, { marginTop: 20 }]}>ملاحظات (اختياري):</Text>
                <TextInput
                  style={styles.modalInput}
                  multiline
                  numberOfLines={3}
                  placeholder="أضف ملاحظات للإجراء..."
                  value={actionNote}
                  onChangeText={setActionNote}
                  textAlign="right"
                />

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleAction('CONTENT_REMOVED')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon name="delete-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>حذف المحتوى</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.warnButton]}
                    onPress={() => handleAction('WARNING')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon name="alert-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>تحذير</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.suspendButton]}
                    onPress={() => handleAction('USER_SUSPENDED')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon name="account-cancel-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>إيقاف مؤقت</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.banButton]}
                    onPress={() => handleAction('USER_BANNED')}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon name="account-off-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>حظر نهائي</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.dismissButton]}
                    onPress={() => dismissReport(selectedReport.id)}
                    disabled={processing}
                  >
                    <Icon name="close-circle-outline" size={20} color="#666" />
                    <Text style={[styles.actionButtonText, { color: '#666' }]}>رفض البلاغ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  reportBody: {
    marginBottom: 12,
  },
  reportReason: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'right',
  },
  reportContent: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    textAlign: 'right',
  },
  reportDetails: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'right',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reporterInfo: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    textAlign: 'right',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  removeButton: {
    backgroundColor: '#d32f2f',
  },
  warnButton: {
    backgroundColor: '#ff9800',
  },
  suspendButton: {
    backgroundColor: '#f57c00',
  },
  banButton: {
    backgroundColor: '#c62828',
  },
  dismissButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AdminModerationScreen;
