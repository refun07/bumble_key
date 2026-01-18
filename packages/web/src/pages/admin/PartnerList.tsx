import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TimePicker from '../../components/common/TimePicker';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    MapPinIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { TableShimmer } from '../../components/common/Shimmer';
import { useTheme } from '../../store/theme';

interface Partner {
    id: number;
    name: string;
    business_name: string | null;
    email: string;
    phone: string | null;
    is_active: boolean;
    hives?: any[];
    active_keys_count?: number;
    location_image?: string | null;
    unavailable_dates?: any[];
    can_login?: boolean;
}

const PartnerList = () => {
    const { showToast } = useToast();
    const { isDarkMode } = useTheme();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [rangeFrom, setRangeFrom] = useState(0);
    const [rangeTo, setRangeTo] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // View State
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        business_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
        availability: {
            Saturday: { from: '10:00 AM', to: '10:00 PM' },
            Sunday: { from: '10:00 AM', to: '10:00 PM' },
            Monday: { from: '10:00 AM', to: '10:00 PM' },
            Tuesday: { from: '10:00 AM', to: '10:00 PM' },
            Wednesday: { from: '10:00 AM', to: '10:00 PM' },
            Thursday: { from: '10:00 AM', to: '10:00 PM' },
            Friday: { from: '10:00 AM', to: '10:00 PM' },
        },
        unavailable_dates: [] as { date: string; from: string; to: string; reason: string }[],
        location_image: null as File | string | null,
        can_login: true
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    useEffect(() => {
        if (view === 'list') {
            fetchPartners();
        }
    }, [currentPage, search, statusFilter, view]);

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/partners', {
                params: {
                    page: currentPage,
                    search,
                    status: statusFilter === 'all' ? '' : statusFilter
                }
            });
            setPartners(response.data.data);
            setCurrentPage(response.data.current_page || currentPage);
            setLastPage(response.data.last_page || 1);
            setTotal(response.data.total || 0);
            setRangeFrom(response.data.from || 0);
            setRangeTo(response.data.to || 0);
        } catch (error) {
            console.error('Failed to fetch partners', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (partner: Partner) => {
        try {
            await api.put(`/admin/partners/${partner.id}`, {
                is_active: !partner.is_active
            });
            showToast(`Partner ${!partner.is_active ? 'activated' : 'deactivated'} successfully`, 'success');
            fetchPartners();
        } catch (error) {
            console.error('Failed to toggle status', error);
            showToast('Failed to update partner status', 'error');
        }
    };

    const handleToggleLogin = async (partner: Partner) => {
        try {
            await api.put(`/admin/partners/${partner.id}`, {
                can_login: !partner.can_login
            });
            showToast(`Partner login ${!partner.can_login ? 'enabled' : 'disabled'} successfully`, 'success');
            fetchPartners();
        } catch (error) {
            console.error('Failed to toggle login permission', error);
            showToast('Failed to update login permission', 'error');
        }
    };

    const handleAddClick = () => {
        setSelectedPartner(null);
        setFormData({
            name: '',
            business_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            address: '',
            latitude: null,
            longitude: null,
            availability: {
                Saturday: { from: '10:00 AM', to: '10:00 PM' },
                Sunday: { from: '10:00 AM', to: '10:00 PM' },
                Monday: { from: '10:00 AM', to: '10:00 PM' },
                Tuesday: { from: '10:00 AM', to: '10:00 PM' },
                Wednesday: { from: '10:00 AM', to: '10:00 PM' },
                Thursday: { from: '10:00 AM', to: '10:00 PM' },
                Friday: { from: '10:00 AM', to: '10:00 PM' },
            },
            unavailable_dates: [],
            location_image: null,
            can_login: true
        });
        setView('form');
    };

    const handleEditClick = (partner: Partner) => {
        setSelectedPartner(partner);
        setFormData({
            name: partner.name,
            business_name: partner.business_name || '',
            email: partner.email,
            password: '', // Don't show password
            password_confirmation: '',
            phone: partner.phone || '',
            address: (partner as any).address || '',
            latitude: (partner as any).latitude || null,
            longitude: (partner as any).longitude || null,
            availability: (partner as any).availability || {
                Saturday: { from: '10:00 AM', to: '10:00 PM' },
                Sunday: { from: '10:00 AM', to: '10:00 PM' },
                Monday: { from: '10:00 AM', to: '10:00 PM' },
                Tuesday: { from: '10:00 AM', to: '10:00 PM' },
                Wednesday: { from: '10:00 AM', to: '10:00 PM' },
                Thursday: { from: '10:00 AM', to: '10:00 PM' },
                Friday: { from: '10:00 AM', to: '10:00 PM' },
            },
            unavailable_dates: (partner as any).unavailable_dates || [],
            location_image: partner.location_image || null,
            can_login: partner.can_login ?? true
        });
        setView('form');
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('active');
    };

    const addUnavailableDate = () => {
        setFormData({
            ...formData,
            unavailable_dates: [
                ...formData.unavailable_dates,
                { date: '', from: '10:00 AM', to: '10:00 PM', reason: '' }
            ]
        });
    };

    const removeUnavailableDate = (index: number) => {
        const newDates = [...formData.unavailable_dates];
        newDates.splice(index, 1);
        setFormData({ ...formData, unavailable_dates: newDates });
    };

    const updateUnavailableDate = (index: number, field: string, value: string) => {
        const newDates = [...formData.unavailable_dates];
        newDates[index] = { ...newDates[index], [field]: value };
        setFormData({ ...formData, unavailable_dates: newDates });
    };

    if (view === 'form') {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primary">Add/Edit Partners</h2>
                </div>

                
                    {/* Form Section */}
                    <div className="bg-primary p-8 rounded-[32px] shadow-sm border border-default space-y-8">
                        <div className="space-y-6">
                            <Input
                                label="Partner Name"
                                placeholder="Apple er dokan melbourne"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name?.[0]}
                            />

                            <Input
                                label="Email"
                                type="email"
                                placeholder="partner@bumble.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={errors.email?.[0]}
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-secondary">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full px-4 py-3 border rounded-xl bg-secondary border-default focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-primary transition-all text-sm text-primary ${errors.password?.[0] ? 'border-red-500' : ''}`}
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary"
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password?.[0] && <p className="text-xs text-red-500">{errors.password[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-secondary">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={`w-full px-4 py-3 border rounded-xl bg-secondary border-default focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-primary transition-all text-sm text-primary ${errors.password_confirmation?.[0] ? 'border-red-500' : ''}`}
                                        placeholder="Confirm password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary"
                                    >
                                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password_confirmation?.[0] && (
                                    <p className="text-xs text-red-500">{errors.password_confirmation[0]}</p>
                                )}
                            </div>

                            <Input
                                label="Full Address"
                                placeholder="Assigned"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                error={errors.address?.[0]}
                            />

                            {/* <LocationPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                                error={errors.latitude?.[0] || errors.longitude?.[0]}
                            /> */}

                            {/* <div className="space-y-2">
                                <label className="block text-sm font-bold text-secondary">Location Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.location_image && (
                                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-default shadow-sm">
                                            <img
                                                src={typeof formData.location_image === 'string'
                                                    ? `${import.meta.env.VITE_API_URL}/storage/${formData.location_image}`
                                                    : URL.createObjectURL(formData.location_image as File)}
                                                alt="Location"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFormData({ ...formData, location_image: file });
                                            }
                                        }}
                                        className={`text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold transition-colors cursor-pointer ${isDarkMode ? 'text-zinc-400 file:bg-bumble-yellow/10 file:text-bumble-yellow hover:file:bg-bumble-yellow/20' : 'text-gray-500 file:bg-bumble-yellow/10 file:text-bumble-yellow-dark hover:file:bg-bumble-yellow/20'}`}
                                    />
                                </div>
                                {errors.location_image?.[0] && (
                                    <p className="text-xs text-red-500">{errors.location_image[0]}</p>
                                )}
                            </div> */}

                            <div className="space-y-4 pt-4 border-t border-default w-full">
                                <label className="block text-sm font-bold text-secondary">
                                    Partner's Availability
                                </label>

                                <div className="space-y-3 w-full">
                                    {Object.entries(formData.availability).map(([day, times]) => (
                                        <div
                                            key={day}
                                            className="flex items-center gap-4 w-full"
                                        >
                                            {/* Day label */}
                                            <span className="min-w-[96px] text-sm font-medium text-secondary">
                                                {day}
                                            </span>

                                            {/* Time pickers container */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <TimePicker
                                                    value={times.from}
                                                    onChange={(val) =>
                                                        setFormData({
                                                            ...formData,
                                                            availability: {
                                                                ...formData.availability,
                                                                [day]: { ...times, from: val },
                                                            },
                                                        })
                                                    }
                                                    className="flex-1"
                                                />

                                                <span className="text-sm font-medium text-secondary/60">
                                                    to
                                                </span>

                                                <TimePicker
                                                    value={times.to}
                                                    onChange={(val) =>
                                                        setFormData({
                                                            ...formData,
                                                            availability: {
                                                                ...formData.availability,
                                                                [day]: { ...times, to: val },
                                                            },
                                                        })
                                                    }
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="space-y-3 pt-4 border-t border-default">
                                <label className="block text-sm font-bold text-secondary">Partner Can Login</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, can_login: !formData.can_login })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.can_login ? 'bg-green-500' : isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${formData.can_login ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-default">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-secondary">Not Available on</label>
                                    <button
                                        onClick={addUnavailableDate}
                                        className="text-xs font-bold text-bumble-yellow-dark hover:text-bumble-yellow-darker flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-bumble-yellow/10 transition-colors"
                                    >
                                        <PlusIcon className="h-3 w-3" />
                                        Add Date
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.unavailable_dates.length === 0 && (
                                        <p className="text-sm text-secondary italic">No unavailable dates added.</p>
                                    )}
                                    {formData.unavailable_dates.map((item, index) => (
                                        <div key={index} className="flex flex-col gap-3 p-4 bg-secondary rounded-xl border border-default relative group">
                                            <button
                                                onClick={() => removeUnavailableDate(index)}
                                                className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-secondary">Date</label>
                                                    <input
                                                        type="date"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bumble-yellow ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                                        value={item.date}
                                                        onChange={(e) => updateUnavailableDate(index, 'date', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-secondary">Reason (Optional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Public Holiday"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bumble-yellow ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                                        value={item.reason}
                                                        onChange={(e) => updateUnavailableDate(index, 'reason', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-medium text-secondary">From</label>
                                                    <TimePicker
                                                        value={item.from}
                                                        onChange={(val) => updateUnavailableDate(index, 'from', val)}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-medium text-secondary">To</label>
                                                    <TimePicker
                                                        value={item.to}
                                                        onChange={(val) => updateUnavailableDate(index, 'to', val)}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="bumble"
                                onClick={async () => {
                                    setIsSaving(true);
                                    setErrors({});
                                    try {
                                        const data = new FormData();
                                        Object.entries(formData).forEach(([key, value]) => {
                                            if (key === 'availability' || key === 'unavailable_dates') {
                                                data.append(key, JSON.stringify(value));
                                            } else if (key === 'password' || key === 'password_confirmation') {
                                                if (value) {
                                                    data.append(key, value.toString());
                                                }
                                            } else if (key === 'can_login') {
                                                data.append(key, value ? '1' : '0');
                                            } else if (key === 'location_image') {
                                                if (value instanceof File) {
                                                    data.append(key, value);
                                                }
                                            } else if (value !== null) {
                                                data.append(key, value.toString());
                                            }
                                        });

                                        if (selectedPartner) {
                                            data.append('_method', 'PUT');
                                            await api.post(`/admin/partners/${selectedPartner.id}`, data, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            showToast('Partner profile updated successfully', 'success');
                                        } else {
                                            await api.post('/admin/partners', data, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            showToast('Partner created successfully', 'success');
                                        }
                                        setView('list');
                                    } catch (error: any) {
                                        if (error.response?.status === 422) {
                                            setErrors(error.response.data.errors);
                                            showToast('Please check the form for errors', 'error');
                                        } else {
                                            showToast('Failed to save partner', 'error');
                                        }
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                className="flex-[2] py-4 shadow-lg shadow-bumble-yellow/20"
                                isLoading={isSaving}
                            >
                                Save Partner Details
                            </Button>
                            <Button
                               
                                onClick={() => setView('list')}
                                className={`px-8 py-3 rounded-xl border-default ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-50'}`}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

               
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-primary">BumbleHive Partners/Shops</h2>
                <Button
                    variant="bumble"
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-bumble-yellow/20"
                >
                    <span>Add New Partner</span>
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 focus:border-bumble-yellow sm:text-sm transition-all shadow-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                        placeholder="Search BumbleHive/Partner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 sm:flex-none">
                        <span className="text-sm font-bold text-secondary whitespace-nowrap">Status</span>
                        <select
                            className={`block w-full sm:w-44 pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 focus:border-bumble-yellow rounded-xl border transition-all shadow-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        className={`flex items-center justify-center gap-2 border-default text-secondary transition-all rounded-xl px-6 py-2.5 font-bold ${isDarkMode ? 'hover:bg-zinc-800 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* List Header - Hidden on Mobile */}
            <div className="hidden lg:grid grid-cols-12 px-8 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                <div className="col-span-3">Partner Name</div>
                <div className="col-span-2">Partner Location</div>
                <div className="col-span-2 text-center">Partner Status</div>
                <div className="col-span-1 text-center">Can Login</div>
                <div className="col-span-2">Assigned BumbleHive</div>
                <div className="col-span-1 text-center">Key Assigned</div>
                <div className="col-span-1"></div>
            </div>

            {/* Partners List */}
            <div className="space-y-4">
                {isLoading ? (
                    <TableShimmer rows={6} cols={5} />
                ) : partners.length === 0 ? (
                    <div className="text-center py-12 text-secondary bg-primary rounded-[32px] border border-default shadow-sm italic">
                        No partners found matching your criteria.
                    </div>
                ) : (
                    partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="bg-primary rounded-3xl lg:rounded-[32px] shadow-sm border border-default hover:border-bumble-yellow hover:shadow-md transition-all duration-200 overflow-hidden group"
                        >
                            {/* Desktop Layout */}
                            <div className="hidden lg:grid grid-cols-12 items-center px-8 py-6">
                                <div className="col-span-3">
                                    <p className="font-bold text-primary">{partner.name}</p>
                                    <p className="text-xs text-secondary mt-0.5">{partner.business_name || 'N/A'}</p>
                                </div>

                                <div className="col-span-2 text-sm text-secondary pr-4">
                                    <span className="line-clamp-2">{(partner as any).address || 'N/A'}</span>
                                </div>

                                <div className="col-span-2 flex justify-center">
                                    <button
                                        onClick={() => handleToggleStatus(partner)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${partner.is_active ? 'bg-green-500' : isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${partner.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <button
                                        onClick={() => handleToggleLogin(partner)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${partner.can_login ? 'bg-green-500' : isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${partner.can_login ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                <div className="col-span-2 text-sm text-secondary">
                                    <div className="flex flex-wrap gap-1">
                                        {partner.hives && partner.hives.length > 0 ? (
                                            partner.hives.map((h: any) => h.name).join(', ')
                                        ) : (
                                            <span className="text-secondary/60">Not assigned</span>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-1 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-800'}`}>
                                        {partner.active_keys_count || 0}
                                    </span>
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <button
                                        onClick={() => handleEditClick(partner)}
                                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-zinc-500 hover:text-bumble-yellow hover:bg-bumble-yellow/10' : 'text-gray-400 hover:text-bumble-yellow-dark hover:bg-bumble-yellow/10'}`}
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="lg:hidden p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-primary text-lg">{partner.name}</p>
                                        <p className="text-sm text-secondary">{partner.business_name || 'N/A'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(partner)}
                                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-zinc-500 hover:text-bumble-yellow hover:bg-bumble-yellow/10' : 'text-gray-400 hover:text-bumble-yellow-dark hover:bg-bumble-yellow/10'}`}
                                    >
                                        <PencilSquareIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="h-5 w-5 text-secondary/60 shrink-0 mt-0.5" />
                                        <p className="text-sm text-secondary">{(partner as any).address || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-default">
                                        <div>
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Status</p>
                                            <button
                                                onClick={() => handleToggleStatus(partner)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${partner.is_active ? 'bg-green-500' : isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${partner.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Keys</p>
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-800'}`}>
                                                {partner.active_keys_count || 0} Keys
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-default">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Can Login</p>
                                        <button
                                            onClick={() => handleToggleLogin(partner)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${partner.can_login ? 'bg-green-500' : isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${partner.can_login ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-default">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Assigned BumbleHive</p>
                                        <p className="text-sm text-secondary">
                                            {partner.hives && partner.hives.length > 0 ? (
                                                partner.hives.map((h: any) => h.name).join(', ')
                                            ) : (
                                                <span className="text-secondary/60">Not assigned</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {lastPage > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-primary border border-default rounded-2xl">
                    <p className="text-sm font-medium text-secondary">
                        Showing {rangeFrom}–{rangeTo} of {total}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-bold rounded-xl border border-default disabled:opacity-40 hover:border-bumble-yellow"
                        >
                            Prev
                        </button>

                        {Array.from({ length: lastPage }).map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 text-sm font-bold rounded-xl border ${
                                        page === currentPage
                                            ? 'bg-bumble-yellow text-bumble-black border-bumble-yellow'
                                            : 'border-default hover:border-bumble-yellow'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            disabled={currentPage === lastPage}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-bold rounded-xl border border-default disabled:opacity-40 hover:border-bumble-yellow"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerList;
