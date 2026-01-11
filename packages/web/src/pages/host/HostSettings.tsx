import { useState } from 'react';
import {
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../store/auth';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';

interface SettingSection {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingSection[] = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
];

const HostSettings = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
            showToast("New passwords don't match", 'error');
            setSaving(false);
            return;
        }

        try {
            // Simulate API call
            setTimeout(() => {
                showToast('Profile updated successfully', 'success');
                setSaving(false);
                setProfileData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }, 1000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaving(false);
        }
    };

    const handleSaveNotifications = () => {
        setSaving(true);
        setTimeout(() => {
            showToast('Notification preferences saved', 'success');
            setSaving(false);
        }, 800);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Settings</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Update your personal information and password.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-bumble-yellow focus:ring-bumble-yellow/20 transition-all"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-bumble-yellow focus:ring-bumble-yellow/20 transition-all"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <div className="border-t border-gray-100 dark:border-zinc-800 my-4"></div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Change Password</h4>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={profileData.currentPassword}
                                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-bumble-yellow focus:ring-bumble-yellow/20 transition-all"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={profileData.newPassword}
                                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-bumble-yellow focus:ring-bumble-yellow/20 transition-all"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={profileData.confirmPassword}
                                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-bumble-yellow focus:ring-bumble-yellow/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    variant="bumble"
                                    isLoading={saving}
                                    className="px-8"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Manage how you receive updates.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'email', label: 'Email Notifications', desc: 'Receive booking updates via email' },
                                { id: 'push', label: 'Push Notifications', desc: 'Receive real-time alerts on your device' },
                                { id: 'sms', label: 'SMS Notifications', desc: 'Receive urgent updates via text message' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{item.label}</p>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={notifications[item.id as keyof typeof notifications]}
                                            onChange={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bumble-yellow"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                variant="bumble"
                                onClick={handleSaveNotifications}
                                isLoading={saving}
                                className="px-8"
                            >
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Manage your account security.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm">
                            Two-factor authentication is currently disabled. Contact support to enable it.
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-zinc-400">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeSection === section.id
                                    ? 'bg-bumble-yellow text-bumble-black shadow-lg shadow-bumble-yellow/20'
                                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <section.icon className={`mr-3 h-5 w-5 ${activeSection === section.id ? 'text-bumble-black' : 'text-gray-400 dark:text-zinc-500'}`} />
                                {section.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm min-h-[500px]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">
                            {sections.find(s => s.id === activeSection)?.name}
                        </h2>
                        {renderSection()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostSettings;
