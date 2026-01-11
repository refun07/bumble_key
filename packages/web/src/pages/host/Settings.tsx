import { useState } from 'react';
import { UserIcon, ShieldCheckIcon, BellIcon, CameraIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../store/auth';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-500">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {activeTab === 'profile' && (
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border-4 border-white shadow-sm">
                                        {(user as any)?.avatar ? (
                                            <img src={(user as any).avatar} alt={user?.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-12 w-12" />
                                        )}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors border-2 border-white">
                                        <CameraIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Profile Picture</h3>
                                    <p className="text-sm text-gray-500">PNG, JPG or GIF. Max size 2MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    defaultValue={user?.name || ''}
                                    className="rounded-xl border-gray-200"
                                />
                                <Input
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    defaultValue={user?.email || ''}
                                    className="rounded-xl border-gray-200"
                                    disabled
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    className="rounded-xl border-gray-200"
                                />
                                <Input
                                    label="Location"
                                    placeholder="Enter your city, country"
                                    className="rounded-xl border-gray-200"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button variant="bumble" className="px-8 py-3">
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
                                <div className="space-y-6 max-w-md">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl border-gray-200"
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl border-gray-200"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button variant="bumble" className="px-8 py-3">
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-8 space-y-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive updates about your keys via email.' },
                                    { title: 'Push Notifications', desc: 'Get real-time alerts on your device.' },
                                    { title: 'Marketing Emails', desc: 'Stay updated with our latest features and news.' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={idx < 2} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bumble-yellow"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button variant="bumble" className="px-8 py-3">
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
