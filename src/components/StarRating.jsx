import React, { useState, useEffect } from 'react';

/**
 * StarRating Component
 * Renders a star rating input, supporting both builder (editable) and respondent (interactive) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing minRating, maxRating, questionText.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when a rating is selected by a respondent.
 * @param {number} [props.answer] - The currently selected answer (for respondent mode).
 * @param {string} [props.size='text-xl'] - Tailwind CSS class for star size (e.g., 'text-xl', 'text-3xl').
 */
const StarRating = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange, // This is the prop passed from TakeSurvey.jsx for respondent mode
    answer,         // This is the current answer value from TakeSurvey.jsx
    size = 'text-xl'
}) => {
    // Ensure minRating and maxRating are numbers, default if undefined
    const minRating = question.minRating !== undefined ? question.minRating : 1;
    const totalStars = question.maxRating !== undefined ? question.maxRating : 5;

    // Internal state for selected rating in respondent mode
    const [selectedRating, setSelectedRating] = useState(answer !== null && answer !== undefined ? answer : minRating);
    const [hoverRating, setHoverRating] = useState(0);

    // Sync internal state with external 'answer' prop
    useEffect(() => {
        if (!isBuilder) {
            setSelectedRating(answer !== null && answer !== undefined ? answer : minRating);
        }
    }, [answer, isBuilder, minRating]);


    // Handles rating selection in respondent mode
    const handleClick = (ratingValue) => {
        if (!isBuilder) {
            setSelectedRating(ratingValue);
            if (onAnswerChange) {
                onAnswerChange(ratingValue); // Pass the selected rating back to the parent
            }
        }
    };

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing min/max rating
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Rating Scale Options</h4>
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
                                value={totalStars}
                                onChange={(e) => updateQuestion('maxRating', parseInt(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-gray-600">Preview:</p>
                        <div className="flex justify-center space-x-1">
                            {[...Array(totalStars)].map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <span
                                        key={ratingValue}
                                        className={`${size} ${ratingValue <= (selectedRating || minRating) ? 'text-yellow-500' : 'text-gray-400'}`}
                                    >
                                        ★
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                // Respondent Mode: Allows interacting with stars
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <div className="flex justify-center space-x-1">
                        {[...Array(totalStars)].map((_, i) => {
                            const ratingValue = i + 1;
                            return (
                                <span
                                    key={ratingValue}
                                    className={`cursor-pointer ${size} transition-colors duration-200
                                        ${ratingValue <= (hoverRating || selectedRating) ? 'text-yellow-500' : 'text-gray-400'}`}
                                    onClick={() => handleClick(ratingValue)}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    ★
                                </span>
                            );
                        })}
                    </div>
                    {selectedRating > 0 && (
                        <p className="text-center text-gray-600 mt-2">You selected: {selectedRating} star{selectedRating !== 1 ? 's' : ''}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StarRating;
