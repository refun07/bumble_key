import { useEffect, useState, Fragment } from 'react';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import { useTheme } from '../../store/theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    SignalIcon,
    BuildingStorefrontIcon,
    RectangleGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

interface Hive {
    id: number;
    name: string;
}

interface NfcFob {
    id: number;
    fob_name: string;
    fob_uid: string;
    fob_serial: string;
    status: string;
    assigned_hive_id: number | null;
    assigned_slot: string | null;
    hive?: {
        id: number;
        name: string;
    };
}

const NfcFobList = () => {
    const { showToast } = useToast();
    const { isDarkMode } = useTheme();
    const [fobs, setFobs] = useState<NfcFob[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [hiveStatus, setHiveStatus] = useState('all');
    const [slotStatus, setSlotStatus] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFob, setSelectedFob] = useState<NfcFob | null>(null);
    const [formData, setFormData] = useState({
        fob_name: '',
        fob_uid: '',
        assigned_hive_id: '' as string | number,
        assigned_slot: '',
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [hiveSearch, setHiveSearch] = useState('');

    useEffect(() => {
        fetchFobs();
    }, [search, hiveStatus, slotStatus]);

    useEffect(() => {
        fetchHives();
    }, []);

    const fetchFobs = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/nfc-fobs', {
                params: {
                    search,
                    hive_status: hiveStatus === 'all' ? '' : hiveStatus,
                    slot_status: slotStatus === 'all' ? '' : slotStatus
                }
            });
            setFobs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch NFC fobs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHives = async () => {
        try {
            const response = await api.get('/admin/hives', {
                params: { paginate: 0 } // Assuming paginate=0 returns all or use a large limit
            });
            // The response structure might be different depending on pagination
            const hiveData = response.data.data || response.data;
            setHives(Array.isArray(hiveData) ? hiveData : []);
        } catch (error) {
            console.error('Failed to fetch hives', error);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setHiveStatus('all');
        setSlotStatus('all');
    };

    const handleAddClick = () => {
        setSelectedFob(null);
        setFormData({
            fob_name: '',
            fob_uid: '',
            assigned_hive_id: '',
            assigned_slot: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEditClick = (fob: NfcFob) => {
        setSelectedFob(fob);
        setFormData({
            fob_name: fob.fob_name,
            fob_uid: fob.fob_uid,
            assigned_hive_id: fob.assigned_hive_id || '',
            assigned_slot: fob.assigned_slot || '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        try {
            const data = {
                ...formData,
                assigned_hive_id: formData.assigned_hive_id === '' ? null : formData.assigned_hive_id,
                assigned_slot: formData.assigned_slot === '' ? null : formData.assigned_slot,
            };

            if (selectedFob) {
                await api.put(`/admin/nfc-fobs/${selectedFob.id}`, data);
                showToast('Fob updated successfully', 'success');
            } else {
                await api.post('/admin/nfc-fobs', data);
                showToast('Fob created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchFobs();
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                showToast('Failed to save fob', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const filteredHives = hives.filter(hive =>
        hive.name.toLowerCase().includes(hiveSearch.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">NFC Fobs</h2>
                <Button
                    variant="bumble"
                    className="flex items-center gap-2 px-6 py-2.5"
                    onClick={handleAddClick}
                >
                    <PlusIcon className="h-5 w-5 stroke-[3]" />
                    <span>Add New Fob</span>
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center bg-primary p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-default shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className={`block w-full pl-11 pr-4 py-2.5 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow sm:text-sm transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                        placeholder="Search BumbleTags"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 sm:flex-none">
                        <span className="text-sm font-bold text-secondary whitespace-nowrap">Hive</span>
                        <select
                            className={`block w-full sm:w-40 pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow rounded-xl border transition-all font-medium ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                            value={hiveStatus}
                            onChange={(e) => setHiveStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="assigned">Assigned</option>
                            <option value="unassigned">Unassigned</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 flex-1 sm:flex-none">
                        <span className="text-sm font-bold text-secondary whitespace-nowrap">Slot</span>
                        <select
                            className={`block w-full sm:w-40 pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow rounded-xl border transition-all font-medium ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                            value={slotStatus}
                            onChange={(e) => setSlotStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="assigned">Assigned</option>
                            <option value="unassigned">Unassigned</option>
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        className={`flex items-center justify-center gap-2 border-default text-secondary transition-all rounded-xl px-6 py-2.5 font-bold ${isDarkMode ? 'hover:bg-zinc-800 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <ArrowPathIcon className="h-4 w-4 stroke-[2.5]" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* List Header - Hidden on Mobile */}
            <div className="hidden lg:grid grid-cols-5 px-8 py-3 text-xs font-bold text-secondary uppercase tracking-widest">
                <div className="col-span-1">Fob Name</div>
                <div className="col-span-1">Fob UID</div>
                <div className="col-span-1">Assigned Hive</div>
                <div className="col-span-1">Assigned Slot</div>
                <div className="col-span-1"></div>
            </div>

            {/* Fobs List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <SignalIcon className="h-6 w-6 text-gray-300" />
                            </div>
                            <div className="h-4 w-48 bg-gray-100 rounded-full"></div>
                        </div>
                    </div>
                ) : fobs.length === 0 ? (
                    <div className="text-center py-20 text-secondary bg-primary rounded-3xl border border-default shadow-sm italic font-medium">
                        No NFC fobs found matching your criteria.
                    </div>
                ) : (
                    fobs.map((fob) => (
                        <div
                            key={fob.id}
                            className="bg-primary rounded-3xl lg:rounded-[32px] shadow-sm border border-default hover:border-bumble-yellow hover:shadow-md transition-all duration-200 overflow-hidden group"
                        >
                            {/* Desktop Layout */}
                            <div className="hidden lg:grid grid-cols-5 items-center px-8 py-6">
                                <div className="col-span-1 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-zinc-800 group-hover:bg-bumble-yellow/10' : 'bg-gray-50 group-hover:bg-bumble-yellow/10'}`}>
                                        <SignalIcon className={`h-6 w-6 transition-colors ${isDarkMode ? 'text-zinc-500 group-hover:text-bumble-yellow' : 'text-gray-400 group-hover:text-bumble-black'}`} />
                                    </div>
                                    <p className="font-bold text-primary">{fob.fob_name}</p>
                                </div>

                                <div className="col-span-1">
                                    <span className={`font-mono text-sm font-bold px-3 py-1 rounded-lg border ${isDarkMode ? 'text-zinc-300 bg-zinc-800 border-zinc-700' : 'text-gray-600 bg-gray-50 border-gray-100'}`}>
                                        {fob.fob_uid}
                                    </span>
                                </div>

                                <div className="col-span-1 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                                        <BuildingStorefrontIcon className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
                                    </div>
                                    <p className={`text-sm font-bold ${fob.hive ? 'text-primary' : 'text-secondary/40 italic'}`}>
                                        {fob.hive?.name || 'Not Assigned'}
                                    </p>
                                </div>

                                <div className="col-span-1 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                                        <RectangleGroupIcon className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
                                    </div>
                                    <p className={`text-sm font-bold ${fob.assigned_slot ? 'text-primary' : 'text-secondary/40 italic'}`}>
                                        {fob.assigned_slot || 'Not Assigned'}
                                    </p>
                                </div>

                                <div className="col-span-1 flex items-center justify-end">
                                    <button
                                        onClick={() => handleEditClick(fob)}
                                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-zinc-500 hover:text-bumble-yellow hover:bg-bumble-yellow/10' : 'text-gray-400 hover:text-bumble-yellow-dark hover:bg-bumble-yellow/10'}`}
                                        title="Edit Fob"
                                    >
                                        <PencilSquareIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="lg:hidden p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <SignalIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{fob.fob_name}</p>
                                            <span className="font-mono text-xs font-bold text-gray-500">
                                                {fob.fob_uid}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(fob)}
                                        className="p-2 text-gray-400 hover:text-bumble-yellow-dark hover:bg-bumble-yellow/10 rounded-xl transition-all"
                                    >
                                        <PencilSquareIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned Hive</p>
                                        <div className="flex items-center gap-2">
                                            <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                                            <p className={`text-sm font-bold ${fob.hive ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                {fob.hive?.name || 'Not Assigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned Slot</p>
                                        <div className="flex items-center gap-2">
                                            <RectangleGroupIcon className="h-4 w-4 text-gray-400" />
                                            <p className={`text-sm font-bold ${fob.assigned_slot ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                {fob.assigned_slot || 'Not Assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className={`fixed inset-0 backdrop-blur-sm transition-opacity ${isDarkMode ? 'bg-zinc-950/80' : 'bg-gray-500/75'}`} />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className={`relative transform overflow-hidden rounded-3xl px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="absolute right-0 top-0 pr-6 pt-6">
                                        <button
                                            type="button"
                                            className={`rounded-full p-2 focus:outline-none transition-all ${isDarkMode ? 'bg-zinc-800 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-700' : 'bg-gray-50 text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="text-left">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-primary">
                                                Add/Edit Fob
                                            </Dialog.Title>
                                            <form onSubmit={handleSave} className="mt-10 space-y-10">
                                                {/* Fob Details Section */}
                                                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Fob Details
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <Input
                                                            label="Fob Name/ID"
                                                            placeholder="BumbleTag001"
                                                            value={formData.fob_name}
                                                            onChange={(e) => setFormData({ ...formData, fob_name: e.target.value })}
                                                            error={errors.fob_name?.[0]}
                                                            required
                                                            className="rounded-xl border-gray-200 py-3"
                                                        />
                                                        <div className="space-y-2">
                                                            <Input
                                                                label="Fob UID"
                                                                placeholder="ABC001"
                                                                value={formData.fob_uid}
                                                                onChange={(e) => setFormData({ ...formData, fob_uid: e.target.value })}
                                                                error={errors.fob_uid?.[0]}
                                                                required
                                                                className={`rounded-xl py-3 ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'}`}
                                                            />
                                                            <p className={`text-xs font-medium italic ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                                                                Please use your app to scan the fob to register the UID
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Assign Section */}
                                                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Assign Fob to a Box
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-bold text-secondary">Assign To Box</label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow sm:text-sm transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                                                    placeholder="Search Box"
                                                                    value={hiveSearch}
                                                                    onChange={(e) => setHiveSearch(e.target.value)}
                                                                />
                                                            </div>
                                                            {hiveSearch && (
                                                                <div className={`mt-2 max-h-40 overflow-y-auto border rounded-xl shadow-sm divide-y ${isDarkMode ? 'bg-zinc-800 border-zinc-700 divide-zinc-700' : 'bg-white border-gray-100 divide-gray-50'}`}>
                                                                    {filteredHives.length > 0 ? (
                                                                        filteredHives.map(hive => (
                                                                            <button
                                                                                key={hive.id}
                                                                                type="button"
                                                                                className={`w-full text-left px-4 py-3 text-sm transition-colors font-medium ${formData.assigned_hive_id === hive.id ? (isDarkMode ? 'bg-bumble-yellow/10 text-bumble-yellow' : 'bg-yellow-50 text-bumble-black') : (isDarkMode ? 'text-zinc-300 hover:bg-zinc-700' : 'text-gray-700 hover:bg-gray-50')}`}
                                                                                onClick={() => {
                                                                                    setFormData({ ...formData, assigned_hive_id: hive.id });
                                                                                    setHiveSearch(hive.name);
                                                                                }}
                                                                            >
                                                                                {hive.name}
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-4 py-3 text-sm text-secondary italic">No boxes found</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {errors.assigned_hive_id && <p className="mt-1 text-sm text-red-600">{errors.assigned_hive_id[0]}</p>}
                                                        </div>

                                                        <Input
                                                            label="Assign To Slot No"
                                                            placeholder="02"
                                                            value={formData.assigned_slot}
                                                            onChange={(e) => setFormData({ ...formData, assigned_slot: e.target.value })}
                                                            error={errors.assigned_slot?.[0]}
                                                            className={`rounded-xl py-3 ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${isDarkMode ? 'shadow-black/20' : 'shadow-gray-200'}`}
                                                        isLoading={isSaving}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default NfcFobList;
