import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh');

        // 401: Not authenticated — try to refresh. If that fails, go to login.
        if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                return api(originalRequest);
            } catch {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        // 403: Authenticated but not authorized (wrong role) → go to /unauthorized
        if (status === 403 && typeof window !== 'undefined') {
            window.location.href = '/unauthorized';
        }

        return Promise.reject(error);
    }
);

export default api;
