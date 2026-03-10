import type { StadiumStatus } from '@/types/admin.types';

export interface AdminStadiumManager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AdminStadium {
  id: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  status: StadiumStatus;
  createdAt: string;
  manager: AdminStadiumManager;
}

export interface StadiumsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StadiumStatus;
}

export interface PaginatedStadiums {
  data: AdminStadium[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
