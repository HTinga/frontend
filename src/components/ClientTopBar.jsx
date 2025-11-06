import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GreenBlobIcon from './GreenBlobIcon'; // Assuming GreenBlobIcon.jsx is in the same directory or adjust path

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

// ClientTopBar Component
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
                    {/* Use the imported GreenBlobIcon */}
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

export default ClientTopBar;
