// src/pages/InstitutionSignupForm.jsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const InstitutionSignupForm = () => {
    const [institutionName, setInstitutionName] = useState('');
    const [contactPersonName, setContactPersonName] = useState('');
    const [email, setEmail] = useState(''); // This will be the login email for the institution's main account
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const userData = {
                institutionName,
                contactPersonName,
                email,
                password,
                role: 'institution_admin', // This role should be handled by your backend
            };

            const res = await API.post('/auth/register', userData); // Backend handles 'institution_admin' role
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setMessage(res.data.message);
            // Redirect to a dashboard for institutions, or a general client dashboard
            navigate('/client/dashboard'); // Or '/institution/dashboard' if you create one
        } catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred during institution registration');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 rounded-md p-2 bg-indigo-100">
                    Sign Up Your Institution
                </h2>
                {message && <p className="mb-4 text-center text-red-500">{message}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Institution Name:</label>
                    <input
                        type="text"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Contact Person Name:</label>
                    <input
                        type="text"
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Contact Email (for login):</label>
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full"
                    >
                            SIGN UP
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

export default InstitutionSignupForm;
