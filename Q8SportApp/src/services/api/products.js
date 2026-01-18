import apiClient from '../apiClient';
import API_CONFIG from '../../config/api';

export const ProductService = {
  getProducts: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS);
    return response.data;
  },

  getProductDetails: async (id) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(id));
    return response.data;
  },

  getUserProducts: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_PRODUCTS);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PRODUCTS, productData);
    return response.data;
  },

  updateProductStatus: async (id, status, soldPrice, buyerInfo) => {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(id) + '/status',
      { status, soldPrice, buyerInfo }
    );
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(id));
    return response.data;
  },
};
