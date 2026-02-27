import apiClient from '../apiClient';
import Logger from '../../utils/logger';

export const ReportService = {
  /**
   * Report content (product, user, comment, etc.)
   */
  async reportContent({ contentType, contentId, reportedUserId, reason, details }) {
    try {
      if (!contentType || !contentId) {
        throw new Error('نوع المحتوى ومعرّفه مطلوبان');
      }

      const response = await apiClient.post('/reports', {
        contentType, // PRODUCT, USER, COMMENT, etc.
        contentId,
        reportedUserId,
        reason,
        details,
      });

      return response.data;
    } catch (error) {
      Logger.error('Report error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'فشل إرسال البلاغ';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get user's report history
   */
  async getMyReports() {
    try {
      const response = await apiClient.get('/reports/my-reports');

      return response.data;
    } catch (error) {
      Logger.error('Get reports error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'فشل تحميل البلاغات';
      throw new Error(errorMessage);
    }
  },
};
