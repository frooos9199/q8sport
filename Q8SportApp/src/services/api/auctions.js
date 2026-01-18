import apiClient from '../apiClient';
import API_CONFIG from '../../config/api';

export const AuctionsService = {
  getAuctions: async ({ status, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;

    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUCTIONS, {
      params,
    });
    return response.data;
  },

  getAuctionDetails: async (id) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(id));
    return response.data;
  },

  getMyAuctions: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUCTIONS_MY);
    return response.data;
  },

  createAuction: async (payload) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUCTIONS, payload);
    return response.data;
  },

  placeBid: async (id, amount) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PLACE_BID(id), { amount });
    return response.data;
  },

  updateAuction: async (id, patch) => {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(id), patch);
    return response.data;
  },
};
