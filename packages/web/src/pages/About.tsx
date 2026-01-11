// import { Link } from 'react-router-dom';
// import Button from '../components/common/Button';

const About = () => {
    return (
        <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-bumble-yellow/10 rounded-full border border-bumble-yellow/20">
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Our Story</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                            Revolutionizing <br /> Key Management.
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            BumbleKey was born out of a simple frustration: the "key exchange dance." As hosts ourselves, we knew there had to be a better way to manage guest access without the stress of meeting in person or relying on unreliable lockboxes.
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Today, we're building a global network of secure BumbleHives, powered by smart automation and military-grade security, to make hosting seamless for everyone.
                        </p>
                    </div>
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                            alt="Modern Office"
                            className="rounded-[60px] shadow-2xl"
                        />
                        <div className="absolute -bottom-10 -left-10 bg-bumble-yellow p-10 rounded-[40px] shadow-2xl">
                            <p className="text-4xl font-black text-gray-900">2024</p>
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Founded</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: 'Our Mission', desc: 'To provide seamless, secure, and automated access for every guest, everywhere.' },
                        { title: 'Our Vision', desc: 'To become the global standard for physical key management in the digital age.' },
                        { title: 'Our Values', desc: 'Security first, host-centric design, and relentless innovation.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-12 rounded-[40px] border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
