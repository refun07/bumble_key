import { Fragment, useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useToast } from '../../store/toast';
import { useDebounce } from '../../hooks/useDebounce';

import {
    MagnifyingGlassIcon,
    PencilIcon,
    ArrowPathIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { TableShimmer } from '../../components/common/Shimmer';

interface Key {
    id: number;
    label: string;
    status: string;
}

interface Property {
    id: number;
    title: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    is_active: boolean;
    keys?: Key[];
}

interface PropertyForm {
    id?: number;
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    is_active: boolean;
}

const DEFAULT_COUNTRY = import.meta.env.VITE_DEFAULT_COUNTRY || 'USA';

const Properties = () => {
    const { isDarkMode } = useTheme();
    const { showToast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string[]>>({});
    const [newProperty, setNewProperty] = useState<PropertyForm>({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: DEFAULT_COUNTRY,
        postal_code: '',
        is_active: true
    });


    const [editProperty, setEditProperty] = useState<PropertyForm | null>(null);

    const fetchData = async (page = currentPage, searchTerm = search) => {
        setIsLoading(true);
        try {
            const propertiesResponse = await api.get('/hosts/properties-list', {
                params: {
                    page,
                    search: searchTerm || undefined
                }
            });

            setProperties(propertiesResponse.data.data);
            setCurrentPage(propertiesResponse.data.current_page || 1);
            setLastPage(propertiesResponse.data.last_page || 1);
            setTotalProperties(propertiesResponse.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        fetchData(1, debouncedSearch);
    }, [debouncedSearch]);

    const resetNewProperty = () => {
        setNewProperty({
            title: '',
            description: '',
            address: '',
            city: '',
            state: '',
            country: DEFAULT_COUNTRY,
            postal_code: '',
            is_active: true
        });
    };

    const handleAddProperty = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        setErrors({});

        try {
            await api.post('/hosts/properties', newProperty);
            showToast('Property created successfully', 'success');
            setIsAddModalOpen(false);
            resetNewProperty();
            fetchData(1, debouncedSearch);
        } catch (error: any) {
            if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                showToast('Failed to create property', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = (property: Property) => {
        setEditProperty({
            id: property.id,
            title: property.title || '',
            description: property.description || '',
            address: property.address || '',
            city: property.city || '',
            state: property.state || '',
            country: property.country || DEFAULT_COUNTRY,
            postal_code: property.postal_code || '',
            is_active: property.is_active
        });
        setEditErrors({});
        setIsEditModalOpen(true);
    };

    const handleUpdateProperty = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editProperty?.id) return;

        setIsSaving(true);
        setEditErrors({});

        const { id, ...payload } = editProperty;

        try {
            await api.put(`/hosts/properties/${id}`, payload);
            showToast('Property updated successfully', 'success');
            setIsEditModalOpen(false);
            setEditProperty(null);
            fetchData(currentPage, debouncedSearch);
        } catch (error: any) {
            if (error?.response?.data?.errors) {
                setEditErrors(error.response.data.errors);
            } else {
                showToast('Failed to update property', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProperty = async (property: Property) => {
        const result = await Swal.fire({
            title: 'Delete this property?',
            text: `This will permanently remove "${property.title}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/hosts/properties/${property.id}`);
            showToast('Property deleted successfully', 'success');
            fetchData(currentPage, debouncedSearch);
        } catch (error) {
            showToast('Failed to delete property', 'error');
        }
    };

    const filteredProperties = properties;

    const getPropertyAddress = (property: Property) => {
        const address = [property.address, property.city, property.country]
            .filter(Boolean)
            .join(', ');
        return address || 'No address provided';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full overflow-x-hidden">
                <div className="flex-1 flex flex-wrap items-center gap-4 min-w-0">
                    <div className="relative w-full lg:w-80 min-w-0">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, address, or key"
                            className={`w-full min-w-0 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all shadow-sm text-sm 
                                ${isDarkMode 
                                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
                                    : 'bg-white border-gray-100 text-gray-900 placeholder-gray-400'
                                }`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setSearch('');
                            fetchData(1, '');
                        }}
                        className="px-6 py-3 whitespace-nowrap"
                    >
                        Clear Search
                    </Button>
                </div>

                <Button
                    variant="bumble"
                    className="px-8 py-3 whitespace-nowrap"
                    onClick={() => {
                        setErrors({});
                        resetNewProperty();
                        setIsAddModalOpen(true);
                    }}
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Property
                </Button>
            </div>


            <div className="space-y-3">
                {isLoading ? (
                    <TableShimmer rows={6} cols={5} />
                ) : (
                    <>
                        {filteredProperties.map((property) => (
                            <div
                                key={property.id}
                                className={`block p-5 rounded-xl border shadow-sm transition-all group ${isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-bumble-yellow/30' : 'bg-white border-gray-50 hover:border-bumble-yellow/50'}`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                                    <div className="md:col-span-3 font-bold text-primary text-sm">
                                        {property.title}
                                    </div>

                                    <div className="md:col-span-4 text-sm text-secondary truncate">
                                        {getPropertyAddress(property)}
                                    </div>

                                    <div className="md:col-span-3 text-sm text-primary font-medium">
                                        {property.keys?.length ? `${property.keys.length} key${property.keys.length === 1 ? '' : 's'}` : 'No keys'}
                                    </div>

                                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                            {property.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                
                                                size="sm"
                                                onClick={() => openEditModal(property)}
                                            >
                                                <PencilIcon className="h-4 w-4 mr-1" />
                                                
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteProperty(property)}
                                            >
                                                <TrashIcon className="h-4 w-4 mr-1 text-black" />
                                                
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredProperties.length === 0 && (
                            <div className={`rounded-3xl border p-20 text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                                    <ArrowPathIcon className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">No properties found</h3>
                                <p className="text-secondary max-w-xs mx-auto mb-8">
                                    We couldn't find any properties matching your search.
                                </p>
                                <Button onClick={() => { setSearch(''); }}>
                                    Clear search
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-secondary">
                        Showing page {currentPage} of {lastPage} ({totalProperties} total)
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <Button
                           
                            className="px-4 py-2"
                            onClick={() => fetchData(currentPage - 1, debouncedSearch)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: lastPage }, (_, index) => {
                            const page = index + 1;
                            const isActive = page === currentPage;
                            return (
                                <Button
                                    key={page}
                                   
                                    className="px-4 py-2"
                                    onClick={() => fetchData(page, debouncedSearch)}
                                    disabled={isActive}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                        <Button
                            
                            className="px-4 py-2"
                            onClick={() => fetchData(currentPage + 1, debouncedSearch)}
                            disabled={currentPage === lastPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

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
                        <div className="fixed inset-0 bg-black/40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className={`w-full max-w-2xl rounded-2xl p-6 shadow-xl ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-lg font-bold text-primary">Add New Property</Dialog.Title>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddModalOpen(false)}
                                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
                                        >
                                            <XMarkIcon className="h-5 w-5 text-secondary" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddProperty} className="mt-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Property Title"
                                                value={newProperty.title}
                                                onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                                                error={errors.title?.[0]}
                                                required
                                            />
                                            <Input
                                                label="Address"
                                                value={newProperty.address}
                                                onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                                                error={errors.address?.[0]}
                                                required
                                            />
                                            <Input
                                                label="City"
                                                value={newProperty.city}
                                                onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                                                error={errors.city?.[0]}
                                                required
                                            />
                                            <Input
                                                label="Country"
                                                value={newProperty.country}
                                                onChange={(e) => setNewProperty({ ...newProperty, country: e.target.value })}
                                                error={errors.country?.[0]}
                                                required
                                            />
                                            <Input
                                                label="State"
                                                value={newProperty.state}
                                                onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                                                error={errors.state?.[0]}
                                            />
                                            <Input
                                                label="Postal Code"
                                                value={newProperty.postal_code}
                                                onChange={(e) => setNewProperty({ ...newProperty, postal_code: e.target.value })}
                                                error={errors.postal_code?.[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-primary mb-2">Description</label>
                                            <textarea
                                                className={`w-full px-4 py-3 border rounded-xl bg-secondary border-default focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-primary transition-all text-sm text-primary ${errors.description ? 'border-red-500' : ''}`}
                                                rows={3}
                                                value={newProperty.description}
                                                onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                                            />
                                            {errors.description?.[0] && <p className="mt-1 text-xs text-red-500">{errors.description[0]}</p>}
                                        </div>

                                        <label className="flex items-center gap-2 text-sm font-medium text-primary">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-bumble-yellow focus:ring-bumble-yellow"
                                                checked={newProperty.is_active}
                                                onChange={(e) => setNewProperty({ ...newProperty, is_active: e.target.checked })}
                                            />
                                            Active
                                        </label>

                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                
                                                onClick={() => setIsAddModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="bumble" isLoading={isSaving}>
                                                Create Property
                                            </Button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

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
                        <div className="fixed inset-0 bg-black/40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className={`w-full max-w-2xl rounded-2xl p-6 shadow-xl ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-lg font-bold text-primary">Edit Property</Dialog.Title>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
                                        >
                                            <XMarkIcon className="h-5 w-5 text-secondary" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateProperty} className="mt-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Property Title"
                                                value={editProperty?.title || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                                                error={editErrors.title?.[0]}
                                                required
                                            />
                                            <Input
                                                label="Address"
                                                value={editProperty?.address || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, address: e.target.value } : prev)}
                                                error={editErrors.address?.[0]}
                                                required
                                            />
                                            <Input
                                                label="City"
                                                value={editProperty?.city || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, city: e.target.value } : prev)}
                                                error={editErrors.city?.[0]}
                                                required
                                            />
                                            <Input
                                                label="Country"
                                                value={editProperty?.country || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, country: e.target.value } : prev)}
                                                error={editErrors.country?.[0]}
                                                required
                                            />
                                            <Input
                                                label="State"
                                                value={editProperty?.state || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, state: e.target.value } : prev)}
                                                error={editErrors.state?.[0]}
                                            />
                                            <Input
                                                label="Postal Code"
                                                value={editProperty?.postal_code || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, postal_code: e.target.value } : prev)}
                                                error={editErrors.postal_code?.[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-primary mb-2">Description</label>
                                            <textarea
                                                className={`w-full px-4 py-3 border rounded-xl bg-secondary border-default focus:outline-none focus:ring-2 focus:ring-bumble-yellow focus:bg-primary transition-all text-sm text-primary ${editErrors.description ? 'border-red-500' : ''}`}
                                                rows={3}
                                                value={editProperty?.description || ''}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                                            />
                                            {editErrors.description?.[0] && <p className="mt-1 text-xs text-red-500">{editErrors.description[0]}</p>}
                                        </div>

                                        <label className="flex items-center gap-2 text-sm font-medium text-primary">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-bumble-yellow focus:ring-bumble-yellow"
                                                checked={editProperty?.is_active || false}
                                                onChange={(e) => setEditProperty((prev) => prev ? { ...prev, is_active: e.target.checked } : prev)}
                                            />
                                            Active
                                        </label>

                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                               
                                                onClick={() => setIsEditModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="bumble" isLoading={isSaving}>
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default Properties;
