import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    user_id: string;
    email: string;
    role: string;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setAuthLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const { setUser, clearUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
