import api from '@/lib/axios';
import type {
  ManagerStats,
  ManagerStadium,
  ManagerGuard,
  PaginatedManagerBookings,
} from '@/interfaces/manager.interface';

export interface CreateStadiumPayload {
  name: string;
  city: string;
  address: string;
  priceFullMatch?: number;
  priceHalfMatch?: number;
}

export interface UpdatePricesPayload {
  priceFullMatch?: number;
  priceHalfMatch?: number;
}

export interface CreateGuardPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AssignGuardPayload {
  stadiumId: string | null;
}

export interface BookingsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const ManagerService = {
  getStats: async (): Promise<ManagerStats> => {
    const { data } = await api.get('/manager/stats');
    return data;
  },

  getStadiums: async (): Promise<ManagerStadium[]> => {
    const { data } = await api.get('/manager/stadiums');
    return data;
  },

  createStadium: async (payload: CreateStadiumPayload): Promise<ManagerStadium> => {
    const { data } = await api.post('/manager/stadiums', payload);
    return data;
  },

  updateStadiumPrices: async (id: string, payload: UpdatePricesPayload): Promise<void> => {
    await api.patch(`/manager/stadiums/${id}/prices`, payload);
  },

  uploadStadiumPhotos: async (id: string, files: File[]): Promise<{ images: string[] }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('photos', f));
    const { data } = await api.post(`/manager/stadiums/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteStadiumPhoto: async (id: string, url: string): Promise<{ images: string[] }> => {
    const { data } = await api.delete(`/manager/stadiums/${id}/photos`, { data: { url } });
    return data;
  },

  deleteStadium: async (id: string): Promise<void> => {
    await api.delete(`/manager/stadiums/${id}`);
  },

  getGuards: async (): Promise<ManagerGuard[]> => {
    const { data } = await api.get('/manager/guards');
    return data;
  },

  createGuard: async (payload: CreateGuardPayload): Promise<ManagerGuard> => {
    const { data } = await api.post('/manager/guards', payload);
    return data;
  },

  assignGuard: async (guardId: string, payload: AssignGuardPayload): Promise<void> => {
    await api.patch(`/manager/guards/${guardId}/assign`, payload);
  },

  deleteGuard: async (guardId: string): Promise<void> => {
    await api.delete(`/manager/guards/${guardId}`);
  },

  getBookings: async (params: BookingsQueryParams): Promise<PaginatedManagerBookings> => {
    const { data } = await api.get('/manager/bookings', { params });
    return data;
  },
};
