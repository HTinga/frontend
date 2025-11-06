import React from 'react';

/**
 * NPS (Net Promoter Score) Question Component
 * Renders the UI for an NPS question, supporting both builder (editable) and respondent (selectable) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing minRating (0), maxRating (10), minLabel, maxLabel.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when an answer is selected by a respondent.
 * @param {number} [props.answer] - The currently selected answer (for respondent mode).
 */
const NPS = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange,
    answer
}) => {
    // NPS scale is fixed from 0 to 10
    const minRating = 0;
    const maxRating = 10;

    // Generate numeric scale options
    const scaleOptions = [];
    for (let i = minRating; i <= maxRating; i++) {
        scaleOptions.push(i);
    }

    // Determine labels for Promoters, Passives, Detractors for display
    const getScoreCategory = (score) => {
        if (score >= 9) return 'Promoter';
        if (score >= 7) return 'Passive';
        return 'Detractor';
    };

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing min/max labels, but scale is fixed
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Net Promoter Score (NPS) Options</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        This question uses a standard 0-10 scale.
                        The question text should typically be: "How likely are you to recommend [Company/Product/Service] to a friend or colleague?"
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Label (0):</label>
                            <input
                                type="text"
                                value={question.minLabel || ''}
                                onChange={(e) => updateQuestion('minLabel', e.target.value)}
                                placeholder="Not at all likely"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Label (10):</label>
                            <input
                                type="text"
                                value={question.maxLabel || ''}
                                onChange={(e) => updateQuestion('maxLabel', e.target.value)}
                                placeholder="Extremely likely"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Respondent Mode: Allows selecting a value on the NPS scale
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span className="text-left font-medium">{question.minLabel || 'Not at all likely'}</span>
                        <span className="text-right font-medium">{question.maxLabel || 'Extremely likely'}</span>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        {scaleOptions.map((value) => (
                            <div key={value} className="flex flex-col items-center flex-1 min-w-[30px] max-w-[50px]">
                                <input
                                    type="radio"
                                    id={`nps-option-${question._id}-${value}`}
                                    name={`question-${question._id}`}
                                    value={value}
                                    checked={answer === value}
                                    onChange={() => onAnswerChange(value)}
                                    className="form-radio h-5 w-5 text-blue-600 cursor-pointer"
                                />
                                <label
                                    htmlFor={`nps-option-${question._id}-${value}`}
                                    className="mt-2 text-gray-700 text-sm font-medium cursor-pointer"
                                >
                                    {value}
                                </label>
                            </div>
                        ))}
                    </div>
                    {answer !== null && answer !== undefined && (
                        <p className="text-center text-blue-700 font-bold text-lg mt-4">
                            You selected: {answer} ({getScoreCategory(answer)})
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NPS;
