import apiClient from './apiClient';
import API_CONFIG from '../config/api';

class AdminService {
  async blockUser(userId: string) {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.ADMIN_USER_BLOCK(userId),
      {}
    );
    return response.data;
  }

  async unblockUser(userId: string) {
    const response = await apiClient.delete(
      API_CONFIG.ENDPOINTS.ADMIN_USER_BLOCK(userId)
    );
    return response.data;
  }

  async deleteComment(commentId: string) {
    const response = await apiClient.delete(
      `/admin/comments/${commentId}`
    );
    return response.data;
  }
}

export default new AdminService();
