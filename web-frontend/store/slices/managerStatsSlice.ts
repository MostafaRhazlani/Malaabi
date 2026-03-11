import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ManagerStats } from '@/interfaces/manager.interface';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ManagerStatsState {
  stats: ManagerStats | null;
  status: Status;
  error: string | null;
}

const initialState: ManagerStatsState = {
  stats: null,
  status: 'idle',
  error: null,
};

const managerStatsSlice = createSlice({
  name: 'managerStats',
  initialState,
  reducers: {
    setManagerStatsLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setManagerStats(state, action: PayloadAction<ManagerStats>) {
      state.stats = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setManagerStatsError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    clearManagerStats(state) {
      state.stats = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const {
  setManagerStatsLoading,
  setManagerStats,
  setManagerStatsError,
  clearManagerStats,
} = managerStatsSlice.actions;

export default managerStatsSlice.reducer;
