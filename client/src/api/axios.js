import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle Errors (Specifically 401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if error is 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            // Using window.location ensures a full refresh and clears state
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;