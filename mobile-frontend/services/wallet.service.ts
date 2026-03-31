import api from './api';

export const WalletService = {
  async getWallet() {
    const response = await api.get('/player/wallet');
    return response.data;
  },

  async topUp(amount: number, description?: string) {
    const response = await api.post('/player/wallet/top-up', { amount, description });
    return response.data;
  },

  async deduct(amount: number, description?: string) {
    const response = await api.post('/player/wallet/deduct', { amount, description });
    return response.data;
  },

  async getTransactions() {
    const response = await api.get('/player/wallet/transactions');
    return response.data;
  }
};
