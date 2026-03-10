import api from '../../lib/axios';
import type { AdminStats } from '@/interfaces/stats.interface';
import type { PaginatedUsers, UsersQueryParams } from '@/interfaces/users.interface';
import type { PaginatedStadiums, StadiumsQueryParams } from '@/interfaces/stadiums.interface';
import type { UserStatus, StadiumStatus } from '@/types/admin.types';

export const AdminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  getUsers: async (params: UsersQueryParams): Promise<PaginatedUsers> => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<void> => {
    await api.patch(`/admin/users/${id}/status`, { status });
  },

  getStadiums: async (params: StadiumsQueryParams): Promise<PaginatedStadiums> => {
    const { data } = await api.get('/admin/stadiums', { params });
    return data;
  },

  updateStadiumStatus: async (id: string, status: StadiumStatus): Promise<void> => {
    await api.patch(`/admin/stadiums/${id}/status`, { status });
  },

  deleteStadium: async (id: string): Promise<void> => {
    await api.delete(`/admin/stadiums/${id}`);
  },
};
