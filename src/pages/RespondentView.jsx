import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

// Helper to generate a unique ID for anonymous users
const getAnonymousId = () => {
    let anonId = localStorage.getItem('anonymousSessionId');
    if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('anonymousSessionId', anonId);
    }
    return anonId;
};

const RespondentView = () => {
    const { surveyId } = useParams(); // Get surveyId from URL, e.g., /survey/:surveyId
    const socket = useRef(null);
    
    // State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [surveyTitle, setSurveyTitle] = useState('Loading Conversation...');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This would be set if the user is logged in
    const userId = null; // For a real app, get this from your auth context
    const anonymousSessionId = getAnonymousId();

    useEffect(() => {
        // Fetch survey details (like title)
        // In a real app, you'd fetch this from an API endpoint
        setSurveyTitle(`Conversation for Survey: ${surveyId}`);

        // Connect to Socket.IO server
        socket.current = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:8000');

        // Join the conversation
        socket.current.emit('joinSurveyConversation', { surveyId, userId, anonymousSessionId });

        // --- Socket Event Listeners ---
        socket.current.on('initialComments', (initialComments) => {
            setComments(initialComments.sort((a, b) => b.upvotesCount - a.upvotesCount));
        });

        socket.current.on('commentReceived', (receivedComment) => {
            setComments(prev => [...prev, receivedComment].sort((a, b) => b.upvotesCount - a.upvotesCount));
        });

        socket.current.on('commentUpdated', (updatedComment) => {
            setComments(prev => 
                prev.map(c => c._id === updatedComment._id ? { ...c, ...updatedComment } : c)
                   .sort((a, b) => b.upvotesCount - a.upvotesCount)
            );
        });

        socket.current.on('commentError', (err) => {
            console.error("A server-side error occurred:", err);
            setError("Could not perform the action. Please try again.");
        });

        // Cleanup on unmount
        return () => {
            socket.current.disconnect();
        };

    }, [surveyId, userId, anonymousSessionId]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim() && !isSubmitting) {
            setIsSubmitting(true);
            socket.current.emit('newComment', {
                surveyId,
                userId,
                anonymousSessionId,
                text: newComment.trim()
            });
            setNewComment('');
            setTimeout(() => setIsSubmitting(false), 1000); // Prevent spamming
        }
    };

    const handleUpvote = (commentId) => {
        socket.current.emit('upvoteComment', { commentId, userId, anonymousSessionId });
    };

    const hasVoted = (comment) => {
        if (userId) return comment.upvotes.includes(userId);
        return comment.anonymousUpvotes.includes(anonymousSessionId);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{surveyTitle}</h1>
                    <p className="text-gray-500 mt-2">Share your thoughts and vote on the ideas you like best.</p>
                </header>

                {/* Submission Form */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 sticky top-4 z-10">
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full p-4 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            rows="3"
                            placeholder="What's on your mind?"
                        ></textarea>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !newComment.trim()}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Share Idea'}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* Live Feed */}
                <main>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Live Ideas</h2>
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment._id} className="bg-white p-5 rounded-xl shadow-md transition-transform duration-300 hover:scale-[1.02]">
                                <p className="text-gray-800 text-lg">{comment.text}</p>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                    {/* AI Analysis */}
                                    <div className="flex items-center space-x-3 text-sm">
                                        <span className={`font-semibold px-2.5 py-1 rounded-full text-xs ${
                                            comment.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                                            comment.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {comment.sentiment}
                                        </span>
                                        <p className="text-gray-500 italic hidden sm:block">{comment.summary}</p>
                                    </div>
                                    {/* Upvote Button */}
                                    <div className="flex items-center">
                                        <span className="font-bold text-xl text-indigo-600 mr-3">{comment.upvotesCount}</span>
                                        <button 
                                            onClick={() => handleUpvote(comment._id)}
                                            className={`p-2 rounded-full transition-colors ${hasVoted(comment) ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-indigo-100'}`}
                                            aria-label="Upvote"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 5.414V16a1 1 0 11-2 0V5.414L5.707 8.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 2z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RespondentView;
