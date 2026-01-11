import { useState, useEffect } from 'react';
import Button from './Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('bumblekey_cookie_consent');
        if (!consent) {
            // Show popup after a short delay
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('bumblekey_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:flex items-center justify-between gap-6 relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-bumble-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="space-y-2 mb-4 md:mb-0 relative z-10">
                        <h3 className="text-lg font-bold text-gray-900">We value your privacy</h3>
                        <p className="text-gray-500 text-sm max-w-2xl">
                            We use cookies to enhance your experience, analyze site traffic, and personalize content.
                            By clicking "Accept", you agree to our use of cookies.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors md:hidden absolute top-0 right-0"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <Button
                            variant="outline"
                            onClick={() => setIsVisible(false)}
                            className="whitespace-nowrap"
                        >
                            Decline
                        </Button>
                        <Button
                            variant="bumble"
                            onClick={handleAccept}
                            className="whitespace-nowrap shadow-lg shadow-bumble-yellow/20"
                        >
                            Accept Cookies
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
