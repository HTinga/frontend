import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api'; // Assuming your API setup is in ../api

// A simple spinner component
const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const TerriAISummarizePage = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'url', 'text'

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        if (activeTab === 'upload' && file) {
            formData.append('file', file);
        } else if (activeTab === 'url' && url) {
            formData.append('url', url);
        } else if (activeTab === 'text' && text) {
            formData.append('text', text);
        } else {
            setError('Please provide content to analyze.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await API.post('/terri-ai/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderInput = () => {
        switch (activeTab) {
            case 'url':
                return <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com or https://www.tiktok.com/..." className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />;
            case 'text':
                return <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your email or document content here..." rows="8" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>;
            case 'upload':
            default:
                return (
                    <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <input type="file" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {file && <p className="mt-2 text-gray-600">Selected: {file.name}</p>}
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
             <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <Link to="/client/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <i className="fas fa-brain text-5xl text-blue-500 mb-4"></i>
                        <h1 className="text-4xl font-bold text-gray-800">Analyze & Summarize with Terri AI</h1>
                        <p className="text-gray-600 mt-2">Upload documents, audio, video, or paste content for transcription, sentiment analysis, and an executive summary.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <div className="flex border-b border-gray-200">
                                <button type="button" onClick={() => setActiveTab('upload')} className={`py-2 px-4 font-semibold ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Upload File</button>
                                <button type="button" onClick={() => setActiveTab('url')} className={`py-2 px-4 font-semibold ${activeTab === 'url' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>From URL</button>
                                <button type="button" onClick={() => setActiveTab('text')} className={`py-2 px-4 font-semibold ${activeTab === 'text' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Paste Text</button>
                            </div>
                            <div className="mt-4">{renderInput()}</div>
                        </div>
                        
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:bg-blue-400">
                            {isLoading ? <Spinner /> : 'Analyze Content'}
                        </button>
                    </form>

                    {error && <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}
                    
                    {result && (
                        <div className="mt-8 space-y-6 animate-fade-in-up">
                            {/* Executive Summary */}
                            <div className="p-6 bg-gray-50 rounded-lg border">
                                <h3 className="text-xl font-bold text-gray-800 mb-3"><i className="fas fa-file-alt mr-2 text-gray-500"></i>Executive Summary</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{result.summary}</p>
                            </div>
                            {/* Sentiment Analysis */}
                            <div className="p-6 bg-gray-50 rounded-lg border">
                                <h3 className="text-xl font-bold text-gray-800 mb-3"><i className="fas fa-smile-beam mr-2 text-gray-500"></i>Sentiment Analysis</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{result.sentiment}</p>
                            </div>
                            {/* Transcription */}
                            {result.transcription && (
                                <div className="p-6 bg-gray-50 rounded-lg border">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3"><i className="fas fa-quote-left mr-2 text-gray-500"></i>Transcription</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{result.transcription}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TerriAISummarizePage;