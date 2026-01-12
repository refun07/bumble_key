import { useState } from 'react';
import { useTheme } from '../../store/theme';
import { CheckIcon } from '@heroicons/react/24/solid';
import Button from '../../components/common/Button';

const SubscriptionPlans = () => {
    const { isDarkMode } = useTheme();
    const [selectedPlan, setSelectedPlan] = useState('pay_as_you_go');

    const plans = [
        { id: 'pay_as_you_go', name: 'Pay as you go' },
        { id: 'monthly', name: 'Monthly Plan' },
        { id: 'yearly', name: 'Yearly Plan' },
    ];

    const services = [
        '24/7 support for complete peace of mind',
        'Track every key movement in real time',
        'Time-restricted codes for extra security',
        'Access codes automatically created and communicated to your guests through',
        'Airbnb or your PMS',
        'Magic link for your guests to know when & where to collect your keys',
    ];

    return (
        <div className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden ${isDarkMode ? 'bg-zinc-950' : 'bg-[#E5E7EB]'}`}>
            {/* Map Background Overlay with Pins */}
            <div className="absolute inset-0 z-0 opacity-40 grayscale pointer-events-none">
                <img src="/map_placeholder.png" alt="Map" className="w-full h-full object-cover" />

                {/* Decorative Map Pins */}
                <div className={`absolute top-[30%] left-[15%] w-4 h-4 bg-[#F97316] rounded-full border-2 shadow-lg animate-pulse ${isDarkMode ? 'border-zinc-900' : 'border-white'}`}></div>
                <div className={`absolute top-[60%] left-[25%] w-4 h-4 bg-[#F97316] rounded-full border-2 shadow-lg ${isDarkMode ? 'border-zinc-900' : 'border-white'}`}></div>
                <div className={`absolute top-[20%] right-[20%] w-4 h-4 bg-[#F97316] rounded-full border-2 shadow-lg animate-pulse ${isDarkMode ? 'border-zinc-900' : 'border-white'}`}></div>
                <div className={`absolute top-[70%] right-[30%] w-4 h-4 bg-[#F97316] rounded-full border-2 shadow-lg ${isDarkMode ? 'border-zinc-900' : 'border-white'}`}></div>
                <div className={`absolute bottom-[20%] left-[50%] w-4 h-4 bg-[#F97316] rounded-full border-2 shadow-lg ${isDarkMode ? 'border-zinc-900' : 'border-white'}`}></div>
                <div className={`absolute top-[50%] right-[10%] w-4 h-4 bg-[#F97316] rounded-full border-2 shadow-lg ${isDarkMode ? 'border-zinc-900' : 'border-white'}`}></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className={`rounded-xl shadow-2xl border p-12 lg:p-16 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                    <h2 className="text-xl font-bold text-primary mb-8">Subscribe to a Plan</h2>

                    {/* Plan Selector */}
                    <div className={`grid grid-cols-3 gap-2 p-1 rounded-lg mb-10 ${isDarkMode ? 'bg-zinc-800' : 'bg-[#F3F4F6]'}`}>
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`py-2.5 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedPlan === plan.id
                                    ? (isDarkMode ? 'bg-zinc-700 text-white shadow-sm ring-1 ring-zinc-600 border border-zinc-500' : 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 border border-gray-900')
                                    : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600')
                                    }`}
                            >
                                {selectedPlan === plan.id && (
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isDarkMode ? 'border-white' : 'border-gray-900'}`}>
                                        <CheckIcon className={`w-2.5 h-2.5 ${isDarkMode ? 'text-white' : 'text-primary'}`} />
                                    </div>
                                )}
                                {plan.name}
                            </button>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="mb-10">
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-bold text-primary">$20</span>
                        </div>
                        <p className="text-xs font-bold text-secondary mt-2">Per Key Collection</p>
                        <p className="text-xs font-bold text-secondary">Free Storage</p>
                    </div>

                    <div className={`border-t pt-8 mb-10 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                        <p className="text-sm font-bold text-primary mb-6">Included Services:</p>
                        <ul className="space-y-3">
                            {services.map((service, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-primary'}`} />
                                    <span className="text-xs font-medium text-secondary leading-relaxed">{service}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            variant="primary"
                            className={`px-10 py-3.5 text-sm rounded-lg font-bold transition-all ${isDarkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-[#374151] text-white hover:bg-gray-800'}`}
                            onClick={() => {
                                console.log('Subscribing to:', selectedPlan);
                            }}
                        >
                            Subscribe to this Plan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
