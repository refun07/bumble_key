import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import Button from '../../components/common/Button';

const SubscriptionPlans = () => {
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
        <div className="min-h-screen bg-[#E5E7EB] relative flex items-center justify-center p-4 overflow-hidden">
            {/* Map Background Overlay with Pins */}
            <div className="absolute inset-0 z-0 opacity-40 grayscale pointer-events-none">
                <img src="/map_placeholder.png" alt="Map" className="w-full h-full object-cover" />

                {/* Decorative Map Pins */}
                <div className="absolute top-[30%] left-[15%] w-4 h-4 bg-[#F97316] rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute top-[60%] left-[25%] w-4 h-4 bg-[#F97316] rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-[20%] right-[20%] w-4 h-4 bg-[#F97316] rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute top-[70%] right-[30%] w-4 h-4 bg-[#F97316] rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-[20%] left-[50%] w-4 h-4 bg-[#F97316] rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-[50%] right-[10%] w-4 h-4 bg-[#F97316] rounded-full border-2 border-white shadow-lg"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-12 lg:p-16">
                    <h2 className="text-xl font-bold text-gray-900 mb-8">Subscribe to a Plan</h2>

                    {/* Plan Selector */}
                    <div className="grid grid-cols-3 gap-2 bg-[#F3F4F6] p-1 rounded-lg mb-10">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`py-2.5 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedPlan === plan.id
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 border border-gray-900'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {selectedPlan === plan.id && (
                                    <div className="w-4 h-4 rounded-full border border-gray-900 flex items-center justify-center">
                                        <CheckIcon className="w-2.5 h-2.5 text-gray-900" />
                                    </div>
                                )}
                                {plan.name}
                            </button>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="mb-10">
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-bold text-gray-900">$20</span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mt-2">Per Key Collection</p>
                        <p className="text-xs font-bold text-gray-400">Free Storage</p>
                    </div>

                    <div className="border-t border-gray-100 pt-8 mb-10">
                        <p className="text-sm font-bold text-gray-900 mb-6">Included Services:</p>
                        <ul className="space-y-3">
                            {services.map((service, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckIcon className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-500 leading-relaxed">{service}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            variant="primary"
                            className="px-10 py-3.5 text-sm bg-[#374151] text-white hover:bg-gray-800 rounded-lg font-bold"
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
