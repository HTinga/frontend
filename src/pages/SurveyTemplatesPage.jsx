import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, Link } from 'react-router-dom'; // Commented out for preview

// --- Mocking External Imports for Standalone Preview ---
// In your actual app, these would come from their respective files/libraries.
const API = {
    get: async (url) => {
        console.log(`Mock API GET: ${url}`);
        // Simulate fetching templates
        if (url === '/client/templates') {
            return {
                data: [
                    {
                        id: 'temp-1',
                        title: 'Customer Satisfaction Survey',
                        description: 'Measure customer satisfaction with JijiPoll’s services, inspired by SurveyMonkey.',
                        publicShareId: 'temp-cs-123',
                        category: 'Customer Feedback',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            { questionText: 'How likely are you to recommend JijiPoll to others?', questionType: 'nps', minRating: 0, maxRating: 10 },
                            { questionText: 'What do you value most about our platform?', questionType: 'open-ended' },
                            { questionText: 'How would you rate our customer support responsiveness?', questionType: 'rating', minRating: 1, maxRating: 5 },
                            {
                                questionText: 'Which aspect of our service needs improvement?',
                                questionType: 'multiple-choice',
                                options: [{ text: 'Ease of Use' }, { text: 'Survey Features' }, { text: 'Support Speed' }, { text: 'Pricing' }],
                                randomizeOptions: true
                            }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Technology', 'Customer Service'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-2',
                        title: 'Employee Engagement Pulse',
                        description: 'Capture real-time employee morale, inspired by Remesh.',
                        publicShareId: 'temp-ep-456',
                        category: 'Employee Feedback',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'How satisfied are you with your work environment?',
                                questionType: 'likert-scale',
                                options: [{ text: 'Strongly Disagree' }, { text: 'Disagree' }, { text: 'Neutral' }, { text: 'Agree' }, { text: 'Strongly Agree' }],
                                minLabel: 'Strongly Disagree',
                                maxLabel: 'Strongly Agree',
                                scaleLabels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
                            },
                            { questionText: 'What improves team collaboration in your workplace?', questionType: 'conversational', conversationalTopic: 'Team Collaboration' },
                            { questionText: 'Rate your opportunities for professional growth.', questionType: 'slider', sliderMin: 0, sliderMax: 100, sliderStep: 10, sliderDefault: 50 }
                        ],
                        targetAudience: { employmentStatus: ['Employed'], interests: ['Career Development'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-3',
                        title: 'Consumer Behavior Survey',
                        description: 'Understand consumer preferences in Kenya, aligned with Bounce Insights.',
                        publicShareId: 'temp-cb-789',
                        category: 'Market Research',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'Which mobile payment platform do you use most?',
                                questionType: 'multiple-choice',
                                options: [{ text: 'M-Pesa' }, { text: 'Airtel Money' }, { text: 'T-Kash' }, { text: 'Other' }],
                                requiresGeolocation: true
                            },
                            {
                                questionText: 'What influences your purchasing decisions most?',
                                questionType: 'ranking',
                                rankingItems: [{ text: 'Price' }, { text: 'Quality' }, { text: 'Brand' }, { text: 'Availability' }]
                            },
                            { questionText: 'How satisfied are you with local e-commerce platforms?', questionType: 'rating', minRating: 1, maxRating: 5 }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['E-commerce', 'Mobile Payments'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-4',
                        title: 'Event Feedback Survey',
                        description: 'Collect feedback to improve events, based on SurveyMonkey.',
                        publicShareId: 'temp-ef-012',
                        category: 'Event Planning',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            { questionText: 'How would you rate the event overall?', questionType: 'nps', minRating: 0, maxRating: 10 },
                            { questionText: 'What was the highlight of the event?', questionType: 'open-ended' },
                            {
                                questionText: 'Which event activities did you enjoy?',
                                questionType: 'multiple-choice',
                                options: [{ text: 'Keynote Speech' }, { text: 'Workshops' }, { text: 'Networking Sessions' }, { text: 'Entertainment' }]
                            }
                        ],
                        targetAudience: { interests: ['Events'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-5',
                        title: 'Healthcare Access Survey',
                        description: 'Assess healthcare access in Kenya.',
                        publicShareId: 'temp-ha-345',
                        category: 'Healthcare',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'How accessible is healthcare in your area?',
                                questionType: 'likert-scale',
                                options: [{ text: 'Very Inaccessible' }, { text: 'Somewhat Inaccessible' }, { text: 'Neutral' }, { text: 'Somewhat Accessible' }, { text: 'Very Accessible' }],
                                minLabel: 'Very Inaccessible',
                                maxLabel: 'Very Accessible',
                                scaleLabels: ['Very Inaccessible', 'Somewhat Inaccessible', 'Neutral', 'Somewhat Accessible', 'Very Accessible']
                            },
                            { questionText: 'What barriers do you face in accessing healthcare?', questionType: 'open-ended' },
                            { questionText: 'Please upload a photo of your local healthcare facility (optional).', questionType: 'file-upload', allowedFileTypes: '.jpg,.png' }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Healthcare'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-6',
                        title: 'Product Concept Testing',
                        description: 'Gather feedback on new product concepts, inspired by SurveyMonkey.',
                        publicShareId: 'temp-pct-678',
                        category: 'Product Development',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'Which product design do you prefer?',
                                questionType: 'image-comparison',
                                options: [
                                    { text: 'Design A', imageUrl: 'https://placehold.co/150x100/A0B0C0/FFFFFF?text=Design+A' },
                                    { text: 'Design B', imageUrl: 'https://placehold.co/150x100/C0A0B0/FFFFFF?text=Design+B' }
                                ]
                            },
                            { questionText: 'How likely are you to purchase this product?', questionType: 'nps', minRating: 0, maxRating: 10 },
                            { questionText: 'What features would enhance this product?', questionType: 'conversational', conversationalTopic: 'Product Features' }
                        ],
                        targetAudience: { interests: ['Product Development'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-7',
                        title: 'Kenya Market Trends Quiz',
                        description: 'Test knowledge of Kenya’s market trends for engaging consumer research.',
                        publicShareId: 'temp-mt-901',
                        category: 'Market Research',
                        type: 'quiz',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'Which platform dominates e-commerce in Kenya in 2025?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Jumia', isCorrect: true },
                                    { text: 'Kilimall', isCorrect: false },
                                    { text: 'Amazon', isCorrect: false },
                                    { text: 'Takealot', isCorrect: false }
                                ]
                            },
                            {
                                questionText: 'What is the primary driver of Kenya’s digital economy?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Mobile Payments', isCorrect: true },
                                    { text: 'Agriculture', isCorrect: false },
                                    { text: 'Tourism', isCorrect: false }
                                ]
                            },
                            { questionText: 'What is Kenya’s mobile penetration rate in 2025?', questionType: 'open-ended', correctAnswer: 'Over 90%' }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Market Research'] },
                        results: [
                            { minScore: 80, message: 'Excellent! You’re a Kenya market expert.' },
                            { minScore: 50, message: 'Good effort! Learn more about market trends.' },
                            { minScore: 0, message: 'Keep exploring Kenya’s market to improve!' }
                        ],
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-8',
                        title: 'Customer Service Skills Quiz',
                        description: 'Assess customer service knowledge for training or hiring, inspired by SurveyMonkey.',
                        publicShareId: 'temp-cs-234',
                        category: 'Customer Feedback',
                        type: 'quiz',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'What is the first step in handling a customer complaint?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Listen Actively', isCorrect: true },
                                    { text: 'Offer a Refund', isCorrect: false },
                                    { text: 'Escalate to Manager', isCorrect: false },
                                    { text: 'Ignore the Complaint', isCorrect: false }
                                ]
                            },
                            { questionText: 'How do you ensure customer satisfaction post-resolution?', questionType: 'conversational', conversationalTopic: 'Customer Satisfaction', correctAnswer: 'Follow up with the customer' },
                            { questionText: 'Rate the importance of empathy in customer service.', questionType: 'rating', minRating: 1, maxRating: 5, correctAnswer: '5' }
                        ],
                        targetAudience: { interests: ['Customer Service'] },
                        results: [
                            { minScore: 80, message: 'Outstanding! You’re a customer service pro.' },
                            { minScore: 50, message: 'Good work! Refine your skills for excellence.' },
                            { minScore: 0, message: 'Practice more to master customer service!' }
                        ],
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-9',
                        title: 'Technology Skills Quiz',
                        description: 'Evaluate proficiency in mobile technology for hiring or training in Kenya’s tech sector.',
                        publicShareId: 'temp-ts-567',
                        category: 'Technology',
                        type: 'quiz',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'Which mobile OS is most popular in Kenya in 2025?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Android', isCorrect: true },
                                    { text: 'iOS', isCorrect: false },
                                    { text: 'KaiOS', isCorrect: false }
                                ]
                            },
                            { questionText: 'What is a key feature of 5G technology?', questionType: 'open-ended', correctAnswer: 'High-speed connectivity' },
                            {
                                questionText: 'Rank these technologies by adoption in Kenya.',
                                questionType: 'ranking',
                                rankingItems: [{ text: 'Mobile Apps' }, { text: 'Cloud Computing' }, { text: 'AI Solutions' }],
                                correctAnswer: 'Mobile Apps,Cloud Computing,AI Solutions'
                            }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Technology'] },
                        results: [
                            { minScore: 80, message: 'Great job! You’re tech-savvy in Kenya’s market.' },
                            { minScore: 50, message: 'Nice try! Deepen your tech knowledge.' },
                            { minScore: 0, message: 'Keep learning about technology trends!' }
                        ],
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-10',
                        title: 'Healthcare Knowledge Quiz',
                        description: 'Test healthcare knowledge for community health workers or students.',
                        publicShareId: 'temp-hk-890',
                        category: 'Healthcare',
                        type: 'quiz',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'What is the primary way to prevent malaria?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Use Insecticide-Treated Nets', isCorrect: true },
                                    { text: 'Drink Herbal Tea', isCorrect: false },
                                    { text: 'Avoid Outdoor Activities', isCorrect: false }
                                ]
                            },
                            { questionText: 'What is a common symptom of malaria?', questionType: 'conversational', conversationalTopic: 'Malaria Symptoms', correctAnswer: 'Fever' },
                            { questionText: 'How effective are mosquito nets in preventing malaria?', questionType: 'slider', sliderMin: 0, sliderMax: 100, sliderStep: 10, sliderDefault: 50, correctAnswer: '80' }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Healthcare'] },
                        results: [
                            { minScore: 80, message: 'Excellent! You’re knowledgeable in healthcare.' },
                            { minScore: 50, message: 'Good effort! Review healthcare basics.' },
                            { minScore: 0, message: 'Study more to improve your healthcare knowledge!' }
                        ],
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    }
                ]
            };
        }
        throw new Error(`Mock API: Route not found for ${url}`);
    },
    post: async (url, data) => {
        console.log(`Mock API POST: ${url}`, data);
        return { data: { survey: { _id: `newSurvey${Math.random().toString(36).substring(7)}`, ...data } } };
    }
};

// Mocking react-router-dom Link for preview
const Link = ({ to, children, className, onClick }) => (
    <a href={to} className={className} onClick={onClick}>
        {children}
    </a>
);

// Mocking useNavigate for preview
const useNavigate = () => {
    return (path, options) => {
        console.log(`Navigating to: ${path}`, options);
        // In a real browser, this would be: window.location.href = path;
    };
};

// GreenBlobIcon Component (Moved here for self-containment)
const GreenBlobIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
        <path d="M12 7a1 1 0 011 1v4a1 1 0 01-2 0V8a1 1 0 011-1z" fill="currentColor"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
);

// Custom hook to handle clicks outside the referenced component (Moved here for self-containment)
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

// ClientTopBar Component (Moved here for self-containment)
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
                {/* JijiPoll Logo and Title - Now a Link to Dashboard */}
                <Link to="/client/dashboard" className="flex items-center space-x-3 hover:text-teal-200 transition-colors duration-200">
                    <GreenBlobIcon className="w-10 h-10 text-white" />
                    <h1 className="text-2xl font-bold">JijiPoll</h1>
                </Link>

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
                            <span className="hidden sm:inline">Demo User</span> {/* Mock user name */}
                            <i className="fas fa-user-circle text-2xl"></i>
                            <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200">
                                {/* User Info Header */}
                                <div className="p-4 bg-gray-50 border-b border-gray-200 text-gray-800">
                                    <p className="font-bold text-lg">Demo User</p> {/* Mock user name */}
                                    <p className="text-sm text-gray-500">demo.user@example.com</p> {/* Mock email */}
                                </div>

                                {/* Account Details Section */}
                                <div className="p-4 text-sm text-gray-700">
                                    <h4 className="font-semibold text-gray-800 mb-2">Account Details</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <span><strong>Plan:</strong></span> <span>Pro</span>
                                        <span><strong>Balance:</strong></span> <span>$150.00</span>
                                        <span><strong>Next Bill:</strong></span> <span>2025-09-01</span>
                                        <span><strong>Users:</strong></span> <span>3/5</span>
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


const SampleSurveyCard = ({ template, onUseTemplate }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{template.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{template.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Category: <span className="font-semibold text-gray-800">{template.category}</span></span>
                <span>Questions: <span className="font-semibold text-gray-800">{template.questions.length}</span></span>
            </div>
            <div className="flex justify-end space-x-2 mt-auto pt-4 border-t border-gray-200">
                <Link to={`/public-survey/${template.publicShareId}`} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                    Preview
                </Link>
                <button onClick={() => onUseTemplate(template)} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                    Use Template
                </button>
            </div>
        </div>
    );
};

const SurveyTemplatesPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('surveys');
    const [templates, setTemplates] = useState([]); // Initialize as empty, will be filled by mock API or fallback
    const [message, setMessage] = useState(''); // For displaying messages/errors

    // Mock functions for ClientTopBar
    const mockUser = { username: 'Demo User', email: 'demo.user@example.com' };
    const mockAccountDetails = { plan: 'Pro', balance: 150.00, nextBillingDate: '2025-09-01', currentUsers: 3, allowedUsers: 5 };
    const mockHandleLogout = () => console.log('Mock Logout Clicked');
    const mockUnreadNotifications = 2;
    const mockOnNotificationClick = () => console.log('Mock Notification Bell Clicked');


    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await API.get('/client/templates');
                setTemplates(res.data);
            } catch (err) {
                console.error('Failed to fetch templates:', err);
                setMessage('Failed to load templates. Displaying default templates.');
                // Fallback to static templates if API fails
                setTemplates([
                    {
                        id: 'temp-1',
                        title: 'Customer Satisfaction Survey',
                        description: 'Measure customer satisfaction with JijiPoll’s services, inspired by SurveyMonkey.',
                        publicShareId: 'temp-cs-123',
                        category: 'Customer Feedback',
                        type: 'survey',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            { questionText: 'How likely are you to recommend JijiPoll to others?', questionType: 'nps', minRating: 0, maxRating: 10 },
                            { questionText: 'What do you value most about our platform?', questionType: 'open-ended' },
                            { questionText: 'How would you rate our customer support responsiveness?', questionType: 'rating', minRating: 1, maxRating: 5 },
                            {
                                questionText: 'Which aspect of our service needs improvement?',
                                questionType: 'multiple-choice',
                                options: [{ text: 'Ease of Use' }, { text: 'Survey Features' }, { text: 'Support Speed' }, { text: 'Pricing' }],
                                randomizeOptions: true
                            }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Technology', 'Customer Service'] },
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                    },
                    {
                        id: 'temp-7',
                        title: 'Kenya Market Trends Quiz',
                        description: 'Test knowledge of Kenya’s market trends for engaging consumer research.',
                        publicShareId: 'temp-mt-901',
                        category: 'Market Research',
                        type: 'quiz',
                        status: 'active',
                        isPublic: true,
                        questions: [
                            {
                                questionText: 'Which platform dominates e-commerce in Kenya in 2025?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Jumia', isCorrect: true },
                                    { text: 'Kilimall', isCorrect: false },
                                    { text: 'Amazon', isCorrect: false },
                                    { text: 'Takealot', isCorrect: false }
                                ]
                            },
                            {
                                questionText: 'What is the primary driver of Kenya’s digital economy?',
                                questionType: 'multiple-choice',
                                options: [
                                    { text: 'Mobile Payments', isCorrect: true },
                                    { text: 'Agriculture', isCorrect: false },
                                    { text: 'Tourism', isCorrect: false }
                                ]
                            },
                            { questionText: 'What is Kenya’s mobile penetration rate in 2025?', questionType: 'open-ended', correctAnswer: 'Over 90%' }
                        ],
                        targetAudience: { countries: ['Kenya'], interests: ['Market Research'] },
                        results: [
                            { minScore: 80, message: 'Excellent! You’re a Kenya market expert.' },
                            { minScore: 50, message: 'Good effort! Learn more about market trends.' },
                            { minScore: 0, message: 'Keep exploring Kenya’s market to improve!' }
                        ],
                        rewardPerResponse: 0.10,
                        randomizeQuestions: false
                        }
                ]);
            }
        };
        fetchTemplates();
    }, []);

    const handleUseTemplate = async (template) => {
        try {
            // Mock user for preview purposes
            const user = { id: 'mockUserId', name: 'Demo User' }; // localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!user || !user.id) {
                setMessage('User not authenticated. Please log in to use templates.');
                // In a real app, you'd navigate to login here: navigate('/login');
                return;
            }
            const res = await API.post('/client/surveys', {
                title: `Copy of ${template.title}`,
                description: template.description,
                questions: template.questions,
                status: 'draft',
                isPublic: template.isPublic,
                type: template.type,
                targetAudience: template.targetAudience,
                rewardPerResponse: template.rewardPerResponse,
                randomizeQuestions: template.randomizeQuestions,
                results: template.results || [],
                clientId: user.id
            });
            setMessage(`Successfully created a copy of "${template.title}"!`);
            navigate(`/client/survey/edit/${res.data.survey._id}`);
        } catch (err) {
            setMessage(err.response?.data?.message || err.message || 'Failed to create survey from template.');
        }
    };

    const handleCreateNewQuiz = () => {
        navigate('/client/survey/new', { state: { templateData: { type: 'quiz', questions: [], results: [] } } });
    };

    return (
        <>
            {/* Font Awesome CDN for icons */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" xintegrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossOrigin="anonymous" referrerPolicy="no-referrer" />

            {/* Client Top Bar */}
            <ClientTopBar
                user={mockUser}
                accountDetails={mockAccountDetails}
                handleLogout={mockHandleLogout}
                unreadNotifications={mockUnreadNotifications}
                onNotificationClick={mockOnNotificationClick}
            />

            <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter"> {/* Added font-inter class */}
                <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
                    {/* Back Button - Now navigates to dashboard */}
                    <button
                        onClick={() => navigate('/client/dashboard')}
                        className="flex items-center text-teal-600 hover:text-teal-800 transition-colors duration-200 mb-6 focus:outline-none"
                    >
                        <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6">Templates & Quizzes</h1>

                    {message && (
                        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{message}</span>
                            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setMessage('')}>
                                <svg className="fill-current h-6 w-6 text-blue-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>
                    )}

                    <div className="mb-8 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('surveys')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-base sm:text-lg transition-colors duration-200
                                    ${activeTab === 'surveys' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Survey Templates
                            </button>
                            <button
                                onClick={() => setActiveTab('quizzes')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-base sm:text-lg transition-colors duration-200
                                    ${activeTab === 'quizzes' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Quizzes
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'surveys' && (
                        <>
                            <p className="text-gray-600 mb-8 text-sm sm:text-base">Choose from our pre-designed survey templates to quickly get started, or create a new survey from scratch.</p>
                            {templates.filter(t => t.type === 'survey').length === 0 ? (
                                <p className="text-gray-600 text-lg text-center mt-10">No survey templates available yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {templates.filter(t => t.type === 'survey').map((template) => (
                                        <SampleSurveyCard key={template.id} template={template} onUseTemplate={handleUseTemplate} />
                                    ))}
                                </div>
                            )}
                            <div className="mt-10 text-center">
                                <Link
                                    to="/client/survey/new"
                                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg transform hover:scale-105 text-sm sm:text-base"
                                >
                                    <i className="fas fa-plus mr-2"></i> Create New Survey From Scratch
                                </Link>
                            </div>
                        </>
                    )}

                    {activeTab === 'quizzes' && (
                        <>
                            <p className="text-gray-600 mb-8 text-sm sm:text-base">Explore our quiz templates to engage your audience and test knowledge, or start a new quiz from scratch.</p>
                            {templates.filter(t => t.type === 'quiz').length === 0 ? (
                                <p className="text-gray-600 text-lg text-center mt-10">No quiz templates available yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {templates.filter(t => t.type === 'quiz').map((template) => (
                                        <SampleSurveyCard key={template.id} template={template} onUseTemplate={handleUseTemplate} />
                                    ))}
                                </div>
                            )}
                            <div className="mt-10 text-center">
                                <button
                                    onClick={handleCreateNewQuiz}
                                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg transform hover:scale-105 text-sm sm:text-base"
                                >
                                    <i className="fas fa-plus mr-2"></i> Create New Quiz From Scratch
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SurveyTemplatesPage;
