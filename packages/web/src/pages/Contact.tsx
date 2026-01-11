import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Contact = () => {
    return (
        <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bumble-yellow/10 rounded-full border border-bumble-yellow/20">
                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Contact Us</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight">Get in touch.</h1>
                            <p className="text-xl text-gray-500 leading-relaxed">
                                Have questions about our service, pricing, or partnerships? We're here to help.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { title: 'Email Us', value: 'hello@bumblekey.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                { title: 'Call Us', value: '+1 (555) 123-4567', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                                { title: 'Visit Us', value: '123 Flinders St, Melbourne VIC 3000', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                        <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{item.title}</h4>
                                        <p className="text-lg font-bold text-gray-900">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[60px] p-12 lg:p-16 shadow-2xl border border-gray-50">
                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="First Name" placeholder="John" />
                                <Input label="Last Name" placeholder="Doe" />
                            </div>
                            <Input label="Email Address" type="email" placeholder="john@example.com" />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea
                                    className="w-full px-6 py-5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all min-h-[150px]"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <Button variant="bumble" className="w-full py-5 rounded-2xl font-bold text-lg shadow-xl">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
