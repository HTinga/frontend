import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">JiJiPoll</Link>
            <nav className="space-x-6">
                <Link to="/platform" className="text-gray-300 hover:text-white">Platform</Link>
                <Link to="/approach" className="text-gray-300 hover:text-white">Approach</Link>
                <Link to="/company" className="text-gray-300 hover:text-white">Company</Link>
            </nav>
        </div>
    </header>
);

const ResourceCard = ({ title, category, description, imageUrl }) => (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-teal-500 transition-all duration-300">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6">
            <p className="text-sm text-teal-400 font-semibold mb-1">{category}</p>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    </div>
);

const ResourcesPage = () => {
    const resources = [
        {
            title: "The Ultimate Guide to Agile Market Research",
            category: "E-BOOK",
            description: "Learn how to implement agile methodologies to get faster, more frequent insights without sacrificing quality.",
            imageUrl: "https://placehold.co/400x250/0D1117/FFFFFF?text=Guide"
        },
        {
            title: "Case Study: How InnovateCo Launched a New Product with 95% Confidence",
            category: "CASE STUDY",
            description: "Discover how our platform helped a leading tech company validate their product concept and messaging.",
            imageUrl: "https://placehold.co/400x250/0D1117/0CFAB7?text=Case+Study"
        },
        {
            title: "5 Common Pitfalls in Qualitative Data Analysis (and How to Avoid Them)",
            category: "BLOG POST",
            description: "Expert advice on ensuring rigor and avoiding bias when analyzing open-ended feedback.",
            imageUrl: "https://placehold.co/400x250/0D1117/FFFFFF?text=Blog"
        },
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header />
            <main className="container mx-auto px-6 py-16">
                <div className="text-center pt-12 pb-20">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white">Insights & Resources</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">Stay ahead of the curve with our latest research, guides, and best practices.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map(res => <ResourceCard key={res.title} {...res} />)}
                </div>
            </main>
        </div>
    );
};

export default ResourcesPage;
