import React from 'react';

/**
 * ImageComparison Question Component
 * Renders the UI for an image comparison question, supporting both builder (editable) and respondent (selectable) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing options, questionText.
 * @param {function} [props.updateOption] - Function to update a specific option's field (only in builder mode).
 * @param {function} [props.addOption] - Function to add a new option (only in builder mode).
 * @param {function} [props.removeOption] - Function to remove an option (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when an image option is selected by a respondent.
 * @param {string} [props.answer] - The ID of the currently selected image option (for respondent mode).
 */
const ImageComparison = ({
    question,
    updateOption,
    addOption,
    removeOption,
    isBuilder = false,
    onAnswerChange, // Renamed from setAnswer to match the prop name from TakeSurvey.jsx
    answer // This is the currently selected option ID
}) => {
    // Ensure options array exists
    const options = question.options || [];

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing, adding, and removing image options
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Image Comparison Options</h4>
                    {options.map((option, index) => (
                        <div key={option._id || index} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 p-3 border rounded-lg bg-gray-50">
                            {option.imageUrl && (
                                <img src={option.imageUrl} alt={`Option ${index + 1}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
                            )}
                            <div className="flex-grow w-full">
                                <label className="block text-gray-700 text-xs font-bold mb-1">Image URL (or upload below):</label>
                                <input
                                    type="text"
                                    value={option.imageUrl || ''}
                                    onChange={(e) => updateOption(index, 'imageUrl', e.target.value)}
                                    placeholder="Enter image URL"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm mb-2"
                                />
                                <label className="block text-gray-700 text-xs font-bold mb-1">Option Text:</label>
                                <input
                                    type="text"
                                    value={option.text || ''}
                                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                                    placeholder={`Option ${index + 1} Label`}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-500 hover:text-red-700 text-xl"
                                title="Remove Option"
                            >
                                <i className="fas fa-times-circle"></i>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                    >
                        Add Image Option
                    </button>
                </div>
            ) : (
                // Respondent Mode: Allows selecting an image option
                <div className="space-y-4">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {options.map((option, index) => (
                            <div
                                key={option._id || index}
                                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out
                                    ${answer === (option._id || index) ? 'border-blue-500 ring-4 ring-blue-300 shadow-lg' : 'border-gray-300 hover:border-blue-400'}`}
                                onClick={() => onAnswerChange(option._id || index)} // Use onAnswerChange
                            >
                                {option.imageUrl ? (
                                    <img
                                        src={option.imageUrl}
                                        alt={option.text || `Option ${index + 1}`}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e0e0e0/555555?text=Image+Load+Error`; }}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                        No Image
                                    </div>
                                )}
                                <div className="p-3 bg-white text-center text-gray-800 font-medium text-sm">
                                    {option.text || `Option ${index + 1}`}
                                </div>
                                {answer === (option._id || index) && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5 text-xs">
                                        <i className="fas fa-check"></i>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageComparison;
