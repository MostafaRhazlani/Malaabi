import api from './api';
import { Stadium } from '@/interfaces/stadium.interface';

export const FavoriteService = {
  async getFavorites(): Promise<Stadium[]> {
    const response = await api.get('/player/favorites');
    return response.data;
  },

  async toggleFavorite(stadiumId: string): Promise<any> {
    const response = await api.post(`/player/favorites/${stadiumId}`);
    return response.data;
  },
};
