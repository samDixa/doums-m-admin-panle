import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://doums-m-backend-production.up.railway.app';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Authentication error detected. Clearing session.');
            localStorage.removeItem('token');
            // Force a reload to trigger the Navigate in DashboardLayout or handle via state
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
