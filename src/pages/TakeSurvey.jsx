import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api'; // Your Axios instance
import MessagePopup from '../components/MessagePopup'; // Import the MessagePopup component

// Import question type components
import MultipleChoice from '../components/QuestionTypes/MultipleChoice';
import OpenEnded from '../components/QuestionTypes/OpenEnded';
import StarRating from '../components/StarRating';
import LikertScale from '../components/QuestionTypes/LikertScale';
import Ranking from '../components/QuestionTypes/Ranking';
import Slider from '../components/QuestionTypes/Slider';
import NPS from '../components/QuestionTypes/NPS';
import FileUpload from '../components/QuestionTypes/FileUpload';
import ImageComparison from '../components/QuestionTypes/ImageComparison';
import Conversational from '../components/QuestionTypes/Conversational';

const TakeSurvey = () => {
    const { id } = useParams(); // 'id' is the survey ID
    const navigate = useNavigate();

    const [survey, setSurvey] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Stores answers: { questionId: value }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // FIXED THIS LINE
    const [message, setMessage] = useState(null); // For MessagePopup
    const [geolocationRequired, setGeolocationRequired] = useState(false);
    const [geolocationGranted, setGeolocationGranted] = useState(false);
    const [geolocationError, setGeolocationError] = useState(null);
    const [currentGeolocation, setCurrentGeolocation] = useState(null); // Stores actual geolocation data
    const [isSurveyCompleted, setIsSurveyCompleted] = useState(false); // New state to track if survey is already completed

    // Effect to fetch survey data
    useEffect(() => {
        console.log('TakeSurvey component rendered.');
        console.log('  - surveyId from useParams (now "id"):', id);

        const fetchSurvey = async () => {
            setLoading(true);
            setError(null);
            try {
                // Corrected API endpoint: Removed '/surveys'
                console.log('Attempting to fetch survey via API instance for:', `/respondent/${id}`);
                const res = await API.get(`/respondent/${id}`);
                setSurvey(res.data);

                // Check if the user has already completed this survey
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser && storedUser.completedSurveys && storedUser.completedSurveys.includes(id)) {
                    setIsSurveyCompleted(true);
                    setMessage({ text: 'You have already completed this survey.', type: 'info' });
                }

                // Initialize answers state based on survey questions
                const initialAnswers = {};
                res.data.questions.forEach(q => {
                    // Initialize based on question type
                    if (q.questionType === 'multiple-choice' || q.questionType === 'image-comparison') {
                        initialAnswers[q._id] = null; // No option selected initially
                    } else if (q.questionType === 'rating' || q.questionType === 'likert-scale' || q.questionType === 'nps' || q.questionType === 'slider') {
                        initialAnswers[q._id] = null; // Numeric value
                    } else if (q.questionType === 'ranking') {
                        initialAnswers[q._id] = []; // Array of ranked item IDs/texts
                    } else if (q.questionType === 'file-upload') {
                        initialAnswers[q._id] = null; // File URL or object
                    } else { // open-ended, conversational
                        initialAnswers[q._id] = ''; // Text input
                    }
                });
                setAnswers(initialAnswers);

            } catch (err) {
                console.error('Error fetching survey:', err);
                console.error('Error response data:', err.response?.data);
                console.error('Error response status:', err.response?.status);
                setError(err.response?.data?.message || 'Failed to load survey.');
            } finally {
                console.log('Finished fetching attempt. Loading state set to false.');
                setLoading(false);
            }
        };

        if (id) {
            console.log('useEffect triggered.');
            console.log('  - Inside useEffect, current surveyId (now "id"):', id);
            fetchSurvey();
        }
    }, [id]);

    // Effect to check and request geolocation if required by the current question
    useEffect(() => {
        if (!survey || !survey.questions || survey.questions.length === 0) return;

        const question = survey.questions[currentQuestionIndex];
        if (question && question.requiresGeolocation) {
            setGeolocationRequired(true);
            if (navigator.geolocation) {
                navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                    if (result.state === 'granted') {
                        setGeolocationGranted(true);
                        setGeolocationError(null);
                        // Get position immediately if granted
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                setCurrentGeolocation({
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                    accuracy: position.coords.accuracy,
                                    timestamp: new Date(position.timestamp)
                                });
                                setMessage({ text: 'Location access granted!', type: 'success' });
                            },
                            (err) => {
                                setGeolocationGranted(false);
                                setGeolocationError(`Location access denied: ${err.message}. Please enable it in your browser settings.`);
                                setMessage({ text: `Location access denied: ${err.message}.`, type: 'error' });
                            },
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                        );
                    } else if (result.state === 'prompt') {
                        setGeolocationGranted(false);
                        setGeolocationError('Please enable location services for this question.');
                    } else if (result.state === 'denied') {
                        setGeolocationGranted(false);
                        setGeolocationError('Location access denied. Please enable it in your browser settings to proceed.');
                    }
                }).catch(err => {
                    console.error("Error querying geolocation permission:", err);
                    setGeolocationGranted(false);
                    setGeolocationError('Could not query geolocation permission. Please ensure your browser supports and allows geolocation.');
                });
            } else {
                setGeolocationRequired(false); // Browser doesn't support
                setGeolocationError('Geolocation is not supported by your browser.');
            }
        } else {
            setGeolocationRequired(false);
            setGeolocationGranted(true); // Not required, so consider it "granted"
            setGeolocationError(null);
            setCurrentGeolocation(null); // Clear geolocation if not required
        }
    }, [survey, currentQuestionIndex]);


    const handleAnswerChange = useCallback((questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value
        }));
    }, []);

    const handleNext = () => {
        const currentQuestion = survey.questions[currentQuestionIndex];

        // Validate current question's answer
        const answer = answers[currentQuestion._id];

        // Add console logs to inspect the answer before validation
        console.log(`Validating question ${currentQuestion._id} (${currentQuestion.questionType}). Answer:`, answer);
        console.log(`Is answer empty or whitespace (pre-trim check)?`, !answer || (typeof answer === 'string' && answer.trim() === ''));


        // Check for empty answers based on question type
        let isValid = true;
        if (currentQuestion.questionType === 'open-ended' || currentQuestion.questionType === 'conversational') {
            // Ensure answer is treated as a string for trimming
            const trimmedAnswer = typeof answer === 'string' ? answer.trim() : '';
            if (!trimmedAnswer) { // Checks for empty string after trimming
                isValid = false;
                setMessage({ text: 'Please provide an answer before proceeding.', type: 'error' });
            }
        } else if (currentQuestion.questionType === 'multiple-choice' || currentQuestion.questionType === 'image-comparison') {
            if (answer === null) { // For radio buttons, null means nothing selected
                isValid = false;
                setMessage({ text: 'Please select an option before proceeding.', type: 'error' });
            }
        } else if (currentQuestion.questionType === 'rating' || currentQuestion.questionType === 'likert-scale' || currentQuestion.questionType === 'nps' || currentQuestion.questionType === 'slider') {
            if (answer === null || isNaN(answer)) {
                isValid = false;
                setMessage({ text: 'Please provide a rating/value before proceeding.', type: 'error' });
            }
        } else if (currentQuestion.questionType === 'ranking') {
            if (!answer || answer.length !== currentQuestion.rankingItems.length || new Set(answer).size !== currentQuestion.rankingItems.length) {
                isValid = false;
                setMessage({ text: 'Please rank all items before proceeding.', type: 'error' });
            }
        } else if (currentQuestion.questionType === 'file-upload') {
            if (!answer) { // Check if a file has been "uploaded" (its URL stored)
                isValid = false;
                setMessage({ text: 'Please upload a file before proceeding.', type: 'error' });
            }
        }


        if (!isValid) {
            // MessagePopup will handle displaying the error
            return;
        }

        // Handle geolocation requirement before moving to next question
        if (currentQuestion.requiresGeolocation && !geolocationGranted) {
            setMessage({ text: geolocationError || 'Location access is required for this question. Please enable it.', type: 'error' });
            return;
        }

        setMessage(null); // Clear any previous messages
        if (currentQuestionIndex < survey.questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            handleSubmitSurvey();
        }
    };

    const handlePrevious = () => {
        setMessage(null); // Clear any previous messages
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    };

    const handleSubmitSurvey = async () => {
        setLoading(true);
        setError(null);
        try {
            const finalAnswers = [];
            for (const question of survey.questions) {
                const answerValue = answers[question._id];
                let formattedAnswer = {
                    questionId: question._id,
                    questionType: question.questionType,
                    // Initialize all possible answer fields to null/undefined
                    selectedOptionId: null,
                    selectedOptionText: null,
                    selectedOptionImageUrl: null,
                    rating: null,
                    textResponse: null,
                    participatedInConversation: false,
                    likertResponse: null,
                    rankedOrder: null,
                    sliderValue: null,
                    npsScore: null,
                    fileUrl: null,
                    geolocation: null // Initialize geolocation
                };

                switch (question.questionType) {
                    case 'multiple-choice':
                    case 'image-comparison':
                        if (answerValue !== null) {
                            const selectedOption = question.options.find(opt => opt._id.toString() === answerValue.toString());
                            formattedAnswer.selectedOptionId = answerValue;
                            formattedAnswer.selectedOptionText = selectedOption ? selectedOption.text : null;
                            if (question.questionType === 'image-comparison') {
                                formattedAnswer.selectedOptionImageUrl = selectedOption ? selectedOption.imageUrl : null;
                            }
                        }
                        break;
                    case 'rating':
                    case 'likert-scale':
                    case 'slider':
                    case 'nps':
                        if (answerValue !== null && !isNaN(answerValue)) {
                            if (question.questionType === 'rating') formattedAnswer.rating = answerValue;
                            if (question.questionType === 'likert-scale') formattedAnswer.likertResponse = answerValue;
                            if (question.questionType === 'slider') formattedAnswer.sliderValue = answerValue;
                            if (question.questionType === 'nps') formattedAnswer.npsScore = answerValue;
                        }
                        break;
                    case 'open-ended':
                    case 'conversational':
                        // Ensure textResponse is always a string, even if empty
                        formattedAnswer.textResponse = typeof answerValue === 'string' ? answerValue : '';
                        if (question.questionType === 'conversational') {
                            formattedAnswer.participatedInConversation = formattedAnswer.textResponse.trim() !== ''; // Assuming any non-empty text means participation
                        }
                        break;
                    case 'ranking':
                        if (Array.isArray(answerValue)) {
                            formattedAnswer.rankedOrder = answerValue;
                        }
                        break;
                    case 'file-upload':
                        // Assuming answerValue for file-upload is the URL returned by the upload component
                        formattedAnswer.fileUrl = answerValue;
                        break;
                    default:
                        break;
                }

                // Add geolocation if required for this question and available
                if (question.requiresGeolocation && currentGeolocation) {
                    formattedAnswer.geolocation = currentGeolocation;
                }

                finalAnswers.push(formattedAnswer);
            }

            // --- IMPORTANT DEBUGGING STEP ---
            console.log("Submitting final answers payload:", { answers: finalAnswers });
            // --- END DEBUGGING STEP ---

            const res = await API.post(`/respondent/${id}/submit`, { answers: finalAnswers });
            setMessage({ text: res.data.message || 'Survey submitted successfully!', type: 'success' });

            // Update local storage to mark this survey as completed for the user
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                const updatedCompletedSurveys = [...(storedUser.completedSurveys || []), id];
                // Ensure unique survey IDs
                storedUser.completedSurveys = [...new Set(updatedCompletedSurveys)];
                storedUser.points = res.data.points; // Update points from response
                localStorage.setItem('user', JSON.stringify(storedUser));
            }
            setIsSurveyCompleted(true); // Mark as completed in state

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                setMessage(null); // Clear the popup
                navigate('/respondent/dashboard');
            }, 3000); // 3-second delay

        } catch (err) {
            console.error('Error submitting survey:', err);
            setMessage({ text: err.response?.data?.message || 'Failed to submit survey.', type: 'error' });
            setError(err.response?.data?.message || 'Failed to submit survey.');
        } finally {
            setLoading(false);
        }
    };

    const requestGeolocationPermission = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeolocationGranted(true);
                    setGeolocationError(null);
                    setCurrentGeolocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp)
                    });
                    setMessage({ text: 'Location access granted!', type: 'success' });
                },
                (err) => {
                    setGeolocationGranted(false);
                    setGeolocationError(`Location access denied: ${err.message}. Please enable it in your browser settings.`);
                    setMessage({ text: `Location access denied: ${err.message}.`, type: 'error' });
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setGeolocationError('Geolocation is not supported by your browser.');
            setMessage({ text: 'Geolocation not supported by your browser.', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-xl text-gray-700">Loading survey...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                    <button onClick={() => navigate('/respondent/dashboard')} className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!survey || survey.questions.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
                <div className="text-xl text-gray-700">No questions found for this survey.</div>
                <button onClick={() => navigate('/respondent/dashboard')} className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Back to Dashboard
                </button>
            </div>
        );
    }

//Quizscoring
    const calculateScore = (responses, questions) => {
  let score = 0;
  questions.forEach((q, i) => {
    if (q.questionType === 'multiple-choice' || q.questionType === 'image-comparison') {
      const selectedOptionText = responses[i]?.selectedOption;
      if (selectedOptionText && q.options.find(o => o.text === selectedOptionText && o.isCorrect)) {
        score += 100 / questions.length;
      }
    } else if (q.questionType === 'open-ended' || q.questionType === 'conversational') {
      if (q.correctAnswer && responses[i]?.textResponse.toLowerCase() === q.correctAnswer.toLowerCase()) {
        score += 100 / questions.length;
      }
    } else if (q.questionType === 'rating' || q.questionType === 'slider') {
      if (q.correctAnswer && responses[i]?.rating === q.correctAnswer) {
        score += 100 / questions.length;
      }
    }
  });
  return score;
};
const getResultMessage = (score, results) => {
  return results.find(r => score >= r.minScore)?.message || 'No result available.';
};


    const currentQuestion = survey.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

    // Determine if the "Next" button should be disabled for geolocation
    const isNextDisabledByGeolocation = geolocationRequired && !geolocationGranted;

    const renderQuestionComponent = (question) => {
        const commonProps = {
            question: question,
            isBuilder: false, // This is the respondent view
            answer: answers[question._id],
            onAnswerChange: (value) => handleAnswerChange(question._id, value)
        };

        switch (question.questionType) {
            case 'multiple-choice':
                return <MultipleChoice {...commonProps} selectedOptionId={answers[question._id]} onSelectOption={(optionId) => handleAnswerChange(question._id, optionId)} />;
            case 'open-ended':
                return <OpenEnded {...commonProps} />;
            case 'rating':
                return <StarRating {...commonProps} />;
            case 'likert-scale':
                return <LikertScale {...commonProps} />;
            case 'ranking':
                return <Ranking {...commonProps} />;
            case 'slider':
                return <Slider {...commonProps} />;
            case 'nps':
                return <NPS {...commonProps} />;
            case 'file-upload':
                // Assuming FileUpload component will handle the upload and pass the URL to onAnswerChange
                return <FileUpload {...commonProps} />;
            case 'image-comparison':
                return <ImageComparison {...commonProps} selectedOptionId={answers[question._id]} onSelectOption={(optionId) => handleAnswerChange(question._id, optionId)} />;
            case 'conversational':
                return <Conversational {...commonProps} />;
            default:
                return <p className="text-red-500">Unknown question type: {question.questionType}</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center justify-center">
            {message && (
                <MessagePopup
                    message={message.text}
                    type={message.type}
                    onClose={() => setMessage(null)}
                    duration={3000} // Messages disappear after 3 seconds
                />
            )}

            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">{survey.title}</h1>
                <p className="text-gray-600 text-center mb-6">{survey.description}</p>

                {isSurveyCompleted && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-center" role="alert">
                        <strong className="font-bold">Survey Completed!</strong>
                        <span className="block sm:inline ml-2">You have already submitted this survey.</span>
                    </div>
                )}

                <div className="mb-6 border-t border-b border-gray-200 py-4">
                    <p className="text-lg font-semibold text-gray-700 mb-3">
                        Question {currentQuestionIndex + 1} of {survey.questions.length}
                    </p>
                    {renderQuestionComponent(currentQuestion)}

                    {geolocationRequired && !geolocationGranted && (
                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
                            <p className="font-semibold mb-2">Location Required:</p>
                            <p className="text-sm">{geolocationError || 'This question requires your GPS location. Please enable it.'}</p>
                            <button
                                onClick={requestGeolocationPermission}
                                className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                            >
                                Enable Location
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0 || loading || isSurveyCompleted}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading || isNextDisabledByGeolocation || isSurveyCompleted}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLastQuestion ? 'Submit Survey' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeSurvey;
