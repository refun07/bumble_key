import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { MagnifyingGlassIcon, PencilIcon, XMarkIcon, PowerIcon, PlusIcon, ArrowPathIcon, CheckIcon, MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { TableShimmer } from '../../components/common/Shimmer';
import { useToast } from '../../store/toast';

interface Hive {
    id: number;
    name: string;
    status: string;
    location_name: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    total_cells: number;
    available_cells_count: number;
    partner_id?: number;
    partner?: {
        id: number;
        name: string;
        business_name?: string;
    };
    photos?: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BoxList = () => {
    const { showToast } = useToast();
    const [hives, setHives] = useState<Hive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editPartnerSearch, setEditPartnerSearch] = useState('');

    // Add Box State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [partnerSearch, setPartnerSearch] = useState('');
    const [newBox, setNewBox] = useState({
        name: '',
        location_name: '',
        address: '',
        city: '',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278,
        total_cells: 10,
        partner_id: '',
        image: null as File | null
    });

    useEffect(() => {
        fetchHives();
        fetchPartners();
    }, [search, statusFilter, availabilityFilter, sortBy, sortOrder]);

    const fetchPartners = async () => {
        try {
            const response = await api.get('/admin/partners');
            setPartners(response.data.data);
        } catch (error) {
            console.error('Failed to fetch partners', error);
        }
    };

    const fetchHives = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/hives', {
                params: {
                    search,
                    status: statusFilter,
                    availability: availabilityFilter,
                    sort_by: sortBy,
                    sort_order: sortOrder
                }
            });
            setHives(response.data.data);
        } catch (error) {
            console.error('Failed to fetch hives', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (hive: Hive) => {
        setSelectedHive(hive);
        setEditPartnerSearch(hive.partner?.name || '');
        setEditImage(null);
        setErrors({});
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHive) return;

        setIsSaving(true);
        setErrors({});

        const formData = new FormData();
        formData.append('_method', 'PUT');

        // Append basic fields
        const fields = ['name', 'location_name', 'address', 'city', 'country', 'latitude', 'longitude', 'partner_id', 'status'];
        fields.forEach(field => {
            const value = (selectedHive as any)[field];
            if (value !== undefined && value !== null) {
                formData.append(field, value.toString());
            }
        });

        if (editImage) {
            formData.append('image', editImage);
        }

        try {
            await api.post(`/admin/hives/${selectedHive.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast('Box updated successfully', 'success');
            setIsEditModalOpen(false);
            fetchHives();
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                console.error('Failed to update hive', error);
                showToast('Failed to update box', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddBox = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        const formData = new FormData();
        Object.entries(newBox).forEach(([key, value]) => {
            if (value !== null) {
                formData.append(key, value as any);
            }
        });

        try {
            await api.post('/admin/hives', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast('Box created successfully', 'success');
            setIsAddModalOpen(false);
            setNewBox({
                name: '',
                location_name: '',
                address: '',
                city: '',
                country: 'UK',
                latitude: 51.5074,
                longitude: -0.1278,
                total_cells: 10,
                partner_id: '',
                image: null
            });
            setPartnerSearch('');
            fetchHives();
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                console.error('Failed to add box', error);
                showToast('Failed to add box', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (hive: Hive) => {
        const newStatus = hive.status === 'disabled' ? 'idle' : 'disabled';
        try {
            await api.put(`/admin/hives/${hive.id}`, { status: newStatus });
            showToast(`Box ${newStatus === 'disabled' ? 'disabled' : 'enabled'} successfully`, 'success');
            fetchHives();
        } catch (error: any) {
            if (error.response?.status === 422) {
                showToast(Object.values(error.response.data.errors).flat().join('\n'), 'error');
            } else {
                console.error('Failed to toggle status', error);
                showToast('Failed to update box status', 'error');
            }
        }
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setAvailabilityFilter('');
        setSortBy('name');
        setSortOrder('asc');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">BumbleHive/Boxes</h2>
                <Button
                    variant="bumble"
                    className="flex items-center gap-2 px-6 py-2.5"
                    onClick={() => {
                        setErrors({});
                        setIsAddModalOpen(true);
                    }}
                >
                    <PlusIcon className="h-5 w-5 stroke-[3]" />
                    <span>Add New Box</span>
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-blue-400 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search BumbleHive"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <select
                        className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="assigned">Assigned</option>
                        <option value="idle">Idle</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Availability</span>
                    <select
                        className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                        <option value="">Slots Available</option>
                        <option value="available">Available</option>
                        <option value="full">Full</option>
                    </select>
                </div>

                <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    Reset Filters
                </Button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div
                    className="col-span-1 cursor-pointer hover:text-gray-700 flex items-center gap-1"
                    onClick={() => toggleSort('name')}
                >
                    Box Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div
                    className="col-span-1 cursor-pointer hover:text-gray-700 flex items-center gap-1"
                    onClick={() => toggleSort('status')}
                >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-2">Assigned Partner</div>
                <div
                    className="col-span-1 text-right pr-12 cursor-pointer hover:text-gray-700 flex items-center justify-end gap-1"
                    onClick={() => toggleSort('available_cells_count')}
                >
                    Available Slots {sortBy === 'available_cells_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Boxes List */}
            <div className="space-y-4">
                {isLoading ? (
                    <TableShimmer rows={6} cols={5} />
                ) : hives.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
                        No boxes found matching your criteria.
                    </div>
                ) : (
                    hives.map((hive) => (
                        <div key={hive.id} className={`bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${hive.status === 'disabled' ? 'opacity-60 grayscale' : ''}`}>
                            <div className="grid grid-cols-6 items-center px-6 py-4">
                                <div className="col-span-1 font-medium text-gray-900">
                                    {hive.name}
                                </div>
                                <div className="col-span-1">
                                    <span className={`text-sm ${hive.status === 'assigned' ? 'text-blue-600 font-semibold' : hive.status === 'disabled' ? 'text-red-500' : 'text-gray-400'}`}>
                                        {hive.status.charAt(0).toUpperCase() + hive.status.slice(1)}
                                    </span>
                                </div>
                                <div className="col-span-2 text-sm text-gray-600 truncate">
                                    {hive.partner?.name || 'No partner assigned'}
                                </div>
                                <div className="col-span-1 text-right pr-12">
                                    <span className="text-sm text-gray-600">
                                        {hive.available_cells_count}/{hive.total_cells}
                                    </span>
                                </div>
                                <div className="col-span-1 flex items-center justify-end gap-4">
                                    {hive.status === 'disabled' ? (
                                        <button
                                            onClick={() => toggleStatus(hive)}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors shadow-sm"
                                            title="Enable Box"
                                        >
                                            <PowerIcon className="h-4 w-4" />
                                            ENABLE
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => toggleStatus(hive)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Disable Box"
                                        >
                                            <PowerIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(hive)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            <Transition.Root show={isEditModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsEditModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10">
                                    <div className="absolute right-0 top-0 hidden pr-6 pt-6 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-full bg-gray-100 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none transition-all"
                                            onClick={() => setIsEditModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                                                Edit BumbleHive Box
                                            </Dialog.Title>
                                            <form onSubmit={handleUpdate} className="mt-10 space-y-10">
                                                {/* Box Details Section */}
                                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Box Details
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Input
                                                                label="Box Name/ID"
                                                                placeholder="BumbleHive001"
                                                                value={selectedHive?.name || ''}
                                                                onChange={(e) => setSelectedHive(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                                error={errors.name?.[0]}
                                                                required
                                                            />
                                                            <Input
                                                                label="Total Slots"
                                                                type="number"
                                                                placeholder="20"
                                                                value={selectedHive?.total_cells || 0}
                                                                onChange={(e) => setSelectedHive(prev => prev ? { ...prev, total_cells: parseInt(e.target.value) } : null)}
                                                                error={errors.total_cells?.[0]}
                                                                required
                                                                disabled // Usually you don't want to change total slots after creation
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">Box Location Image</label>
                                                            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl bg-white hover:border-bumble-yellow hover:bg-yellow-50/30 transition-all cursor-pointer relative group">
                                                                <div className="space-y-2 text-center">
                                                                    <PhotoIcon className="mx-auto h-14 w-14 text-gray-400 group-hover:text-bumble-yellow transition-colors" />
                                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                                        <label className="relative cursor-pointer rounded-md font-bold text-bumble-black hover:text-gray-700 focus-within:outline-none">
                                                                            <span>Upload a new file</span>
                                                                            <input
                                                                                type="file"
                                                                                className="sr-only"
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) setEditImage(file);
                                                                                }}
                                                                            />
                                                                        </label>
                                                                        <p className="pl-1">or drag and drop</p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 font-medium">PNG, JPG, GIF up to 2MB</p>
                                                                </div>
                                                                {(editImage || (selectedHive?.photos && selectedHive.photos.length > 0)) && (
                                                                    <div className="absolute inset-0 bg-white p-3 rounded-xl shadow-inner">
                                                                        <img
                                                                            src={editImage ? URL.createObjectURL(editImage) : `${API_URL}/storage/${selectedHive?.photos?.[0]}`}
                                                                            alt="Preview"
                                                                            className="h-full w-full object-cover rounded-lg"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                                                            onClick={() => {
                                                                                if (editImage) setEditImage(null);
                                                                                // If it's an existing photo, we might need a way to delete it, but for now just hide it if we upload a new one
                                                                            }}
                                                                        >
                                                                            <XMarkIcon className="h-4 w-4 stroke-[3]" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {errors.image && <p className="mt-1 text-sm text-red-600 font-medium">{errors.image[0]}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Assign Box Section */}
                                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Assign Box
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="relative">
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search partners by name or business..."
                                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow transition-all"
                                                                    value={editPartnerSearch}
                                                                    onChange={(e) => setEditPartnerSearch(e.target.value)}
                                                                />
                                                                <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
                                                            </div>

                                                            {editPartnerSearch && (
                                                                <div className="absolute z-10 mt-2 w-full border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto bg-white divide-y divide-gray-50">
                                                                    {partners
                                                                        .filter(p =>
                                                                            p.name.toLowerCase().includes(editPartnerSearch.toLowerCase()) ||
                                                                            p.business_name?.toLowerCase().includes(editPartnerSearch.toLowerCase())
                                                                        )
                                                                        .map(partner => (
                                                                            <div
                                                                                key={partner.id}
                                                                                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-yellow-50/50 transition-colors ${selectedHive?.partner_id === partner.id ? 'bg-yellow-50 border-l-4 border-bumble-yellow' : ''}`}
                                                                                onClick={() => {
                                                                                    setSelectedHive(prev => prev ? { ...prev, partner_id: partner.id } : null);
                                                                                    setEditPartnerSearch(partner.name);
                                                                                }}
                                                                            >
                                                                                <div className="bg-gray-100 p-2 rounded-lg">
                                                                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-gray-900">{partner.name}</p>
                                                                                    <p className="text-xs text-gray-500 font-medium">{partner.business_name || 'No business name'}</p>
                                                                                </div>
                                                                                {selectedHive?.partner_id === partner.id && (
                                                                                    <CheckIcon className="ml-auto h-5 w-5 text-bumble-yellow stroke-[3]" />
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    {partners.filter(p => p.name.toLowerCase().includes(editPartnerSearch.toLowerCase()) || p.business_name?.toLowerCase().includes(editPartnerSearch.toLowerCase())).length === 0 && (
                                                                        <div className="px-5 py-4 text-sm text-gray-500 text-center italic">No partners found</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {errors.partner_id && <p className="mt-1 text-sm text-red-600 font-medium">{errors.partner_id[0]}</p>}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Input
                                                                label="Location Name"
                                                                placeholder="e.g. King's Cross Station"
                                                                value={selectedHive?.location_name || ''}
                                                                onChange={(e) => setSelectedHive(prev => prev ? { ...prev, location_name: e.target.value } : null)}
                                                                error={errors.location_name?.[0]}
                                                                required
                                                            />
                                                            <Input
                                                                label="City"
                                                                placeholder="e.g. London"
                                                                value={selectedHive?.city || ''}
                                                                onChange={(e) => setSelectedHive(prev => prev ? { ...prev, city: e.target.value } : null)}
                                                                error={errors.city?.[0]}
                                                                required
                                                            />
                                                        </div>
                                                        <Input
                                                            label="Address"
                                                            placeholder="Full street address"
                                                            value={selectedHive?.address || ''}
                                                            onChange={(e) => setSelectedHive(prev => prev ? { ...prev, address: e.target.value } : null)}
                                                            error={errors.address?.[0]}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1 py-4 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all order-2 sm:order-1"
                                                        onClick={() => setIsEditModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className="flex-[2] py-4 shadow-lg shadow-gray-200 order-1 sm:order-2"
                                                        isLoading={isSaving}
                                                    >
                                                        Save Changes
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

            {/* Add Box Modal */}
            <Transition.Root show={isAddModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsAddModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10">
                                    <div className="absolute right-0 top-0 hidden pr-6 pt-6 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-full bg-gray-100 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none transition-all"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                                                Add New BumbleHive Box
                                            </Dialog.Title>
                                            <form onSubmit={handleAddBox} className="mt-10 space-y-10">
                                                {/* Box Details Section */}
                                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Box Details
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Input
                                                                label="Box Name/ID"
                                                                placeholder="BumbleHive001"
                                                                value={newBox.name}
                                                                onChange={(e) => setNewBox(prev => ({ ...prev, name: e.target.value }))}
                                                                error={errors.name?.[0]}
                                                                required
                                                            />
                                                            <Input
                                                                label="Total Slots"
                                                                type="number"
                                                                placeholder="20"
                                                                value={newBox.total_cells}
                                                                onChange={(e) => setNewBox(prev => ({ ...prev, total_cells: parseInt(e.target.value) }))}
                                                                error={errors.total_cells?.[0]}
                                                                required
                                                            />
                                                            <div className="space-y-1">
                                                                <label className="block text-sm font-medium text-gray-700">Box Location Image</label>
                                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-bumble-yellow transition-colors cursor-pointer relative">
                                                                    <div className="space-y-1 text-center">
                                                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                                        <div className="flex text-sm text-gray-600">
                                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                                                <span>Upload a file</span>
                                                                                <input
                                                                                    type="file"
                                                                                    className="sr-only"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (file) setNewBox(prev => ({ ...prev, image: file }));
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                            <p className="pl-1">or drag and drop</p>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                                                    </div>
                                                                    {newBox.image && (
                                                                        <div className="absolute inset-0 bg-white p-2 rounded-md">
                                                                            <img
                                                                                src={URL.createObjectURL(newBox.image)}
                                                                                alt="Preview"
                                                                                className="h-full w-full object-cover rounded"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                                                onClick={() => setNewBox(prev => ({ ...prev, image: null }))}
                                                                            >
                                                                                <XMarkIcon className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Assign Box Section */}
                                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Assign Box
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="relative">
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search partners by name or business..."
                                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow transition-all"
                                                                    value={partnerSearch}
                                                                    onChange={(e) => setPartnerSearch(e.target.value)}
                                                                />
                                                                <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
                                                            </div>

                                                            {partnerSearch && (
                                                                <div className="absolute z-10 mt-2 w-full border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto bg-white divide-y divide-gray-50">
                                                                    {partners
                                                                        .filter(p =>
                                                                            p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                                                                            p.business_name?.toLowerCase().includes(partnerSearch.toLowerCase())
                                                                        )
                                                                        .map(partner => (
                                                                            <div
                                                                                key={partner.id}
                                                                                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-yellow-50/50 transition-colors ${newBox.partner_id === partner.id.toString() ? 'bg-yellow-50 border-l-4 border-bumble-yellow' : ''}`}
                                                                                onClick={() => {
                                                                                    setNewBox(prev => ({ ...prev, partner_id: partner.id.toString() }));
                                                                                    setPartnerSearch(partner.name);
                                                                                }}
                                                                            >
                                                                                <div className="bg-gray-100 p-2 rounded-lg">
                                                                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-gray-900">{partner.name}</p>
                                                                                    <p className="text-xs text-gray-500 font-medium">{partner.business_name || 'No business name'}</p>
                                                                                </div>
                                                                                {newBox.partner_id === partner.id.toString() && (
                                                                                    <CheckIcon className="ml-auto h-5 w-5 text-bumble-yellow stroke-[3]" />
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    {partners.filter(p => p.name.toLowerCase().includes(partnerSearch.toLowerCase()) || p.business_name?.toLowerCase().includes(partnerSearch.toLowerCase())).length === 0 && (
                                                                        <div className="px-5 py-4 text-sm text-gray-500 text-center italic">No partners found</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {errors.partner_id && <p className="mt-1 text-sm text-red-600">{errors.partner_id[0]}</p>}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Input
                                                                label="Location Name"
                                                                placeholder="e.g. King's Cross Station"
                                                                value={newBox.location_name}
                                                                onChange={(e) => setNewBox(prev => ({ ...prev, location_name: e.target.value }))}
                                                                error={errors.location_name?.[0]}
                                                                required
                                                            />
                                                            <Input
                                                                label="City"
                                                                placeholder="e.g. London"
                                                                value={newBox.city}
                                                                onChange={(e) => setNewBox(prev => ({ ...prev, city: e.target.value }))}
                                                                error={errors.city?.[0]}
                                                                required
                                                            />
                                                        </div>
                                                        <Input
                                                            label="Address"
                                                            placeholder="Full street address"
                                                            value={newBox.address}
                                                            onChange={(e) => setNewBox(prev => ({ ...prev, address: e.target.value }))}
                                                            error={errors.address?.[0]}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1 py-4 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all order-2 sm:order-1"
                                                        onClick={() => setIsAddModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className="flex-[2] py-4 shadow-lg shadow-gray-200 order-1 sm:order-2"
                                                        isLoading={isSaving}
                                                    >
                                                        Confirm & Create Box
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

export default BoxList;
