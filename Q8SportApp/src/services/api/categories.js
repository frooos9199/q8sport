import apiClient from '../apiClient';
import API_CONFIG from '../../config/api';

export const CategoryService = {
  getCategories: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES);
    return response.data;
  },
};
