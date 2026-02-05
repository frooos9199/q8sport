import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://q8sportcar.com/api';

export const ReportService = {
  /**
   * Report content (product, user, comment, etc.)
   */
  async reportContent({ contentType, contentId, reportedUserId, reason, details }) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType, // PRODUCT, USER, COMMENT, etc.
          contentId,
          reportedUserId,
          reason,
          details,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل إرسال البلاغ');
      }

      return data;
    } catch (error) {
      console.error('Report error:', error);
      throw error;
    }
  },

  /**
   * Get user's report history
   */
  async getMyReports() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/reports/my-reports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تحميل البلاغات');
      }

      return data;
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  },
};
