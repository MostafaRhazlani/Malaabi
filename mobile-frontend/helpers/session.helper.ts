import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'auth_session';

export interface AuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  role: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  position?: string | null;
  profileImg?: string | null;
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

export async function updateSession(update: Partial<AuthSession>): Promise<void> {
  const current = await getSession();
  if (current) {
    await saveSession({ ...current, ...update });
  }
}
