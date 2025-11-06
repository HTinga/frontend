// src/pages/QuizPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const QuizPage = () => {
    // Mock data for quizzes (in a real app, fetch from backend)
    const [quizzes, setQuizzes] = useState([
        {
            id: 'quiz-1',
            title: 'General Knowledge Quiz',
            description: 'Test your knowledge across various subjects.',
            type: 'general',
            status: 'active',
            questionsCount: 10,
        },
        {
            id: 'quiz-2',
            title: 'Job Recruitment: Aptitude Test',
            description: 'A standard aptitude test for job applicants, covering logical reasoning and numerical skills.',
            type: 'recruitment',
            status: 'active',
            questionsCount: 15,
        },
        {
            id: 'quiz-3',
            title: 'Job Recruitment: Technical Skills (Frontend)',
            description: 'Assess a candidate\'s proficiency in frontend development technologies like React, HTML, CSS, and JavaScript.',
            type: 'recruitment',
            status: 'draft',
            questionsCount: 20,
        },
        {
            id: 'quiz-4',
            title: 'Company Culture Fit Quiz',
            description: 'Evaluate how well a candidate\'s values and work style align with your company culture.',
            type: 'recruitment',
            status: 'active',
            questionsCount: 8,
        },
    ]);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2 border-gray-200">Your Quizzes</h2>
                <p className="text-gray-600 mb-8">Create and manage interactive quizzes for various purposes, including recruitment and internal training.</p>

                <div className="mb-8">
                    <button
                        onClick={() => alert('Create New Quiz functionality to be implemented!')}
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg transform hover:scale-105"
                    >
                        <i className="fas fa-plus mr-2"></i> Create New Quiz
                    </button>
                </div>

                {quizzes.length === 0 ? (
                    <p className="text-gray-600 text-lg text-center mt-10">You haven't created any quizzes yet. Start by creating one!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
                                <h3 className="text-xl font-bold text-purple-700 mb-2">{quiz.title}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                    <span>Type: <span className="font-semibold">{quiz.type.charAt(0).toUpperCase() + quiz.type.slice(1)}</span></span>
                                    <span>Status: <span className={"font-semibold " + (quiz.status === 'active' ? 'text-green-600' : 'text-orange-500')}>{quiz.status.toUpperCase()}</span></span>
                                </div>
                                <div className="flex justify-end space-x-3 mt-auto">
                                    <button
                                        onClick={() => alert(`View/Manage Quiz "${quiz.title}" functionality to be implemented!`)}
                                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded-md transition-colors duration-200"
                                    >
                                        Manage Quiz
                                    </button>
                                    <button
                                        onClick={() => alert(`Share Quiz "${quiz.title}" functionality to be implemented!`)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md transition-colors duration-200"
                                    >
                                        Share
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
