const Blog = () => {
    return (
        <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-bumble-yellow/10 rounded-full border border-bumble-yellow/20">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Insights</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight">The BumbleKey Blog.</h1>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        Tips, tricks, and industry insights for the modern Airbnb host.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {[
                        {
                            title: '5 Tips for a Seamless Guest Check-in',
                            date: 'Jan 10, 2026',
                            category: 'Hosting Tips',
                            img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=500'
                        },
                        {
                            title: 'Why Physical Keys Still Matter in a Digital World',
                            date: 'Jan 05, 2026',
                            category: 'Industry',
                            img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500'
                        },
                        {
                            title: 'The Future of Short-Term Rental Automation',
                            date: 'Dec 28, 2025',
                            category: 'Technology',
                            img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=500'
                        },
                        {
                            title: 'How to Scale Your Airbnb Business in 2026',
                            date: 'Dec 20, 2025',
                            category: 'Business',
                            img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=500'
                        },
                        {
                            title: 'BumbleKey vs. Smart Locks: Which is Right for You?',
                            date: 'Dec 15, 2025',
                            category: 'Comparison',
                            img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=500'
                        },
                        {
                            title: 'Success Story: How One Host Managed 50 Properties',
                            date: 'Dec 10, 2025',
                            category: 'Case Study',
                            img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=500'
                        }
                    ].map((post, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative rounded-[40px] overflow-hidden aspect-[4/3] mb-8 shadow-sm">
                                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900">
                                    {post.category}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{post.date}</p>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-bumble-yellow transition-colors leading-tight">{post.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
