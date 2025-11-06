import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- SVG & Icon Components ---
// Extracted green blob from the original logo SVG
const GreenBlobIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M27.1993 15.5102C27.034 17.8347 26.8895 20.7127 24.9529 22.0042C22.8853 23.3831 20.0109 21.179 17.6313 21.8911C15.6291 22.4903 14.8345 25.7519 12.7474 25.6568C10.7172 25.5643 9.94209 22.8554 8.45067 21.4729C7.11898 20.2384 5.58075 19.3436 4.42517 17.9422C2.92223 16.1197 2.15777 13.3114 1.87177 10.9642C1.57162 8.50096 2.805 7.67767 4.42517 5.79976C6.02321 3.94749 7.09322 2.86969 9.37468 1.99329C11.5926 1.14131 13.9364 1.08875 16.1326 1.99329C18.4733 2.95735 18.5646 4.08493 20.4286 5.79975C22.0398 7.28194 24.5221 7.27642 25.8781 8.99599C27.2727 10.7644 27.3592 13.2614 27.1993 15.5102Z" fill="currentColor" />
    </svg>
);

// Combined JiJiPoll text with the green blob as a suffix
const JijiPollLogo = ({ className }) => (
    <div className={`flex items-center ${className}`}>
        <span className="font-extrabold text-2xl">JiJiPoll</span>
        <GreenBlobIcon className="w-6 h-6 ml-1 text-teal-500" /> {/* Adjust size and color as needed */}
    </div>
);

const MenuIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const XIcon = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

// --- Reusable Components ---
const NavLink = ({ to, children }) => <Link to={to} className="text-gray-300 hover:text-white transition-colors duration-200">{children}</Link>;

const FeaturePopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-teal-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-teal-400 mb-2">Survey Panels</h3>
                    <p className="text-gray-400">Access millions of engaged respondents from around the globe, segmented by thousands of demographic and psychographic variables.</p>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-teal-400 mb-2">WhatsApp & SMS Surveys</h3>
                    <p className="text-gray-400">Reach respondents where they are most active with conversational, mobile-first surveys that boost completion rates.</p>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-teal-400 mb-2">Live Focus Groups</h3>
                    <p className="text-gray-400">Conduct real-time, anonymous discussions with AI-powered analysis to uncover deep qualitative insights instantly.</p>
                </div>
            </div>
        </div>
    );
};

// --- Main Landing Page Component ---
const LandingPage = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const body = document.body;
        body.classList.add('landing-page-body');
        return () => body.classList.remove('landing-page-body');
    }, []);

    const navLinks = [
        { name: 'Platform', path: '/platform' },
        { name: 'Approach', path: '/approach' },
        { name: 'Resources', path: '/resources' },
        { name: 'Company', path: '/company' },
    ];

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans overflow-x-hidden">
            <FeaturePopup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)} />
            <style>{`
                .landing-page-body { background: #0D1117; }
                .text-glow { text-shadow: 0 0 10px rgba(13, 250, 183, 0.5); }
                .hero-bg { background-image: radial-gradient(circle at 50% 0, rgba(13, 250, 183, 0.15), transparent 40%); }
                .cta-gradient-bg {
                    background: linear-gradient(90deg, #1a1a3d, #004d40);
                }
            `}</style>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/"><JijiPollLogo className="w-24 h-auto text-white" /></Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => <NavLink key={link.name} to={link.path}>{link.name}</NavLink>)}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-md transition-colors">Log In</button>
                        <button onClick={() => navigate('/register-role-select')} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-5 rounded-md transition-all duration-300 shadow-lg shadow-teal-500/20">Get Started</button>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-white"><MenuIcon /></button>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-gray-900/95 pb-6">
                        <nav className="flex flex-col items-center space-y-4 px-6">
                            {navLinks.map(link => <NavLink key={link.name} to={link.path}>{link.name}</NavLink>)}
                            <button onClick={() => navigate('/login')} className="w-full text-center bg-gray-800 py-3 rounded-md mt-4">Log In</button>
                            <button onClick={() => navigate('/register-role-select')} className="w-full text-center bg-teal-500 py-3 rounded-md">Get Started</button>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 text-center overflow-hidden hero-bg">
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight text-glow">
                            The Human-Side of Data
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                            Our platform combines qualitative conversations with quantitative scale, delivering insights that drive confident decisions.
                        </p>
                        <div className="flex justify-center items-center gap-4">
                            <button onClick={() => navigate('/register-role-select')} className="bg-white text-gray-900 font-bold py-3 px-8 rounded-md text-lg transition-transform transform hover:scale-105">
                                Get Started Free
                            </button>
                            <button onClick={() => setPopupOpen(true)} className="border border-gray-600 text-white font-bold py-3 px-8 rounded-md text-lg transition-all hover:bg-gray-800">
                                View Features
                            </button>
                        </div>
                    </div>
                </section>

                {/* Trusted By Section */}
                <section className="py-12 bg-gray-900">
                    <div className="container mx-auto px-6">
                        <p className="text-center text-gray-500 uppercase text-sm font-semibold">Powering insights for world-class companies</p>
                        <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 gap-y-4 mt-6 opacity-40 grayscale">
                            <p className="font-bold text-2xl">NEXUS</p>
                            <p className="font-bold text-2xl">InnovateCo</p>
                            <p className="font-bold text-2xl">Quantum</p>
                            <p className="font-bold text-2xl">Apex</p>
                            <p className="font-bold text-2xl">Momentum</p>
                        </div>
                    </div>
                </section>

                {/* Platform Overview Section */}
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="text-center lg:text-left">
                                <span className="text-teal-400 font-semibold">One Unified Platform</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">All Your Research Tools, Integrated</h2>
                                <p className="text-gray-400 mb-6">Stop juggling multiple tools. From quantitative surveys to qualitative deep dives, our AI-powered platform streamlines your entire research workflow, delivering richer insights in a fraction of the time.</p>
                                <Link to="/platform" className="text-teal-400 font-semibold hover:text-teal-300">Explore the Platform &rarr;</Link>
                            </div>
                            <div>
                                <img src="https://placehold.co/600x400/0D1117/0CFAB7?text=Platform+Dashboard" alt="Platform Dashboard Placeholder" className="rounded-lg shadow-2xl shadow-teal-500/10" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 md:py-32 bg-black/20">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Get Actionable Insights in 3 Simple Steps</h2>
                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                                <p className="text-3xl font-bold text-teal-400 mb-2">1</p>
                                <h3 className="text-xl font-bold text-white mb-2">Launch Your Study</h3>
                                <p className="text-gray-400">Define your audience and launch a survey or live conversation in minutes using our intuitive builder or expert-designed templates.</p>
                            </div>
                            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                                <p className="text-3xl font-bold text-teal-400 mb-2">2</p>
                                <h3 className="text-xl font-bold text-white mb-2">Engage & Collect</h3>
                                <p className="text-gray-400">Gather rich quantitative and qualitative data as our AI moderates conversations and analyzes responses in real-time.</p>
                            </div>
                            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                                <p className="text-3xl font-bold text-teal-400 mb-2">3</p>
                                <h3 className="text-xl font-bold text-white mb-2">Analyze & Share</h3>
                                <p className="text-gray-400">Explore interactive dashboards, discover key themes, and export presentation-ready reports to drive business impact.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Use Cases Section */}
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                             <img src="https://placehold.co/600x450/0D1117/FFFFFF?text=Use+Case+Example" alt="Use Case Placeholder" className="rounded-lg shadow-2xl shadow-white/5" />
                        </div>
                        <div className="text-center lg:text-left order-1 lg:order-2">
                             <span className="text-teal-400 font-semibold">Versatile Solutions</span>
                             <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Built for Every Research Need</h2>
                             <p className="text-gray-400 mb-6">From concept testing and brand tracking to creative evaluation and customer journey mapping, JiJiPoll provides the flexibility to tackle any research challenge.</p>
                             <ul className="space-y-2 text-gray-300">
                                 <li>✓ Concept & Product Testing</li>
                                 <li>✓ Brand & Ad Measurement</li>
                                 <li>✓ Customer Experience (CX)</li>
                                 <li>✓ Employee Insights (EX)</li>
                             </ul>
                        </div>
                    </div>
                </section>

                {/* Ready to Get Started Section */}
                <section className="py-20 md:py-24 cta-gradient-bg text-center rounded-xl shadow-2xl mx-auto max-w-6xl my-16">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-glow">
                            Ready to Transform Your Research?
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
                            Join thousands of innovators who are already leveraging JiJiPoll to gain deeper, faster, and more actionable insights.
                        </p>
                        <button onClick={() => navigate('/register-role-select')} className="bg-white text-gray-900 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-teal-400/40">
                            Start Your Free Trial
                        </button>
                    </div>
                </section>

            </main>

            {/* NEW: Enhanced Footer */}
            <footer className="bg-gray-950 border-t border-gray-800 py-12 md:py-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 text-gray-400">
                        {/* Company Info */}
                        <div className="md:col-span-2 lg:col-span-2">
                            <JijiPollLogo className="text-white mb-4" />
                            <p className="text-sm leading-relaxed mb-4 max-w-md">
                                JiJiPoll empowers businesses to gather deep, actionable insights through innovative survey and conversational research tools.
                            </p>
                            <div className="flex space-x-4 mt-4 text-gray-500">
                                <a href="#" className="hover:text-white transition-colors"><i className="fab fa-twitter text-xl"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fab fa-linkedin-in text-xl"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fab fa-facebook-f text-xl"></i></a>
                                <a href="#" className="hover:text-white transition-colors"><i className="fab fa-instagram text-xl"></i></a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bold text-white text-lg mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/platform" className="hover:text-white transition-colors">Platform</Link></li>
                                <li><Link to="/approach" className="hover:text-white transition-colors">Our Approach</Link></li>
                                <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                                <li><Link to="/company" className="hover:text-white transition-colors">Company</Link></li>
                                <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
                                <li><Link to="/register-role-select" className="hover:text-white transition-colors">Sign Up</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-bold text-white text-lg mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="lg:col-span-1">
                            <h4 className="font-bold text-white text-lg mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-sm">
                                <li>Email: <a href="mailto:info@jijipoll.com" className="hover:text-white transition-colors">info@jijipoll.com</a></li>
                                <li>Phone: <a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a></li>
                                <li>Address: 123 Research Lane, Insight City, 54321</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} JiJiPoll. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
