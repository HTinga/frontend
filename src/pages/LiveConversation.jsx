import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom'; // Assuming you use react-router for session IDs
import io from 'socket.io-client';

// Load Font Awesome for icons
// This script should ideally be in your public/index.html or main HTML file.
// Including it here for self-contained runnable code.
const FontAwesomeScript = () => (
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js" crossOrigin="anonymous"></script>
);

// --- Helper Components ---

// A simple component to display messages to the user (replaces browser alerts)
const MessageDisplay = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-lg border ${bgColor} z-50 flex items-center`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-lg font-bold">&times;</button>
        </div>
    );
};

const CreatePollModal = ({ isOpen, onClose, onCreate, onMessage }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    if (!isOpen) return null;

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const handleSubmit = () => {
        if (question.trim() && options.every(o => o.trim())) {
            onCreate({ question, options: options.filter(o => o.trim()) });
            onClose();
            setQuestion('');
            setOptions(['', '']);
        } else {
            onMessage("Please fill out the poll question and all options.", 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Poll</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Poll Question"
                        className="w-full p-3 bg-gray-100 rounded-lg"
                    />
                    <h3 className="text-lg font-semibold text-gray-700 mt-4">Options</h3>
                    {options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="w-full p-3 bg-gray-100 rounded-lg"
                        />
                    ))}
                     <button onClick={addOption} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold mt-2">
                        + Add Option
                    </button>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg">Launch Poll</button>
                </div>
            </div>
        </div>
    );
};

// --- GreenBlobIcon Component (defined inline as per previous context) ---
const GreenBlobIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
        <path d="M12 7a1 1 0 011 1v4a1 1 0 01-2 0V8a1 1 0 011-1z" fill="currentColor"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
);

// Custom hook to handle clicks outside the referenced component
const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

// --- ClientTopBar Component (New Uniform Version) ---
const ClientTopBar = ({ user, accountDetails, handleLogout, unreadNotifications, onNotificationClick }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Use the custom hook to close the dropdown when clicking outside
    useClickOutside(dropdownRef, () => setDropdownOpen(false));
    
    // Function to ensure dropdown closes on navigation
    const handleLinkClick = () => {
        setDropdownOpen(false);
    };

    return (
        <header className="bg-teal-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <GreenBlobIcon className="w-10 h-10 text-white" />
                    <h1 className="text-2xl font-bold">JijiPoll</h1>
                </div>

                <nav className="flex items-center space-x-4 sm:space-x-6">
                    {/* Notification Bell Icon */}
                    <button
                        onClick={onNotificationClick}
                        className="relative text-white hover:text-teal-200 transition-colors duration-200 focus:outline-none"
                    >
                        <i className="fas fa-bell text-xl"></i>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-teal-600">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 text-white hover:text-teal-200 transition-colors duration-200 focus:outline-none"
                        >
                            <span className="hidden sm:inline">{user?.username || 'User'}</span>
                            <i className="fas fa-user-circle text-2xl"></i>
                            <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200">
                                {/* User Info Header */}
                                <div className="p-4 bg-gray-50 border-b border-gray-200 text-gray-800">
                                    <p className="font-bold text-lg">{user?.username}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>

                                {/* Account Details Section */}
                                <div className="p-4 text-sm text-gray-700">
                                    <h4 className="font-semibold text-gray-800 mb-2">Account Details</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <span><strong>Plan:</strong></span> <span>{accountDetails?.plan || 'N/A'}</span>
                                        <span><strong>Balance:</strong></span> <span>${accountDetails?.balance?.toFixed(2) || '0.00'}</span>
                                        <span><strong>Next Bill:</strong></span> <span>{accountDetails?.nextBillingDate || 'N/A'}</span>
                                        <span><strong>Users:</strong></span> <span>{accountDetails?.currentUsers || 0}/{accountDetails?.allowedUsers || 0}</span>
                                    </div>
                                </div>
                                
                                <hr />

                                {/* Navigation Links */}
                                <nav className="py-2">
                                    <Link to="/client/manage-users" onClick={handleLinkClick} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-users-cog w-5 mr-3 text-gray-500"></i> Manage Users
                                    </Link>
                                    <Link to="/client/payment-details" onClick={handleLinkClick} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-credit-card w-5 mr-3 text-gray-500"></i> Payment Details
                                    </Link>
                                    <Link to="/client/upgrade-plan" onClick={handleLinkClick} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-arrow-alt-circle-up w-5 mr-3 text-gray-500"></i> Upgrade Plan
                                    </Link>
                                    <Link to="/client/help" onClick={handleLinkClick} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-question-circle w-5 mr-3 text-gray-500"></i> Help & Support
                                    </Link>
                                </nav>
                                
                                <hr />

                                {/* Logout Button */}
                                <div className="p-2">
                                    <button
                                        onClick={() => { handleLogout(); setDropdownOpen(false); }}
                                        className="w-full flex items-center text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                        <i className="fas fa-sign-out-alt w-5 mr-3"></i> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};


// --- Main Live Conversation Component ---

const LiveConversation = () => {
    const { sessionId } = useParams();
    const socket = useRef(null);

    const [isPollModalOpen, setPollModalOpen] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState("Loading question...");
    const [newQuestionText, setNewQuestionText] = useState("");
    const [respondentIdeas, setRespondentIdeas] = useState([]);
    const [activePoll, setActivePoll] = useState(null);
    const [pollResults, setPollResults] = useState(null);
    const [message, setMessage] = useState(null); // For MessageDisplay
    const [messageType, setMessageType] = useState('info'); // For MessageDisplay

    const respondentLink = `${window.location.origin}/session/${sessionId}`;
    
    // Function to display messages (replaces alert)
    const displayMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        const timer = setTimeout(() => {
            setMessage(null);
        }, 5000); // Message disappears after 5 seconds
        return () => clearTimeout(timer);
    };

    useEffect(() => {
        // Connect to the backend server
        // IMPORTANT: Ensure this matches your backend's Socket.IO URL
        socket.current = io('http://localhost:3001');

        // Join the specific conversation room
        socket.current.emit('join_conversation', sessionId);

        // --- Socket Event Listeners ---
        socket.current.on('question_updated', (question) => {
            setActiveQuestion(question);
        });

        socket.current.on('idea_received', (newIdea) => {
            setRespondentIdeas(prevIdeas => [...prevIdeas, newIdea].sort((a, b) => b.votes - a.votes));
        });
        
        socket.current.on('idea_voted', (ideaId) => {
            setRespondentIdeas(prevIdeas => 
                prevIdeas.map(idea => 
                    idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
                ).sort((a,b) => b.votes - a.votes)
            );
        });

        socket.current.on('poll_created', (newPoll) => {
            setActivePoll(newPoll);
            setPollResults(null);
            displayMessage("New poll launched!", "success");
        });
        
        socket.current.on('poll_voted', ({ pollId, optionText }) => {
            setActivePoll(prevPoll => {
                if (prevPoll && prevPoll.id === pollId) {
                    return {
                        ...prevPoll,
                        options: prevPoll.options.map(opt => 
                            opt.text === optionText ? { ...opt, votes: opt.votes + 1 } : opt
                        )
                    };
                }
                return prevPoll;
            });
        });

        // Cleanup on component unmount
        return () => {
            socket.current.disconnect();
        };
    }, [sessionId]);

    const handlePushQuestion = () => {
        if (newQuestionText.trim()) {
            socket.current.emit('new_question', { sessionId, question: newQuestionText });
            setActiveQuestion(newQuestionText);
            setNewQuestionText("");
            displayMessage("Question updated successfully!", "success");
        } else {
            displayMessage("Please enter a question to push.", "error");
        }
    };

    const handleCreatePoll = (pollData) => {
        socket.current.emit('create_poll', { sessionId, pollData });
    };
    
    const handleEndPoll = () => {
        setPollResults(activePoll);
        setActivePoll(null);
        displayMessage("Poll ended. Results displayed below.", "info");
    };

    // Dummy user data for ClientTopBar
    const dummyUser = {
        username: 'Moderator',
        email: 'moderator@example.com',
        // photoURL: 'https://placehold.co/40x40/aabbcc/ffffff?text=M' // Not directly used by the new top bar, but good to keep
    };

    // Dummy account details for ClientTopBar
    const dummyAccountDetails = {
        plan: 'Premium',
        balance: 125.75,
        nextBillingDate: '2025-09-01',
        currentUsers: 3,
        allowedUsers: 5
    };

    const handleLogout = () => {
        displayMessage("Logged out successfully (dummy logout).", 'info');
        // In a real app, this would clear auth tokens, redirect to login, etc.
        // For now, we can redirect to the dashboard as a mock logout
        // navigate('/client/dashboard'); // If using useNavigate hook from react-router-dom
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Include Font Awesome script */}
            <FontAwesomeScript />

            <ClientTopBar
                user={dummyUser}
                accountDetails={dummyAccountDetails}
                handleLogout={handleLogout}
                unreadNotifications={2} // Example: 2 unread notifications
                onNotificationClick={() => displayMessage("You have 2 new notifications!", 'info')}
            />
            <MessageDisplay message={message} type={messageType} onClose={() => setMessage(null)} />

            <CreatePollModal isOpen={isPollModalOpen} onClose={() => setPollModalOpen(false)} onCreate={handleCreatePoll} onMessage={displayMessage} />
            
            <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Moderator Controls</h2>
                         <p className="text-md text-gray-600 mb-2">Active Question:</p>
                        <p className="text-lg font-semibold text-indigo-700 mb-4">{activeQuestion}</p>
                        <textarea
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            className="w-full p-3 bg-gray-50 border rounded-lg"
                            rows="3"
                            placeholder="Enter a new question..."
                        ></textarea>
                        <button onClick={handlePushQuestion} className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200">
                            Push New Question
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Polling</h2>
                        {!activePoll && !pollResults && (
                            <button onClick={() => setPollModalOpen(true)} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200">
                                <i className="fas fa-plus mr-2"></i> Create New Poll
                            </button>
                        )}
                        
                        {activePoll && (
                            <div className="text-center">
                                <p className="font-semibold text-lg text-gray-800">{activePoll.question}</p>
                                 <ul className="space-y-2 mt-4 text-left">
                                    {activePoll.options.map((opt, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                            <span className="text-gray-700">{opt.text}</span>
                                            <span className="font-bold text-teal-600">{opt.votes} votes</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={handleEndPoll} className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200">End Poll</button>
                            </div>
                        )}

                        {pollResults && (
                            <div>
                                <h3 className="font-bold text-lg mb-3">Final Poll Results</h3>
                                <ul className="space-y-2">
                                    {pollResults.options.sort((a,b) => b.votes - a.votes).map((result, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <span className="text-gray-700">{result.text}</span>
                                            <span className="font-bold text-indigo-600">{result.votes} votes</span>
                                        </li>
                                    ))}
                                </ul>
                                 <button onClick={() => { setPollResults(null); setPollModalOpen(true); }} className="w-full mt-4 text-sm text-indigo-600 font-semibold hover:text-indigo-800">
                                    Create Another Poll
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Live Idea Feed</h2>
                        <Link to="/client/dashboard" className="text-purple-600 hover:text-purple-800 transition-colors duration-200 font-semibold">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                    <div className="space-y-4 h-[60vh] overflow-y-auto pr-2">
                        {respondentIdeas.length === 0 && (
                            <p className="text-gray-500 text-center py-10">No ideas received yet. Share the link with respondents!</p>
                        )}
                        {respondentIdeas.map(idea => (
                            <div key={idea.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-800 text-lg font-medium">{idea.text}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            idea.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                                            idea.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {idea.sentiment}
                                        </span>
                                        <p className="text-xs text-gray-500 italic">AI Summary: {idea.summary}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-bold text-2xl text-indigo-600">{idea.votes}</span>
                                        <button onClick={() => socket.current.emit('vote_idea', { sessionId, ideaId: idea.id })} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200">
                                            <i className="fas fa-arrow-up"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveConversation;
