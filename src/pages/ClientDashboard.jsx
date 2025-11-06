// src/pages/ClientDashboard.js

import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import ClientTopBar from '../components/ClientTopBar';
import TerriAIChat from '../components/TerriAIChat'; // --- ADDITION 1: Import the new chat component ---

const BASE_SURVEY_URL = `${window.location.origin}/public-survey/`;

// Custom hook to handle clicks outside the referenced component (Your original code, unchanged)
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

// --- Reusable Modal Components (Your original code, unchanged) ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="text-gray-600 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const NotificationModal = ({ isOpen, onClose, notifications }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                         <i className="fas fa-times text-xl"></i>
                     </button>
                </div>
                <div className="max-h-96 overflow-y-auto -mr-2 pr-2">
                    {notifications.length === 0 ? ( <p className="text-gray-500 text-center py-8">You have no new notifications.</p> ) : (
                        notifications.map((notification) => (
                            <div key={notification._id} className="p-3 border-b border-gray-200 text-gray-700 text-sm">
                                {notification.message}
                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Survey Card Component (Your original code, unchanged) ---
const SurveyCard = ({ survey, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const publicUrl = `${BASE_SURVEY_URL}${survey.publicShareId}`;
    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{survey.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{survey.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Status: <span className={`font-semibold ${survey.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>{survey.status}</span></span>
                <span>Responses: <span className="font-semibold text-gray-800">{survey.responseCount || 0}</span></span>
            </div>
            {survey.isPublic && survey.publicShareId && (
                <div className="mb-4">
                    <div className="flex items-center bg-gray-100 p-2 rounded-md">
                        <input type="text" readOnly value={publicUrl} className="text-sm text-teal-700 bg-transparent flex-grow focus:outline-none truncate" />
                        <button onClick={handleCopy} className="ml-2 text-sm bg-teal-500 hover:bg-teal-600 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-200">{copied ? 'Copied!' : 'Copy'}</button>
                    </div>
                </div>
            )}
            <div className="flex justify-end space-x-2 mt-auto pt-4 border-t border-gray-200">
                <Link to={`/client/surveys/${survey._id}/responses`} className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">Responses</Link>
                <Link to={`/client/survey/edit/${survey._id}`} className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">Edit</Link>
                <button onClick={() => onDelete(survey)} className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">Delete</button>
            </div>
        </div>
    );
};

// --- Main Dashboard Component (Your original code with additions) ---
const ClientDashboard = () => {
    // All your state, hooks, and functions remain unchanged
    const [surveys, setSurveys] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
    const [surveyToDelete, setSurveyToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateMenuOpen, setCreateMenuOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const createMenuRef = useRef(null);
    useClickOutside(createMenuRef, () => setCreateMenuOpen(false));
    const [accountDetails] = useState({
        balance: 125.50,
        plan: 'Pro',
        lastPaymentDate: 'July 15, 2025',
        nextBillingDate: 'August 15, 2025',
        allowedUsers: 5,
        currentUsers: 2,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) { navigate('/login'); return; }
        const fetchData = async () => {
            try {
                const [surveysRes, notificationsRes] = await Promise.all([ API.get('/client/surveys'), API.get('/client/notifications'), ]);
                setSurveys(surveysRes.data);
                const sortedNotifications = notificationsRes.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(sortedNotifications);
                setUnreadNotifications(notificationsRes.data.filter(n => !n.read).length);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, user]);

    const openDeleteModal = (survey) => { setSurveyToDelete(survey); setDeleteModalOpen(true); };
    const handleConfirmDelete = async () => {
        if (!surveyToDelete) return;
        try {
            await API.delete(`/client/surveys/${surveyToDelete._id}`);
            setSurveys(surveys.filter(survey => survey._id !== surveyToDelete._id));
            setDeleteModalOpen(false);
        } catch (err) { setError(err.response?.data?.message || 'Failed to delete survey.'); setDeleteModalOpen(false); }
    };
    const handleNotificationClick = async () => {
        setNotificationModalOpen(true);
        if (unreadNotifications > 0) {
            try {
                await API.put('/client/notifications/mark-read');
                setNotifications(notifications.map(n => ({ ...n, read: true })));
                setUnreadNotifications(0);
            } catch (err) { console.error('Failed to mark notifications as read:', err); }
        }
    };
    const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); };
    const filteredSurveys = surveys.filter(survey => survey.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

            {user && ( <ClientTopBar user={user} accountDetails={accountDetails} handleLogout={handleLogout} unreadNotifications={unreadNotifications} onNotificationClick={handleNotificationClick}/> )}

            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Confirm Deletion" >
                Are you sure you want to delete the survey "<strong>{surveyToDelete?.title}</strong>"? This action cannot be undone.
            </ConfirmationModal>

            <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setNotificationModalOpen(false)} notifications={notifications} />

            {/* --- ADDITION 2: Render the new AI Chat Assistant. It floats over the page. --- */}
            <TerriAIChat />

            <div className="bg-gray-50 min-h-screen">
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    {/* --- Action Buttons Header --- */}
                    <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
                         <div className="relative" ref={createMenuRef}>
                            <button onClick={() => setCreateMenuOpen(!isCreateMenuOpen)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 flex items-center justify-center" >
                                <i className="fas fa-plus mr-2"></i> Create
                            </button>
                            {isCreateMenuOpen && (
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 border border-gray-200 animate-fade-in-up">
                                    <Link to="/client/survey/new" onClick={() => setCreateMenuOpen(false)} className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-pen-nib w-5 mr-3 text-gray-500"></i> Create New Survey
                                    </Link>
                                    <Link to="/client/templates" onClick={() => setCreateMenuOpen(false)} className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100">
                                       <i className="fas fa-th-large w-5 mr-3 text-gray-500"></i> Browse Samples
                                    </Link>
                                </div>
                            )}
                        </div>
                        <Link to="/client/chat-flow-templates" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 flex items-center justify-center">
                            <i className="fab fa-whatsapp mr-2"></i> WhatsApp & SMS
                        </Link>

                        {/* --- ADDITION 3: The new button that links to the Summarize page. --- */}
                        <Link to="/client/summarize" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 flex items-center justify-center">
                            <i className="fas fa-brain mr-2"></i> Summarize / Transcribe
                        </Link>

                        <Link to="/client/live-conversation" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 flex items-center justify-center">
                            <i className="fas fa-comments mr-2"></i> Focus Groups
                        </Link>
                    </div>

                    {/* --- Surveys Section (Your original code, unchanged) --- */}
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-3xl font-bold text-gray-800">Your Surveys</h2>
                            <div className="w-full sm:w-64">
                                <input type="text" placeholder="Search surveys..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                            </div>
                        </div>
                        {surveys.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg">
                                <i className="fas fa-poll-h text-5xl text-gray-300 mb-4"></i>
                                <h3 className="text-xl font-semibold text-gray-700">No surveys found</h3>
                                <p className="text-gray-500 mt-2">Click the "Create" button to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSurveys.map((survey) => ( <SurveyCard key={survey._id} survey={survey} onDelete={openDeleteModal} /> ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default ClientDashboard;