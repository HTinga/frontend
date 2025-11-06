import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">JiJiPoll</Link>
            <nav className="space-x-6">
                <Link to="/platform" className="text-gray-300 hover:text-white">Platform</Link>
                <Link to="/resources" className="text-gray-300 hover:text-white">Resources</Link>
                <Link to="/company" className="text-gray-300 hover:text-white">Company</Link>
            </nav>
        </div>
    </header>
);

const ApproachPage = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header />
            <main className="container mx-auto px-6 py-16">
                <div className="text-center pt-12 pb-20">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white">A Better Approach to Insights</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">We blend technology and human-centric design to deliver research that is more agile, authentic, and actionable.</p>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="flex items-start space-x-6">
                        <div className="text-4xl font-bold text-teal-400">01</div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Conversational by Design</h3>
                            <p className="text-gray-400">We believe research should feel like a natural conversation, not an interrogation. Our mobile-first, chat-based interfaces increase engagement and yield more thoughtful, honest responses by meeting people in familiar digital environments.</p>
                        </div>
                    </div>
                     <div className="flex items-start space-x-6">
                        <div className="text-4xl font-bold text-teal-400">02</div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Augmented Intelligence</h3>
                            <p className="text-gray-400">Our platform uses AI not to replace human researchers, but to augment their capabilities. From AI-assisted moderation in live groups to automated thematic analysis, we handle the heavy lifting so you can focus on strategic thinking and storytelling.</p>
                        </div>
                    </div>
                     <div className="flex items-start space-x-6">
                        <div className="text-4xl font-bold text-teal-400">03</div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Democratized Insights</h3>
                            <p className="text-gray-400">High-quality research shouldn't be reserved for massive budgets. Our scalable platform and flexible pricing make it possible for teams of all sizes—from startups to Fortune 500s—to make customer-centric decisions with confidence.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ApproachPage;
