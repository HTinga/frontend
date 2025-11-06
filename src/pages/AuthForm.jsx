// src/pages/AuthForm.jsx
import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ type }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // If type is 'register', immediately redirect to role selection
    useEffect(() => {
        if (type === 'register') {
            navigate('/register-role-select');
        }
    }, [type, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // This form now only handles login
            const res = await API.post(`/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setMessage(res.data.message);

            // Redirect based on user role after successful login
            // Ensure these role strings match exactly what your backend returns (e.g., 'client', 'respondent', 'admin', 'institution_admin')
            if (res.data.user.role === 'client' || res.data.user.role === 'institution_admin') {
                navigate('/client/dashboard'); // Institutions and individual clients go to client dashboard
            } else if (res.data.user.role === 'respondent') {
                // Check if respondent's profile is complete
                if (res.data.user.isProfileComplete) {
                    navigate('/respondent/dashboard');
                } else {
                    navigate('/respondent/onboarding-survey'); // Redirect to onboarding if profile is incomplete
                }
            } else if (res.data.user.role === 'super_admin') { // Assuming 'super_admin' for application owner
                navigate('/admin/dashboard'); // Redirect to the super admin dashboard
            } else {
                navigate('/'); // Fallback
            }

        } catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred during login');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 rounded-md p-2 bg-blue-100">
                    Login
                </h2>
                {message && <p className="mb-4 text-center text-red-500">{message}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full"
                    >
                        Login
                    </button>
                </div>
                <p className="text-center text-sm mt-4">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/register-role-select')}
                        className="text-blue-500 hover:text-blue-800 font-bold"
                    >
                        Register here
                    </button>
                </p>
            </form>
        </div>
    );
};

export default AuthForm;
