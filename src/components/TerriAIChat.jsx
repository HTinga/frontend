import React, { useState, useRef, useEffect } from 'react';
import API from '../api';

const TerriAIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Hello! I am Terri AI. How can I help you with your research today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatboxRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom when new messages are added
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await API.post('/terri-ai/chat', { prompt: input });
            const aiMessage = { from: 'ai', text: res.data.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { from: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Widget Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-5 w-96 h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col z-40 animate-fade-in-up">
                    <div className="p-4 bg-gray-800 text-white rounded-t-xl">
                        <h3 className="font-bold text-lg">Chat with Terri AI</h3>
                    </div>
                    <div ref={chatboxRef} className="flex-1 p-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`my-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="my-2 flex justify-start">
                                <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                                   <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..."
                                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 w-16 h-16 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-gray-900 transition-transform hover:scale-110"
                aria-label="Open Terri AI Chat"
            >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-brain'} text-2xl`}></i>
            </button>
        </>
    );
};

export default TerriAIChat;