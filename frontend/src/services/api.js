import axios from 'axios';

const api = axios.create({
    baseURL: 'https://chetan-human-resource-management-system.onrender.com/api', 
});

// Request interceptor to add the Authorization header
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;