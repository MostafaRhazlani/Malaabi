import axios from 'axios';
import { getSession, saveSession, clearSession } from '@/helpers/session.helper';
import { router } from 'expo-router';

const BASE_URL = "https://unsimpering-jinny-unexcused.ngrok-free.dev";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

api.interceptors.request.use(async (config) => {
    try {
        const session = await getSession();
        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
    } catch (error) {
        console.error('Error attaching auth token:', error);
    }
    return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Avoid infinite loops on auth endpoints
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const session = await getSession();
                if (!session?.refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh endpoint manually to avoid circular dependencies with services
                const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refresh_token: session.refreshToken
                });

                if (data.access_token) {
                    // Update session
                    await saveSession({
                        ...session,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token || session.refreshToken,
                    });

                    // Update headers and retry original request
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails too, clear everything and go to login
                await clearSession();
                router.replace('/(auth)/login');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { BASE_URL };
export default api;
