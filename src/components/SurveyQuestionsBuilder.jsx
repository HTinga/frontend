import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Import Question Type Components
import MultipleChoice from './QuestionTypes/MultipleChoice';
import OpenEnded from './QuestionTypes/OpenEnded';
import StarRating from './StarRating'; // Assuming this is your 1-5 star rating component
import Conversational from './QuestionTypes/Conversational';

/**
 * SurveyQuestionsBuilder Component
 * Manages the creation, editing, reordering, and deletion of survey questions.
 * It also handles specific logic for different question types, including GPRS requirement.
 *
 * @param {object} props - Component props
 * @param {Array<object>} props.questions - Array of question objects
 * @param {function} props.setQuestions - State setter for questions array
 * @param {function} props.setMessage - Function to display messages (e.g., for image upload)
 * @param {object} props.uploadingImageQuestionId - State for tracking image upload progress (question ID)
 * @param {object} props.uploadingImageOptionIndex - State for tracking image upload progress (option index)
 * @param {function} props.setUploadingImageQuestionId - Setter for uploadingImageQuestionId
 * @param {function} props.setUploadingImageOptionIndex - Setter for uploadingImageOptionIndex
 * @param {object} props.API - Axios instance for API calls (e.g., image upload)
 */
const SurveyQuestionsBuilder = ({
    questions,
    setQuestions,
    setMessage,
    uploadingImageQuestionId,
    uploadingImageOptionIndex,
    setUploadingImageQuestionId,
    setUploadingImageOptionIndex,
    API
}) => {
    const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false);

    // Handler to update a specific field of a question
    const updateQuestion = (qId, field, value) => {
        setQuestions(questions.map(q =>
            q._id === qId ? { ...q, [field]: value } : q
        ));
    };

    // Handler to update an option within a question (e.g., for Multiple Choice, Image Comparison)
    const updateOption = (qId, optionIndex, field, value) => {
        setQuestions(questions.map(q => {
            if (q._id === qId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    // Adds a new text option to a question (e.g., for Multiple Choice)
    const addOptionToQuestion = (qId) => {
        setQuestions(questions.map(q =>
            q._id === qId ? { ...q, options: [...(q.options || []), { text: '' }] } : q
        ));
    };

    // Adds a new ranking item to a ranking question
    const addRankingItemToQuestion = (qId) => {
        setQuestions(questions.map(q =>
            q._id === qId ? { ...q, rankingItems: [...(q.rankingItems || []), { text: '' }] } : q
        ));
    };

    // Removes a ranking item from a ranking question
    const removeRankingItemFromQuestion = (qId, itemIndex) => {
        setQuestions(questions.map(q =>
            q._id === qId ? { ...q, rankingItems: q.rankingItems.filter((_, i) => i !== itemIndex) } : q
        ));
    };

    // Adds a new image option to an image comparison question
    const addImageOptionToQuestion = (qId) => {
        setQuestions(questions.map(q =>
            q._id === qId ? { ...q, options: [...(q.options || []), { imageUrl: '', text: '' }] } : q
        ));
    };

    // Removes an option from a question
    const removeOptionFromQuestion = (qId, optionIndex) => {
        setQuestions(questions.filter(q => q._id === qId)[0] ?
            questions.map(q =>
                q._id === qId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q
            ) : questions
        );
    };

    // Handles image upload for image-based questions/options
    const handleImageUpload = async (e, questionId, optionIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImageQuestionId(questionId);
        setUploadingImageOptionIndex(optionIndex);
        setMessage('');

        const formData = new FormData();
        formData.append('image', file); // 'image' must match the field name in multer setup on backend

        try {
            const res = await API.post('/api/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const imageUrl = res.data.imageUrl;
            console.log('Uploaded image URL:', imageUrl);

            updateOption(questionId, optionIndex, 'imageUrl', imageUrl);
            setMessage('Image uploaded successfully!');

        } catch (err) {
            console.error('Error uploading image:', err);
            setMessage(err.response?.data?.message || 'Failed to upload image. Please try again.');
        } finally {
            setUploadingImageQuestionId(null);
            setUploadingImageOptionIndex(null);
        }
    };

    // Handler for general file upload (for 'file-upload' question type)
    const handleFileUpload = async (e, questionId) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessage(''); // Clear previous messages
        // You might want a loading state specific to file uploads if multiple can happen
        // For simplicity, we'll just show a generic message or rely on backend response.

        const formData = new FormData();
        formData.append('file', file); // 'file' should match your backend's expected field name

        try {
            // Assuming a generic file upload endpoint
            const res = await API.post('/api/upload/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const fileUrl = res.data.fileUrl; // Backend should return the URL of the uploaded file
            console.log('Uploaded file URL:', fileUrl);
            // In a real scenario, you might want to store this URL in the question object
            // For now, we're just demonstrating the upload process.
            setMessage(`File uploaded successfully: ${file.name}`); // Replaced alert with setMessage
        } catch (err) {
            console.error('Error uploading file:', err);
            setMessage(err.response?.data?.message || 'Failed to upload file. Please try again.');
        }
    };

    // Adds a new question of a specified type
    const addQuestion = (type) => {
        let newQuestion = {
            _id: uuidv4(),
            questionText: '',
            questionType: type,
            requiresGeolocation: false, // Default GPRS requirement
        };

        switch (type) {
            case 'multiple-choice':
                newQuestion.options = [{ text: '' }, { text: '' }];
                newQuestion.randomizeOptions = false; // For answer choice randomization
                break;
            case 'image-comparison':
                newQuestion.options = [{ imageUrl: '', text: '' }, { imageUrl: '', text: '' }];
                break;
            case 'rating':
                newQuestion.minRating = 1;
                newQuestion.maxRating = 5;
                break;
            case 'likert-scale':
                newQuestion.minRating = 1;
                newQuestion.maxRating = 5; // Default to 5 points
                newQuestion.minLabel = 'Strongly Disagree';
                newQuestion.maxLabel = 'Strongly Agree';
                newQuestion.scaleLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
                break;
            case 'ranking':
                newQuestion.rankingItems = [{ text: '' }, { text: '' }];
                break;
            case 'slider':
                newQuestion.sliderMin = 0;
                newQuestion.sliderMax = 100;
                newQuestion.sliderStep = 1;
                newQuestion.sliderDefault = 50;
                newQuestion.minLabel = 'Low';
                newQuestion.maxLabel = 'High';
                break;
            case 'nps': // Net Promoter Score
                newQuestion.minRating = 0;
                newQuestion.maxRating = 10;
                newQuestion.minLabel = 'Not at all likely';
                newQuestion.maxLabel = 'Extremely likely';
                break;
            case 'file-upload':
                newQuestion.allowedFileTypes = ''; // e.g., ".pdf,.jpg,.mp4"
                break;
            case 'conversational':
                newQuestion.conversationalTopic = '';
                break;
            default:
                break;
        }

        setQuestions([...questions, newQuestion]);
        setShowQuestionTypeSelector(false);
    };

    // Removes a question from the survey
    const removeQuestion = (qId) => {
        setQuestions(questions.filter(q => q._id !== qId));
    };

    // Handles drag and drop reordering of questions
    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedQuestions = Array.from(questions);
        const [removed] = reorderedQuestions.splice(result.source.index, 1);
        reorderedQuestions.splice(result.destination.index, 0, removed);

        setQuestions(reorderedQuestions);
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 border-b pb-2">Survey Questions</h2>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {questions.map((q, index) => (
                                <Draggable key={q._id} draggableId={q._id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 relative border-l-4 border-blue-500"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-semibold text-gray-700">Question {index + 1} ({q.questionType})</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                                                        <i className="fas fa-grip-vertical"></i>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(q._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* GPRS Requirement Checkbox */}
                                            <div className="mb-4 flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`gprs-${q._id}`}
                                                    checked={q.requiresGeolocation || false}
                                                    onChange={(e) => updateQuestion(q._id, 'requiresGeolocation', e.target.checked)}
                                                    className="form-checkbox h-5 w-5 text-purple-600 rounded"
                                                />
                                                <label htmlFor={`gprs-${q._id}`} className="ml-2 text-gray-700 text-sm font-bold">
                                                    This question requires GPS Location
                                                </label>
                                                <span className="ml-2 text-xs text-gray-500">(Respondent must enable GPRS to answer)</span>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-sm font-bold mb-2">Question Text:</label>
                                                <input
                                                    type="text"
                                                    value={q.questionText}
                                                    onChange={(e) => updateQuestion(q._id, 'questionText', e.target.value)}
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                    required
                                                />
                                            </div>

                                            {/* Conditional: Answer Choice Randomization for Multiple Choice */}
                                            {q.questionType === 'multiple-choice' && (
                                                <div className="mb-4 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`randomize-options-${q._id}`}
                                                        checked={q.randomizeOptions || false}
                                                        onChange={(e) => updateQuestion(q._id, 'randomizeOptions', e.target.checked)}
                                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                                    />
                                                    <label htmlFor={`randomize-options-${q._id}`} className="ml-2 text-gray-700 text-sm font-bold">
                                                        Randomize Answer Choices
                                                    </label>
                                                </div>
                                            )}

                                            {/* Render specific question type components */}
                                            {q.questionType === 'multiple-choice' && (
                                                <MultipleChoice
                                                    question={q}
                                                    updateOption={(optionIndex, field, value) => updateOption(q._id, optionIndex, field, value)}
                                                    addOption={() => addOptionToQuestion(q._id)}
                                                    removeOption={(optionIndex) => removeOptionFromQuestion(q._id, optionIndex)}
                                                    isBuilder={true}
                                                />
                                            )}
                                            {q.questionType === 'open-ended' && (
                                                <OpenEnded
                                                    question={q}
                                                    updateQuestion={(field, value) => updateQuestion(q._id, field, value)}
                                                    isBuilder={true}
                                                />
                                            )}
                                            {q.questionType === 'rating' && (
                                                <StarRating // Assuming StarRating component handles min/maxRating
                                                    question={q}
                                                    updateQuestion={(field, value) => updateQuestion(q._id, field, value)}
                                                    isBuilder={true}
                                                />
                                            )}
                                            {q.questionType === 'likert-scale' && (
                                                <div className="mb-4 p-4 border rounded bg-white">
                                                    <h4 className="text-lg font-semibold mb-2">Likert Scale Options</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Rating Value (e.g., 1):</label>
                                                            <input
                                                                type="number"
                                                                value={q.minRating}
                                                                onChange={(e) => updateQuestion(q._id, 'minRating', parseInt(e.target.value))}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Rating Value (e.g., 5):</label>
                                                            <input
                                                                type="number"
                                                                value={q.maxRating}
                                                                onChange={(e) => updateQuestion(q._id, 'maxRating', parseInt(e.target.value))}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Label (e.g., Strongly Disagree):</label>
                                                            <input
                                                                type="text"
                                                                value={q.minLabel}
                                                                onChange={(e) => updateQuestion(q._id, 'minLabel', e.target.value)}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Label (e.g., Strongly Agree):</label>
                                                            <input
                                                                type="text"
                                                                value={q.maxLabel}
                                                                onChange={(e) => updateQuestion(q._id, 'maxLabel', e.target.value)}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Scale Labels (comma-separated):</label>
                                                        <input
                                                            type="text"
                                                            value={q.scaleLabels ? q.scaleLabels.join(', ') : ''}
                                                            onChange={(e) => updateQuestion(q._id, 'scaleLabels', e.target.value.split(',').map(s => s.trim()))}
                                                            placeholder="e.g., Very Poor, Poor, Average, Good, Very Good"
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {q.questionType === 'ranking' && (
                                                <div className="mb-4 p-4 border rounded bg-white">
                                                    <h4 className="text-lg font-semibold mb-2">Ranking Items</h4>
                                                    {q.rankingItems.map((item, itemIndex) => (
                                                        <div key={itemIndex} className="flex items-center space-x-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={item.text}
                                                                onChange={(e) => {
                                                                    const newItems = [...q.rankingItems];
                                                                    newItems[itemIndex] = { text: e.target.value };
                                                                    updateQuestion(q._id, 'rankingItems', newItems);
                                                                }}
                                                                placeholder={`Item ${itemIndex + 1}`}
                                                                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 flex-grow"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRankingItemFromQuestion(q._id, itemIndex)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <i className="fas fa-times-circle"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addRankingItemToQuestion(q._id)}
                                                        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                                                    >
                                                        Add Ranking Item
                                                    </button>
                                                </div>
                                            )}
                                            {q.questionType === 'slider' && (
                                                <div className="mb-4 p-4 border rounded bg-white">
                                                    <h4 className="text-lg font-semibold mb-2">Slider Options</h4>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Value:</label>
                                                            <input
                                                                type="number"
                                                                value={q.sliderMin}
                                                                onChange={(e) => updateQuestion(q._id, 'sliderMin', parseFloat(e.target.value))}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Value:</label>
                                                            <input
                                                                type="number"
                                                                value={q.sliderMax}
                                                                onChange={(e) => updateQuestion(q._id, 'sliderMax', parseFloat(e.target.value))}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Step:</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={q.sliderStep}
                                                                onChange={(e) => updateQuestion(q._id, 'sliderStep', parseFloat(e.target.value))}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Default Value:</label>
                                                            <input
                                                                type="number"
                                                                value={q.sliderDefault}
                                                                onChange={(e) => updateQuestion(q._id, 'sliderDefault', parseFloat(e.target.value))}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Label:</label>
                                                            <input
                                                                type="text"
                                                                value={q.minLabel}
                                                                onChange={(e) => updateQuestion(q._id, 'minLabel', e.target.value)}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Label:</label>
                                                            <input
                                                                type="text"
                                                                value={q.maxLabel}
                                                                onChange={(e) => updateQuestion(q._id, 'maxLabel', e.target.value)}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {q.questionType === 'nps' && (
                                                <div className="mb-4 p-4 border rounded bg-white">
                                                    <h4 className="text-lg font-semibold mb-2">Net Promoter Score (NPS)</h4>
                                                    <p className="text-gray-600 text-sm">
                                                        This question uses a standard 0-10 scale.
                                                        The question text should typically be: "How likely are you to recommend [Company/Product/Service] to a friend or colleague?"
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Label (0):</label>
                                                            <input
                                                                type="text"
                                                                value={q.minLabel || 'Not at all likely'}
                                                                onChange={(e) => updateQuestion(q._id, 'minLabel', e.target.value)}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Label (10):</label>
                                                            <input
                                                                type="text"
                                                                value={q.maxLabel || 'Extremely likely'}
                                                                onChange={(e) => updateQuestion(q._id, 'maxLabel', e.target.value)}
                                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {q.questionType === 'file-upload' && (
                                                <div className="mb-4 p-4 border rounded bg-white">
                                                    <h4 className="text-lg font-semibold mb-2">File Upload Options</h4>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        This question allows respondents to upload a file.
                                                        You can specify allowed file types if needed (e.g., .pdf, .docx, .jpg).
                                                    </p>
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Allowed File Types (e.g., .pdf, .jpg, .mp4):</label>
                                                        <input
                                                            type="text"
                                                            value={q.allowedFileTypes || ''}
                                                            onChange={(e) => updateQuestion(q._id, 'allowedFileTypes', e.target.value)}
                                                            placeholder=".pdf, .docx, .xlsx, .jpg, .png, .mp4"
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {q.questionType === 'image-comparison' && (
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Image Options:</label>
                                                    {q.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center space-x-2 mb-2 p-2 border rounded">
                                                            {option.imageUrl && (
                                                                <img src={option.imageUrl} alt="Option" className="w-16 h-16 object-cover rounded" />
                                                            )}
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => updateOption(q._id, optIndex, 'text', e.target.value)}
                                                                placeholder="Option Text"
                                                                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 flex-grow"
                                                            />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(e, q._id, optIndex)}
                                                                className="hidden"
                                                                id={`image-upload-${q._id}-${optIndex}`}
                                                            />
                                                            <label
                                                                htmlFor={`image-upload-${q._id}-${optIndex}`}
                                                                className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md cursor-pointer text-sm ${
                                                                    uploadingImageQuestionId === q._id && uploadingImageOptionIndex === optIndex ? 'opacity-70 cursor-not-allowed' : ''
                                                                }`}
                                                            >
                                                                {uploadingImageQuestionId === q._id && uploadingImageOptionIndex === optIndex ? 'Uploading...' : 'Upload Image'}
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeOptionFromQuestion(q._id, optIndex)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <i className="fas fa-times-circle"></i>
                                                            </button>
                                                        </div>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => addImageOptionToQuestion(q._id)}
                                                                className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                                                            >
                                                                Add Image Option
                                                            </button>
                                                        </div>
                                                    )}
                                                    {q.questionType === 'conversational' && (
                                                        <Conversational
                                                            question={q}
                                                            updateQuestion={(field, value) => updateQuestion(q._id, field, value)}
                                                            isBuilder={true}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            type="button"
                            onClick={() => setShowQuestionTypeSelector(!showQuestionTypeSelector)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors duration-200"
                        >
                            Add New Question
                        </button>
                    </div>

                    {showQuestionTypeSelector && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Question Type</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('multiple-choice')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Multiple Choice
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('open-ended')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Open-Ended
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('rating')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Rating (1-5 Stars)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('likert-scale')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Likert Scale
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('ranking')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Ranking
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('slider')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Slider
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('nps')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Net Promoter Score (NPS)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('file-upload')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        File Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('image-comparison')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Image Comparison
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addQuestion('conversational')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md"
                                    >
                                        Conversational
                                    </button>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowQuestionTypeSelector(false)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        };

export default SurveyQuestionsBuilder;
