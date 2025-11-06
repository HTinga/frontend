import React from 'react';

/**
 * OpenEnded Question Component
 * Renders the UI for an open-ended question, supporting both builder (editable) and respondent (input) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing questionText.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when the answer changes (for respondent mode).
 * @param {string} [props.answer] - The current answer text (for respondent mode).
 */
const OpenEnded = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange, // Renamed from setAnswer to match the prop name from TakeSurvey.jsx
    answer
}) => {
    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing question properties
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Open-Ended Question Options</h4>
                    <p className="text-gray-600 text-sm">
                        This question type allows respondents to type a free-form text answer.
                        No specific options are needed here.
                    </p>
                </div>
            ) : (
                // Respondent Mode: Allows typing an answer
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <textarea
                        value={answer || ''} // Ensure value is controlled
                        onChange={(e) => onAnswerChange(e.target.value)} // Use onAnswerChange
                        placeholder="Type your answer here..."
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                    />
                </div>
            )}
        </div>
    );
};

export default OpenEnded;
