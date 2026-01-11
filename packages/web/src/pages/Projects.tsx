const Projects = () => {
    return (
        <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-bumble-yellow/10 rounded-full border border-bumble-yellow/20">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Our Impact</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight max-w-4xl">
                        Empowering hosts <br /> around the world.
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {[
                        {
                            title: 'The Melbourne Expansion',
                            category: 'Urban Network',
                            desc: 'How we deployed 50+ BumbleHives across Melbourne CBD in just 3 months.',
                            img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000'
                        },
                        {
                            title: 'Airbnb Automation Pilot',
                            category: 'Smart Integration',
                            desc: 'A case study on how 100 hosts reduced check-in issues by 95% using our Airbnb sync.',
                            img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000'
                        },
                        {
                            title: 'Secure Storage Initiative',
                            category: 'Security',
                            desc: 'Implementing military-grade encryption and physical security in all our BumbleHives.',
                            img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1000'
                        },
                        {
                            title: 'Global Partner Program',
                            category: 'Community',
                            desc: 'Building a network of local business partners to host BumbleHives in every major city.',
                            img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000'
                        }
                    ].map((project, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative rounded-[50px] overflow-hidden aspect-video mb-8 shadow-lg">
                                <img src={project.img} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900">
                                    {project.category}
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-bumble-yellow transition-colors">{project.title}</h3>
                            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">{project.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Projects;
