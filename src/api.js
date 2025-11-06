// src/api/index.js
import axios from 'axios';

// Create an Axios instance
const API = axios.create({
    // Use an environment variable for the backend URL, or default to localhost
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add the authentication token to every outgoing request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Your backend middleware expects 'Authorization: Bearer <token>'
            // This line correctly sets the Authorization header with the Bearer prefix.
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle common response errors (e.g., 401 Unauthorized)
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If the error is a 401 Unauthorized, it might mean the token is expired or invalid
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized request. Redirecting to login...');
            // Clear token and user data from local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
