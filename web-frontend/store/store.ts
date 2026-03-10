import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminStatsReducer from './slices/adminStatsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminStats: adminStatsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
