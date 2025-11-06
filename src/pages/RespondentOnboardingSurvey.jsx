import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import axios directly
import { useNavigate } from 'react-router-dom';

// Import the ALL administrative data for cascading location dropdowns
import allAdministrativeUnits from '../data/allAdministrativeUnits';

// Import the demographic options from surveyOptions
import {
    employmentStatusOptions,
    maritalStatusOptions,
    earningsOptions, // This will be the base options without currency
    religionOptions,
    sexualOrientationOptions,
    educationLevelOptions,
    interestOptions
} from '../data/surveyOptions';

// Use the imported administrative data directly
const administrativeData = allAdministrativeUnits;

// Country options directly from the administrative data keys
const countryOptions = [
    { value: '', label: 'Select Country' }, // Re-added for initial selection, but will be validated
    { value: 'kenya', label: 'Kenya' },
    { value: 'uganda', label: 'Uganda' },
    { value: 'tanzania', label: 'Tanzania' },
    { value: 'somalia', label: 'Somalia' },
    { value: 'sudan', label: 'Sudan' },
    { value: 'south sudan', label: 'South Sudan' },
    { value: 'ethiopia', label: 'Ethiopia' },
    { value: 'rwanda', label: 'Rwanda' },
    { value: 'burundi', label: 'Burundi' },
    { value: 'congo', label: 'Congo (DRC)' }
];

// Currency mapping for East African countries
const currencyMap = {
    'kenya': 'KES',
    'uganda': 'UGX',
    'tanzania': 'TZS',
    'somalia': 'SOS',
    'sudan': 'SDG',
    'south sudan': 'SSP',
    'ethiopia': 'ETB',
    'rwanda': 'RWF',
    'burundi': 'BIF',
    'congo': 'CDF'
};

// Helper function to get currency symbol
const getCurrencySymbol = (country) => {
    return currencyMap[country.toLowerCase()] || '$'; // Default to $ if not found
};

// Helper function to dynamically update earnings options with currency
const getEarningsOptionsWithCurrency = (selectedCountry) => {
    const currency = getCurrencySymbol(selectedCountry);
    return [{ value: '', label: `Select Earnings` }, ...earningsOptions.map(option => ({
        value: option.value,
        label: option.label.replace('KES', currency) // Replace KES placeholder with actual currency
    }))];
};

// Define all questions and their properties
const questionsConfig = [
    { id: 'age', label: 'Age', type: 'number', placeholder: 'e.g., 30', optional: false },
    { id: 'gender', label: 'Gender', type: 'select', options: [{ value: '', label: 'Select Gender' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }], optional: false },
    // Location
    { id: 'selectedCountry', label: 'Country', type: 'select', options: countryOptions, optional: false },
    { id: 'adminUnit1', label: 'Admin Unit 1', type: 'select', options: [], optional: false, dependsOn: 'selectedCountry' }, // Options will be dynamic
    { id: 'adminUnit2', label: 'Admin Unit 2', type: 'select', options: [], optional: false, dependsOn: 'adminUnit1' }, // Options will be dynamic
    { id: 'adminUnit3', label: 'Ward', type: 'select', options: [], optional: false, dependsOn: 'adminUnit2', conditionalShow: (formData) => formData.selectedCountry === 'kenya' }, // Kenya specific
    // Demographics
    { id: 'employmentStatus', label: 'Employment Status', type: 'select', options: [{ value: '', label: 'Select Employment Status' }, ...employmentStatusOptions], optional: false },
    { id: 'maritalStatus', label: 'Marital Status', type: 'select', options: [{ value: '', label: 'Select Marital Status' }, ...maritalStatusOptions], optional: false },
    { id: 'earnings', label: 'Earnings', type: 'select', options: [], optional: false }, // Options will be dynamic
    { id: 'religion', label: 'Religion', type: 'select', options: [{ value: '', label: 'Select Religion' }, ...religionOptions], optional: false },
    { id: 'sexualOrientation', label: 'Sexual Orientation', type: 'select', options: [{ value: '', label: 'Select Sexual Orientation' }, ...sexualOrientationOptions], optional: false },
    { id: 'educationLevel', label: 'Education Level', type: 'select', options: [{ value: '', label: 'Select Education Level' }, ...educationLevelOptions], optional: false },
    { id: 'interests', label: 'Interests', type: 'checkbox-group', options: interestOptions, optional: false } // Changed to checkbox-group
];

// Define steps, grouping questions by their IDs
const steps = [
    {
        title: 'Basic Information',
        questions: ['age', 'gender']
    },
    {
        title: 'Your Location (Part 1)',
        questions: ['selectedCountry', 'adminUnit1', 'adminUnit2']
    },
    {
        title: 'Your Location (Part 2)',
        questions: ['adminUnit3'], // This step will only show if adminUnit3 is relevant (e.g., Kenya)
        conditionalShow: (formData) => formData.selectedCountry === 'kenya' && formData.adminUnit2 // Only show if Kenya and Admin Unit 2 selected
    },
    {
        title: 'Demographic Details (Part 1)',
        questions: ['employmentStatus', 'maritalStatus', 'earnings']
    },
    {
        title: 'Demographic Details (Part 2)',
        questions: ['religion', 'sexualOrientation', 'educationLevel']
    },
    {
        title: 'Your Interests',
        questions: ['interests']
    }
];

// Create an Axios instance directly within this file
const API = axios.create({
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


const RespondentOnboardingSurvey = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Consolidated state for all form data
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        selectedCountry: '',
        adminUnit1: '',
        adminUnit2: '',
        adminUnit3: '',
        employmentStatus: '',
        maritalStatus: '',
        earnings: '',
        religion: '',
        sexualOrientation: '',
        educationLevel: '',
        interests: [] // Interests is now an array for multi-select
    });

    // States for dynamic administrative units options (these hold the *options* for the dropdowns)
    const [adminUnit1Options, setAdminUnit1Options] = useState([]);
    const [adminUnit2Options, setAdminUnit2Options] = useState([]);
    const [adminUnit3Options, setAdminUnit3Options] = useState([]);

    // Check if user is logged in as respondent, otherwise redirect
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!token || !user || user.role !== 'respondent') {
            navigate('/login'); // Redirect to login if not a logged-in respondent
        }
        // If user is already complete, redirect them to dashboard
        if (user && user.isProfileComplete) {
            navigate('/respondent/dashboard');
        }
    }, [navigate]);

    // --- Effects for Populating Cascading Dropdowns ---
    useEffect(() => {
        if (formData.selectedCountry && administrativeData[formData.selectedCountry]) {
            const countryData = administrativeData[formData.selectedCountry];
            const unit1Key = Object.keys(countryData).find(key => Array.isArray(countryData[key]));
            if (unit1Key) {
                setAdminUnit1Options(countryData[unit1Key].map(name => ({ value: name, label: name })));
            } else {
                setAdminUnit1Options([]);
            }
        } else {
            setAdminUnit1Options([]);
        }
        // Reset lower-level selections when parent changes
        setFormData(prev => ({ ...prev, adminUnit1: '', adminUnit2: '', adminUnit3: '' }));
        setAdminUnit2Options([]);
        setAdminUnit3Options([]);
    }, [formData.selectedCountry]);

    useEffect(() => {
        if (formData.selectedCountry && formData.adminUnit1 && administrativeData[formData.selectedCountry]) {
            const countryData = administrativeData[formData.selectedCountry];
            if (formData.selectedCountry === 'kenya' && countryData.subCounties && countryData.subCounties[formData.adminUnit1]) {
                setAdminUnit2Options(countryData.subCounties[formData.adminUnit1].map(name => ({ value: name, label: name })));
            } else {
                const unit2Key = Object.keys(countryData).find(key =>
                    key.includes('subCounties') || key.includes('districts') ||
                    key.includes('zones') || key.includes('localities') ||
                    key.includes('counties') || key.includes('territories')
                );
                if (unit2Key && countryData[unit2Key] && countryData[unit2Key][formData.adminUnit1]) {
                    setAdminUnit2Options(countryData[unit2Key][formData.adminUnit1].map(name => ({ value: name, label: name })));
                } else {
                    setAdminUnit2Options([]);
                }
            }
        } else {
            setAdminUnit2Options([]);
        }
        setFormData(prev => ({ ...prev, adminUnit2: '', adminUnit3: '' }));
        setAdminUnit3Options([]);
    }, [formData.selectedCountry, formData.adminUnit1]);

    useEffect(() => {
        if (formData.selectedCountry === 'kenya' && administrativeData.kenya.wards && administrativeData.kenya.wards[formData.adminUnit2]) {
            setAdminUnit3Options(administrativeData.kenya.wards[formData.adminUnit2].map(name => ({ value: name, label: name })));
        } else {
            setAdminUnit3Options([]);
        }
        setFormData(prev => ({ ...prev, adminUnit3: '' }));
    }, [formData.selectedCountry, formData.adminUnit2]);


    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'interests') {
            setFormData(prev => {
                const newInterests = checked
                    ? [...prev.interests, value]
                    : prev.interests.filter(item => item !== value);
                return { ...prev, interests: newInterests };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleNext = () => {
        // Basic validation for current step (can be expanded)
        const currentStepQuestions = steps[currentStep].questions;
        for (const qId of currentStepQuestions) {
            const questionConfig = questionsConfig.find(q => q.id === qId);
            // Validate if the question is currently visible and is required
            if (!questionConfig.optional && (!questionConfig.conditionalShow || questionConfig.conditionalShow(formData))) {
                if (questionConfig.type === 'number' && (formData[qId] === '' || isNaN(formData[qId]))) {
                     setMessage(`Please enter a valid number for "${questionConfig.label}".`);
                     return;
                }
                if (questionConfig.type === 'text' && formData[qId].trim() === '') {
                    setMessage(`Please fill in the "${questionConfig.label}" field.`);
                    return;
                }
                if (questionConfig.type === 'select' && formData[qId] === '') {
                    setMessage(`Please select an option for "${questionConfig.label}".`);
                    return;
                }
                // Special validation for multi-select interests
                if (questionConfig.type === 'checkbox-group' && questionConfig.id === 'interests' && formData.interests.length === 0) {
                    setMessage(`Please select at least one interest.`);
                    return;
                }
            }
        }
        setMessage(''); // Clear previous messages

        let nextStep = currentStep + 1;
        // Skip steps that have a conditionalShow returning false
        while (nextStep < steps.length && steps[nextStep].conditionalShow && !steps[nextStep].conditionalShow(formData)) {
            nextStep++;
        }
        setCurrentStep(nextStep);
    };

    const handlePrevious = () => {
        let prevStep = currentStep - 1;
        // Skip steps that have a conditionalShow returning false when going backwards
        while (prevStep >= 0 && steps[prevStep].conditionalShow && !steps[prevStep].conditionalShow(formData)) {
            prevStep--;
        }
        setCurrentStep(prevStep);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        // Final validation for all fields before submission
        for (const step of steps) {
            for (const qId of step.questions) {
                const questionConfig = questionsConfig.find(q => q.id === qId);
                if (!questionConfig.optional && (!questionConfig.conditionalShow || questionConfig.conditionalShow(formData))) {
                    if (questionConfig.type === 'number' && (formData[qId] === '' || isNaN(formData[qId]))) {
                        setMessage(`Please enter a valid number for "${questionConfig.label}".`);
                        setLoading(false);
                        return;
                    }
                    if (questionConfig.type === 'text' && formData[qId].trim() === '') {
                        setMessage(`Please fill in the "${questionConfig.label}" field.`);
                        setLoading(false);
                        return;
                    }
                    if (questionConfig.type === 'select' && formData[qId] === '') {
                        setMessage(`Please select an option for "${questionConfig.label}".`);
                        setLoading(false);
                        return;
                    }
                    if (questionConfig.type === 'checkbox-group' && questionConfig.id === 'interests' && formData.interests.length === 0) {
                        setMessage(`Please select at least one interest.`);
                        setLoading(false);
                        return;
                    }
                }
            }
        }

        try {
            const profileData = {
                age: formData.age ? parseInt(formData.age) : undefined,
                gender: formData.gender || undefined,
                location: {
                    country: formData.selectedCountry || undefined,
                    adminUnit1: formData.adminUnit1 || undefined,
                    adminUnit2: formData.adminUnit2 || undefined,
                    adminUnit3: formData.adminUnit3 || undefined
                },
                demographics: {
                    employmentStatus: formData.employmentStatus || undefined,
                    maritalStatus: formData.maritalStatus || undefined,
                    earnings: formData.earnings || undefined,
                    religion: formData.religion || undefined,
                    sexualOrientation: formData.sexualOrientation || undefined,
                    educationLevel: formData.educationLevel || undefined,
                    interests: formData.interests || undefined, // Interests is already an array
                }
            };

            // Clean up empty objects/arrays from profileData
            const cleanProfileData = {};
            for (const key in profileData) {
                if (profileData[key] !== undefined && profileData[key] !== null && profileData[key] !== '') {
                    if (typeof profileData[key] === 'object' && !Array.isArray(profileData[key])) {
                        const cleanedSubObject = Object.fromEntries(
                            Object.entries(profileData[key]).filter(([, val]) => val !== undefined && val !== null && val !== '')
                        );
                        if (Object.keys(cleanedSubObject).length > 0) {
                            cleanProfileData[key] = cleanedSubObject;
                        }
                    } else if (Array.isArray(profileData[key])) {
                        if (profileData[key].length > 0) {
                            cleanProfileData[key] = profileData[key];
                        }
                    } else {
                        cleanProfileData[key] = profileData[key];
                    }
                }
            }

            // Call the new backend API endpoint to update the profile
            const res = await API.put('/respondent/profile', cleanProfileData);

            // Update user's points and profile completion status in local storage
            localStorage.setItem('user', JSON.stringify(res.data.user)); // Store the updated user object from backend

            setMessage('Thank you for completing your profile! You\'ve earned 50 points.');

            // Redirect to dashboard after a short delay to show the message
            setTimeout(() => {
                navigate('/respondent/dashboard');
            }, 3000); // Redirect after 3 seconds
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save profile data.';
            setMessage(errorMessage);
            console.error('Error saving profile:', err);

            // No redirect to login on error, let user fix and retry
            // setTimeout(() => {
            //     navigate('/login');
            // }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const currentStepConfig = steps[currentStep];
    const currentQuestions = currentStepConfig.questions.map(qId => questionsConfig.find(q => q.id === qId));

    // Filter out questions that should not be shown based on their own conditionalShow
    const visibleQuestions = currentQuestions.filter(q => !q.conditionalShow || q.conditionalShow(formData));

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 rounded-md p-2 bg-emerald-100">
                    Complete Your Profile (Earn 50 Points!)
                </h2>
                <p className="text-gray-600 mb-6 text-center text-sm">
                    Step {currentStep + 1} of {steps.length}: {currentStepConfig.title}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
                </div>

                {message && <p className="mb-4 text-center text-red-500 font-semibold">{message}</p>}
                {loading && <p className="mb-4 text-center text-blue-500">Saving your profile...</p>}

                <p className="text-gray-600 mb-6 text-center">
                    Help us match you with relevant surveys by providing some basic demographic and location information. This will earn you 50 points! This survey is mandatory to activate your account and access other features.
                </p>

                {visibleQuestions.map(q => (
                    <div className="mb-4" key={q.id}>
                        {/* Dynamic label for Admin Unit 1 & 2 */}
                        {q.id === 'adminUnit1' && formData.selectedCountry && (() => {
                            const countryData = administrativeData[formData.selectedCountry];
                            const unit1Key = Object.keys(countryData).find(key => Array.isArray(countryData[key]));
                            const label = unit1Key ? (unit1Key.replace(/s$/, '').replace(/([A-Z])/g, ' $1').trim()) : 'Unit 1';
                            return (
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    {label.charAt(0).toUpperCase() + label.slice(1)}:
                                </label>
                            );
                        })()}
                        {q.id === 'adminUnit2' && formData.selectedCountry && formData.adminUnit1 && (() => {
                            let label = 'Sub-County/District';
                            if (formData.selectedCountry === 'kenya') label = 'Sub-County';
                            else if (['uganda', 'tanzania', 'somalia', 'burundi', 'congo', 'rwanda'].includes(formData.selectedCountry)) label = 'District';
                            else if (formData.selectedCountry === 'ethiopia') label = 'Zone';
                            else if (['sudan', 'south sudan'].includes(formData.selectedCountry)) label = 'Locality/County';

                            return (
                                <label className="block text-gray-700 text-sm font-bold mb-2">{label}:</label>
                            );
                        })()}

                        {/* Default label for other questions */}
                        {!(q.id === 'adminUnit1' || q.id === 'adminUnit2') && (
                            <label className="block text-gray-700 text-sm font-bold mb-2">{q.label}:</label>
                        )}
                        
                        {q.type === 'number' && (
                            <input
                                type="number"
                                name={q.id}
                                value={formData[q.id]}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder={q.placeholder}
                                required={!q.optional}
                            />
                        )}
                        {q.type === 'text' && (
                            <input
                                type="text"
                                name={q.id}
                                value={formData[q.id]}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder={q.placeholder}
                                required={!q.optional}
                            />
                        )}
                        {q.type === 'select' && (
                            <select
                                name={q.id}
                                value={formData[q.id]}
                                onChange={handleChange}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required={!q.optional}
                            >
                                {/* Conditionally render options based on question ID */}
                                {q.id === 'selectedCountry' && countryOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                                {q.id === 'adminUnit1' && adminUnit1Options.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                                {q.id === 'adminUnit2' && adminUnit2Options.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                                {q.id === 'adminUnit3' && adminUnit3Options.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                                {/* General options for demographic select fields */}
                                {['gender', 'employmentStatus', 'maritalStatus', 'religion', 'sexualOrientation', 'educationLevel'].includes(q.id) && q.options.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                                {/* Dynamic earnings options */}
                                {q.id === 'earnings' && getEarningsOptionsWithCurrency(formData.selectedCountry).map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        )}
                        {q.type === 'checkbox-group' && q.id === 'interests' && (
                            <div className="border rounded p-2 max-h-32 overflow-y-auto bg-white">
                                {q.options.map(option => (
                                    <div key={option.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`interest-${option.value}`}
                                            name="interests"
                                            value={option.value}
                                            checked={formData.interests.includes(option.value)}
                                            onChange={handleChange}
                                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            required={!q.optional && formData.interests.length === 0} // HTML5 validation for at least one checked
                                        />
                                        <label htmlFor={`interest-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex items-center justify-between mt-6">
                    {currentStep > 0 && (
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            Previous
                        </button>
                    )}
                    {currentStep < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className={`font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${
                                loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            disabled={loading}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className={`font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${
                                loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Complete Profile & Earn Points'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RespondentOnboardingSurvey;
