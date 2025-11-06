import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Configuration ---
// The base URL for your Node.js/Express backend API.
// IMPORTANT: Ensure this matches the URL where your backend is running.
// If running locally, it's 'http://localhost:8000'.
// If using ngrok, it will be your ngrok HTTPS URL (e.g., 'https://abcdef12345.ngrok.io/api').
const API_URL = 'http://localhost:8000/api';

// --- API Service Functions ---
// A collection of functions for interacting with the backend API.

/**
 * Fetches all surveys from the backend.
 * Assumes the backend has an endpoint: GET /api/surveys
 * @returns {Promise<Array>} A promise that resolves to an array of surveys.
 */
const fetchAllSurveys = async () => {
    try {
        const response = await fetch(`${API_URL}/surveys`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch surveys');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchAllSurveys:", error);
        throw error; // Re-throw to be caught by the component
    }
};

/**
 * Fetches a single survey by ID from the backend.
 * Assumes the backend has an endpoint: GET /api/surveys/:surveyId
 * @param {string} surveyId - The ID of the survey to fetch.
 * @returns {Promise<object>} A promise that resolves to the survey object.
 */
const fetchSurveyById = async (surveyId) => {
    try {
        const response = await fetch(`${API_URL}/surveys/${surveyId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch survey');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchSurveyById:", error);
        throw error;
    }
};

/**
 * Creates a new survey on the backend.
 * Assumes the backend has an endpoint: POST /api/surveys
 * @param {object} surveyData - The data for the new survey (e.g., { title, welcomeMessage, thankYouMessage, questions: [...] }).
 * @returns {Promise<object>} A promise that resolves to the newly created survey object.
 */
const createSurvey = async (surveyData) => {
    try {
        const response = await fetch(`${API_URL}/surveys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create survey');
        }
        return response.json();
    } catch (error) {
        console.error("Error in createSurvey:", error);
        throw error;
    }
};

/**
 * Fetches the results (responses) for a specific survey.
 * Assumes the backend has an endpoint: GET /api/surveys/:surveyId/responses
 * @param {string} surveyId - The ID of the survey.
 * @returns {Promise<Array>} A promise that resolves to an array of responses.
 */
const fetchSurveyResponses = async (surveyId) => {
    try {
        const response = await fetch(`${API_URL}/surveys/${surveyId}/responses`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch responses');
        }
        return response.json();
    } catch (error) {
        console.error("Error in fetchSurveyResponses:", error);
        throw error;
    }
};


// --- UI Components ---

// A simple component to display messages to the user (replaces browser alerts)
const MessageDisplay = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-lg border ${bgColor} z-50 flex items-center`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-lg font-bold">&times;</button>
        </div>
    );
};

const SurveyDashboard = ({ onSelectSurvey, onCreateNew }) => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSurveys = async () => {
            setLoading(true);
            setError(null);
            try {
                const surveysData = await fetchAllSurveys();
                setSurveys(surveysData);
            } catch (err) {
                setError(`Failed to load surveys: ${err.message}. Please ensure your backend is running.`);
                setSurveys([]); // Clear surveys on error
            } finally {
                setLoading(false);
            }
        };
        loadSurveys();
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">My Surveys</h1>
                    <p className="mt-2 text-lg text-gray-600">Your real-time surveys for WhatsApp.</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                    + Create New Survey
                </button>
            </header>
            <main className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                {loading && <p className="text-center py-12 text-gray-600">Loading surveys from your server...</p>}
                {error && <p className="text-red-500 text-center py-12">{error}</p>}
                {!loading && !error && surveys.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">You haven't created any surveys yet.</p>
                        <p className="text-gray-500 text-md mt-2">Click "Create New Survey" to get started!</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {!loading && !error && surveys.map(survey => (
                        <div key={survey._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full cursor-pointer" onClick={() => onSelectSurvey(survey)}>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{survey.title}</h3>
                            {/* Display the first question's text if available */}
                            <p className="text-gray-600 text-sm mb-4 flex-grow">
                                {survey.questions && survey.questions.length > 0
                                    ? survey.questions[0].questionText
                                    : 'No questions defined.'}
                            </p>
                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <span className="w-full text-center text-purple-600 font-bold py-2 px-4 rounded-lg transition-colors duration-200 block">
                                    View Results
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

// --- Dummy Flow Templates ---
const FLOW_TEMPLATES = [
    {
        name: "Blank Flow",
        title: "",
        welcomeMessage: "Welcome to our survey! Please answer a few questions.",
        flowQuestions: [
            {
                questionText: "What is your question?",
                questionType: "multiple_choice",
                options: [{ text: "Option 1" }, { text: "Option 2" }]
            }
        ],
        thankYouMessage: "Thank you for your participation!"
    },
    {
        name: "Simple Feedback Survey",
        title: "Customer Feedback",
        welcomeMessage: "Welcome to our quick feedback survey! Please answer a few questions.",
        flowQuestions: [
            {
                questionText: "How satisfied are you with our service today?",
                questionType: "multiple_choice",
                options: [{ text: "Very Satisfied" }, { text: "Satisfied" }, { text: "Neutral" }, { text: "Dissatisfied" }, { text: "Very Dissatisfied" }]
            },
            {
                questionText: "Would you recommend us to a friend?",
                questionType: "multiple_choice",
                options: [{ text: "Yes" }, { text: "No" }]
            }
        ],
        thankYouMessage: "Thank you for your valuable feedback! We appreciate your time."
    },
    {
        name: "Product Interest Survey",
        title: "New Product Interest",
        welcomeMessage: "Hi there! We're planning new products and would love your input.",
        flowQuestions: [
            {
                questionText: "Which new product feature interests you most?",
                questionType: "multiple_choice",
                options: [{ text: "Feature A" }, { text: "Feature B" }, { text: "Feature C" }]
            },
            {
                questionText: "Any other thoughts or suggestions for new products?",
                questionType: "open_ended",
                options: [] // Open-ended questions don't have predefined options
            }
        ],
        thankYouMessage: "Thanks for helping us shape our future products!"
    }
];

const CreateSurveyForm = ({ onSurveyCreated, onBack, onMessage }) => {
    const [title, setTitle] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [flowQuestions, setFlowQuestions] = useState([]);
    const [thankYouMessage, setThankYouMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Initialize with a blank template by default
    useEffect(() => {
        const blankTemplate = FLOW_TEMPLATES[0];
        setTitle(blankTemplate.title);
        setWelcomeMessage(blankTemplate.welcomeMessage);
        setFlowQuestions(blankTemplate.flowQuestions.map(q => ({ ...q, options: q.options.map(o => ({ ...o })) }))); // Deep copy options
        setThankYouMessage(blankTemplate.thankYouMessage);
    }, []);

    const handleApplyTemplate = (template) => {
        setTitle(template.title);
        setWelcomeMessage(template.welcomeMessage);
        // Deep copy questions and options to avoid modifying template directly
        setFlowQuestions(template.flowQuestions.map(q => ({ ...q, options: q.options.map(o => ({ ...o })) })));
        setThankYouMessage(template.thankYouMessage);
        onMessage(`Applied "${template.name}" template.`, 'info');
    };

    const handleAddQuestion = () => {
        setFlowQuestions([...flowQuestions, { questionText: '', questionType: 'multiple_choice', options: [{ text: '' }, { text: '' }] }]);
    };

    const handleRemoveQuestion = (index) => {
        setFlowQuestions(flowQuestions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...flowQuestions];
        newQuestions[index][field] = value;
        // If question type changes to open_ended, clear options
        if (field === 'questionType' && value === 'open_ended') {
            newQuestions[index].options = [];
        } else if (field === 'questionType' && value === 'multiple_choice' && newQuestions[index].options.length < 2) {
            // Ensure at least two options for multiple_choice
            newQuestions[index].options = [{ text: '' }, { text: '' }];
        }
        setFlowQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newQuestions = [...flowQuestions];
        newQuestions[qIndex].options[optIndex].text = value;
        setFlowQuestions(newQuestions);
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...flowQuestions];
        newQuestions[qIndex].options.push({ text: '' });
        setFlowQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex, optIndex) => {
        const newQuestions = [...flowQuestions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== optIndex);
        // Ensure at least two options remain for multiple_choice
        if (newQuestions[qIndex].questionType === 'multiple_choice' && newQuestions[qIndex].options.length < 2) {
            newQuestions[qIndex].options.push({ text: '' });
        }
        setFlowQuestions(newQuestions);
    };

    const handleCreateSurvey = async () => {
        if (!title.trim() || !welcomeMessage.trim() || !thankYouMessage.trim()) {
            onMessage("Please fill out the survey title, welcome message, and thank you message.", 'error');
            return;
        }
        if (flowQuestions.length === 0) {
            onMessage("Please add at least one question to your survey flow.", 'error');
            return;
        }
        const hasEmptyQuestionText = flowQuestions.some(q => !q.questionText.trim());
        if (hasEmptyQuestionText) {
            onMessage("All questions must have text.", 'error');
            return;
        }
        const hasInvalidOptions = flowQuestions.some(q =>
            q.questionType === 'multiple_choice' && q.options.some(opt => !opt.text.trim())
        );
        if (hasInvalidOptions) {
            onMessage("All multiple-choice options must have text.", 'error');
            return;
        }

        setIsCreating(true);
        try {
            const surveyData = {
                title: title.trim(),
                welcomeMessage: welcomeMessage.trim(),
                thankYouMessage: thankYouMessage.trim(),
                questions: flowQuestions.map(q => ({
                    questionText: q.questionText.trim(),
                    questionType: q.questionType,
                    // Only include options if it's a multiple_choice question
                    options: q.questionType === 'multiple_choice' ? q.options.filter(opt => opt.text.trim()).map(opt => ({ text: opt.text.trim() })) : []
                })),
            };
            const newSurvey = await createSurvey(surveyData);
            onMessage("Survey created successfully!", 'success');
            onSurveyCreated(newSurvey);
        } catch (e) {
            onMessage(`Failed to create survey: ${e.message}. Please check your backend.`, 'error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="text-purple-600 hover:text-purple-800 transition-colors duration-200 mb-6 font-semibold">&larr; Back to Dashboard</button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create a New WhatsApp Survey Flow</h2>

            {/* Template Selection */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Choose a Template</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {FLOW_TEMPLATES.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => handleApplyTemplate(template)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm border border-blue-300"
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg"/>
                </div>

                <div>
                    <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Welcome Message</label>
                    <textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg"></textarea>
                    <p className="text-xs text-gray-500 mt-1">This message will be sent to users when they start the survey.</p>
                </div>

                {/* Questions Section */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Survey Questions (Flow Steps)</h3>
                    {flowQuestions.length === 0 && <p className="text-gray-500 text-sm mb-4">No questions added yet. Click "Add Question" to start building your flow.</p>}
                    {flowQuestions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-700">Question {qIndex + 1}</h4>
                                <button onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                            </div>
                            <div className="mb-3">
                                <label htmlFor={`questionText-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                <input type="text" id={`questionText-${qIndex}`} value={question.questionText} onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor={`questionType-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                                <select id={`questionType-${qIndex}`} value={question.questionType} onChange={(e) => handleQuestionChange(qIndex, 'questionType', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg">
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="open_ended">Open Ended</option>
                                    {/* Add other types as needed: 'rating', 'nps', 'checkbox' */}
                                </select>
                            </div>

                            {question.questionType === 'multiple_choice' && (
                                <div className="ml-4 border-l pl-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                    {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center mt-2 space-x-2">
                                            <input type="text" value={option.text} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg"/>
                                            {question.options.length > 2 && (
                                                <button onClick={() => handleRemoveOption(qIndex, optIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddOption(qIndex)} className="mt-3 text-sm font-semibold text-purple-600 hover:text-purple-800">+ Add Option</button>
                                </div>
                            )}
                        </div>
                    ))}
                    <button onClick={handleAddQuestion} className="w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200 mt-4">
                        + Add Question to Flow
                    </button>
                </div>

                <div>
                    <label htmlFor="thankYouMessage" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Thank You Message</label>
                    <textarea id="thankYouMessage" value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-lg"></textarea>
                    <p className="text-xs text-gray-500 mt-1">This message will be sent to users after they complete the survey.</p>
                </div>
            </div>

            <div className="mt-8 border-t pt-6">
                <button onClick={handleCreateSurvey} disabled={isCreating} className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg disabled:bg-gray-400 rounded-lg">
                    {isCreating ? 'Creating Survey...' : 'Create Survey'}
                </button>
            </div>
        </div>
    );
};

const SurveyResults = ({ survey, onMessage }) => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResults = async () => {
            if (!survey?._id) return;
            setLoading(true);
            setError(null);
            try {
                const resultsData = await fetchSurveyResponses(survey._id);
                setResponses(resultsData);
            } catch (err) {
                setError(`Failed to fetch results: ${err.message}.`);
                setResponses([]);
            } finally {
                setLoading(false);
            }
        };
        loadResults();

        // Optional: Polling for live updates (e.g., every 5 seconds)
        const intervalId = setInterval(loadResults, 5000);
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [survey?._id]);

    if (loading) return <p className="mt-8 text-center text-gray-600">Loading live results...</p>;
    if (error) return <p className="mt-8 text-center text-red-500">{error}</p>;

    // For simplicity, this component currently focuses on displaying results for the first question
    // and assumes it's multiple_choice. A more robust implementation would iterate through all questions
    // and display results based on their type.
    const firstQuestion = survey.questions && survey.questions.length > 0 ? survey.questions[0] : null;

    if (!firstQuestion) {
        return <p className="mt-8 text-center text-gray-600">No questions defined for this survey to display results.</p>;
    }

    const totalResponses = responses.length;
    
    // Calculate vote counts for each option of the first question if it's multiple_choice
    let voteCounts = {};
    if (firstQuestion.questionType === 'multiple_choice') {
        firstQuestion.options.forEach(option => {
            voteCounts[option.text] = 0;
        });
        responses.forEach(response => {
            // NOTE: In a real app, `questionId` would be used to match answers to questions.
            // For this mock, we'll assume the first answer corresponds to the first question.
            const answer = response.answers && response.answers.length > 0 ? response.answers[0] : null;
            if (answer && firstQuestion.questionType === 'multiple_choice') {
                voteCounts[answer.answerText] = (voteCounts[answer.answerText] || 0) + 1;
            }
        });
    } else {
        // For open-ended questions, just list responses
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Live Results: {firstQuestion.questionText}</h3>
                <p className="text-gray-500 mb-6 text-sm">Total Responses: {totalResponses}</p>
                {totalResponses === 0 && <p className="text-center text-gray-500">No responses yet. Share your survey!</p>}
                <div className="space-y-2">
                    {responses.map((response, index) => {
                        // NOTE: In a real app, `questionId` would be used to match answers to questions.
                        // For this mock, we'll assume the first answer corresponds to the first question.
                        const answer = response.answers && response.answers.length > 0 ? response.answers[0] : null;
                        return (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700">{answer ? answer.answerText : 'No answer'}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Live Results: {firstQuestion.questionText}</h3>
            <p className="text-gray-500 mb-6 text-sm">Total Responses: {totalResponses}</p>
            {totalResponses === 0 && <p className="text-center text-gray-500">No responses yet. Share your survey!</p>}
            <div className="space-y-4">
                {firstQuestion.options.map((option, index) => {
                    const count = voteCounts[option.text] || 0;
                    const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                    return (
                        <div key={index}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{option.text}</span>
                                <span className="text-sm font-medium text-gray-500">{count} votes</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div className="bg-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SurveyDetailView = ({ survey, onBack, onMessage, onGoToAnalysis }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-purple-600 hover:text-purple-800 transition-colors duration-200 font-semibold">
                    &larr; Back to Dashboard
                </button>
                <button
                    onClick={() => onGoToAnalysis(survey._id)} // This will trigger a message in this mock setup
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
                >
                    View Full Analysis
                </button>
            </div>
            <div className="bg-green-100 p-6 rounded-xl border border-green-200 text-center">
                <h2 className="text-2xl font-bold text-green-800 mb-4">Your Survey is Live on WhatsApp!</h2>
                <p className="text-green-700 mb-2">To participate, users should send a WhatsApp message to your bot number.</p>
                <p className="text-green-700 font-semibold">Initial message to start any survey:</p>
                <div className="my-4 p-3 bg-gray-800 text-white font-mono rounded-lg inline-block text-lg">
                    START
                </div>
                <p className="text-green-700 mt-4">Once they type 'START', the bot will guide them through the survey questions.</p>
                <p className="text-green-700 text-sm mt-2">
                    (Note: For this initial setup, the bot will automatically pick the first available survey when a user types 'START'.
                    Future enhancements could allow users to select specific surveys.)
                </p>
                <p className="text-green-700 text-sm mt-4 font-semibold">
                    Survey ID: <span className="font-mono bg-green-200 px-2 py-1 rounded">{survey._id}</span>
                </p>
            </div>
            <SurveyResults survey={survey} onMessage={onMessage} />
        </div>
    );
};

// --- Placeholder for GreenBlobIcon ---
// In a real project, this would be imported from a separate file.
const GreenBlobIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
        <path d="M12 7a1 1 0 011 1v4a1 1 0 01-2 0V8a1 1 0 011-1z" fill="currentColor"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
);


// Custom hook to handle clicks outside the referenced component
const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const ClientTopBar = ({ user, accountDetails, handleLogout, unreadNotifications, onNotificationClick, onLogoClick }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Use the custom hook to close the dropdown when clicking outside
    useClickOutside(dropdownRef, () => setDropdownOpen(false));
    
    // Function to ensure dropdown closes on navigation
    const handleLinkClick = () => {
        setDropdownOpen(false);
    };

    return (
        <header className="bg-teal-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                {/* JijiPoll Logo and Title - Now a clickable element */}
                <button onClick={onLogoClick} className="flex items-center space-x-3 hover:text-teal-200 transition-colors duration-200 focus:outline-none">
                    <GreenBlobIcon className="w-10 h-10 text-white" />
                    <h1 className="text-2xl font-bold">JijiPoll</h1>
                </button>

                <nav className="flex items-center space-x-4 sm:space-x-6">
                    {/* Notification Bell Icon */}
                    <button
                        onClick={onNotificationClick}
                        className="relative text-white hover:text-teal-200 transition-colors duration-200 focus:outline-none"
                    >
                        <i className="fas fa-bell text-xl"></i>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-teal-600">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 text-white hover:text-teal-200 transition-colors duration-200 focus:outline-none"
                        >
                            <span className="hidden sm:inline">Demo User</span> {/* Mock user name */}
                            <i className="fas fa-user-circle text-2xl"></i>
                            <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200">
                                {/* User Info Header */}
                                <div className="p-4 bg-gray-50 border-b border-gray-200 text-gray-800">
                                    <p className="font-bold text-lg">Demo User</p> {/* Mock user name */}
                                    <p className="text-sm text-gray-500">demo.user@example.com</p> {/* Mock email */}
                                </div>

                                {/* Account Details Section */}
                                <div className="p-4 text-sm text-gray-700">
                                    <h4 className="font-semibold text-gray-800 mb-2">Account Details</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <span><strong>Plan:</strong></span> <span>Pro</span>
                                        <span><strong>Balance:</strong></span> <span>$150.00</span>
                                        <span><strong>Next Bill:</strong></span> <span>2025-09-01</span>
                                        <span><strong>Users:</strong></span> <span>3/5</span>
                                    </div>
                                </div>
                                
                                <hr />

                                {/* Navigation Links - Using simple buttons as we don't have react-router-dom */}
                                <nav className="py-2">
                                    {/* These would ideally be Links in a full React Router setup */}
                                    <button onClick={() => { handleLinkClick(); console.log('Navigating to Manage Users'); }} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                                        <i className="fas fa-users-cog w-5 mr-3 text-gray-500"></i> Manage Users
                                    </button>
                                    <button onClick={() => { handleLinkClick(); console.log('Navigating to Payment Details'); }} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                                        <i className="fas fa-credit-card w-5 mr-3 text-gray-500"></i> Payment Details
                                    </button>
                                    <button onClick={() => { handleLinkClick(); console.log('Navigating to Upgrade Plan'); }} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                                        <i className="fas fa-arrow-alt-circle-up w-5 mr-3 text-gray-500"></i> Upgrade Plan
                                    </button>
                                    <button onClick={() => { handleLinkClick(); console.log('Navigating to Help & Support'); }} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                                        <i className="fas fa-question-circle w-5 mr-3 text-gray-500"></i> Help & Support
                                    </button>
                                </nav>
                                
                                <hr />

                                {/* Logout Button */}
                                <div className="p-2">
                                    <button
                                        onClick={() => { handleLogout(); setDropdownOpen(false); }}
                                        className="w-full flex items-center text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                        <i className="fas fa-sign-out-alt w-5 mr-3"></i> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};


// Main App Component to manage views
const App = () => {
    // State to manage the current view: 'dashboard', 'create', 'detail'
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    const handleMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    };

    const handleSelectSurvey = (survey) => {
        setSelectedSurvey(survey);
        setCurrentView('detail');
    };

    const handleCreateNew = () => {
        setCurrentView('create');
    };

    const handleSurveyCreated = (newSurvey) => {
        setSelectedSurvey(newSurvey);
        setCurrentView('detail'); // Go to detail view of the newly created survey
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setSelectedSurvey(null); // Clear selected survey when going back to dashboard
    };

    // Mock functions for ClientTopBar
    const mockUser = { username: 'Demo User', email: 'demo.user@example.com' };
    const mockAccountDetails = { plan: 'Pro', balance: 150.00, nextBillingDate: '2025-09-01', currentUsers: 3, allowedUsers: 5 };
    const mockHandleLogout = () => handleMessage('Mock Logout Clicked', 'info');
    const mockUnreadNotifications = 2;
    const mockOnNotificationClick = () => handleMessage('Mock Notification Bell Clicked', 'info');
    const mockOnLogoClick = () => handleBackToDashboard(); // Logo click goes to dashboard

    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            {/* Tailwind CSS CDN */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Font Awesome CDN for icons */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" xintegrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossOrigin="anonymous" referrerPolicy="no-referrer" />

            <ClientTopBar
                user={mockUser}
                accountDetails={mockAccountDetails}
                handleLogout={mockHandleLogout}
                unreadNotifications={mockUnreadNotifications}
                onNotificationClick={mockOnNotificationClick}
                onLogoClick={mockOnLogoClick}
            />

            <MessageDisplay message={message} type={messageType} onClose={() => setMessage('')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentView === 'dashboard' && (
                    <SurveyDashboard
                        onSelectSurvey={handleSelectSurvey}
                        onCreateNew={handleCreateNew}
                    />
                )}

                {currentView === 'create' && (
                    <CreateSurveyForm
                        onSurveyCreated={handleSurveyCreated}
                        onBack={handleBackToDashboard}
                        onMessage={handleMessage}
                    />
                )}

                {currentView === 'detail' && selectedSurvey && (
                    <SurveyDetailView
                        survey={selectedSurvey}
                        onBack={handleBackToDashboard}
                        onMessage={handleMessage}
                        onGoToAnalysis={(surveyId) => handleMessage(`Navigating to full analysis for Survey ID: ${surveyId}`, 'info')}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
