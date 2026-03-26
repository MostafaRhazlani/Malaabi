import api from './api';
import { AuthService } from './auth.service';

export interface Stadium {
  id: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  priceFullMatch: number;
  priceHalfMatch: number;
}

export interface PaginatedStadiums {
  data: Stadium[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetStadiumsParams {
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export const PlayerService = {
  async getStadiums(params: GetStadiumsParams = {}): Promise<PaginatedStadiums> {
    const token = await AuthService.getAccessToken();
    const { data } = await api.get<PaginatedStadiums>('/player/stadiums', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async getStadium(id: string): Promise<Stadium> {
    const token = await AuthService.getAccessToken();
    const { data } = await api.get<Stadium>(`/player/stadiums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
