import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminStadium } from '@/interfaces/stadiums.interface';

type AdminStadiumsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AdminStadiumsState {
  stadiums: AdminStadium[];
  total: number;
  totalPages: number;
  status: AdminStadiumsStatus;
  error: string | null;
}

const initialState: AdminStadiumsState = {
  stadiums: [],
  total: 0,
  totalPages: 1,
  status: 'idle',
  error: null,
};

const adminStadiumsSlice = createSlice({
  name: 'adminStadiums',
  initialState,
  reducers: {
    setAdminStadiumsLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setAdminStadiums(
      state,
      action: PayloadAction<{ stadiums: AdminStadium[]; total: number; totalPages: number }>
    ) {
      state.stadiums = action.payload.stadiums;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.status = 'succeeded';
      state.error = null;
    },
    setAdminStadiumsError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    updateAdminStadiumStatus(
      state,
      action: PayloadAction<{ id: string; status: AdminStadium['status'] }>
    ) {
      const stadium = state.stadiums.find((s) => s.id === action.payload.id);
      if (stadium) stadium.status = action.payload.status;
    },
    removeAdminStadium(state, action: PayloadAction<string>) {
      state.stadiums = state.stadiums.filter((s) => s.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setAdminStadiumsLoading,
  setAdminStadiums,
  setAdminStadiumsError,
  updateAdminStadiumStatus,
  removeAdminStadium,
} = adminStadiumsSlice.actions;

export default adminStadiumsSlice.reducer;
