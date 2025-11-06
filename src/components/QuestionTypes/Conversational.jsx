import React, { useState, useEffect, useRef } from 'react';
import socket from '../../socket';

const Conversational = ({ question, surveyId, userId, anonymousSessionId, isBuilder = false }) => {
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isBuilder) return; // Don't run socket logic in builder mode

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('joinSurveyConversation', { surveyId, userId, anonymousSessionId });

        socket.on('initialComments', (initialComments) => {
            setComments(initialComments);
        });

        socket.on('commentReceived', (comment) => {
            setComments((prevComments) => [...prevComments, comment]);
        });

        socket.on('commentUpdated', (updatedComment) => {
            setComments((prevComments) =>
                prevComments.map((c) => (c._id === updatedComment._id ? updatedComment : c))
            );
        });

        return () => {
            socket.off('initialComments');
            socket.off('commentReceived');
            socket.off('commentUpdated');
            // socket.emit('leaveSurveyConversation', { surveyId, userId, anonymousSessionId }); // Optional: if you want to track active users more precisely
            socket.disconnect(); // Disconnect when component unmounts
        };
    }, [surveyId, userId, anonymousSessionId, isBuilder]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handlePostComment = () => {
        if (newCommentText.trim() && surveyId) {
            socket.emit('newComment', { surveyId, userId, anonymousSessionId, text: newCommentText });
            setNewCommentText('');
        }
    };

    const handleUpvote = (commentId) => {
        if (!userId && !anonymousSessionId) {
            alert('Please login or ensure your session is active to upvote.');
            return;
        }
        socket.emit('upvoteComment', { commentId, userId: userId || anonymousSessionId }); // Use userId or anonymousSessionId for upvoting
    };

    if (isBuilder) {
        return (
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
                <p className="font-semibold">{question.questionText || "Conversational Topic:"}</p>
                <p className="text-gray-600 mt-2">
                    Respondents will discuss this topic in real-time and can upvote comments.
                </p>
                <div className="bg-white p-4 rounded-md mt-4 border border-dashed text-gray-500 text-center">
                    (Live discussion preview will appear here for respondents)
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{question.questionText || question.conversationalTopic}</h3>
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-blue-600">
                                    {comment.respondentId ? comment.respondentId.username : 'Anonymous'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(comment.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-gray-800 text-md">{comment.text}</p>
                            <div className="flex items-center mt-2 text-gray-600">
                                <button
                                    onClick={() => handleUpvote(comment._id)}
                                    className={`flex items-center text-sm px-2 py-1 rounded-full transition-colors duration-200
                                        ${comment.upvotes.includes(userId || anonymousSessionId) ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-200'}`}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                    Upvote {comment.upvotes.length > 0 && `(${comment.upvotes.length})`}
                                </button>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex mt-4">
                <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Type your comment here..."
                    className="flex-grow border border-gray-300 rounded-l-md p-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    onKeyPress={(e) => { if (e.key === 'Enter') handlePostComment(); }}
                />
                <button
                    onClick={handlePostComment}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-md transition-colors duration-200"
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default Conversational;