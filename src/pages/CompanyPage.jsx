import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">JiJiPoll</Link>
            <nav className="space-x-6">
                <Link to="/platform" className="text-gray-300 hover:text-white">Platform</Link>
                <Link to="/approach" className="text-gray-300 hover:text-white">Approach</Link>
                <Link to="/resources" className="text-gray-300 hover:text-white">Resources</Link>
            </nav>
        </div>
    </header>
);

const CompanyPage = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header />
            <main className="container mx-auto px-6 py-16">
                <div className="text-center pt-12 pb-20 max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white">Our Mission</h1>
                    <p className="text-lg text-gray-300 mt-6">
                        To empower organizations with a deep and authentic understanding of the people they serve, enabling them to build better products, create better experiences, and make a better world.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center py-16">
                    <div>
                        <img src="https://placehold.co/600x400/0D1117/FFFFFF?text=Our+Team" alt="Team placeholder" className="rounded-lg" />
                    </div>
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-4">Founded by Researchers, for Researchers</h2>
                        <p className="text-gray-400">
                            JiJiPoll was born out of a frustration with the status quo of market research—slow, expensive, and often disconnected from real human experience. Our founding team of researchers, data scientists, and engineers set out to build the platform they always wished they had. Today, we're a passionate, global team dedicated to pushing the boundaries of what's possible in the world of insights.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyPage;
