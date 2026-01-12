import { useState, useEffect } from 'react';
import { useTheme } from '../../store/theme';
import {
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
    CreditCardIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    KeyIcon,
    EnvelopeIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../store/auth';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';
import api from '../../services/api';

interface SettingSection {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingSection[] = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing & Pricing', icon: CreditCardIcon },
    { id: 'branding', name: 'Branding', icon: PaintBrushIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon },
    { id: 'email', name: 'Email Settings', icon: EnvelopeIcon },
];

const AdminSettings = () => {
    const { isDarkMode } = useTheme();
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
    const [settings, setSettings] = useState({
        // General
        appName: 'BumbleKey',
        timezone: 'Australia/Sydney',
        currency: 'AUD',
        dateFormat: 'DD/MM/YYYY',

        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,

        // Security
        twoFactorEnabled: false,
        sessionTimeout: 60,
        ipWhitelisting: false,

        // Billing/Pricing
        pay_as_you_go_price: 5,
        monthly_price: 29,
        yearly_price: 290,
        monthly_discount: 0,
        yearly_discount: 17,
        trial_days: 14,

        // Branding
        primaryColor: '#FACC15',
        logoUrl: '',

        // Email
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        fromEmail: 'hello@bumblekey.com',
        fromName: 'BumbleKey',
    });

    useEffect(() => {
        fetchPricingSettings();
    }, []);

    const fetchPricingSettings = async () => {
        try {
            const response = await api.get('/pricing');
            setSettings(prev => ({
                ...prev,
                pay_as_you_go_price: response.data.pay_as_you_go_price || 5,
                monthly_price: response.data.monthly_price || 29,
                yearly_price: response.data.yearly_price || 290,
                monthly_discount: response.data.monthly_discount || 0,
                yearly_discount: response.data.yearly_discount || 0,
                trial_days: response.data.trial_days || 14,
                currency: response.data.currency || 'AUD',
            }));
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
        }
    };

    const handleChange = (key: string, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSavePricing = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings/pricing', {
                pay_as_you_go_price: settings.pay_as_you_go_price,
                monthly_price: settings.monthly_price,
                yearly_price: settings.yearly_price,
                monthly_discount: settings.monthly_discount,
                yearly_discount: settings.yearly_discount,
                trial_days: settings.trial_days,
                currency: settings.currency
            });
            // Refresh pricing to get calculated values
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast('Pricing settings updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update pricing settings', error);
            showToast('Failed to update pricing settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
            showToast("New passwords don't match", 'error');
            setSaving(false);
            return;
        }

        try {
            // In a real app, this would call an API endpoint
            // await api.put('/profile', profileData);

            // For now we'll just simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast('Profile updated successfully', 'success');
            setSaving(false);
            setProfileData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaving(false);
        }
    };


    const handleSave = () => {
        if (activeSection === 'billing') {
            handleSavePricing();
        } else {
            alert('Settings saved!');
        }
    };

    // Calculate discounted prices for preview
    const monthlyDiscounted = settings.monthly_price * (1 - settings.monthly_discount / 100);
    const yearlyDiscounted = settings.yearly_price * (1 - settings.yearly_discount / 100);

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Application Name</label>
                            <input
                                type="text"
                                value={settings.appName}
                                onChange={(e) => handleChange('appName', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Timezone</label>
                            <select
                                value={settings.timezone}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                            >
                                <option value="Australia/Sydney">Australia/Sydney</option>
                                <option value="Australia/Melbourne">Australia/Melbourne</option>
                                <option value="Australia/Brisbane">Australia/Brisbane</option>
                                <option value="Australia/Perth">Australia/Perth</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                            >
                                <option value="AUD">AUD - Australian Dollar</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Date Format</label>
                            <select
                                value={settings.dateFormat}
                                onChange={(e) => handleChange('dateFormat', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        {[
                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                            { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive alerts via SMS' },
                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional emails and newsletters' },
                        ].map((item) => (
                            <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                                <div>
                                    <p className="font-medium text-primary">{item.label}</p>
                                    <p className="text-sm text-secondary">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleChange(item.key, !settings[item.key as keyof typeof settings])}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-bumble-yellow' : (isDarkMode ? 'bg-zinc-700' : 'bg-gray-200')
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                            <div>
                                <p className="font-medium text-primary">Two-Factor Authentication</p>
                                <p className="text-sm text-secondary">Add an extra layer of security</p>
                            </div>
                            <button
                                onClick={() => handleChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactorEnabled ? 'bg-bumble-yellow' : (isDarkMode ? 'bg-zinc-700' : 'bg-gray-200')
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                            />
                        </div>
                        <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                            <div>
                                <p className="font-medium text-primary">IP Whitelisting</p>
                                <p className="text-sm text-secondary">Restrict access to specific IPs</p>
                            </div>
                            <button
                                onClick={() => handleChange('ipWhitelisting', !settings.ipWhitelisting)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.ipWhitelisting ? 'bg-bumble-yellow' : (isDarkMode ? 'bg-zinc-700' : 'bg-gray-200')
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.ipWhitelisting ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <h3 className="text-lg font-bold text-primary">Profile Settings</h3>
                            <p className="text-sm text-secondary">Update your personal information and password.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-secondary mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className={`w-full rounded-xl border transition-all focus:border-bumble-yellow focus:ring-bumble-yellow/20 bg-primary border-default text-primary`}
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-secondary mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className={`w-full rounded-xl border transition-all focus:border-bumble-yellow focus:ring-bumble-yellow/20 bg-primary border-default text-primary`}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <div className={`border-t my-4 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}></div>
                                    <h4 className="text-sm font-bold text-primary mb-4">Change Password</h4>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-secondary mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={profileData.currentPassword}
                                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                        className={`w-full rounded-xl border transition-all focus:border-bumble-yellow focus:ring-bumble-yellow/20 bg-primary border-default text-primary`}
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-secondary mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={profileData.newPassword}
                                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                        className={`w-full rounded-xl border transition-all focus:border-bumble-yellow focus:ring-bumble-yellow/20 bg-primary border-default text-primary`}
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-bold text-secondary mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={profileData.confirmPassword}
                                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                        className={`w-full rounded-xl border transition-all focus:border-bumble-yellow focus:ring-bumble-yellow/20 bg-primary border-default text-primary`}
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

            case 'billing':
                return (
                    <div className="space-y-8">
                        {/* Pricing Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-4">Subscription Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className={`p-4 border rounded-xl transition-all bg-primary border-default`}>
                                    <label className="block text-sm font-medium text-secondary mb-2">Pay As You Go</label>
                                    <div className="relative">
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-secondary`}>$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.pay_as_you_go_price}
                                            onChange={(e) => handleChange('pay_as_you_go_price', parseFloat(e.target.value))}
                                            className={`w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                        />
                                    </div>
                                    <p className="text-xs text-secondary mt-2">Per key exchange</p>
                                </div>
                                <div className={`p-4 border rounded-xl transition-all bg-primary border-default`}>
                                    <label className="block text-sm font-medium text-secondary mb-2">Monthly Plan</label>
                                    <div className="relative">
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-secondary`}>$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.monthly_price}
                                            onChange={(e) => handleChange('monthly_price', parseFloat(e.target.value))}
                                            className={`w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                        />
                                    </div>
                                    <p className="text-xs text-secondary mt-2">Per month</p>
                                </div>
                                <div className={`p-4 border rounded-xl transition-all bg-primary border-default`}>
                                    <label className="block text-sm font-medium text-secondary mb-2">Yearly Plan</label>
                                    <div className="relative">
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-secondary`}>$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.yearly_price}
                                            onChange={(e) => handleChange('yearly_price', parseFloat(e.target.value))}
                                            className={`w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                        />
                                    </div>
                                    <p className="text-xs text-secondary mt-2">Per year</p>
                                </div>
                            </div>
                        </div>

                        {/* Discount Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-4">Discounts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-4 border rounded-xl transition-all ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                                    <label className="block text-sm font-medium text-secondary mb-2">Monthly Discount (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={settings.monthly_discount}
                                            onChange={(e) => handleChange('monthly_discount', parseFloat(e.target.value) || 0)}
                                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-primary border-default text-primary`}
                                        />
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-secondary`}>%</span>
                                    </div>
                                    {settings.monthly_discount > 0 && (
                                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                            Final price: <span className="font-bold">${monthlyDiscounted.toFixed(2)}</span>
                                            <span className={`line-through ml-2 text-secondary`}>${settings.monthly_price}</span>
                                        </p>
                                    )}
                                </div>
                                <div className={`p-4 border rounded-xl transition-all ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                                    <label className="block text-sm font-medium text-secondary mb-2">Yearly Discount (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={settings.yearly_discount}
                                            onChange={(e) => handleChange('yearly_discount', parseFloat(e.target.value) || 0)}
                                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-primary border-default text-primary`}
                                        />
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-secondary`}>%</span>
                                    </div>
                                    {settings.yearly_discount > 0 && (
                                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                            Final price: <span className="font-bold">${yearlyDiscounted.toFixed(2)}</span>
                                            <span className={`line-through ml-2 text-secondary`}>${settings.yearly_price}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trial & Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">Trial Period (days)</label>
                                <input
                                    type="number"
                                    value={settings.trial_days}
                                    onChange={(e) => handleChange('trial_days', parseInt(e.target.value))}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">Currency</label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                >
                                    <option value="AUD">AUD - Australian Dollar</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className={`p-4 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                            <h4 className="text-sm font-medium text-secondary mb-3">Pricing Preview (as shown to customers)</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className={`p-4 rounded-lg border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                    <p className="text-xs text-secondary uppercase">Pay As You Go</p>
                                    <p className="text-2xl font-bold text-primary">${settings.pay_as_you_go_price}</p>
                                    <p className="text-xs text-secondary">per exchange</p>
                                </div>
                                <div className={`p-4 rounded-lg border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                    <p className="text-xs text-secondary uppercase">Monthly</p>
                                    <p className="text-2xl font-bold text-primary">
                                        ${settings.monthly_discount > 0 ? monthlyDiscounted.toFixed(0) : settings.monthly_price}
                                    </p>
                                    {settings.monthly_discount > 0 && (
                                        <p className="text-xs text-green-600">{settings.monthly_discount}% off</p>
                                    )}
                                </div>
                                <div className={`p-4 rounded-lg border transition-all bg-primary ${isDarkMode ? 'border-bumble-yellow/50' : 'border-bumble-yellow'}`}>
                                    <p className="text-xs text-secondary uppercase">Yearly</p>
                                    <p className="text-2xl font-bold text-primary">
                                        ${settings.yearly_discount > 0 ? yearlyDiscounted.toFixed(0) : settings.yearly_price}
                                    </p>
                                    {settings.yearly_discount > 0 && (
                                        <p className="text-xs text-green-600">{settings.yearly_discount}% off</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'branding':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Primary Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className={`w-16 h-16 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}
                                />
                                <input
                                    type="text"
                                    value={settings.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className={`flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Logo URL</label>
                            <input
                                type="url"
                                value={settings.logoUrl}
                                onChange={(e) => handleChange('logoUrl', e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary placeholder-secondary`}
                            />
                        </div>
                        <div className={`p-6 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                            <p className="text-sm text-secondary mb-4">Preview</p>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    B
                                </div>
                                <span className="text-2xl font-bold text-primary">{settings.appName}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'integrations':
                return (
                    <div className="space-y-6">
                        {[
                            { name: 'Airbnb', status: 'connected', logo: '🏠' },
                            { name: 'Booking.com', status: 'disconnected', logo: '📘' },
                            { name: 'Stripe', status: 'connected', logo: '💳' },
                            { name: 'Twilio', status: 'disconnected', logo: '📱' },
                        ].map((integration) => (
                            <div key={integration.name} className={`flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{integration.logo}</span>
                                    <div>
                                        <p className="font-medium text-primary">{integration.name}</p>
                                        <p className={`text-sm ${integration.status === 'connected' ? 'text-green-600' : 'text-secondary'}`}>
                                            {integration.status === 'connected' ? 'Connected' : 'Not connected'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant={integration.status === 'connected' ? 'outline' : 'bumble'} className="whitespace-nowrap">
                                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                        ))}
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-6">
                        <div className={`p-4 border rounded-xl transition-all ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
                            <p className={`text-sm ${isDarkMode ? 'text-yellow-500' : 'text-yellow-800'}`}>
                                <strong>Warning:</strong> Keep your API keys secret. Never share them publicly.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Public API Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value="pk_live_xxxxxxxxxxxxxxxx"
                                    readOnly
                                    className={`flex-1 px-4 py-3 rounded-xl border font-mono text-sm transition-all bg-secondary border-default text-secondary`}
                                />
                                <Button variant="outline">Copy</Button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Secret API Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value="sk_live_xxxxxxxxxxxxxxxx"
                                    readOnly
                                    className={`flex-1 px-4 py-3 rounded-xl border font-mono text-sm transition-all bg-secondary border-default text-secondary`}
                                />
                                <Button variant="outline">Reveal</Button>
                                <Button variant="outline">Regenerate</Button>
                            </div>
                        </div>
                    </div>
                );

            case 'email':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">SMTP Host</label>
                                <input
                                    type="text"
                                    value={settings.smtpHost}
                                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                                    placeholder="smtp.example.com"
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary placeholder-secondary`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">SMTP Port</label>
                                <input
                                    type="number"
                                    value={settings.smtpPort}
                                    onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">SMTP Username</label>
                            <input
                                type="text"
                                value={settings.smtpUser}
                                onChange={(e) => handleChange('smtpUser', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">From Email</label>
                                <input
                                    type="email"
                                    value={settings.fromEmail}
                                    onChange={(e) => handleChange('fromEmail', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">From Name</label>
                                <input
                                    type="text"
                                    value={settings.fromName}
                                    onChange={(e) => handleChange('fromName', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bumble-yellow focus:border-transparent transition-all bg-primary border-default text-primary`}
                                />
                            </div>
                        </div>
                        <Button variant="outline">Send Test Email</Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">Settings</h1>
                <p className="text-secondary">Manage your application settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === section.id
                                    ? 'bg-bumble-yellow text-gray-900 font-medium'
                                    : (isDarkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                                    }`}
                            >
                                <section.icon className="w-5 h-5" />
                                {section.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-primary rounded-2xl border border-default p-6">
                        <h2 className="text-xl font-bold text-primary mb-6">
                            {sections.find(s => s.id === activeSection)?.name}
                        </h2>
                        {renderSection()}
                        <div className={`mt-8 pt-6 border-t flex justify-end ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                            <Button variant="bumble" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
