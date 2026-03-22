import axios from 'axios';

const BASE_URL = "https://unsimpering-jinny-unexcused.ngrok-free.dev";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

export { BASE_URL };
export default api;
