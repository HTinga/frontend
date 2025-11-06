import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * Ranking Question Component
 * Renders the UI for a ranking question, supporting both builder (editable) and respondent (draggable) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing rankingItems.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when the ranking order changes (for respondent mode).
 * @param {Array<string>} [props.answer] - The currently ranked order of item texts (for respondent mode).
 */
const Ranking = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange,
    answer // In respondent mode, this will be the array of ranked item texts
}) => {
    // For respondent mode, manage the internal state of draggable items
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!isBuilder && question.rankingItems) {
            // Initialize items for respondent mode. If an answer already exists, use it.
            // Otherwise, use the original order from the question.
            const initialItems = answer && answer.length === question.rankingItems.length
                ? answer.map(text => ({ id: text, content: text })) // Reconstruct from answer
                : question.rankingItems.map(item => ({ id: item.text, content: item.text })); // Use original
            setItems(initialItems);
        }
    }, [question.rankingItems, isBuilder, answer]);

    // Handles drag and drop reordering for respondent mode
    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        setItems(reorderedItems);
        // Pass the new order of item texts back to the parent component
        if (onAnswerChange) {
            onAnswerChange(reorderedItems.map(item => item.content));
        }
    };

    // Handler to update a specific ranking item's text (only in builder mode)
    const updateRankingItem = (itemIndex, newText) => {
        if (updateQuestion) {
            const newRankingItems = [...question.rankingItems];
            newRankingItems[itemIndex] = { text: newText };
            updateQuestion('rankingItems', newRankingItems);
        }
    };

    // Adds a new ranking item (only in builder mode)
    const addRankingItem = () => {
        if (updateQuestion) {
            updateQuestion('rankingItems', [...(question.rankingItems || []), { text: '' }]);
        }
    };

    // Removes a ranking item (only in builder mode)
    const removeRankingItem = (itemIndex) => {
        if (updateQuestion) {
            updateQuestion('rankingItems', question.rankingItems.filter((_, i) => i !== itemIndex));
        }
    };

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows editing ranking items
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">Ranking Items</h4>
                    {question.rankingItems && question.rankingItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2 mb-2">
                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateRankingItem(itemIndex, e.target.value)}
                                placeholder={`Item ${itemIndex + 1}`}
                                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 flex-grow"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => removeRankingItem(itemIndex)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove Item"
                            >
                                <i className="fas fa-times-circle"></i>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addRankingItem}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                    >
                        Add Ranking Item
                    </button>
                </div>
            ) : (
                // Respondent Mode: Allows dragging and dropping to rank items
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <p className="text-gray-600 text-sm mb-4">Drag and drop the items to rank them in your preferred order.</p>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="ranking-items">
                            {(provided) => (
                                <ul
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white p-3 rounded-md shadow-sm flex items-center space-x-3 cursor-grab hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    <span className="text-blue-600 font-bold text-lg">{index + 1}.</span>
                                                    <span className="flex-grow text-gray-800">{item.content}</span>
                                                    <i className="fas fa-grip-vertical text-gray-400"></i>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}
        </div>
    );
};

export default Ranking;
