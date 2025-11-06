import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">JiJiPoll</Link>
            <nav className="space-x-6">
                <Link to="/approach" className="text-gray-300 hover:text-white">Approach</Link>
                <Link to="/resources" className="text-gray-300 hover:text-white">Resources</Link>
                <Link to="/company" className="text-gray-300 hover:text-white">Company</Link>
            </nav>
        </div>
    </header>
);

const FeatureSection = ({ title, description, imageUrl, reverse = false }) => (
    <div className="grid lg:grid-cols-2 gap-12 items-center py-16">
        <div className={`text-center lg:text-left ${reverse ? 'lg:order-2' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">{title}</h2>
            <p className="text-gray-400 mb-6">{description}</p>
        </div>
        <div className={`${reverse ? 'lg:order-1' : ''}`}>
            <img src={imageUrl} alt={`${title} placeholder`} className="rounded-lg shadow-2xl shadow-teal-500/10" />
        </div>
    </div>
);

const PlatformPage = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Header />
            <main className="container mx-auto px-6 py-16">
                <div className="text-center pt-12 pb-20">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white">The All-in-One Insights Platform</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">From agile quant to in-depth qual, get closer to your customers than ever before.</p>
                </div>

                <FeatureSection
                    title="Build Surveys People Love"
                    description="Our intuitive drag-and-drop survey builder makes it easy to create beautiful, mobile-first surveys. Use advanced logic, custom branding, and a wide range of question types to capture high-quality data."
                    imageUrl="https://placehold.co/600x400/0D1117/0CFAB7?text=Survey+Builder"
                />

                <FeatureSection
                    title="Engage in Real-Time with Live Focus Groups"
                    description="Go beyond static questions. Host moderated, anonymous conversations where participants can submit, vote on, and discuss ideas. Our AI co-pilot helps you probe deeper and identify key themes as they emerge."
                    imageUrl="https://placehold.co/600x400/0D1117/FFFFFF?text=Live+Conversation"
                    reverse={true}
                />

                <FeatureSection
                    title="Reach Anyone, Anywhere"
                    description="Tap into our global panel of millions of vetted respondents or integrate with WhatsApp and SMS to reach niche audiences directly. Ensure your insights are representative and reliable."
                    imageUrl="https://placehold.co/600x400/0D1117/0CFAB7?text=Global+Reach"
                />
                
                <FeatureSection
                    title="AI-Powered Qualitative Analysis"
                    description="Don't spend weeks analyzing open-ended text. Our AI instantly codes responses, performs sentiment analysis, and visualizes key themes, turning hours of work into minutes."
                    imageUrl="https://placehold.co/600x400/0D1117/FFFFFF?text=AI+Analysis"
                    reverse={true}
                />

            </main>
        </div>
    );
};

export default PlatformPage;
