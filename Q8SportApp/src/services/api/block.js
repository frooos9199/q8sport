import apiClient from '../apiClient';
import Logger from '../../utils/logger';

export const BlockService = {
  /**
   * Block a user
   */
  async blockUser(userId) {
    try {
      if (!userId) {
        throw new Error('معرّف المستخدم مطلوب');
      }

      const response = await apiClient.post('/blocks', {
        blockedUserId: userId,
      });

      return response.data;
    } catch (error) {
      Logger.error('Block user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'فشل حظر المستخدم';
      throw new Error(errorMessage);
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId) {
    try {
      if (!userId) {
        throw new Error('معرّف المستخدم مطلوب');
      }

      const response = await apiClient.delete(`/blocks/${userId}`);

      return response.data;
    } catch (error) {
      Logger.error('Unblock user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إلغاء الحظر';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get list of blocked users
   */
  async getBlockedUsers() {
    try {
      const response = await apiClient.get('/blocks');

      return response.data;
    } catch (error) {
      Logger.error('Get blocked users error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'فشل تحميل المستخدمين المحظورين';
      throw new Error(errorMessage);
    }
  },

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId) {
    try {
      if (!userId) {
        return false;
      }

      const response = await apiClient.get(`/blocks/check/${userId}`);

      return response.data?.isBlocked || false;
    } catch (error) {
      Logger.error('Check blocked error:', error);
      return false;
    }
  },
};
