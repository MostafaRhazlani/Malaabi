import api from './api';
import { saveSession, getSession, clearSession, type AuthSession } from '@/helpers/session.helper';

export type { AuthSession };

export interface AuthUserPayload {
  id: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  position?: string | null;
  profileImg?: string | null;
}

export const AuthService = {
  async login(email: string, password: string): Promise<AuthUserPayload | null> {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token && data.refresh_token && data.user?.role && data.user?.email) {
      const payload: AuthUserPayload = {
        id: data.user.user_id,
        role: data.user.role as string,
        email: data.user.email as string,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        birthDate: data.user.birth_date ?? null,
        position: data.user.position ?? null,
        profileImg: data.user.profile_img ?? null,
      };

      await saveSession({
        userId: payload.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        role: payload.role,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthDate: payload.birthDate,
        position: payload.position,
        profileImg: payload.profileImg,
      });
      return payload;
    }
    return null;
  },

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<AuthUserPayload | null> {
    const { data } = await api.post('/auth/register', { firstName, lastName, email, password });
    if (data.access_token && data.refresh_token && data.user?.role && data.user?.email) {
      const payload: AuthUserPayload = {
        id: data.user.user_id,
        role: data.user.role as string,
        email: data.user.email as string,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        birthDate: data.user.birth_date ?? null,
        position: data.user.position ?? null,
        profileImg: data.user.profile_img ?? null,
      };

      await saveSession({
        userId: payload.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        role: payload.role,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthDate: payload.birthDate,
        position: payload.position,
        profileImg: payload.profileImg,
      });
      return payload;
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