import api from './api';
import { saveSession, getSession, clearSession, type AuthSession } from '@/helpers/session.helper';

export type { AuthSession };

export const AuthService = {
  async login(email: string, password: string): Promise<{ id: string; role: string; email: string } | null> {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token && data.refresh_token && data.user?.role && data.user?.email) {
      await saveSession({
        userId: data.user.user_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        role: data.user.role,
        email: data.user.email,
      });
      return { id: data.user.user_id, role: data.user.role as string, email: data.user.email as string };
    }
    return null;
  },

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<{ id: string; role: string; email: string } | null> {
    const { data } = await api.post('/auth/register', { firstName, lastName, email, password });
    if (data.access_token && data.refresh_token && data.user?.role && data.user?.email) {
      await saveSession({
        userId: data.user.user_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        role: data.user.role,
        email: data.user.email,
      });
      return { id: data.user.user_id, role: data.user.role as string, email: data.user.email as string };
    }
    return null;
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout'); } catch {}
    await clearSession();
  },

  async getAccessToken(): Promise<string | null> {
    return (await getSession())?.accessToken ?? null;
  },

  async getSession(): Promise<AuthSession | null> {
    return getSession();
  },
};