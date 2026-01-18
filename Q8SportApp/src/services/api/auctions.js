import apiClient from '../apiClient';
import API_CONFIG from '../../config/api';

export const AuctionsService = {
  getAuctions: async ({ status = 'ACTIVE', page = 1, limit = 20 } = {}) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUCTIONS, {
      params: { status, page, limit },
    });
    return response.data;
  },

  getAuctionDetails: async (id) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUCTION_DETAILS(id));
    return response.data;
  },

  placeBid: async (id, amount) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PLACE_BID(id), { amount });
    return response.data;
  },
};
