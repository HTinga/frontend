import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Assuming your API instance is here

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Added loading state for initial check
    const navigate = useNavigate();

    useEffect(() => {
        // Check for token and user on initial load
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
                // Optionally, verify token with backend here if desired for stricter security
                // e.g., API.get('/auth/verify-token').then(...).catch(logout);
            } catch (e) {
                console.error("Failed to parse stored user data:", e);
                logout(); // Clear invalid data
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/login', credentials); // Adjust login endpoint if different
            const { token, user: userData } = res.data; // Destructure token and user data from response

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData)); // Store user data

            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false);
            // Redirect based on role or to a default dashboard
            if (userData.role === 'respondent') {
                navigate('/respondent/dashboard');
            } else if (userData.role === 'client') {
                navigate('/client/dashboard');
            } else {
                navigate('/'); // Fallback
            }
            return res.data;
        } catch (error) {
            setLoading(false);
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw error; // Re-throw to allow component to catch and display error
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/register', userData); // Adjust register endpoint if different
            // After successful registration, you might automatically log them in or redirect to login
            setLoading(false);
            return res.data;
        } catch (error) {
            setLoading(false);
            console.error("Registration failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to login page on logout
    };

    const authValue = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};