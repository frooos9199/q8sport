import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://q8sportcar.com/api';

export const BlockService = {
  /**
   * Block a user
   */
  async blockUser(userId) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          blockedUserId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل حظر المستخدم');
      }

      return data;
    } catch (error) {
      console.error('Block user error:', error);
      throw error;
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/blocks/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل إلغاء الحظر');
      }

      return data;
    } catch (error) {
      console.error('Unblock user error:', error);
      throw error;
    }
  },

  /**
   * Get list of blocked users
   */
  async getBlockedUsers() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/blocks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تحميل المستخدمين المحظورين');
      }

      return data;
    } catch (error) {
      console.error('Get blocked users error:', error);
      throw error;
    }
  },

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/blocks/check/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل التحقق من الحظر');
      }

      return data.isBlocked || false;
    } catch (error) {
      console.error('Check blocked error:', error);
      return false;
    }
  },
};
