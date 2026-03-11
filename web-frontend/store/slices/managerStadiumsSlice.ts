import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ManagerStadium } from '@/interfaces/manager.interface';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ManagerStadiumsState {
  stadiums: ManagerStadium[];
  status: Status;
  error: string | null;
}

const initialState: ManagerStadiumsState = {
  stadiums: [],
  status: 'idle',
  error: null,
};

const managerStadiumsSlice = createSlice({
  name: 'managerStadiums',
  initialState,
  reducers: {
    setManagerStadiumsLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setManagerStadiums(state, action: PayloadAction<ManagerStadium[]>) {
      state.stadiums = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setManagerStadiumsError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    addManagerStadium(state, action: PayloadAction<ManagerStadium>) {
      state.stadiums.unshift(action.payload);
    },
    updateManagerStadium(state, action: PayloadAction<ManagerStadium>) {
      const idx = state.stadiums.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) state.stadiums[idx] = action.payload;
    },
    removeManagerStadium(state, action: PayloadAction<string>) {
      state.stadiums = state.stadiums.filter((s) => s.id !== action.payload);
    },
  },
});

export const {
  setManagerStadiumsLoading,
  setManagerStadiums,
  setManagerStadiumsError,
  addManagerStadium,
  updateManagerStadium,
  removeManagerStadium,
} = managerStadiumsSlice.actions;

export default managerStadiumsSlice.reducer;
