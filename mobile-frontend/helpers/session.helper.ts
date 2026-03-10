import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'auth_session';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  role: string;
  email: string;
}

export async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(AUTH_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthSession; } catch { return null; }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_KEY);
}
