import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { MagnifyingGlassIcon, PencilIcon, XMarkIcon, PowerIcon, PlusIcon, ArrowPathIcon, CheckIcon, MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { TableShimmer } from '../../components/common/Shimmer';
import { useToast } from '../../store/toast';
import { useTheme } from '../../store/theme';
import LocationPicker from '../../components/maps/LocationPicker';
import { useDebounce } from '../../hooks/useDebounce';

interface NewBox {
    name: string;
    location_name: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    total_cells: number;
    partner_id: string;
    image: File | null;
}


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


const APP_URL = import.meta.env.VITE_APP_URL ;
const DEFAULT_COUNTRY = import.meta.env.VITE_DEFAULT_COUNTRY || 'Australia';
const BoxList = () => {
    const { showToast } = useToast();
    const { isDarkMode } = useTheme();
    const [hives, setHives] = useState<Hive[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [sortBy, setSortBy] = useState('updated_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editPartnerSearch, setEditPartnerSearch] = useState('');


    const [removeEditImage, setRemoveEditImage] = useState(false);
    const [showEditMap, setShowEditMap] = useState(false);

 




    const [showMap, setShowMap] = useState(false);

    // Add Box State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [partnerSearch, setPartnerSearch] = useState('');
    const [newBox, setNewBox] = useState<NewBox>({
        name: '',
        location_name: '',
        address: '',
        city: '',
        country: DEFAULT_COUNTRY,
        latitude: -37.8136,
        longitude: 144.9631,
        total_cells: 10,
        partner_id: '',
        image: null
    });



    

    useEffect(() => {
        fetchHives(1);
        fetchPartners();
    }, [search, statusFilter, availabilityFilter, sortBy, sortOrder]);


    const debouncedAddress = useDebounce(newBox.address, 700);
    const debouncedCity = useDebounce(newBox.city, 700);

    useEffect(() => {
        if (!debouncedAddress || !debouncedCity) return;

        geocodeAddress();
    }, [debouncedAddress, debouncedCity]);

    const fetchPartners = async () => {
        try {
            const response = await api.get('/admin/partners');
            setPartners(response.data.data);
        } catch (error) {
            console.error('Failed to fetch partners', error);
        }
    };

 const fetchHives = async (page = 1) => {
    setIsLoading(true);
    try {
        const response = await api.get('/admin/hives', {
            params: {
                page,
                search,
                status: statusFilter,
                availability: availabilityFilter,
                sort_by: sortBy,
                sort_order: sortOrder
            }
        });

        const res = response.data;

        setHives(res.data);
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
        setTotal(res.total);
    } catch (error) {
        console.error('Failed to fetch hives', error);
    } finally {
        setIsLoading(false);
    }
};

const isEditInitialized = useRef(false);

const hasCoords = (hive: Hive): boolean =>
    Number.isFinite(Number(hive.latitude)) &&
    Number.isFinite(Number(hive.longitude));


    const handleEdit = (hive: Hive) => {
        setSelectedHive({
            ...hive,
            latitude: Number(hive.latitude),
            longitude: Number(hive.longitude),
        });

        setEditPartnerSearch(hive.partner?.name || '');
        setEditImage(null);
        setRemoveEditImage(false);
        setErrors({});

        //  show map ONLY if coordinates already exist
        setShowEditMap(hasCoords(hive));

        setIsEditModalOpen(true);
    };



   const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHive) return;

        setIsSaving(true);
        setErrors({});

        const formData = new FormData();
        formData.append('_method', 'PUT');

        const fields = [
            'name',
            'location_name',
            'address',
            'city',
            'country',
            'latitude',
            'longitude',
            'partner_id',
            'status'
        ];

        fields.forEach(field => {
            const value = (selectedHive as any)[field];
            if (value !== undefined && value !== null) {
                formData.append(field, value.toString());
            }
        });

        //  IMAGE LOGIC
        if (removeEditImage) {
            formData.append('remove_image', '1');
        }

        if (editImage) {
            formData.append('image', editImage);
        }

        try {
            await api.post(`/admin/hives/${selectedHive.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Box updated successfully', 'success');
            setIsEditModalOpen(false);
            fetchHives();
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                showToast('Failed to update box', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };


    const handleAddBox = async (e: React.FormEvent) => {
        e.preventDefault();
        // setIsSaving(true);
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
                country: DEFAULT_COUNTRY,
                latitude: -37.8136,
                longitude: 144.9631,
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
        setSortBy('updated_at');
        setSortOrder('desc');
    };



    const geocodeAddress = async () => {
            const query = `${newBox.address}, ${newBox.city}, ${newBox.country}`.trim();

            if (query.length < 8) return;

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
                );

                const data = await res.json();
                if (!data.length) return;

                setNewBox(prev => ({
                    ...prev,
                    latitude: Number(data[0].lat),
                    longitude: Number(data[0].lon),
                }));

                setShowMap(true);
            } catch {
                // silently fail (better UX)
            }
    };


    const debouncedEditAddress = useDebounce(selectedHive?.address || '', 700);
    const debouncedEditCity = useDebounce(selectedHive?.city || '', 700);

  useEffect(() => {
    if (!selectedHive) return;
    if (!debouncedEditAddress || !debouncedEditCity) return;

    //  Skip first render (initial load)
    if (!isEditInitialized.current) {
        isEditInitialized.current = true;
        return;
    }

    geocodeEditAddress();
}, [debouncedEditAddress, debouncedEditCity]);



    const geocodeEditAddress = async (isUpdate:boolean = false) => {
    if (!selectedHive) return;

        
            const query = `${selectedHive.address}, ${selectedHive.city}, ${selectedHive.country}`.trim();

            // console.log(selectedHive);
            // if (query.length < 8) return;

            if(selectedHive.latitude !=null && selectedHive.longitude!=null && isUpdate==false) return ;

            try {


                console.log("updating maps");
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
                );

                const data = await res.json();
                if (!data.length) return;

                setSelectedHive(prev =>
                    prev
                        ? {
                            ...prev,
                            latitude: Number(data[0].lat),
                            longitude: Number(data[0].lon)
                        }
                        : null
                );

                setShowEditMap(true);
            } catch {
                // silent fail (same UX as add modal)
            }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">BumbleHive/Boxes</h2>
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
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center bg-primary p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-default shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 focus:border-bumble-yellow sm:text-sm transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                        placeholder="Search BumbleHive"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 sm:flex-none">
                        <span className="text-sm font-bold text-secondary whitespace-nowrap">Status</span>
                        <select
                            className={`block w-full sm:w-40 pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 focus:border-bumble-yellow rounded-xl border transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="assigned">Assigned</option>
                            <option value="idle">Idle</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 flex-1 sm:flex-none">
                        <span className="text-sm font-bold text-secondary whitespace-nowrap">Slots</span>
                        <select
                            className={`block w-full sm:w-44 pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 focus:border-bumble-yellow rounded-xl border transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                        >
                            <option value="">All Availability</option>
                            <option value="available">Available</option>
                            <option value="full">Full</option>
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        className={`flex items-center justify-center gap-2 border-default text-secondary transition-all rounded-xl px-6 py-2.5 font-bold ${isDarkMode ? 'hover:bg-zinc-800 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table Header - Hidden on Mobile */}
            <div className="hidden lg:grid grid-cols-6 px-8 py-3 text-xs font-bold text-secondary uppercase tracking-wider">
                <div
                    className={`col-span-1 cursor-pointer flex items-center gap-1 ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-700'}`}
                    onClick={() => toggleSort('name')}
                >
                    Box Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div
                    className={`col-span-1 cursor-pointer flex items-center gap-1 ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-700'}`}
                    onClick={() => toggleSort('status')}
                >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-2">Assigned Partner</div>
                <div
                    className={`col-span-1 text-right pr-12 cursor-pointer flex items-center justify-end gap-1 ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-700'}`}
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
                    <div className="text-center py-12 text-secondary bg-primary rounded-[32px] border border-default shadow-sm italic">
                        No boxes found matching your criteria.
                    </div>
                ) : (
                    hives.map((hive) => (
                        <div key={hive.id} className={`bg-primary rounded-3xl lg:rounded-[32px] shadow-sm border border-default hover:border-bumble-yellow hover:shadow-md transition-all duration-200 overflow-hidden group ${hive.status === 'disabled' ? 'opacity-60 grayscale' : ''}`}>
                            {/* Desktop Layout */}
                            <div className="hidden lg:grid grid-cols-6 items-center px-8 py-6">
                                <div className="col-span-1 font-bold text-primary">
                                    {hive.name}
                                </div>
                                <div className="col-span-1">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${hive.status === 'assigned' ? 'bg-blue-500/10 text-blue-500' : hive.status === 'disabled' ? 'bg-red-500/10 text-red-500' : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-50 text-gray-600'}`}>
                                        {hive.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="col-span-2 text-sm text-secondary truncate font-medium">
                                    {hive.partner?.name || <span className="text-secondary/40 italic">No partner assigned</span>}
                                </div>
                                <div className="col-span-1 text-right pr-12">
                                    <span className="text-sm font-bold text-primary">
                                        {hive.available_cells_count} <span className="text-secondary/40 font-medium">/ {hive.total_cells}</span>
                                    </span>
                                </div>
                                <div className="col-span-1 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => toggleStatus(hive)}
                                        className={`p-2 rounded-xl transition-all ${hive.status === 'disabled' ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                                        title={hive.status === 'disabled' ? 'Enable Box' : 'Disable Box'}
                                    >
                                        <PowerIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(hive)}
                                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-zinc-500 hover:text-bumble-yellow hover:bg-bumble-yellow/10' : 'text-gray-400 hover:text-bumble-yellow-dark hover:bg-bumble-yellow/10'}`}
                                        title="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="lg:hidden p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-primary text-lg">{hive.name}</p>
                                        <span className={`inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${hive.status === 'assigned' ? 'bg-blue-500/10 text-blue-500' : hive.status === 'disabled' ? 'bg-red-500/10 text-red-500' : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-50 text-gray-600'}`}>
                                            {hive.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(hive)}
                                            className={`p-2 rounded-xl transition-all ${hive.status === 'disabled' ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                                        >
                                            <PowerIcon className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(hive)}
                                            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-zinc-500 hover:text-bumble-yellow hover:bg-bumble-yellow/10' : 'text-gray-400 hover:text-bumble-yellow-dark hover:bg-bumble-yellow/10'}`}
                                        >
                                            <PencilIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="h-5 w-5 text-secondary/40 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-primary">{hive.partner?.name || 'No partner assigned'}</p>
                                            <p className="text-xs text-secondary mt-0.5">{hive.address || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-default">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Available Slots</p>
                                            <p className="text-sm font-bold text-primary">
                                                {hive.available_cells_count} <span className="text-secondary/40 font-medium">/ {hive.total_cells}</span>
                                            </p>
                                        </div>
                                        <div className={`mt-2 h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                            <div
                                                className={`h-full transition-all duration-500 ${hive.available_cells_count === 0 ? 'bg-red-500' : 'bg-bumble-yellow'}`}
                                                style={{ width: `${(hive.available_cells_count / hive.total_cells) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-between mt-8">
                        <p className="text-sm text-secondary">
                            Showing page <span className="font-bold">{currentPage}</span> of{' '}
                            <span className="font-bold">{lastPage}</span> • Total {total}
                        </p>

                        <div className="flex gap-2">
                            {/* Previous */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => fetchHives(currentPage - 1)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer
                                    ${currentPage === 1
                                        ? 'opacity-40 cursor-not-allowed '
                                        : 'bg-primary border border-default hover:bg-bumble-yellow/10'}
                                `}
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {[...Array(lastPage)].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => fetchHives(page)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition cursor-pointer
                                            ${page === currentPage
                                                ? 'bg-bumble-yellow text-black'
                                                : 'bg-primary border border-default hover:bg-bumble-yellow/10'}
                                        `}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {/* Next */}
                            <button
                                disabled={currentPage === lastPage}
                                onClick={() => fetchHives(currentPage + 1)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer
                                    ${currentPage === lastPage
                                        ? 'opacity-40 cursor-not-allowed bg-gray-200'
                                        : 'bg-primary border border-default hover:bg-bumble-yellow/10'}
                                `}
                            >
                                Next
                            </button>
                        </div>
                    </div>
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
                                <Dialog.Panel className={`relative transform overflow-hidden rounded-2xl px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="absolute right-0 top-0 hidden pr-6 pt-6 sm:block">
                                        <button
                                            type="button"
                                            className={`rounded-full p-2 focus:outline-none transition-all ${isDarkMode ? 'bg-zinc-800 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-700' : 'bg-gray-100 text-gray-400 hover:text-gray-500 hover:bg-gray-200'}`}
                                            onClick={() => setIsEditModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-primary">
                                                Edit BumbleHive Box
                                            </Dialog.Title>
                                            <form onSubmit={handleUpdate} className="mt-10 space-y-10">
                                                {/* Box Details Section */}
                                                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
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
                                                        <label className="block text-sm font-semibold text-secondary">
                                                            Box Location Image
                                                        </label>

                                                        <div
                                                            className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all cursor-pointer relative
                                                            ${isDarkMode
                                                                ? 'bg-zinc-900 border-zinc-700 hover:border-bumble-yellow'
                                                                : 'bg-white border-gray-300 hover:border-bumble-yellow'
                                                            }`}
                                                        >
                                                            {!editImage && !removeEditImage && selectedHive?.photos?.length ? (
                                                                // ✅ EXISTING IMAGE
                                                                <div className="relative w-full h-56">
                                                                    <img
                                                                        src={`${APP_URL}/storage/${selectedHive.photos[0]}`}
                                                                        className="h-full w-full object-cover rounded-lg"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2"
                                                                        onClick={() => setRemoveEditImage(true)}
                                                                    >
                                                                        <XMarkIcon className="h-4 w-4 stroke-[3]" />
                                                                    </button>
                                                                </div>
                                                            ) : editImage ? (
                                                                // ✅ NEW IMAGE PREVIEW
                                                                <div className="relative w-full h-56">
                                                                    <img
                                                                        src={URL.createObjectURL(editImage)}
                                                                        className="h-full w-full object-cover rounded-lg"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2"
                                                                        onClick={() => setEditImage(null)}
                                                                    >
                                                                        <XMarkIcon className="h-4 w-4 stroke-[3]" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                // ✅ UPLOAD STATE
                                                                <div className="space-y-2 text-center">
                                                                    <PhotoIcon className="mx-auto h-14 w-14 text-zinc-500" />
                                                                    <label className="cursor-pointer font-bold text-sm">
                                                                        Upload a new file
                                                                        <input
                                                                            type="file"
                                                                            className="sr-only"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    setEditImage(file);
                                                                                    setRemoveEditImage(false);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </label>
                                                                    <p className="text-xs text-secondary">
                                                                        PNG, JPG up to 2MB
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {errors.image && (
                                                            <p className="text-sm text-red-600 font-medium">
                                                                {errors.image[0]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    </div>
                                                </div>

                                                {/* Assign Box Section */}
                                                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Assign Box
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="relative">
                                                            <label className="block text-sm font-semibold text-secondary mb-2">Assign To</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search partners by name or business..."
                                                                    className={`w-full pl-4 pr-12 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                                                    value={editPartnerSearch}
                                                                    onChange={(e) => setEditPartnerSearch(e.target.value)}
                                                                />
                                                                <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-zinc-500" />
                                                            </div>

                                                            {editPartnerSearch && (
                                                                <div className={`absolute z-10 mt-2 w-full border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y ${isDarkMode ? 'bg-zinc-800 border-zinc-700 divide-zinc-700' : 'bg-white border-gray-200 divide-gray-50'}`}>
                                                                    {partners
                                                                        .filter(p =>
                                                                            p.name.toLowerCase().includes(editPartnerSearch.toLowerCase()) ||
                                                                            p.business_name?.toLowerCase().includes(editPartnerSearch.toLowerCase())
                                                                        )
                                                                        .map(partner => (
                                                                            <div
                                                                                key={partner.id}
                                                                                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${selectedHive?.partner_id === partner.id ? (isDarkMode ? 'bg-bumble-yellow/10 border-l-4 border-bumble-yellow' : 'bg-yellow-50 border-l-4 border-bumble-yellow') : (isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-yellow-50/50')}`}
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
                                                                        <div className="px-5 py-4 text-sm text-secondary text-center italic">No partners found</div>
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
                                                      
                                                            <Button
                                                                type="button"
                                                               
                                                                className="w-full mt-2"
                                                                onClick={() => geocodeEditAddress(true)}
                                                            >
                                                                Show / Update Map
                                                            </Button>

                                                            {showEditMap && selectedHive && (
                                                                <div className="mt-4 space-y-2">
                                                                    <p className="text-sm font-semibold text-secondary">
                                                                        Pin exact box location
                                                                    </p>

                                                                    <LocationPicker
                                                                        latitude={Number(selectedHive.latitude)}
                                                                        longitude={Number(selectedHive.longitude)}
                                                                        onChange={(lat, lng) =>
                                                                            setSelectedHive(prev =>
                                                                                prev
                                                                                    ? { ...prev, latitude: lat, longitude: lng }
                                                                                    : null
                                                                            )
                                                                        }
                                                                    />

                                                                    <p className="text-xs text-secondary">
                                                                        Lat: {Number(selectedHive.latitude).toFixed(6)} | Lng:{' '}
                                                                        {Number(selectedHive.longitude).toFixed(6)}
                                                                    </p>
                                                                </div>
                                                            )}



                                                    </div>

                                                    
                                                  
                                                </div>

                                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                                    <Button
                                                        type="button"
                                                       
                                                        className={`flex-1 py-4 rounded-xl font-bold transition-all order-2 sm:order-1 border-default ${isDarkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        onClick={() => setIsEditModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className={`flex-[2] py-4 shadow-lg order-1 sm:order-2 ${isDarkMode ? 'shadow-black/20' : 'shadow-gray-200'}`}
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
                                <Dialog.Panel className={`relative transform overflow-hidden rounded-2xl px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="absolute right-0 top-0 hidden pr-6 pt-6 sm:block">
                                        <button
                                            type="button"
                                            className={`rounded-full p-2 focus:outline-none transition-all ${isDarkMode ? 'bg-zinc-800 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-700' : 'bg-gray-100 text-gray-400 hover:text-gray-500 hover:bg-gray-200'}`}
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-primary">
                                                Add New BumbleHive Box
                                            </Dialog.Title>
                                            <form onSubmit={handleAddBox} className="mt-10 space-y-10">
                                                {/* Box Details Section */}
                                                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
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
                                                                <label className="block text-sm font-medium text-secondary">Box Location Image</label>
                                                                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer relative ${isDarkMode ? 'bg-zinc-900 border-zinc-700 hover:border-bumble-yellow' : 'bg-white border-gray-300 hover:border-bumble-yellow'}`}>
                                                                    <div className="space-y-1 text-center">
                                                                        <PhotoIcon className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`} />
                                                                        <div className="flex text-sm">
                                                                            <label className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
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
                                                                            <p className={`pl-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-600'}`}>or drag and drop</p>
                                                                        </div>
                                                                        <p className={`text-xs ${isDarkMode ? 'text-zinc-600' : 'text-gray-500'}`}>PNG, JPG, GIF up to 2MB</p>
                                                                    </div>
                                                                    {newBox.image && (
                                                                        <div className={`absolute inset-0 p-2 rounded-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
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
                                                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-bumble-yellow rounded-full"></span>
                                                        Assign Box
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div className="relative">
                                                            <label className="block text-sm font-semibold text-secondary mb-2">Assign To</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search partners by name or business..."
                                                                    className={`w-full pl-4 pr-12 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:border-bumble-yellow transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                                                    value={partnerSearch}
                                                                    onChange={(e) => setPartnerSearch(e.target.value)}
                                                                />
                                                                <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-zinc-500" />
                                                            </div>

                                                            {partnerSearch && (
                                                                <div className={`absolute z-10 mt-2 w-full border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y ${isDarkMode ? 'bg-zinc-800 border-zinc-700 divide-zinc-700' : 'bg-white border-gray-200 divide-gray-50'}`}>
                                                                    {partners
                                                                        .filter(p =>
                                                                            p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                                                                            p.business_name?.toLowerCase().includes(partnerSearch.toLowerCase())
                                                                        )
                                                                        .map(partner => (
                                                                            <div
                                                                                key={partner.id}
                                                                                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${newBox.partner_id === partner.id.toString() ? (isDarkMode ? 'bg-bumble-yellow/10 border-l-4 border-bumble-yellow' : 'bg-yellow-50 border-l-4 border-bumble-yellow') : (isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-yellow-50/50')}`}
                                                                                onClick={() => {
                                                                                    setNewBox(prev => ({ ...prev, partner_id: partner.id.toString() }));
                                                                                    setPartnerSearch(partner.name);
                                                                                }}
                                                                            >
                                                                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                                                                                    <MapPinIcon className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-primary">{partner.name}</p>
                                                                                    <p className="text-xs text-secondary font-medium">{partner.business_name || 'No business name'}</p>
                                                                                </div>
                                                                                {newBox.partner_id === partner.id.toString() && (
                                                                                    <CheckIcon className="ml-auto h-5 w-5 text-bumble-yellow stroke-[3]" />
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    {partners.filter(p => p.name.toLowerCase().includes(partnerSearch.toLowerCase()) || p.business_name?.toLowerCase().includes(partnerSearch.toLowerCase())).length === 0 && (
                                                                        <div className="px-5 py-4 text-sm text-secondary text-center italic">No partners found</div>
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
                                                        {/* <Input
                                                            label="Address"
                                                            placeholder="Full street address"
                                                            value={newBox.address}
                                                            onChange={(e) => setNewBox(prev => ({ ...prev, address: e.target.value }))}
                                                            error={errors.address?.[0]}
                                                            required
                                                        /> */}
                                                    </div>
                                                        <Input
                                                            label="Address"
                                                            placeholder="Full street address"
                                                            value={newBox.address}
                                                            onChange={(e) =>
                                                                setNewBox(prev => ({ ...prev, address: e.target.value }))
                                                            }
                                                            error={errors.address?.[0]}
                                                            required
                                                        />


                                                        <Button
                                                            type="button"
                                                            
                                                            className="w-full mt-2"
                                                            onClick={geocodeAddress}
                                                        >
                                                            Show on Map
                                                        </Button>

                                                        {showMap && (
                                                            <div className="mt-4 space-y-2">
                                                                <p className="text-sm font-semibold text-secondary">
                                                                    Pin exact box location
                                                                </p>

                                                                <LocationPicker
                                                                    latitude={newBox.latitude}
                                                                    longitude={newBox.longitude}
                                                                    onChange={(lat, lng) =>
                                                                        setNewBox(prev => ({
                                                                            ...prev,
                                                                            latitude: lat,
                                                                            longitude: lng
                                                                        }))
                                                                    }
                                                                />

                                                                <p className="text-xs text-secondary">
                                                                    Lat: {newBox.latitude.toFixed(6)} | Lng: {newBox.longitude.toFixed(6)}
                                                                </p>
                                                            </div>
                                                        )}

                                                </div>

                                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                                    <Button
                                                        type="button"
                                                       
                                                        className={`flex-1 py-4 rounded-xl font-bold transition-all order-2 sm:order-1 border-default ${isDarkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        onClick={() => setIsAddModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className={`flex-[2] py-4 shadow-lg order-1 sm:order-2 ${isDarkMode ? 'shadow-black/20' : 'shadow-gray-200'}`}
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
