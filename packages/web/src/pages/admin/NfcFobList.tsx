import { useEffect, useState, Fragment } from 'react';
import api from '../../services/api';
import { useToast } from '../../store/toast';
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
            <div className="flex flex-col lg:flex-row gap-6 items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow sm:text-sm transition-all"
                        placeholder="Search BumbleTags"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Hive Status</span>
                        <select
                            className="block w-full sm:w-44 pl-4 pr-10 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow rounded-xl border bg-white transition-all font-medium text-gray-700"
                            value={hiveStatus}
                            onChange={(e) => setHiveStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="assigned">Hive Assigned</option>
                            <option value="unassigned">Not Assigned</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Slot Status</span>
                        <select
                            className="block w-full sm:w-44 pl-4 pr-10 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow rounded-xl border bg-white transition-all font-medium text-gray-700"
                            value={slotStatus}
                            onChange={(e) => setSlotStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="assigned">Slot Assigned</option>
                            <option value="unassigned">Not Assigned</option>
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <ArrowPathIcon className="h-4 w-4 stroke-[2.5]" />
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* List Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-5 px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
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
                    <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm italic font-medium">
                        No NFC fobs found matching your criteria.
                    </div>
                ) : (
                    fobs.map((fob) => (
                        <div
                            key={fob.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-bumble-yellow/30 transition-all duration-300 overflow-hidden group"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-5 items-center px-8 py-6 gap-4 md:gap-0">
                                {/* Fob Name */}
                                <div className="col-span-1 flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-bumble-yellow/10 transition-colors">
                                        <SignalIcon className="h-6 w-6 text-gray-400 group-hover:text-bumble-black transition-colors" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{fob.fob_name}</p>
                                        <p className="text-xs text-gray-400 md:hidden font-bold uppercase tracking-wider">Fob Name</p>
                                    </div>
                                </div>

                                {/* Fob UID */}
                                <div className="col-span-1">
                                    <p className="md:hidden text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Fob UID</p>
                                    <span className="font-mono text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                        {fob.fob_uid}
                                    </span>
                                </div>

                                {/* Assigned Hive */}
                                <div className="col-span-1 flex items-center gap-3">
                                    <div className="hidden md:block bg-gray-50 p-2 rounded-lg">
                                        <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="md:hidden text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Assigned Hive</p>
                                        <p className={`text-sm font-bold ${fob.hive ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                            {fob.hive?.name || 'Not Assigned'}
                                        </p>
                                    </div>
                                </div>

                                {/* Assigned Slot */}
                                <div className="col-span-1 flex items-center gap-3">
                                    <div className="hidden md:block bg-gray-50 p-2 rounded-lg">
                                        <RectangleGroupIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="md:hidden text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Assigned Slot</p>
                                        <p className={`text-sm font-bold ${fob.assigned_slot ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                            {fob.assigned_slot || 'Not Assigned'}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex items-center justify-end">
                                    <button
                                        onClick={() => handleEditClick(fob)}
                                        className="p-3 text-gray-400 hover:text-bumble-black hover:bg-bumble-yellow rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-bumble-yellow/20"
                                        title="Edit Fob"
                                    >
                                        <PencilSquareIcon className="h-6 w-6" />
                                    </button>
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
                        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10">
                                    <div className="absolute right-0 top-0 pr-6 pt-6">
                                        <button
                                            type="button"
                                            className="rounded-full bg-gray-50 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-all"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="text-left">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                                                Add/Edit Fob
                                            </Dialog.Title>
                                            <form onSubmit={handleSave} className="mt-10 space-y-10">
                                                {/* Fob Details Section */}
                                                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
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
                                                                className="rounded-xl border-gray-200 py-3"
                                                            />
                                                            <p className="text-xs text-gray-400 font-medium italic">
                                                                Please use your app to scan the fob to register the UID
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Assign Section */}
                                                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Assign Fob to a Box
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-bold text-gray-700">Assign To Box</label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow sm:text-sm transition-all"
                                                                    placeholder="Search Box"
                                                                    value={hiveSearch}
                                                                    onChange={(e) => setHiveSearch(e.target.value)}
                                                                />
                                                            </div>
                                                            {hiveSearch && (
                                                                <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-50">
                                                                    {filteredHives.length > 0 ? (
                                                                        filteredHives.map(hive => (
                                                                            <button
                                                                                key={hive.id}
                                                                                type="button"
                                                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium ${formData.assigned_hive_id === hive.id ? 'bg-yellow-50 text-bumble-black' : 'text-gray-700'}`}
                                                                                onClick={() => {
                                                                                    setFormData({ ...formData, assigned_hive_id: hive.id });
                                                                                    setHiveSearch(hive.name);
                                                                                }}
                                                                            >
                                                                                {hive.name}
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-4 py-3 text-sm text-gray-400 italic">No boxes found</div>
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
                                                            className="rounded-xl border-gray-200 py-3"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <Button
                                                        type="submit"
                                                        variant="secondary"
                                                        className="w-full py-4 rounded-xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl transition-all"
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
