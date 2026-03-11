import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminStatsReducer from './slices/adminStatsSlice';
import adminUsersReducer from './slices/adminUsersSlice';
import adminStadiumsReducer from './slices/adminStadiumsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminStats: adminStatsReducer,
        adminUsers: adminUsersReducer,
        adminStadiums: adminStadiumsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
