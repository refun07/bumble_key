import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import api from '../services/api';
import {
    ShieldCheckIcon,
    MapPinIcon,
    DevicePhoneMobileIcon,
    HomeIcon,
    BuildingOfficeIcon,
    BuildingOffice2Icon,
    UserIcon,
    CheckCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface PricingData {
    pay_as_you_go_price: number;
    monthly_price: number;
    yearly_price: number;
    monthly_discount: number;
    yearly_discount: number;
    monthly_discounted_price: number;
    yearly_discounted_price: number;
    trial_days: number;
    currency: string;
}

const Landing = () => {
    const [activePlan, setActivePlan] = useState('monthly');
    const [pricing, setPricing] = useState<PricingData>({
        pay_as_you_go_price: 5,
        monthly_price: 29,
        yearly_price: 290,
        monthly_discount: 0,
        yearly_discount: 0,
        monthly_discounted_price: 29,
        yearly_discounted_price: 290,
        trial_days: 14,
        currency: 'AUD'
    });

    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % 3);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await api.get('/pricing');
                setPricing(response.data);
            } catch (error) {
                console.error('Failed to fetch pricing:', error);
            }
        };
        fetchPricing();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 relative z-10">
                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                                Smart Key Management for{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10 px-2 text-gray-900">
                                        {['Airbnbs', 'Property Managers', 'Hotels'][currentWordIndex]}
                                    </span>
                                    <span
                                        key={currentWordIndex}
                                        className="absolute inset-0 bg-bumble-yellow/30 -skew-y-2 rounded-lg animate-fade-in"
                                    ></span>
                                </span>
                            </h1>
                            <p className="text-xl text-gray-500 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '1.1s', animationFillMode: 'both' }}>
                                Managing your keys has never been easier! Smart solutions for Airbnb hosts, estate agents, short and long term rentals.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/host/signup">
                                    <Button variant="bumble" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-bumble-yellow/20 hover:scale-105 transition-all">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/locations">
                                    <Button variant="outline" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base border-gray-200 hover:bg-gray-50 transition-all">
                                        Find a Location
                                    </Button>
                                </Link>
                            </div>
                            <div className="pt-8 flex items-center gap-4 text-sm font-medium text-gray-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                                    ))}
                                </div>
                                <p>Join over 70,000 clients managing keys with us</p>
                            </div>
                        </div>
                        <div className="relative lg:h-[600px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-bumble-yellow/10 to-transparent rounded-[60px] blur-3xl -z-10 transform rotate-6"></div>
                            <div className="relative h-full w-full rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 bg-gray-50">
                                <img
                                    src="/bumblekey_hero_locker.png"
                                    alt="BumbleKey Smart Locker"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solutions Comparison */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Choose Your Solution</h2>
                        <p className="text-gray-500 text-lg">Flexible options for every key management need.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-16 h-16 bg-bumble-yellow/10 rounded-2xl flex items-center justify-center mb-8">
                                <MapPinIcon className="w-8 h-8 text-bumble-yellow" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">BumbleHive Points</h3>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                Drop your keys at your nearest public BumbleHive Point (convenience stores, cafes) and manage access remotely. Perfect for Airbnb hosts and occasional sharing.
                            </p>
                            <Link to="/locations" className="text-bumble-yellow font-bold hover:underline flex items-center gap-2">
                                Find a Point <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                        <div className="bg-gray-900 p-10 rounded-[40px] shadow-xl text-white">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                                <BuildingOfficeIcon className="w-8 h-8 text-bumble-yellow" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">BumbleBox Private Lockers</h3>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Install your own BumbleBox on-site. Allow your team, staff, and customers to pick up and drop off keys 24/7. Ideal for offices, hotels, and apartment blocks.
                            </p>
                            <Link to="/contact" className="text-bumble-yellow font-bold hover:underline flex items-center gap-2">
                                Request a Quote <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who It's For */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Tailored for Your Industry</h2>
                        <p className="text-gray-500 text-lg">See how BumbleKey solves access for your specific use case.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Airbnb Hosts', desc: 'No more waiting for guests. Automate check-ins and get 5-star reviews for smooth arrival.', icon: HomeIcon },
                            { title: 'Property Managers', desc: 'Manage hundreds of keys from one dashboard. Track every pickup and drop-off in real-time.', icon: BuildingOffice2Icon },
                            { title: 'Estate Agents', desc: 'Track keys in & out of the office. Never lose a key again with our smart tracking fobs.', icon: BuildingOfficeIcon },
                            { title: 'Contractors & Cleaners', desc: 'Secure, traceable access for service providers. Grant temporary access with a click.', icon: UserIcon },
                            { title: 'Hotels & Hostels', desc: 'Offer 24/7 key retrieval without front desk staff. Reduce overhead and improve guest experience.', icon: StarIcon },
                            { title: 'Car Rental & Fleets', desc: 'Automated key handover for vehicle rentals. Customers pick up keys at their convenience.', icon: DevicePhoneMobileIcon }
                        ].map((item, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl border border-gray-100 hover:border-bumble-yellow/50 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-bumble-yellow transition-colors duration-300">
                                    <item.icon className="h-6 w-6 text-gray-900" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Deep Dive */}
            <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-bumble-yellow/5 skew-x-12 transform origin-top-right"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-8">Everything you need to manage access securely.</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full bg-bumble-yellow flex items-center justify-center shrink-0">
                                        <DevicePhoneMobileIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
                                        <p className="text-gray-400 leading-relaxed">Know exactly when your keys are picked up and returned instantly via our app.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full bg-bumble-yellow flex items-center justify-center shrink-0">
                                        <ShieldCheckIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Bank-grade Security</h3>
                                        <p className="text-gray-400 leading-relaxed">We use standard security protocols to ensure your keys are safe. All keys are stored anonymously.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full bg-bumble-yellow flex items-center justify-center shrink-0">
                                        <CheckCircleIcon className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Seamless Integrations</h3>
                                        <p className="text-gray-400 leading-relaxed">Sync with Airbnb, Booking.com, and your favorite Property Management Systems.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gray-800 rounded-[40px] p-8 border border-gray-700 shadow-2xl">
                                {/* Mock App Interface */}
                                <div className="bg-white rounded-3xl overflow-hidden aspect-[3/4] relative">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                        <div className="text-center p-8">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">Key Collected</h4>
                                            <p className="text-gray-500 text-sm">Guest picked up "Apartment 4B" key at 2:30 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Credibility */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted by industry leaders</h2>
                        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
                            {/* Placeholder Logos */}
                            <div className="h-8 w-32 bg-gray-300 rounded"></div>
                            <div className="h-8 w-32 bg-gray-300 rounded"></div>
                            <div className="h-8 w-32 bg-gray-300 rounded"></div>
                            <div className="h-8 w-32 bg-gray-300 rounded"></div>
                            <div className="h-8 w-32 bg-gray-300 rounded"></div>
                        </div>
                    </div>

                    <div className="bg-bumble-yellow rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                                "BumbleKey transformed our operations. We save 20+ hours a week on key handovers."
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-16 h-16 bg-black rounded-full"></div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 text-lg">James Wilson</p>
                                    <p className="text-gray-800 font-medium">Director, Urban Stay Property Management</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full translate-x-1/3 translate-y-1/3"></div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 relative bg-gray-900 overflow-hidden">
                {/* Map Background */}
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="/hive_hero.png"
                        alt="Background Map"
                        className="w-full h-full object-cover grayscale"
                    />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-[30px] shadow-2xl overflow-hidden">
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Subscribe to a Plan</h2>

                            {/* Plan Tabs */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                {['pay_as_you_go', 'monthly', 'yearly'].map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => setActivePlan(plan)}
                                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${activePlan === plan
                                            ? 'border-black bg-gray-50 text-gray-900 font-bold'
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${activePlan === plan ? 'border-black bg-black text-white' : 'border-gray-300'
                                            }`}>
                                            {activePlan === plan && <CheckCircleIcon className="w-4 h-4" />}
                                        </div>
                                        <span className="capitalize">{plan.replace(/_/g, ' ')}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Plan Details */}
                            <div className="mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-bold text-gray-900">
                                        ${activePlan === 'pay_as_you_go'
                                            ? pricing.pay_as_you_go_price
                                            : activePlan === 'monthly'
                                                ? (pricing.monthly_discount > 0 ? pricing.monthly_discounted_price.toFixed(0) : pricing.monthly_price)
                                                : (pricing.yearly_discount > 0 ? pricing.yearly_discounted_price.toFixed(0) : pricing.yearly_price)
                                        }
                                    </span>
                                    <span className="text-gray-500 font-medium">
                                        {activePlan === 'pay_as_you_go' ? 'Per Key Exchange' : activePlan === 'monthly' ? 'Per Month' : 'Per Year'}
                                    </span>
                                    {((activePlan === 'monthly' && pricing.monthly_discount > 0) ||
                                        (activePlan === 'yearly' && pricing.yearly_discount > 0)) && (
                                            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {activePlan === 'monthly' ? pricing.monthly_discount : pricing.yearly_discount}% OFF
                                            </span>
                                        )}
                                </div>
                                {((activePlan === 'monthly' && pricing.monthly_discount > 0) ||
                                    (activePlan === 'yearly' && pricing.yearly_discount > 0)) && (
                                        <p className="text-gray-400 mt-1 line-through">
                                            Was ${activePlan === 'monthly' ? pricing.monthly_price : pricing.yearly_price}
                                        </p>
                                    )}
                                <p className="text-gray-400 mt-2">Free Storage included</p>
                            </div>

                            <div className="h-px bg-gray-100 w-full mb-8"></div>

                            {/* Features */}
                            <div className="space-y-6 mb-10">
                                <h3 className="text-lg font-bold text-gray-900">Included Services:</h3>
                                <ul className="space-y-4">
                                    {[
                                        '24/7 support for complete peace of mind',
                                        'Track every key movement in real time',
                                        'Time-restricted codes for extra security',
                                        'Access codes automatically created and sent to guests',
                                        'Airbnb or your PMS integration',
                                        'Magic link for your guests'
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-600">
                                            <CheckCircleIcon className="w-6 h-6 text-gray-900 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link to="/host/signup">
                                <Button variant="bumble" className="w-full py-4 rounded-xl font-bold text-lg bg-gray-900 text-white hover:bg-gray-800 shadow-none">
                                    Subscribe to this Plan
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Link to="/contact" className="text-white/80 hover:text-white font-medium underline">
                            Need a custom plan for your agency? Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
                        Ready to Manage Keys the <span className="text-bumble-yellow">Smart Way</span>?
                    </h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        Join thousands of Australian hosts and property managers simplifying their access today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/locations">
                            <Button variant="outline" className="px-10 py-5 rounded-2xl font-bold text-lg border-gray-200 hover:bg-gray-50">
                                Find a Location
                            </Button>
                        </Link>
                        <Link to="/host/signup">
                            <Button variant="bumble" className="px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-bumble-yellow/20">
                                Sign Up Now
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">Launching in Australia</p>
                </div>
            </section>
        </>
    );
};

export default Landing;
