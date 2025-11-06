import React, { useEffect } from 'react';

/**
 * MessagePopup Component
 * Displays a temporary, dismissible message as a pop-up overlay.
 *
 * @param {object} props - Component props
 * @param {string} props.message - The message text to display.
 * @param {'success' | 'error'} props.type - The type of message, influences styling (e.g., 'success', 'error').
 * @param {function} props.onClose - Callback function to close/clear the message.
 * @param {number} [props.duration=3000] - How long the message should display in milliseconds before auto-closing.
 */
const MessagePopup = ({ message, type, onClose, duration = 10000 }) => { // Default to 30 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            // Cleanup function to clear the timer if the component unmounts or message changes
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) {
        return null; // Don't render if there's no message
    }

    // Determine background gradient based on message type
    let backgroundClass = '';
    let textColorClass = 'text-white'; // Default text color for gradient backgrounds

    if (type === 'success') {
        // Vibrant, multi-color gradient for success
        backgroundClass = 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600';
    } else if (type === 'error') {
        // Reddish gradient for errors
        backgroundClass = 'bg-gradient-to-br from-red-500 via-orange-600 to-red-700';
    } else {
        // Default neutral gradient
        backgroundClass = 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className={`relative ${backgroundClass} ${textColorClass} p-8 rounded-xl shadow-2xl max-w-lg w-full text-center transform transition-all duration-300 ease-out scale-100 opacity-100 animate-fade-in`}>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white hover:text-gray-200 text-2xl font-bold leading-none"
                    aria-label="Close message"
                >
                    &times;
                </button>
                <p className="text-xl font-semibold mb-2">{message}</p>
                <p className="text-sm opacity-90">This message will disappear in {duration / 1000} seconds.</p>
            </div>
        </div>
    );
};

export default MessagePopup;
