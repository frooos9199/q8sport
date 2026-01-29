import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AdminService from '../../services/AdminService';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const { width } = Dimensions.get('window');

const ShowcaseDetailsScreen = ({ route, navigation }) => {
  const { showcase } = route.params;
  const { isAuthenticated, user } = useAuth();
  const images = showcase.images ? JSON.parse(showcase.images) : [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(showcase.showcaseComments || []);
  const [newComment, setNewComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const isAdmin = user?.role === 'ADMIN';
  const isPending = showcase.status === 'PENDING';

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    
    try {
      if (liked) {
        await apiClient.delete(`${API_CONFIG.ENDPOINTS.SHOWCASES}/${showcase.id}/like`);
      } else {
        await apiClient.post(`${API_CONFIG.ENDPOINTS.SHOWCASES}/${showcase.id}/like`);
      }
      setLiked(!liked);
    } catch (error) {
      Alert.alert('خطأ', 'فشل الإعجاب');
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    setShowCommentInput(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await apiClient.post(
        `${API_CONFIG.ENDPOINTS.SHOWCASES}/${showcase.id}/comments`,
        { comment: newComment }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      setShowCommentInput(false);
      Alert.alert('✅', 'تم إضافة التعليق');
    } catch (error) {
      Alert.alert('خطأ', 'فشل إضافة التعليق');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `شاهد ${showcase.carBrand} ${showcase.carModel} ${showcase.carYear} على تطبيق Q8Sport!`,
        url: `https://www.q8sportcar.com/showcases/${showcase.id}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'الموافقة على العرض',
      'هل أنت متأكد من الموافقة على هذا العرض؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'موافقة',
          onPress: () => {
            Alert.alert('✅', 'تمت الموافقة على العرض بنجاح');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'رفض العرض',
      'هل أنت متأكد من رفض هذا العرض؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'رفض',
          style: 'destructive',
          onPress: () => {
            Alert.alert('❌', 'تم رفض العرض');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'حذف التعليق',
      'هل أنت متأكد من حذف هذا التعليق؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.deleteComment(commentId);
              Alert.alert('✅', 'تم حذف التعليق بنجاح');
              navigation.replace('ShowcaseDetails', { showcase });
            } catch (error) {
              Alert.alert('❌', 'فشل حذف التعليق');
            }
          }
        }
      ]
    );
  };

  const handleBlockUser = (userId) => {
    Alert.alert(
      'حظر المستخدم',
      'هل أنت متأكد من حظر هذا المستخدم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حظر',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.blockUser(userId);
              Alert.alert('✅', 'تم حظر المستخدم بنجاح');
            } catch (error) {
              Alert.alert('❌', 'فشل حظر المستخدم');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* شارة PENDING */}
        {isPending && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerIcon}>⏳</Text>
            <Text style={styles.pendingBannerText}>هذا العرض في انتظار الموافقة</Text>
          </View>
        )}

        {/* صور السيارة */}
        <View style={styles.imagesSection}>
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <FlatList
              data={images}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsContainer}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive
                  ]}>
                  <Image source={{ uri: item }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
        </View>

        {/* معلومات المالك */}
        <View style={styles.ownerSection}>
          <Image
            source={{ uri: showcase.user?.avatar }}
            style={styles.ownerAvatar}
          />
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>{showcase.user?.name}</Text>
            <Text style={styles.ownerLabel}>مالك السيارة</Text>
          </View>
          
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>+ متابعة</Text>
          </TouchableOpacity>
        </View>

        {/* معلومات السيارة */}
        <View style={styles.carSection}>
          <Text style={styles.carTitle}>
            {showcase.carBrand} {showcase.carModel}
          </Text>
          <Text style={styles.carYear}>{showcase.carYear}</Text>
          
          {showcase.horsepower && (
            <View style={styles.hpBadge}>
              <Text style={styles.hpIcon}>⚡</Text>
              <Text style={styles.hpText}>{showcase.horsepower} HP</Text>
            </View>
          )}
        </View>

        {/* الوصف */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>📝 الوصف</Text>
          <Text style={styles.description}>{showcase.description}</Text>
        </View>

        {/* الإحصائيات */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{showcase.likes}</Text>
            <Text style={styles.statLabel}>إعجاب</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{showcase.views}</Text>
            <Text style={styles.statLabel}>مشاهدة</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{showcase.showcaseComments?.length || 0}</Text>
            <Text style={styles.statLabel}>تعليق</Text>
          </View>
        </View>

        {/* التعليقات */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>💬 التعليقات</Text>
          
          {showCommentInput && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="اكتب تعليقك..."
                placeholderTextColor="#666"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <View style={styles.commentInputActions}>
                <TouchableOpacity
                  style={styles.commentCancelBtn}
                  onPress={() => {
                    setShowCommentInput(false);
                    setNewComment('');
                  }}>
                  <Text style={styles.commentCancelText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.commentSendBtn}
                  onPress={handleAddComment}>
                  <Text style={styles.commentSendText}>إرسال</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.user?.name}</Text>
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(comment.id)}
                      style={styles.deleteCommentBtn}>
                      <Text style={styles.deleteCommentIcon}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.commentBox}>
              <Text style={styles.noComments}>لا توجد تعليقات بعد</Text>
              <Text style={styles.noCommentsSubtext}>كن أول من يعلق!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* أزرار الإجراءات */}
      {isAdmin && isPending ? (
        <View style={styles.adminActionsBar}>
          <TouchableOpacity
            style={[styles.adminActionBtn, styles.approveBtn]}
            onPress={handleApprove}>
            <Text style={styles.adminActionBtnIcon}>✓</Text>
            <Text style={styles.adminActionBtnText}>موافقة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminActionBtn, styles.rejectBtn]}
            onPress={handleReject}>
            <Text style={styles.adminActionBtnIcon}>✕</Text>
            <Text style={styles.adminActionBtnText}>رفض</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={[styles.actionBtn, liked && styles.actionBtnLiked]}
            onPress={handleLike}>
            <Text style={styles.actionBtnIcon}>{liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionBtnText}>إعجاب</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleComment}>
            <Text style={styles.actionBtnIcon}>💬</Text>
            <Text style={styles.actionBtnText}>تعليق</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={styles.actionBtnText}>مشاركة</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pendingBanner: {
    backgroundColor: '#FFC107',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pendingBannerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  pendingBannerText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesSection: {
    backgroundColor: '#0a0a0a',
  },
  mainImage: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#1a1a1a',
  },
  thumbnailsContainer: {
    padding: 16,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  thumbnailActive: {
    borderColor: '#DC2626',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#DC2626',
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ownerLabel: {
    color: '#999',
    fontSize: 14,
  },
  followButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  carSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  carTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  carYear: {
    color: '#999',
    fontSize: 18,
    marginBottom: 16,
  },
  hpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hpIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  hpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#DC2626',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#999',
    fontSize: 14,
  },
  commentsSection: {
    padding: 20,
    marginBottom: 80,
  },
  commentBox: {
    backgroundColor: '#1a1a1a',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  noComments: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  noCommentsSubtext: {
    color: '#999',
    fontSize: 14,
  },
  commentItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  deleteCommentBtn: {
    padding: 4,
  },
  deleteCommentIcon: {
    fontSize: 18,
  },
  commentInputContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  commentCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  commentCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentSendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  commentSendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 2,
    borderTopColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  adminActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 2,
    borderTopColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  adminActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  adminActionBtnIcon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  adminActionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionBtnLiked: {
    backgroundColor: '#DC2626',
  },
  actionBtnIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ShowcaseDetailsScreen;
