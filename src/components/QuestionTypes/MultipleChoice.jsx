import React from 'react';

/**
 * MultipleChoice Question Component
 * Renders the UI for a multiple-choice question, supporting both builder (editable) and respondent (selectable) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing options, questionText, etc.
 * @param {function} [props.updateOption] - Function to update a specific option's field (only in builder mode).
 * @param {function} [props.addOption] - Function to add a new option (only in builder mode).
 * @param {function} [props.removeOption] - Function to remove an option (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onSelectOption] - Callback when an option is selected by a respondent.
 * @param {string} [props.selectedOptionId] - The ID of the currently selected option (for respondent mode).
 */
const MultipleChoice = ({
    question,
    updateOption,
    addOption,
    removeOption,
    isBuilder = false,
    onSelectOption,
    selectedOptionId
}) => {
    // Ensure options array exists
    const options = question.options || [];

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing, adding, and removing options
                <>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Options:</label>
                    {options.map((option, index) => (
                        <div key={option._id || index} className="flex items-center space-x-2 mb-2">
                            <input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateOption(index, 'text', e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 flex-grow"
                                required // Options should generally not be empty in builder
                            />
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove Option"
                            >
                                <i className="fas fa-times-circle"></i> {/* Font Awesome icon */}
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                    >
                        Add Option
                    </button>
                </>
            ) : (
                // Respondent Mode: Allows selecting options
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-2">{question.questionText}</label>
                    {options.map((option, index) => (
                        <div key={option._id || index} className="flex items-center">
                            <input
                                type="radio"
                                id={`option-${question._id}-${option._id || index}`}
                                name={`question-${question._id}`}
                                value={option._id || index} // Use option._id if available, otherwise index
                                checked={selectedOptionId === (option._id || index)}
                                onChange={() => onSelectOption(option._id || index)} // Pass option ID or index
                                className="form-radio h-4 w-4 text-blue-600 rounded"
                            />
                            <label
                                htmlFor={`option-${question._id}-${option._id || index}`}
                                className="ml-2 text-gray-700 text-base cursor-pointer"
                            >
                                {option.text}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultipleChoice;
