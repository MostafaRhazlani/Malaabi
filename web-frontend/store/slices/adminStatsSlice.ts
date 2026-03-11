import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminStats } from '@/interfaces/stats.interface';

type AdminStatsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AdminStatsState {
  stats: AdminStats | null;
  status: AdminStatsStatus;
  error: string | null;
}

const initialState: AdminStatsState = {
  stats: null,
  status: 'idle',
  error: null,
};

const adminStatsSlice = createSlice({
  name: 'adminStats',
  initialState,
  reducers: {
    setAdminStatsLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setAdminStats(state, action: PayloadAction<AdminStats>) {
      state.stats = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setAdminStatsError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    clearAdminStats(state) {
      state.stats = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const {
  setAdminStatsLoading,
  setAdminStats,
  setAdminStatsError,
  clearAdminStats,
} = adminStatsSlice.actions;

export default adminStatsSlice.reducer;
