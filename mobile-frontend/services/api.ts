import axios from 'axios';

const BASE_URL = "http://10.30.250.91:4000";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { BASE_URL };
export default api;
