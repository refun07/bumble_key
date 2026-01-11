import Button from '../components/common/Button';

const Influencers = () => {
    return (
        <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-bumble-yellow/10 rounded-full border border-bumble-yellow/20">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Partnerships</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight">Grow with BumbleKey.</h1>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        Are you a travel influencer, real estate expert, or hosting guru? Join our influencer program and help your audience automate their hosting experience.
                    </p>
                    <div className="pt-4">
                        <Button variant="bumble" className="px-12 py-5 rounded-2xl font-bold text-lg shadow-xl">
                            Apply to Join
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {[
                        { name: 'Sarah Travel', followers: '250k+', platform: 'Instagram', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=500' },
                        { name: 'Host Master', followers: '100k+', platform: 'YouTube', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500' },
                        { name: 'Airbnb Queen', followers: '500k+', platform: 'TikTok', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=500' }
                    ].map((influencer, idx) => (
                        <div key={idx} className="group relative rounded-[40px] overflow-hidden aspect-[4/5] shadow-xl">
                            <img src={influencer.img} alt={influencer.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                                <h3 className="text-2xl font-bold text-white mb-1">{influencer.name}</h3>
                                <p className="text-bumble-yellow font-bold text-sm uppercase tracking-widest">{influencer.followers} {influencer.platform}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 rounded-[60px] p-12 lg:p-24 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Why partner with us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {[
                            { title: 'High Commission', desc: 'Earn top-tier commissions for every host you bring to the platform.' },
                            { title: 'Exclusive Perks', desc: 'Get early access to new features and free BumbleHive storage for life.' },
                            { title: 'Dedicated Support', desc: 'Work directly with our partnership team to create high-impact content.' }
                        ].map((perk, idx) => (
                            <div key={idx} className="space-y-4">
                                <h4 className="text-xl font-bold text-bumble-yellow">{perk.title}</h4>
                                <p className="text-gray-400 leading-relaxed">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Influencers;
