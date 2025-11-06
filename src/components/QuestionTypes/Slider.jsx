import React from 'react';

/**
 * Slider Question Component
 * Renders the UI for a slider question, supporting both builder (editable) and respondent (interactive) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing sliderMin, sliderMax, sliderStep, sliderDefault, minLabel, maxLabel.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when the slider value changes (for respondent mode).
 * @param {number} [props.answer] - The currently selected slider value (for respondent mode).
 */
const Slider = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange,
    answer
}) => {
    // Ensure numeric defaults for slider properties
    const sliderMin = question.sliderMin !== undefined ? question.sliderMin : 0;
    const sliderMax = question.sliderMax !== undefined ? question.sliderMax : 100;
    const sliderStep = question.sliderStep !== undefined ? question.sliderStep : 1;
    const sliderDefault = question.sliderDefault !== undefined ? question.sliderDefault : 50;

    // For respondent mode, use the answer prop or the default value
    const currentValue = answer !== null && answer !== undefined ? answer : sliderDefault;

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing slider properties and labels
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Slider Options</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Value:</label>
                            <input
                                type="number"
                                value={sliderMin}
                                onChange={(e) => updateQuestion('sliderMin', parseFloat(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Value:</label>
                            <input
                                type="number"
                                value={sliderMax}
                                onChange={(e) => updateQuestion('sliderMax', parseFloat(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Step:</label>
                            <input
                                type="number"
                                step="any" // Allows decimal steps
                                value={sliderStep}
                                onChange={(e) => updateQuestion('sliderStep', parseFloat(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Default Value:</label>
                            <input
                                type="number"
                                value={sliderDefault}
                                onChange={(e) => updateQuestion('sliderDefault', parseFloat(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Min Label:</label>
                            <input
                                type="text"
                                value={question.minLabel || ''}
                                onChange={(e) => updateQuestion('minLabel', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Label:</label>
                            <input
                                type="text"
                                value={question.maxLabel || ''}
                                onChange={(e) => updateQuestion('maxLabel', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Respondent Mode: Allows interacting with the slider
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span className="text-left font-medium">{question.minLabel || sliderMin}</span>
                        <span className="text-right font-medium">{question.maxLabel || sliderMax}</span>
                    </div>
                    <input
                        type="range"
                        min={sliderMin}
                        max={sliderMax}
                        step={sliderStep}
                        value={currentValue}
                        onChange={(e) => onAnswerChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-blue-600"
                    />
                    <div className="text-center text-blue-700 font-bold text-lg mt-2">
                        {currentValue}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Slider;
