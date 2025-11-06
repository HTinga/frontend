// src/pages/AdminSignupForm.jsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const AdminSignupForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const userData = { username, email, password, role: 'admin' };
            const res = await API.post('/auth/register', userData); // Backend handles 'admin' role
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setMessage(res.data.message);
            navigate('/admin/dashboard'); // Redirect to admin dashboard (assuming it exists)
        } catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred during admin registration');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 rounded-md p-2 bg-purple-100">
                    Sign Up as Admin
                </h2>
                {message && <p className="mb-4 text-center text-red-500">{message}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
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
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full"
                    >
                        Register as Admin
                    </button>
                </div>
                <p className="text-center text-sm mt-4">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-500 hover:text-blue-800 font-bold"
                    >
                        Login here
                    </button>
                </p>
            </form>
        </div>
    );
};

export default AdminSignupForm;
