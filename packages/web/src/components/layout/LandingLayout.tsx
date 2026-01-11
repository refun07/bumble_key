import { Link, Outlet } from 'react-router-dom';
import Button from '../common/Button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LandingLayout = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-bumble-yellow/30">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-12">
                            <Link to="/" className="flex-shrink-0 flex items-center group">
                                <img src="/logo.png" alt="BumbleKey Logo" className="h-10 w-auto transition-transform group-hover:scale-110" />
                            </Link>
                            <div className="hidden lg:flex items-center gap-8">
                                <Link to="/" className="text-xs font-bold text-gray-900 uppercase tracking-widest">Home</Link>
                                <Link to="/about" className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors">About Us</Link>
                                <Link to="/influencers" className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors">Influencers</Link>
                                <Link to="/projects" className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors">Projects</Link>
                                <Link to="/blog" className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors">Blog</Link>
                                <Link to="/contact" className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors">Contact Us</Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors px-4">Login</Link>
                            <Link to="/host/signup">
                                <Button variant="bumble" className="px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-bumble-yellow/20">
                                    Join Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <img src="/logo.png" alt="BumbleKey Logo" className="h-10 w-auto" />
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                The world's most secure and automated key management platform for short-term rentals and property managers.
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-bumble-yellow/10 hover:border-bumble-yellow/20 transition-all cursor-pointer">
                                        <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Platform</h5>
                            <ul className="space-y-4">
                                {['How it Works', 'BumbleHive Map', 'Pricing', 'Airbnb Sync', 'Security'].map(item => (
                                    <li key={item}><Link to="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Company</h5>
                            <ul className="space-y-4">
                                {['About Us', 'Careers', 'Blog', 'Press', 'Contact'].map(item => (
                                    <li key={item}><Link to="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Newsletter</h5>
                            <p className="text-sm text-gray-500 mb-6">Get the latest updates on key management automation.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email address" className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all" />
                                <Button variant="bumble" className="px-4 py-3 rounded-xl">
                                    <ArrowPathIcon className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© 2026 BumbleKey. All rights reserved.</p>
                        <div className="flex gap-8">
                            <Link to="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">Privacy Policy</Link>
                            <Link to="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingLayout;
