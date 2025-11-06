import React from 'react';

/**
 * LikertScale Question Component
 * Renders the UI for a Likert scale question, supporting both builder (editable) and respondent (selectable) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing questionText, minRating, maxRating, minLabel, maxLabel, scaleLabels.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when an answer is selected by a respondent.
 * @param {number} [props.answer] - The currently selected answer (for respondent mode).
 */
const LikertScale = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange,
    answer
}) => {
    // Ensure minRating and maxRating are numbers, default if undefined
    const minRating = question.minRating !== undefined ? question.minRating : 1;
    const maxRating = question.maxRating !== undefined ? question.maxRating : 5;

    // Generate numeric scale options
    const scaleOptions = [];
    for (let i = minRating; i <= maxRating; i++) {
        scaleOptions.push(i);
    }

    // Use provided scale labels or generate generic ones
    const labels = question.scaleLabels && question.scaleLabels.length === (maxRating - minRating + 1)
        ? question.scaleLabels
        : scaleOptions.map(val => `Option ${val}`); // Fallback generic labels

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing scale properties and labels
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Likert Scale Options</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Rating Value (e.g., 1):</label>
                            <input
                                type="number"
                                value={minRating}
                                onChange={(e) => updateQuestion('minRating', parseInt(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Rating Value (e.g., 5):</label>
                            <input
                                type="number"
                                value={maxRating}
                                onChange={(e) => updateQuestion('maxRating', parseInt(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Label (e.g., Strongly Disagree):</label>
                            <input
                                type="text"
                                value={question.minLabel || ''}
                                onChange={(e) => updateQuestion('minLabel', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Label (e.g., Strongly Agree):</label>
                            <input
                                type="text"
                                value={question.maxLabel || ''}
                                onChange={(e) => updateQuestion('maxLabel', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Scale Labels (comma-separated, must match number of options):</label>
                        <input
                            type="text"
                            value={question.scaleLabels ? question.scaleLabels.join(', ') : ''}
                            onChange={(e) => updateQuestion('scaleLabels', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="e.g., Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                        {question.scaleLabels && question.scaleLabels.length !== (maxRating - minRating + 1) && (
                            <p className="text-red-500 text-xs mt-1">Warning: Number of labels ({question.scaleLabels.length}) does not match scale range ({maxRating - minRating + 1}).</p>
                        )}
                    </div>
                </div>
            ) : (
                // Respondent Mode: Allows selecting a value on the Likert scale
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span className="text-left font-medium">{question.minLabel || minRating}</span>
                        <span className="text-right font-medium">{question.maxLabel || maxRating}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        {scaleOptions.map((value, index) => (
                            <div key={value} className="flex flex-col items-center">
                                <input
                                    type="radio"
                                    id={`likert-option-${question._id}-${value}`}
                                    name={`question-${question._id}`}
                                    value={value}
                                    checked={answer === value}
                                    onChange={() => onAnswerChange(value)}
                                    className="form-radio h-5 w-5 text-blue-600 cursor-pointer"
                                />
                                <label
                                    htmlFor={`likert-option-${question._id}-${value}`}
                                    className="mt-2 text-gray-700 text-sm font-medium cursor-pointer"
                                >
                                    {labels[index]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LikertScale;
