import api from './api';

export interface CreateBookingData {
  stadiumId: string;
  scheduledAt: string;
  matchType: 'FULL' | 'HALF';
}

export interface TakenSlotsResponse {
  slots: { scheduledAt: string; matchType: 'FULL' | 'HALF' }[];
  currentTime: string;
}

export const BookingService = {
  async create(bookingData: CreateBookingData) {
    const response = await api.post('/player/bookings', bookingData);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/player/bookings');
    return response.data;
  },

  async getTakenSlots(stadiumId: string, date?: string, startDate?: string, endDate?: string): Promise<TakenSlotsResponse> {
    const response = await api.get('/player/bookings/slots', {
      params: { stadiumId, date, startDate, endDate },
    });
    return response.data;
  },
};
