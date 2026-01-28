import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

class AdminService {
  async blockUser(userId: string) {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/admin/users/${userId}/block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async unblockUser(userId: string) {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.delete(
      `${API_URL}/admin/users/${userId}/block`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async deleteComment(commentId: string) {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.delete(
      `${API_URL}/admin/comments/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export default new AdminService();
