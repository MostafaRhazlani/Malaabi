import api from './api';

export interface GuardBooking {
  id: string;
  totalAmount: number;
  matchType: string;
  scheduledAt: string;
  status: string;
  player: {
    first_name: string;
    last_name: string;
    profile_img?: string;
  };
}

export const GuardService = {
  async getStadiumBookings(): Promise<GuardBooking[]> {
    const response = await api.get('/guard/bookings');
    return response.data;
  },

  async verifyToken(token: string) {
    const response = await api.post('/guard/verify', { token });
    return response.data;
  },
};
