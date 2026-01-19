import { useEffect, useState, useRef, Fragment } from 'react';
import { useTheme } from '../../store/theme';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { XMarkIcon, PlusIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import HiveMapPicker from '../../components/maps/HiveMapPicker';


interface Property {
    id: number;
    title: string;
    address: string;
}

interface Hive {
    id: number;
    name: string;
    address: string;
    photos?: string[];
    latitude: number;
    longitude: number;
}

interface KeyData {
    id: number;
    label: string;
    description: string | null;
    key_type: string;
    package_type: string;
    notes: string | null;
    property_id: number;
    photo: string | null;
    current_assignment?: {
        hive_id?: number;
    };
}

const APP_URL = import.meta.env.VITE_APP_URL;

const KeyRegistration = () => {
    const { isDarkMode } = useTheme();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const [properties, setProperties] = useState<Property[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);
    const [hiveQuery, setHiveQuery] = useState('');
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [fileName, setFileName] = useState('');

    // Property Modal State
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [isAddingProperty, setIsAddingProperty] = useState(false);
    const [propertyErrors, setPropertyErrors] = useState<Record<string, string[]>>({});
    const [newProperty, setNewProperty] = useState({
        title: '',
        address: '',
        city: '',
        country: 'UK',
    });

    const [formData, setFormData] = useState({
        property_id: '',
        label: '',
        key_type: 'master',
        package_type: 'monthly',
        description: '',
        notes: '',
        hive_id: '',
        photo: '',
    });

    useEffect(() => {
        const fetchAllHives = async () => {
            const allHives: Hive[] = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                // eslint-disable-next-line no-await-in-loop
                const response = await api.get('/hives', { params: { page } });
                const data = response.data;
                allHives.push(...(data.data || []));
                hasNextPage = Boolean(data.next_page_url);
                page += 1;
            }

            return allHives;
        };

        const fetchData = async () => {
            try {
                const propsPromise = api.get('/hosts/properties');
                const hivesPromise = fetchAllHives();
                const keyPromise = id ? api.get(`/hosts/keys/${id}`) : Promise.resolve(null);

                const [propsRes, hivesRes, keyRes] = await Promise.all([
                    propsPromise,
                    hivesPromise,
                    keyPromise
                ]);
                const fetchedProperties = propsRes.data.data || [];
                const fetchedHives = hivesRes;

                console.log(fetchedHives);

                setProperties(fetchedProperties);
                setHives(fetchedHives);

                if (keyRes?.data?.data) {
                    const keyData: KeyData = keyRes.data.data;
                    setFormData({
                        property_id: keyData.property_id.toString(),
                        label: keyData.label,
                        key_type: keyData.key_type,
                        package_type: keyData.package_type,
                        description: keyData.description || '',
                        notes: keyData.notes || '',
                        hive_id: keyData.current_assignment?.hive_id?.toString() || '',
                        photo: keyData.photo || ''
                    });

                    if (keyData.photo) {
                        setFileName('Current image');
                    }

                    if (keyData.current_assignment?.hive_id) {
                        const matchedHive = fetchedHives.find(
                            (hive: Hive) => hive.id === keyData.current_assignment?.hive_id
                        );
                        if (matchedHive) {
                            setSelectedHive(matchedHive);
                        }
                    }
                } else {
                    // Set initial property if available and not already set
                    if (fetchedProperties.length > 0 && !formData.property_id) {
                        setFormData(prev => ({ ...prev, property_id: fetchedProperties[0].id.toString() }));
                    }

                    // Set initial hive if available and not already set
                    if (fetchedHives.length > 0 && !formData.hive_id) {
                        setSelectedHive(fetchedHives[0]);
                        setFormData(prev => ({ ...prev, hive_id: fetchedHives[0].id.toString() }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                showToast('Failed to load properties or hives', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleHiveChange = (hiveId: string) => {
        const hive = hives.find(h => h.id.toString() === hiveId);
        if (hive) {
            setSelectedHive(hive);
            setFormData({ ...formData, hive_id: hiveId });
        } else {
            setSelectedHive(null);
            setFormData({ ...formData, hive_id: '' });
        }
    };

    const filteredHives = hiveQuery.trim().length === 0
        ? hives
        : hives.filter((hive) => {
            const query = hiveQuery.toLowerCase();
            return hive.name.toLowerCase().includes(query)
                || hive.address.toLowerCase().includes(query);
        });

    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingProperty(true);
        setPropertyErrors({});
        try {
            const response = await api.post('/hosts/properties', newProperty);
            const createdProperty = response.data.data;

            showToast('Property created successfully', 'success');
            setIsPropertyModalOpen(false);
            setNewProperty({ title: '', address: '', city: '', country: 'UK' });

            // Refresh properties and select the new one
            const propsRes = await api.get('/hosts/properties');
            const fetchedProperties = propsRes.data.data || [];
            setProperties(fetchedProperties);
            setFormData(prev => ({ ...prev, property_id: createdProperty.id.toString() }));
        } catch (error: any) {
            if (error.response?.status === 422) {
                setPropertyErrors(error.response.data.errors);
            } else {
                showToast('Failed to create property', 'error');
            }
        } finally {
            setIsAddingProperty(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        
        try {
            if (isEdit) {
                await api.put(`/hosts/keys/${id}`, formData);
                showToast('Key updated successfully', 'success');
            } else {
                await api.post('/hosts/keys', formData);
                showToast('Key registered successfully', 'success');
            }
            navigate('/host/keys');
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
                showToast('Please check the form for errors', 'error');
            } else {
                showToast(isEdit ? 'Failed to update key' : 'Failed to register key', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-zinc-950' : 'bg-[#F8F9FB]'}`}>
            <div className={`max-w-xl mx-auto rounded-[40px] shadow-sm border p-12 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                <div className="text-left mb-10">
                    <Link to="/host/keys" className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary mb-4">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to list
                    </Link>
                    <h2 className="text-3xl font-bold text-primary">
                        {isEdit ? 'Edit Key' : 'Register Your Key'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <Input
                            label="Key Name"
                            placeholder="Write the name"
                            className="rounded-xl border-gray-200"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            error={errors.label?.[0]}
                            required
                        />

                        <Input
                            label="Address"
                            placeholder="Write the address"
                            className="rounded-xl border-gray-200"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            error={errors.description?.[0]}
                        />

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-primary">Property</label>
                                <button
                                    type="button"
                                    onClick={() => setIsPropertyModalOpen(true)}
                                    className="text-xs font-bold text-bumble-yellow hover:text-yellow-600 flex items-center gap-1"
                                >
                                    <PlusIcon className="h-3 w-3 stroke-[3]" />
                                    Add New
                                </button>
                            </div>
                            <select
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow transition-all text-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:bg-zinc-900' : 'bg-gray-50/50 border-gray-200 focus:bg-white'}`}
                                value={formData.property_id}
                                onChange={(e) => {
                                    console.log('Property changed:', e.target.value);
                                    setFormData({ ...formData, property_id: e.target.value });
                                }}
                                required
                            >
                                <option value="">Select a property</option>
                                {properties.map(prop => (
                                    <option key={prop.id} value={prop.id}>{prop.title}</option>
                                ))}
                            </select>
                            {errors.property_id && <p className="mt-1 text-xs text-red-500">{errors.property_id[0]}</p>}
                        </div>

                        <Input
                            label="Notes"
                            placeholder="Write the notes"
                            className="rounded-xl border-gray-200"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            error={errors.notes?.[0]}
                        />

                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Key Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="No image uploaded"
                                    className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow transition-all text-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50/50 border-gray-200 placeholder-gray-400'}`}
                                    value={fileName}
                                    readOnly
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <Button
                                    type="button"
                                    variant="bumble"
                                    className="px-6 py-3"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Upload
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">BumbleHive</label>
                            <Combobox
                                value={selectedHive}
                                onChange={(hive: Hive | null) => handleHiveChange(hive?.id?.toString() || '')}
                            >
                                <div className="relative mb-4">
                                    <Combobox.Input
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow transition-all text-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50/50 border-gray-200 placeholder-gray-400'}`}
                                        displayValue={(hive: Hive | null) => hive?.name || ''}
                                        onChange={(event) => setHiveQuery(event.target.value)}
                                        placeholder="Select a BumbleHive (Optional)"
                                    />
                                    {filteredHives.length > 0 && (
                                        <Combobox.Options className={`absolute z-[1000] mt-2 max-h-60 w-full overflow-auto rounded-xl border shadow-lg ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                            {filteredHives.map((hive) => (
                                                <Combobox.Option
                                                    key={hive.id}
                                                    value={hive}
                                                    className={({ active }) =>
                                                        `cursor-pointer px-4 py-2 text-sm ${active ? 'bg-bumble-yellow text-bumble-black' : ''}`
                                                    }
                                                >
                                                    <div className="font-medium">{hive.name}</div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                                        {hive.address}
                                                    </div>
                                                </Combobox.Option>
                                            ))}
                                        </Combobox.Options>
                                    )}
                                </div>
                            </Combobox>

                            {selectedHive && (
                                <div className={`border  relative  rounded-2xl z-999999 p-4 flex items-center gap-4 shadow-sm ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={
                                                selectedHive.photos?.[0]
                                                    ? `${APP_URL}/storage/${selectedHive.photos[0]}`
                                                    : "/bumblehive_preview.png"
                                            }
                                            alt={selectedHive.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-primary truncate">{selectedHive.name}</h4>
                                        <p className="text-[10px] text-secondary mt-1 leading-relaxed">{selectedHive.address}</p>
                                    </div>
                                </div>
                            )}
                        
                

                          {hives.length > 0 && (
    <div className="mt-10 relative z-0">
        <HiveMapPicker
            hives={hives}
            selectedHiveId={selectedHive?.id}
            onSelect={(hive) => {
                setSelectedHive(hive);
                setFormData(prev => ({
                    ...prev,
                    hive_id: hive.id.toString(),
                }));
            }}
        />
    </div>
)}


                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            variant="bumble"
                            className="w-full py-4 text-lg"
                            isLoading={isSaving}
                        >
                            {isEdit ? 'Update Key Details' : 'Save Key Details'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Add Property Modal */}
            <Transition.Root show={isPropertyModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsPropertyModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className={`fixed inset-0 backdrop-blur-sm transition-opacity ${isDarkMode ? 'bg-zinc-950/80' : 'bg-slate-900/60'}`} />
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
                                <Dialog.Panel className={`relative transform overflow-hidden rounded-2xl px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-10 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="absolute right-0 top-0 hidden pr-6 pt-6 sm:block">
                                        <button
                                            type="button"
                                            className={`rounded-full p-2 focus:outline-none transition-all ${isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700' : 'bg-gray-100 text-gray-400 hover:text-gray-500 hover:bg-gray-200'}`}
                                            onClick={() => setIsPropertyModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-primary">
                                                Add New Property
                                            </Dialog.Title>
                                            <form onSubmit={handleAddProperty} className="mt-8 space-y-5">
                                                <Input
                                                    label="Property Title"
                                                    placeholder="e.g. My Apartment"
                                                    value={newProperty.title}
                                                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                                                    error={propertyErrors.title?.[0]}
                                                    required
                                                />
                                                <Input
                                                    label="Address"
                                                    placeholder="Full street address"
                                                    value={newProperty.address}
                                                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                                                    error={propertyErrors.address?.[0]}
                                                    required
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input
                                                        label="City"
                                                        placeholder="e.g. London"
                                                        value={newProperty.city}
                                                        onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                                                        error={propertyErrors.city?.[0]}
                                                        required
                                                    />
                                                    <Input
                                                        label="Country"
                                                        placeholder="e.g. UK"
                                                        value={newProperty.country}
                                                        onChange={(e) => setNewProperty({ ...newProperty, country: e.target.value })}
                                                        error={propertyErrors.country?.[0]}
                                                        required
                                                    />
                                                </div>
                                                <div className="pt-6 flex gap-4">
                                                    <Button
                                                        type="button"
                                                       
                                                        className="flex-1 py-3 rounded-xl font-bold"
                                                        onClick={() => setIsPropertyModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="bumble"
                                                        className="flex-1 py-3"
                                                        isLoading={isAddingProperty}
                                                    >
                                                        Create Property
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

export default KeyRegistration;
