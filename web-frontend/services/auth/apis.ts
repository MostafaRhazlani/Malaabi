import api from '../../lib/axios';

export const AuthService = {
    // Auth Login
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Auth Me
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};
