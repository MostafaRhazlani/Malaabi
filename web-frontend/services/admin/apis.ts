import api from '../../lib/axios';
import type { AdminStats } from '@/interfaces/stats.interface';

export const AdminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },
};
