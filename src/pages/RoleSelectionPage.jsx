// src/pages/RoleSelectionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Choose Your Account Type
                </h2>
                <p className="text-gray-600 mb-8">
                    Please select the type of account you'd like to create:
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/register/institution')}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
                    >
                          Institution / Organization
                    </button>
                    <button
                        onClick={() => navigate('/register/client')}
                        // Re-added route for individual client signup
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
                    >
                          Individual Researcher
                    </button>
                    <button
                        onClick={() => navigate('/register/respondent')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
                    >
                            Respondent
                    </button>
                </div>

                <p className="text-center text-sm mt-8">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-500 hover:text-blue-800 font-bold"
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
