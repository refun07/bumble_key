import { useState } from 'react';
import { useTheme } from '../../store/theme';
import { UserIcon, ShieldCheckIcon, BellIcon, CameraIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../store/auth';

const Settings = () => {
    const { isDarkMode } = useTheme();
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
                <h2 className="text-2xl font-bold text-primary">Settings</h2>
                <p className="text-secondary">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-bumble-yellow text-gray-900 shadow-md'
                                : (isDarkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100')
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-gray-900' : (isDarkMode ? 'text-zinc-500' : 'text-gray-400')}`} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className={`flex-1 rounded-3xl border shadow-sm overflow-hidden bg-primary border-default`}>
                    {activeTab === 'profile' && (
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className={`h-24 w-24 rounded-full flex items-center justify-center text-secondary overflow-hidden border-4 shadow-sm bg-secondary border-default`}>
                                        {(user as any)?.avatar ? (
                                            <img src={(user as any).avatar} alt={user?.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-12 w-12" />
                                        )}
                                    </div>
                                    <button className={`absolute bottom-0 right-0 p-2 text-white rounded-full shadow-lg transition-colors border-2 ${isDarkMode ? 'bg-bumble-yellow text-gray-900 border-zinc-900 hover:bg-yellow-500' : 'bg-black border-white hover:bg-gray-900'}`}>
                                        <CameraIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-primary">Profile Picture</h3>
                                    <p className="text-sm text-secondary">PNG, JPG or GIF. Max size 2MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    defaultValue={user?.name || ''}
                                    className="rounded-xl"
                                />
                                <Input
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    defaultValue={user?.email || ''}
                                    className="rounded-xl"
                                    disabled
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    className="rounded-xl"
                                />
                                <Input
                                    label="Location"
                                    placeholder="Enter your city, country"
                                    className="rounded-xl"
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
                                <h3 className="text-lg font-bold text-primary mb-6">Change Password</h3>
                                <div className="space-y-6 max-w-md">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl"
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="rounded-xl"
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
                            <h3 className="text-lg font-bold text-primary mb-6">Notification Preferences</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive updates about your keys via email.' },
                                    { title: 'Push Notifications', desc: 'Get real-time alerts on your device.' },
                                    { title: 'Marketing Emails', desc: 'Stay updated with our latest features and news.' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-bold text-primary">{item.title}</p>
                                            <p className="text-xs text-secondary">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={idx < 2} />
                                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bumble-yellow ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}></div>
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
