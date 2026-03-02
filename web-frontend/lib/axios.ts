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
    (error) => {
        const status = error.response?.status;

        // 401: Not authenticated → go to login
        if (status === 401 && typeof window !== 'undefined') {
            window.location.href = '/login';
        }

        // 403: Authenticated but not authorized (wrong role) → go to /unauthorized
        if (status === 403 && typeof window !== 'undefined') {
            window.location.href = '/unauthorized';
        }

        return Promise.reject(error);
    }
);

export default api;
