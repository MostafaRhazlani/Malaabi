import api from './api';
import { Stadium } from '@/interfaces/stadium.interface';

export const StadiumService = {
  async getAll(type?: string): Promise<Stadium[]> {
    const { data } = await api.get<Stadium[]>('/stadiums', {
      params: { type },
    });
    return data;
  },

  async search(query?: string): Promise<Stadium[]> {
    const { data } = await api.get<Stadium[]>('/stadiums/search', {
      params: { q: query },
    });
    return data;
  },
};
