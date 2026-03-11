import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser } from '@/interfaces/users.interface';

type AdminUsersStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AdminUsersState {
  users: AdminUser[];
  total: number;
  totalPages: number;
  status: AdminUsersStatus;
  error: string | null;
}

const initialState: AdminUsersState = {
  users: [],
  total: 0,
  totalPages: 1,
  status: 'idle',
  error: null,
};

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    setAdminUsersLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setAdminUsers(
      state,
      action: PayloadAction<{ users: AdminUser[]; total: number; totalPages: number }>
    ) {
      state.users = action.payload.users;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.status = 'succeeded';
      state.error = null;
    },
    setAdminUsersError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    updateAdminUserStatus(
      state,
      action: PayloadAction<{ id: string; status: AdminUser['status'] }>
    ) {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) user.status = action.payload.status;
    },
    removeAdminUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setAdminUsersLoading,
  setAdminUsers,
  setAdminUsersError,
  updateAdminUserStatus,
  removeAdminUser,
} = adminUsersSlice.actions;

export default adminUsersSlice.reducer;
