import * as SecureStore from 'expo-secure-store';
import api from './api';

export const AuthService = {
  async login(email: string, password: string): Promise<string | null> {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token && data.refresh_token && data.user?.role) {
      await SecureStore.setItemAsync('access_token', data.access_token);
      await SecureStore.setItemAsync('refresh_token', data.refresh_token);
      await SecureStore.setItemAsync('user_role', data.user.role);
      return data.user.role as string;
    }
    return null;
  },

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<string | null> {
    const { data } = await api.post('/auth/register', { firstName, lastName, email, password });
    if (data.access_token && data.refresh_token && data.user?.role) {
      await SecureStore.setItemAsync('access_token', data.access_token);
      await SecureStore.setItemAsync('refresh_token', data.refresh_token);
      await SecureStore.setItemAsync('user_role', data.user.role);
      return data.user.role as string;
    }
    return null;
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout'); } catch {}
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user_role');
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync('access_token');
  },

  async getRole(): Promise<string | null> {
    return SecureStore.getItemAsync('user_role');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('access_token');
    return !!token;
  },

  async isPlayer(): Promise<boolean> {
    const role = await SecureStore.getItemAsync('user_role');
    return role === 'PLAYER';
  },
};