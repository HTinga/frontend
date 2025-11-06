import React, { useState, useEffect, useCallback } from 'react';
import API from '../api'; // Your Axios instance with interceptors
import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // Removed as per previous context

// IMPORTANT: For Font Awesome icons, ensure you have added the CDN link to your public/index.html:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" xintegrity="sha512-..." crossorigin="anonymous" referrerpolicy="no-referrer" />

// --- Helper Functions & Constants ---
// Function to get dynamic greeting based on time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    if (hour < 22) return 'Good Evening';
    return 'Good Night';
};

// OpenWeatherMap API Key (Replace with your actual key from OpenWeatherMap)
// You need to sign up at openweathermap.org to get a free API key.
const OPENWEATHER_API_KEY = '888d33479b5d614797e6201d'; // <<< CRITICAL: REPLACE THIS WITH YOUR ACTUAL, VALID OPENWEATHERMAP API KEY!
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// --- Reusable UI Components ---

/**
 * A modal component for confirming actions.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Function to call when closing the modal.
 * @param {function} props.onConfirm - Function to call when the action is confirmed.
 * @param {string} props.title - The title of the modal.
 * @param {React.ReactNode} props.children - The content of the modal.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="text-gray-600 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal for withdrawal.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Function to call when closing the modal.
 * @param {function} props.onWithdraw - Function to call when withdrawal is initiated.
 * @param {number} props.currentPoints - The current points the user has.
 */
const WithdrawalModal = ({ isOpen, onClose, onWithdraw, currentPoints }) => {
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMessage('');
            setMpesaNumber('');
            setWithdrawalAmount('');
        }
    }, [isOpen]);

    const handleWithdrawSubmit = () => {
        if (!mpesaNumber || !withdrawalAmount) {
            setMessage('Please fill in all fields.');
            return;
        }
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            setMessage('Please enter a valid amount.');
            return;
        }
        if (amount > currentPoints) {
            setMessage('Withdrawal amount cannot exceed your current points.');
            return;
        }
        if (amount < 1000) {
            setMessage('Minimum withdrawal amount is 1000 points.');
            return;
        }

        // Simulate API call for withdrawal
        onWithdraw(mpesaNumber, amount);
        onClose(); // Close modal after initiating withdrawal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Withdraw Earnings</h2>
                {message && <p className="text-red-500 text-sm mb-4">{message}</p>}
                <p className="text-gray-700 mb-4">Current Points: <span className="font-bold text-blue-700">{currentPoints}</span></p>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mpesaNumber">
                        M-Pesa Number:
                    </label>
                    <input
                        type="tel"
                        id="mpesaNumber"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        placeholder="e.g., 0712345678"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="withdrawalAmount">
                        Points to Withdraw:
                    </label>
                    <input
                        type="number"
                        id="withdrawalAmount"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="Minimum 1000 points"
                        min="1000"
                        max={currentPoints}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleWithdrawSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Respondent Dashboard Component ---

const RespondentDashboard = () => {
    // Development-only: Clear console on every render to manage spam during debugging
    // You should remove this in production.
    if (import.meta.env.DEV) {
        console.clear();
    }

    const [availableSurveys, setAvailableSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [earnings, setEarnings] = useState(0); // This will be in points
    const [completedSurveys, setCompletedSurveys] = useState([]);
    const [isWithdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [weatherData, setWeatherData] = useState(null); // State for weather data
    const [weatherError, setWeatherError] = useState(null); // State for weather error
    const [weatherLoading, setWeatherLoading] = useState(true); // State for weather loading
    const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied' - for overall browser permission
    const [surveyGeolocationStatus, setSurveyGeolocationStatus] = useState({}); // { surveyId: 'granted' | 'denied' | 'prompt' | 'loading' }
    const [activeTab, setActiveTab] = useState('available'); // 'available' or 'completed'
    const [showAllAvailableSurveys, setShowAllAvailableSurveys] = useState(false); // New state for "show more"

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage

    // Function to handle logout - now memoized with useCallback
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]); // navigate is a stable dependency from useNavigate

    // Function to fetch weather data (memoized)
    const fetchWeatherData = useCallback(async (city, country, lat = null, lon = null) => {
        setWeatherLoading(true);
        setWeatherError(null);
        // Check if the API key is the placeholder or empty
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === '82d8330a845eb7545ff3dc85ace93905') {
            setWeatherError('Weather API key is not configured. Please replace "YOUR_OPENWEATHER_API_KEY" in the code with your actual key from OpenWeatherMap.');
            setWeatherLoading(false);
            return;
        }

        let apiUrl = '';
        if (lat && lon) {
            apiUrl = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        } else {
            const locationQuery = city ? `${city},${country || 'KE'}` : 'Nairobi,KE'; // Default to Nairobi if no city
            apiUrl = `${WEATHER_API_BASE_URL}?q=${locationQuery}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        }

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errData = await response.json();
                // Specific check for invalid API key error from OpenWeatherMap
                if (response.status === 401 && errData.message.includes('Invalid API key')) {
                    throw new Error('Invalid OpenWeatherMap API key. Please check your configuration.');
                }
                throw new Error(errData.message || 'Failed to fetch weather data.');
            }
            const data = await response.json();
            setWeatherData({
                temp: data.main.temp,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                city: data.name,
                country: data.sys.country
            });
        } catch (err) {
            console.error('Error fetching weather:', err); // Keep this for debugging
            setWeatherError(`Failed to load weather: ${err.message}`);
        } finally {
            setWeatherLoading(false);
        }
    }, []);

    // Effect for initial data fetching (surveys, earnings) and profile check
    useEffect(() => {
        setLoading(true);
        setError(null);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!token || !storedUser || storedUser.role !== 'respondent') {
            navigate('/login');
            setLoading(false); // Ensure loading is false on redirect
            return;
        }

        // IMPORTANT: Check if profile is complete. If not, redirect to onboarding survey.
        if (!storedUser.isProfileComplete) {
            navigate('/respondent/onboarding-survey');
            setLoading(false); // Ensure loading is false on redirect
            return; // Stop further execution of this useEffect
        }

        const fetchData = async () => {
            try {
                const surveysRes = await API.get('/respondent/available');
                // Mocking `requiresGeolocation` for demonstration. In a real app, this comes from your backend.
                const surveysWithGpsRequirement = surveysRes.data.map(survey => ({
                    ...survey,
                    // Example: Mark some surveys as requiring geolocation
                    requiresGeolocation: ['654321098765432109876543', 'some-other-survey-id'].includes(survey._id) || false
                }));
                setAvailableSurveys(surveysWithGpsRequirement);

                // Corrected API call for earnings
                const earningsRes = await API.get('/respondent/me/earnings');
                setEarnings(earningsRes.data.points || 0);
                setCompletedSurveys(earningsRes.data.completedSurveys || []);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                let errorMessage = err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.';

                if (err.response?.status === 401 || err.response?.status === 403) {
                    errorMessage = 'Session expired or not authorized. Please log in again.';
                    logout(); // Use the local logout function
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, logout]); // Dependencies for data fetching

    // Effect for weather data fetching and geolocation permission handling
    useEffect(() => {
        // Only attempt geolocation if supported and we haven't already processed it
        if (navigator.geolocation && locationPermissionStatus !== 'denied' && !weatherData && !weatherError) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setLocationPermissionStatus(result.state);
                if (result.state === 'granted') {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            fetchWeatherData(null, null, position.coords.latitude, position.coords.longitude);
                        },
                        (err) => {
                            console.error('Error getting current position for weather:', err);
                            setLocationPermissionStatus('denied'); // Explicitly set to denied on error
                            setWeatherError('Location access denied. Weather data may not be accurate for your current location.');
                            fetchWeatherData('Nairobi', 'KE'); // Fallback
                        },
                        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
                    );
                } else {
                    // If 'prompt' or 'denied' initially, fallback to Nairobi.
                    // The UI button will handle explicit 'prompt' requests.
                    fetchWeatherData('Nairobi', 'KE');
                }
            }).catch(err => {
                console.error("Error querying geolocation permission:", err);
                setWeatherError('Could not query geolocation permission.');
                fetchWeatherData('Nairobi', 'KE'); // Fallback
            });
        } else if (locationPermissionStatus === 'denied' && !weatherData && !weatherError) {
            // If permission was already denied from a previous session, just set the error and fallback
            setWeatherError('Location access denied. Weather data may not be accurate for your current location.');
            fetchWeatherData('Nairobi', 'KE');
        } else if (!navigator.geolocation && !weatherData && !weatherError) {
            // If geolocation is not supported at all by the browser
            setWeatherError('Geolocation not supported by your browser.');
            fetchWeatherData('Nairobi', 'KE');
        }
    }, [fetchWeatherData, locationPermissionStatus, weatherData, weatherError]); // Dependencies for weather fetching


    // Function to request geolocation permission for a specific survey
    const requestSurveyGeolocation = useCallback((surveyId) => {
        if (navigator.geolocation) {
            setSurveyGeolocationStatus(prev => ({ ...prev, [surveyId]: 'loading' })); // Set loading state for this survey
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log(`Geolocation granted for survey ${surveyId}:`, position.coords);
                    setSurveyGeolocationStatus(prev => ({ ...prev, [surveyId]: 'granted' }));
                    // In a real app, you might store the coords here to pass to the TakeSurvey page
                    // e.g., setSurveyLocationCoords(prev => ({ ...prev, [surveyId]: { lat: position.coords.latitude, lon: position.coords.longitude } }));
                },
                (err) => {
                    console.error(`Geolocation denied or error for survey ${surveyId}:`, err);
                    setSurveyGeolocationStatus(prev => ({ ...prev, [surveyId]: 'denied' }));
                    // Optionally show a more specific message to the user
                    alert(`Location access denied for this survey: ${err.message}. You may not be able to take this survey.`);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Request high accuracy for survey needs
            );
        } else {
            setSurveyGeolocationStatus(prev => ({ ...prev, [surveyId]: 'denied' }));
            alert('Geolocation is not supported by your browser.');
        }
    }, []);


    const handleInitiateWithdrawal = (mpesaNumber, amount) => {
        alert(`Withdrawal request for ${amount} points to M-Pesa number ${mpesaNumber} initiated. This will be processed by the backend.`);
        setEarnings(prev => prev - amount);
    };

    // Surveys to display based on showAllAvailableSurveys state
    const surveysToDisplay = showAllAvailableSurveys ? availableSurveys : availableSurveys.slice(0, 3);


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-xl text-gray-700">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                    {error.includes('Session expired') && (
                        <button onClick={() => navigate('/login')} className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            Login Again
                        </button>
                    )}
                    {!error.includes('Session expired') && (
                        <button onClick={() => window.location.reload()} className="ml-4 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const pointsRemaining = 1000 - earnings;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <WithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={() => setWithdrawalModalOpen(false)}
                onWithdraw={handleInitiateWithdrawal}
                currentPoints={earnings}
            />

            <div className="max-w-7xl mx-auto">
                {/* Top Header Section */}
                <header className="bg-white p-6 rounded-lg shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                    {/* Left Section: Welcome and Points */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
                            {getGreeting()}, {user?.username || 'Respondent'}!
                        </h1>
                        <div className="flex items-center justify-center md:justify-start space-x-4">
                            <div className="text-blue-700 text-2xl font-bold">
                                {earnings} Points
                            </div>
                            <span className="text-gray-600 text-lg">
                                ({pointsRemaining > 0 ? `${pointsRemaining} to go for withdrawal!` : 'Ready to withdraw!'})
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                            <button
                                onClick={() => setWithdrawalModalOpen(true)}
                                disabled={earnings < 1000}
                                className={`font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow-md ${
                                    earnings >= 1000 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Withdraw Points
                            </button>
                        </div>
                    </div>

                    {/* Right Section: Notifications, Help, Logout, Weather */}
                    <div className="flex-shrink-0 flex flex-col items-center md:items-end space-y-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => alert('Notifications functionality to be implemented!')}
                                className="text-gray-700 hover:text-blue-600 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 relative"
                                aria-label="Notifications"
                            >
                                <i className="fas fa-bell text-2xl"></i>
                                {availableSurveys.length > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                                        {availableSurveys.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => alert('Help & Support functionality to be implemented!')}
                                className="text-gray-700 hover:text-blue-600 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                aria-label="Help"
                            >
                                <i className="fas fa-info-circle text-2xl"></i>
                            </button>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Weather Widget */}
                        <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-inner text-sm flex items-center space-x-2 w-full md:w-auto mt-4 md:mt-0">
                            {weatherLoading ? (
                                <span>Loading weather...</span>
                            ) : weatherError ? (
                                <span className="text-red-600">{weatherError}</span>
                            ) : weatherData ? (
                                <>
                                    <img
                                        src={`http://openweathermap.org/img/wn/${weatherData.icon}.png`}
                                        alt={weatherData.description}
                                        className="w-8 h-8"
                                    />
                                    <div>
                                        <p className="font-semibold">{weatherData.city}, {weatherData.country}</p>
                                        <p>{weatherData.temp}°C, {weatherData.description}</p>
                                    </div>
                                </>
                            ) : (
                                <span>Weather data unavailable.</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Geolocation Permission Prompt (Global) */}
                {locationPermissionStatus === 'prompt' && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-8 flex justify-between items-center">
                        <div>
                            <strong className="font-bold">Location Access:</strong>
                            <span className="block sm:inline ml-2">
                                Please allow general location access for local weather updates.
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                // This global prompt will request permission for weather, not specific surveys
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        setLocationPermissionStatus('granted');
                                        fetchWeatherData(null, null, position.coords.latitude, position.coords.longitude);
                                    },
                                    (err) => {
                                        setLocationPermissionStatus('denied');
                                        setWeatherError('Location access denied. Weather data may not be accurate for your current location.');
                                    },
                                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
                                );
                            }}
                            className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200"
                        >
                            Enable General Location
                        </button>
                    </div>
                )}
                 {locationPermissionStatus === 'denied' && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
                        <strong className="font-bold">Location Denied:</strong>
                        <span className="block sm:inline ml-2">
                            General location access is denied. Weather data may not be accurate. You can enable it in your browser settings.
                        </span>
                    </div>
                )}


                {/* Tab Navigation */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('available')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg transition-colors duration-200
                                ${activeTab === 'available' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Available Surveys
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg transition-colors duration-200
                                ${activeTab === 'completed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Completed Surveys
                        </button>
                    </nav>
                </div>

                {/* Content based on active tab */}
                <main className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
                    {activeTab === 'available' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2 border-gray-200">Available Surveys</h2>
                            {availableSurveys.length === 0 ? (
                                <p className="text-gray-600 text-lg text-center mt-10">No surveys currently available for you. Check back later!</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {surveysToDisplay.map((survey) => {
                                            const requiresGps = survey.requiresGeolocation;
                                            const gpsStatusForSurvey = surveyGeolocationStatus[survey._id] || 'prompt';
                                            const isTakeSurveyEnabled = !requiresGps || gpsStatusForSurvey === 'granted';

                                            return (
                                                <div key={survey._id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
                                                    <h3 className="text-xl font-bold text-blue-700 mb-2">{survey.title}</h3>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{survey.description}</p>
                                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                                        <span>Reward: <span className="font-semibold">{survey.rewardPerResponse || 0} points</span></span>
                                                        <span>Questions: <span className="font-semibold">{survey.questions.length}</span></span>
                                                    </div>
                                                    <div className="flex flex-col space-y-2 mt-auto"> {/* Use flex-col for buttons */}
                                                        {requiresGps && gpsStatusForSurvey !== 'granted' && (
                                                            <button
                                                                onClick={() => requestSurveyGeolocation(survey._id)}
                                                                className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md ${
                                                                    gpsStatusForSurvey === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
                                                                }`}
                                                                disabled={gpsStatusForSurvey === 'loading'}
                                                            >
                                                                {gpsStatusForSurvey === 'loading' ? 'Enabling GPRS...' : 'Enable GPRS'}
                                                            </button>
                                                        )}
                                                        {requiresGps && gpsStatusForSurvey === 'denied' && (
                                                            <p className="text-red-500 text-xs text-center">Location required for this survey. Please enable in browser settings.</p>
                                                        )}
                                                        <Link
                                                            to={`/respondent/take-survey/${survey._id}`}
                                                            className={`text-center font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md ${
                                                                isTakeSurveyEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                            style={{ pointerEvents: isTakeSurveyEnabled ? 'auto' : 'none' }} // Disable link clicks
                                                        >
                                                            Take Survey
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {availableSurveys.length > 3 && (
                                        <div className="text-center mt-8">
                                            <button
                                                onClick={() => setShowAllAvailableSurveys(!showAllAvailableSurveys)}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                            >
                                                {showAllAvailableSurveys ? 'Show Less Surveys' : `Show All ${availableSurveys.length} Surveys`}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'completed' && (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2 border-gray-200">Completed Surveys</h2>
                            {completedSurveys.length === 0 ? (
                                <p className="text-gray-600 text-lg text-center mt-10">You haven't completed any surveys yet. Start taking some!</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {completedSurveys.map((survey) => (
                                        <div key={survey._id} className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md flex flex-col">
                                            <h3 className="text-xl font-bold text-green-800 mb-2">{survey.title}</h3>
                                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{survey.description}</p>
                                            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                                                <span>Earned: <span className="font-semibold">{survey.rewardPerResponse || 0} points</span></span>
                                                <span>Date: <span className="font-semibold">{new Date(survey.completionDate).toLocaleDateString()}</span></span>
                                            </div>
                                            <Link
                                               to={`/respondent/survey-details/${survey._id}`}
                                                                            className="..."
                                                                >
                                                                    View Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RespondentDashboard;
