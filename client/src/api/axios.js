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
            
            // CRITICAL FIX: Don't redirect if we are already on the login page
            // This allows the Login component to handle "Invalid Credentials" errors 
            // and show a Toast message instead of reloading the page.
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;