import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api'; // Your Axios instance
import { v4 as uuidv4 } from 'uuid';

import SurveyQuestionsBuilder from '../components/SurveyQuestionsBuilder'; // Import the extracted component

// Import the ALL administrative data
import allAdministrativeUnits from '../data/allAdministrativeUnits';

// Import the new survey options
import {
    employmentStatusOptions,
    maritalStatusOptions,
    earningsOptions,
    religionOptions,
    sexualOrientationOptions,
    educationLevelOptions,
    interestOptions
} from '../data/surveyOptions';

// Use the imported administrative data directly
const administrativeData = allAdministrativeUnits;

// Country options directly from the administrative data keys
const countryOptions = [
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

const SurveyBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]); // Questions state managed here, passed to child
    const [rewardPerResponse, setRewardPerResponse] = useState(0.10);
    const [status, setStatus] = useState('draft');
    const [isPublic, setIsPublic] = useState(false);
    const [targetAudience, setTargetAudience] = useState({
        countries: [], // Now an array for multi-select
        adminUnit1: [],
        adminUnit2: [],
        adminUnit3: [],
        minAge: '',
        maxAge: '',
        gender: '',
        sexualOrientation: [], // Multi-select
        educationLevel: [],    // Multi-select
        employmentStatus: [],  // Multi-select
        maritalStatus: [],     // Multi-select
        earnings: [],          // Multi-select
        religion: [],          // Multi-select
        interests: []          // Multi-select
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImageQuestionId, setUploadingImageQuestionId] = useState(null); // Passed to child
    const [uploadingImageOptionIndex, setUploadingImageOptionIndex] = useState(null); // Passed to child
    const [showTargetAudienceDetails, setShowTargetAudienceDetails] = useState(false);
    const [randomizeQuestions, setRandomizeQuestions] = useState(false); // Survey-level question randomization

    // State for dynamic administrative units (these hold the *options* for the checkboxes)
    const [adminUnit1Options, setAdminUnit1Options] = useState([]);
    const [adminUnit2Options, setAdminUnit2Options] = useState([]);
    const [adminUnit3Options, setAdminUnit3Options] = useState([]);

    // Base URL for public surveys (adjust as per your frontend routing)
    const PUBLIC_SURVEY_BASE_URL = `${window.location.origin}/survey/public`;

    // Effect to fetch existing survey data for editing
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (id) {
            setLoading(true);
            const fetchSurvey = async () => {
                try {
                    const res = await API.get(`/client/surveys/${id}`);
                    const surveyData = res.data;
                    setTitle(surveyData.title);
                    setDescription(surveyData.description);
                    // Ensure questions are valid objects with _id before setting state
                    setQuestions(surveyData.questions
                        .filter(q => q && typeof q === 'object' && q._id) // Robust filter on load
                        .map(q => ({
                            ...q,
                            _id: q._id || uuidv4(), // Ensure _id exists, generate if somehow missing
                            requiresGeolocation: q.requiresGeolocation || false,
                            randomizeOptions: q.randomizeOptions || false,
                            likertScaleLabels: q.likertScaleLabels || [],
                            rankingItems: q.rankingItems || [],
                            sliderMin: q.sliderMin !== undefined ? q.sliderMin : 0,
                            sliderMax: q.sliderMax !== undefined ? q.sliderMax : 100,
                            sliderStep: q.sliderStep !== undefined ? q.sliderStep : 1,
                            sliderDefault: q.sliderDefault !== undefined ? q.sliderDefault : 50,
                            minLabel: q.minLabel || '',
                            maxLabel: q.maxLabel || '',
                            allowedFileTypes: q.allowedFileTypes || '', // For file upload
                        })));
                    setRewardPerResponse(surveyData.rewardPerResponse);
                    setStatus(surveyData.status);

                    const loadedTargetAudience = surveyData.targetAudience || {};
                    // Ensure all multi-select fields are initialized as arrays on load
                    const multiSelectFields = [
                        'countries', 'adminUnit1', 'adminUnit2', 'adminUnit3', // Geographical
                        'sexualOrientation', 'educationLevel', 'employmentStatus', 'maritalStatus',
                        'earnings', 'religion', 'interests'
                    ];
                    const initialTargetAudience = {};
                    multiSelectFields.forEach(field => {
                        initialTargetAudience[field] = Array.isArray(loadedTargetAudience[field])
                            ? loadedTargetAudience[field]
                            : (loadedTargetAudience[field] ? [loadedTargetAudience[field]] : []); // Convert single value to array or empty array
                    });
                    // Handle non-array fields
                    initialTargetAudience.minAge = loadedTargetAudience.minAge || '';
                    initialTargetAudience.maxAge = loadedTargetAudience.maxAge || '';
                    initialTargetAudience.gender = loadedTargetAudience.gender || '';

                    setTargetAudience(initialTargetAudience);
                    setIsPublic(surveyData.isPublic);
                    setRandomizeQuestions(surveyData.randomizeQuestions || false);

                    // Determine if target audience section should be shown if it has any filters
                    if (Object.keys(loadedTargetAudience).length > 0) {
                        setShowTargetAudienceDetails(true);
                    }

                } catch (err) {
                    setMessage(err.response?.data?.message || 'Failed to load survey for editing.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSurvey();
        }
    }, [id, navigate]);


    // --- Effects for Populating Cascading Checkbox Options ---

    // Effect 1: Populates Admin Unit 1 options based on selectedCountries
    useEffect(() => {
        const selectedCountries = targetAudience.countries;
        let newAdminUnit1Options = [];

        if (selectedCountries && selectedCountries.length > 0) {
            selectedCountries.forEach(country => {
                if (administrativeData[country]) {
                    const countryData = administrativeData[country];
                    const unit1Key = Object.keys(countryData).find(key => Array.isArray(countryData[key]));
                    if (unit1Key) {
                        newAdminUnit1Options = [...newAdminUnit1Options, ...countryData[unit1Key].map(name => ({ value: name, label: `${name} (${country})` }))];
                    }
                }
            });
        }
        // Remove duplicates and sort
        newAdminUnit1Options = Array.from(new Set(newAdminUnit1Options.map(o => o.value)))
                                .map(value => newAdminUnit1Options.find(o => o.value === value))
                                .sort((a,b) => a.label.localeCompare(b.label));

        setAdminUnit1Options(newAdminUnit1Options);
        // Reset lower-level selections if their parents are no longer selected
        setTargetAudience(prev => ({
            ...prev,
            adminUnit1: prev.adminUnit1.filter(unit => newAdminUnit1Options.some(opt => opt.value === unit)),
            adminUnit2: [],
            adminUnit3: []
        }));
    }, [targetAudience.countries]);

    // Effect 2: Populates Admin Unit 2 options based on selectedCountries and targetAudience.adminUnit1
    useEffect(() => {
        const selectedCountries = targetAudience.countries;
        const selectedAdminUnit1s = targetAudience.adminUnit1;
        let newAdminUnit2Options = [];

        if (selectedCountries.length > 0 && selectedAdminUnit1s.length > 0) {
            selectedCountries.forEach(country => {
                if (administrativeData[country]) {
                    const countryData = administrativeData[country];
                    selectedAdminUnit1s.forEach(adminUnit1 => {
                        // Special handling for Kenya's subCounties
                        if (country === 'kenya' && countryData.subCounties && countryData.subCounties[adminUnit1]) {
                             newAdminUnit2Options = [...newAdminUnit2Options, ...countryData.subCounties[adminUnit1].map(name => ({ value: name, label: `${name} (${adminUnit1}, ${country})` }))];
                        } else {
                            // General fallback for other countries/structures
                            const unit2Key = Object.keys(countryData).find(key =>
                                key.includes('subCounties') || key.includes('districts') ||
                                key.includes('zones') || key.includes('localities') ||
                                key.includes('counties') || key.includes('territories')
                            );
                            if (unit2Key && countryData[unit2Key] && countryData[unit2Key][adminUnit1]) {
                                newAdminUnit2Options = [...newAdminUnit2Options, ...countryData[unit2Key][adminUnit1].map(name => ({ value: name, label: `${name} (${adminUnit1}, ${country})` }))];
                            }
                        }
                    });
                }
            });
        }
        newAdminUnit2Options = Array.from(new Set(newAdminUnit2Options.map(o => o.value)))
                                .map(value => newAdminUnit2Options.find(o => o.value === value))
                                .sort((a,b) => a.label.localeCompare(b.label));
        setAdminUnit2Options(newAdminUnit2Options);
        setTargetAudience(prev => ({
            ...prev,
            adminUnit2: prev.adminUnit2.filter(unit => newAdminUnit2Options.some(opt => opt.value === unit)),
            adminUnit3: []
        }));
    }, [targetAudience.countries, targetAudience.adminUnit1]);

    // Effect 3: Populates Admin Unit 3 options based on selectedCountries and targetAudience.adminUnit2
    useEffect(() => {
        const selectedCountries = targetAudience.countries;
        const selectedAdminUnit2s = targetAudience.adminUnit2;
        let newAdminUnit3Options = [];

        if (selectedCountries.length > 0 && selectedAdminUnit2s.length > 0) {
            selectedCountries.forEach(country => {
                if (country === 'kenya' && administrativeData.kenya.wards) {
                    selectedAdminUnit2s.forEach(adminUnit2 => {
                        if (administrativeData.kenya.wards[adminUnit2]) {
                            newAdminUnit3Options = [...newAdminUnit3Options, ...administrativeData.kenya.wards[adminUnit2].map(name => ({ value: name, label: `${name} (${adminUnit2}, ${country})` }))];
                        }
                    });
                }
            });
        }
        newAdminUnit3Options = Array.from(new Set(newAdminUnit3Options.map(o => o.value)))
                                .map(value => newAdminUnit3Options.find(o => o.value === value))
                                .sort((a,b) => a.label.localeCompare(b.label));
        setAdminUnit3Options(newAdminUnit3Options);
        setTargetAudience(prev => ({
            ...prev,
            adminUnit3: prev.adminUnit3.filter(unit => newAdminUnit3Options.some(opt => opt.value === unit))
        }));
    }, [targetAudience.countries, targetAudience.adminUnit2]);


    // --- Handlers for Target Audience Demographic/Geographical Changes ---

    const handleTargetAudienceChange = useCallback((e) => {
        const { name, value, checked, type } = e.target;

        setTargetAudience(prev => {
            if (type === 'checkbox') {
                // For checkbox lists (multi-select)
                const currentValues = Array.isArray(prev[name]) ? [...prev[name]] : [];
                if (checked) {
                    return { ...prev, [name]: [...currentValues, value] };
                } else {
                    return { ...prev, [name]: currentValues.filter(item => item !== value) };
                }
            } else {
                // For single-select inputs (like minAge, maxAge, gender)
                return { ...prev, [name]: value };
            }
        });
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear any previous messages at the start of submission
        setLoading(true);

        // Robust filtering: Ensure each question object is valid before processing
        const cleanedQuestions = questions
            .filter(q => q && typeof q === 'object' && Object.prototype.hasOwnProperty.call(q, '_id'))
            .map(q => {
                const { _id, ...rest } = q; // Destructure only if q is a valid object with _id
                return rest;
            });

        // Clean up targetAudience by removing empty arrays or undefined values
        const finalTargetAudience = {};
        for (const key in targetAudience) {
            const value = targetAudience[key];
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    finalTargetAudience[key] = value;
                }
            } else if (value !== '' && value !== undefined && value !== null) {
                finalTargetAudience[key] = value;
            }
        }

        const surveyData = {
            title,
            description,
            questions: cleanedQuestions,
            rewardPerResponse: parseFloat(rewardPerResponse),
            status,
            isPublic,
            targetAudience: finalTargetAudience,
            randomizeQuestions
        };

        try {
            if (id) {
                await API.put(`/client/surveys/${id}`, surveyData);
                setMessage('Survey updated successfully!'); // Success message for update
            } else {
                await API.post('/client/surveys', surveyData);
                // Updated success message and redirect for new survey creation
                setMessage('Thank you for creating the survey! You can now publish it by editing it to make it active and updating the form.');
                // Delay navigation to allow message to be seen
                setTimeout(() => {
                    navigate('/client/dashboard');
                }, 3000); // 3-second delay
            }
        } catch (err) {
            // Only set error message if an actual error occurred
            setMessage(err.response?.data?.message || 'Error saving survey.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) return <div className="flex justify-center items-center min-h-screen text-xl">Loading survey for editing...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {id ? 'Edit Survey' : 'Create New Survey'}
                </h1>
                {/* Conditional message display with dynamic styling */}
                {message && (
                    <p className={`mb-4 text-center font-semibold ${
                        message.includes('successfully') || message.includes('Thank you') ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Survey Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Reward Per Response ($):</label>
                        <input
                            type="number"
                            step="0.01"
                            value={rewardPerResponse}
                            onChange={(e) => setRewardPerResponse(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            min="0"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Survey Status:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 text-gray-700 text-sm font-bold">Allow Anonymous Public Sharing</label>
                        <p className="ml-4 text-sm text-gray-500">(Generates a link for anyone to respond anonymously, no earnings for specific respondents)</p>
                    </div>

                    {/* Survey-level Question Randomization */}
                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="randomizeQuestions"
                            checked={randomizeQuestions}
                            onChange={(e) => setRandomizeQuestions(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-purple-600 rounded"
                        />
                        <label htmlFor="randomizeQuestions" className="ml-2 text-gray-700 text-sm font-bold">Randomize Question Order</label>
                        <p className="ml-4 text-sm text-gray-500">(Questions will be presented in a random order to respondents)</p>
                    </div>


                    {/* --- Target Audience Section --- */}
                    <div className="flex items-center justify-between mb-4 mt-8 border-b pb-2">
                        <h2 className="text-2xl font-bold text-gray-800">Target Audience (Optional)</h2>
                        <button
                            type="button"
                            onClick={() => setShowTargetAudienceDetails(!showTargetAudienceDetails)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded-md transition-colors duration-200"
                        >
                            {showTargetAudienceDetails ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>

                    {showTargetAudienceDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Age and Gender remain as single select */}
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Min Age:</label>
                                <input
                                    type="number"
                                    name="minAge"
                                    value={targetAudience.minAge || ''}
                                    onChange={handleTargetAudienceChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Max Age:</label>
                                <input
                                    type="number"
                                    name="maxAge"
                                    value={targetAudience.maxAge || ''}
                                    onChange={handleTargetAudienceChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Gender:</label>
                                <select
                                    name="gender"
                                    value={targetAudience.gender || ''}
                                    onChange={handleTargetAudienceChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                >
                                    <option value="">Any</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Multi-select Demographic Fields */}
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Sexual Orientation(s):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {sexualOrientationOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`so-${option.value}`}
                                                name="sexualOrientation"
                                                value={option.value}
                                                checked={targetAudience.sexualOrientation.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`so-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Education Level(s):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {educationLevelOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`edu-${option.value}`}
                                                name="educationLevel"
                                                value={option.value}
                                                checked={targetAudience.educationLevel.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`edu-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Employment Status(es):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {employmentStatusOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`emp-${option.value}`}
                                                name="employmentStatus"
                                                value={option.value}
                                                checked={targetAudience.employmentStatus.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`emp-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Marital Status(es):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {maritalStatusOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`marital-${option.value}`}
                                                name="maritalStatus"
                                                value={option.value}
                                                checked={targetAudience.maritalStatus.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`marital-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Earnings:</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {earningsOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`earnings-${option.value}`}
                                                name="earnings"
                                                value={option.value}
                                                checked={targetAudience.earnings.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`earnings-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Religion(s):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {religionOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`religion-${option.value}`}
                                                name="religion"
                                                value={option.value}
                                                checked={targetAudience.religion.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`religion-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Interest(s):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {interestOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`interest-${option.value}`}
                                                name="interests"
                                                value={option.value}
                                                checked={targetAudience.interests.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`interest-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Multi-select Geographical Structure */}
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Country(ies):</label>
                                <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                    {countryOptions.map(option => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`country-${option.value}`}
                                                name="countries"
                                                value={option.value}
                                                checked={targetAudience.countries.includes(option.value)}
                                                onChange={handleTargetAudienceChange}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`country-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {targetAudience.countries.length > 0 && adminUnit1Options.length > 0 && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Admin Unit 1 (e.g., County/Region):</label>
                                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                        {adminUnit1Options.map(option => (
                                            <div key={option.value} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`admin1-${option.value}`}
                                                    name="adminUnit1"
                                                    value={option.value}
                                                    checked={targetAudience.adminUnit1.includes(option.value)}
                                                    onChange={handleTargetAudienceChange}
                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                />
                                                <label htmlFor={`admin1-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {targetAudience.adminUnit1.length > 0 && adminUnit2Options.length > 0 && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Admin Unit 2 (e.g., Sub-County/District):</label>
                                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                        {adminUnit2Options.map(option => (
                                            <div key={option.value} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`admin2-${option.value}`}
                                                    name="adminUnit2"
                                                    value={option.value}
                                                    checked={targetAudience.adminUnit2.includes(option.value)}
                                                    onChange={handleTargetAudienceChange}
                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                />
                                                <label htmlFor={`admin2-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {targetAudience.adminUnit2.length > 0 && adminUnit3Options.length > 0 && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Admin Unit 3 (e.g., Ward):</label>
                                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                                        {adminUnit3Options.map(option => (
                                            <div key={option.value} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`admin3-${option.value}`}
                                                    name="adminUnit3"
                                                    value={option.value}
                                                    checked={targetAudience.adminUnit3.includes(option.value)}
                                                    onChange={handleTargetAudienceChange}
                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                />
                                                <label htmlFor={`admin3-${option.value}`} className="ml-2 text-gray-700 text-sm">{option.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- Questions Section (Now a separate component) --- */}
                    <SurveyQuestionsBuilder
                        questions={questions}
                        setQuestions={setQuestions}
                        setMessage={setMessage}
                        uploadingImageQuestionId={uploadingImageQuestionId}
                        setUploadingImageQuestionId={setUploadingImageQuestionId}
                        uploadingImageOptionIndex={uploadingImageOptionIndex}
                        setUploadingImageOptionIndex={setUploadingImageOptionIndex}
                        API={API}
                    />

                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (id ? 'Update Survey' : 'Create Survey')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SurveyBuilder;
