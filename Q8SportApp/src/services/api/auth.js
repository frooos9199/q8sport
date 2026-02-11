import apiClient from '../apiClient';
import API_CONFIG from '../../config/api';
import Logger from '../../utils/logger';

export const AuthService = {
  login: async (email, password) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  register: async (name, email, password, phone, whatsapp, acceptedTerms = false) => {
    Logger.debug('AuthService: Sending registration', { acceptedTerms });
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, {
      name,
      email,
      password,
      phone: phone?.trim() || null,
      whatsapp: whatsapp?.trim() || null,
      acceptedTerms,
    });
    Logger.debug('AuthService: Registration response received');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ME);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  },
};
