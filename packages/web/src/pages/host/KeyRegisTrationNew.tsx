import { useEffect, useState, useRef, Fragment } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon, PlusIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../store/theme';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

interface PricingData {
    pay_as_you_go_price: number;
    monthly_price: number;
    yearly_price: number;
    monthly_discount: number;
    yearly_discount: number;
    monthly_discounted_price: number;
    yearly_discounted_price: number;
    trial_days: number;
    currency: string;
}

const APP_URL = import.meta.env.VITE_APP_URL;
const DEFAULT_COUNTRY = import.meta.env.DEFAULT_COUNTRY || 'Australia';

const getKeyPhotoSrc = (photo?: string | null) => {
    if (!photo) return '';
    if (photo.startsWith('data:') || photo.startsWith('http')) {
        return photo;
    }
    return `${APP_URL}/storage/${photo}`;
};

const RecenterOnSelect = ({ hive }: { hive?: Hive | null }) => {
    const map = useMap();

    useEffect(() => {
        if (hive) {
            map.setView([hive.latitude, hive.longitude], 16, {
                animate: true,
            });
        }
    }, [hive, map]);

    return null;
};

const HivePopupContent = ({
    hive,
    onUse,
}: {
    hive: Hive;
    onUse: () => void;
}) => {
    const map = useMap();

    return (
        <div className="w-[220px]">
            <div className="h-24 w-full overflow-hidden rounded-lg mb-3">
                <img
                    src={
                        hive.photos?.[0]
                            ? `${APP_URL}/storage/${hive.photos[0]}`
                            : "/bumblehive_preview.png"
                    }
                    alt={hive.name}
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="text-sm font-bold">{hive.name}</div>
            <div className="text-xs text-gray-500 mt-1">{hive.address}</div>
            <button
                type="button"
                className="mt-3 w-full rounded-lg bg-bumble-yellow px-3 py-2 text-xs font-bold text-bumble-black"
                onClick={() => {
                    onUse();
                    map.closePopup();
                }}
            >
                Use this BumbleKey Nest
            </button>
        </div>
    );
};

const KeyRegisTrationNew = () => {
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
    const [mapQuery, setMapQuery] = useState('');
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [fileName, setFileName] = useState('');
    const formRef = useRef<HTMLDivElement>(null);
    const [pricing, setPricing] = useState<PricingData>({
        pay_as_you_go_price: 5,
        monthly_price: 29,
        yearly_price: 290,
        monthly_discount: 0,
        yearly_discount: 0,
        monthly_discounted_price: 29,
        yearly_discounted_price: 290,
        trial_days: 14,
        currency: 'AUD',
    });

    const [hasLocalData, setHasLocalData] = useState(false);    
    const [preselectedHiveId, setPreselectedHiveId] = useState<number | null>(null);

    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [isAddingProperty, setIsAddingProperty] = useState(false);
    const [propertyErrors, setPropertyErrors] = useState<Record<string, string[]>>({});
    const [newProperty, setNewProperty] = useState({
        title: '',
        address: '',
        city: '',
        country: DEFAULT_COUNTRY,
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
        if (isEdit) return;

        const storedHive = localStorage.getItem('public_bumblekey_selection');
        const storedPlan = localStorage.getItem('public_bumblekey_plan');

        

        if (storedHive) {
            try {
                const hiveData = JSON.parse(storedHive);
                if (hiveData?.id) {
                    setPreselectedHiveId(Number(hiveData.id));
                }
            } catch (error) {
                console.warn('Failed to parse public_bumblekey_selection', error);
            }
        }

        if (storedPlan) {
            try {
                const planData = JSON.parse(storedPlan);
                const planId = planData?.id;
                if (planId === 'pay_as_you_go' || planId === 'monthly' || planId === 'yearly') {
                    setFormData(prev => ({
                        ...prev,
                        package_type: planId,
                    }));
             
                }
            } catch (error) {
                console.warn('Failed to parse public_bumblekey_plan', error);
            }
        }

        if(storedHive && storedPlan) {
            setHasLocalData(true);
        }

        localStorage.removeItem('public_bumblekey_selection');
        localStorage.removeItem('public_bumblekey_plan'); 
        
        
    }, [isEdit]);


// useEffect(() => {
//     if (!formData.package_type) return;

    
//     const timer = setTimeout(() => {
//         formRef.current?.scrollIntoView({
//             behavior: 'smooth',
//             block: 'end',
//         });
//     }, 500); // half second

//     return () => clearTimeout(timer);

// }, [formData.package_type]);

    useEffect(()=>{
        if(hasLocalData){
           setTimeout(()=>{
                formRef.current?.scrollIntoView({
                    behavior:'smooth',
                    block:'end',
                });
                setHasLocalData(false);
            },500);
        }
    },[hasLocalData]);

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
                const pricingPromise = api.get('/pricing');

                const [propsRes, hivesRes, keyRes, pricingRes] = await Promise.all([
                    propsPromise,
                    hivesPromise,
                    keyPromise,
                    pricingPromise
                ]);
                const fetchedProperties = propsRes.data.data || [];
                const fetchedHives = hivesRes;

                setProperties(fetchedProperties);
                setHives(fetchedHives);
                setPricing(pricingRes.data);

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
                    if (fetchedProperties.length > 0 && !formData.property_id) {
                        setFormData(prev => ({ ...prev, property_id: fetchedProperties[0].id.toString() }));
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

    useEffect(() => {
        if (isEdit || !preselectedHiveId || hives.length === 0) return;

        if (formData.hive_id) return;

        const matchedHive = hives.find((hive) => hive.id === preselectedHiveId);
        if (matchedHive) {
            setSelectedHive(matchedHive);
            setFormData(prev => ({
                ...prev,
                hive_id: matchedHive.id.toString(),
            }));
        }
    }, [hives, preselectedHiveId, isEdit, formData.hive_id]);

    const handleHiveSelect = (hive: Hive, shouldScroll = false) => {
        setSelectedHive(hive);
        setFormData(prev => ({
            ...prev,
            hive_id: hive.id.toString(),
        }));
        if (shouldScroll) {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const visibleHives = mapQuery.trim().length === 0
        ? hives
        : hives.filter((hive) => {
            const query = mapQuery.toLowerCase();
            return hive.name.toLowerCase().includes(query)
                || hive.address.toLowerCase().includes(query);
        });

    const getPlanPrice = (plan: 'pay_as_you_go' | 'monthly' | 'yearly') => {
        if (plan === 'pay_as_you_go') {
            return pricing.pay_as_you_go_price;
        }
        if (plan === 'monthly') {
            return pricing.monthly_discount > 0 ? Number(pricing.monthly_discounted_price.toFixed(0)) : pricing.monthly_price;
        }
        return pricing.yearly_discount > 0 ? Number(pricing.yearly_discounted_price.toFixed(0)) : pricing.yearly_price;
    };

    const getPlanLabel = (plan: 'pay_as_you_go' | 'monthly' | 'yearly') => {
        if (plan === 'pay_as_you_go') {
            return 'Pay as you go';
        }
        return plan === 'monthly' ? 'Monthly' : 'Yearly';
    };

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

    const mapCenter: LatLngTuple = selectedHive
        ? [selectedHive.latitude, selectedHive.longitude]
        : [51.5074, -0.1278];

    return (
        <div className={`min-h-screen px-4 py-6 sm:px-6 lg:px-10 ${isDarkMode ? 'bg-zinc-950' : 'bg-[#F8F9FB]'}`}>
            <div className="text-left mb-6">
                <Link to="/host/keys" className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary mb-4">
                    <ChevronLeftIcon className="h-4 w-4" />
                    Back to list
                </Link>
                <h2 className="text-3xl font-bold text-primary">
                    {isEdit ? 'Edit Key' : 'Register Your Key'}
                </h2>
            </div>

            <div className={`relative h-[50vh] w-full rounded-3xl border overflow-hidden shadow-2xl ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
                <MapContainer center={mapCenter} zoom={13} className="h-[50vh] w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <RecenterOnSelect hive={selectedHive} />

                    {visibleHives.map((hive) => (
                        <Marker
                            key={hive.id}
                            position={[hive.latitude, hive.longitude]}
                            eventHandlers={{
                                click: () => handleHiveSelect(hive),
                            }}
                        >
                            <Popup>
                                <HivePopupContent
                                    hive={hive}
                                    onUse={() => handleHiveSelect(hive, true)}
                                />
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <div className="absolute top-6 left-1/2 z-[400] w-full max-w-2xl -translate-x-1/2 px-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className={`h-5 w-5 group-focus-within:text-bumble-yellow transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            className={`block w-full pl-12 pr-12 py-4 border-none rounded-xl shadow-2xl focus:ring-2 focus:ring-bumble-yellow text-sm font-medium transition-all ${isDarkMode ? 'bg-zinc-800 text-white placeholder-zinc-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                            placeholder="Search a BumbleHive by name or address"
                            value={mapQuery}
                            onChange={(e) => setMapQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <button
                                type="button"
                                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-50'}`}
                            >
                                <svg className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        {mapQuery && visibleHives.length > 0 && (
                            <div className={`absolute top-full mt-2 w-full rounded-xl shadow-2xl border overflow-hidden py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                {visibleHives.map(hive => (
                                    <button
                                        key={hive.id}
                                        type="button"
                                    className={`w-full px-6 py-3 flex items-center gap-4 transition-colors text-left ${isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-50'}`}
                                    onClick={() => {
                                        handleHiveSelect(hive);
                                        setMapQuery('');
                                    }}
                                >
                                        <MapPinIcon className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
                                        <div>
                                            <p className="text-sm font-bold text-primary">{hive.name}</p>
                                            <p className="text-xs text-secondary truncate">{hive.address}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div
                ref={formRef}
                className={`mt-8 w-full rounded-[32px] shadow-sm border p-6 sm:p-8 lg:p-10 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {selectedHive && (
                        <div className={`border rounded-2xl p-4 flex items-center gap-4 shadow-sm ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-100'}`}>
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

                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Package</label>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {(['pay_as_you_go', 'monthly', 'yearly'] as const).map((plan) => {
                                const isActive = formData.package_type === plan;
                                const showDiscount = (plan === 'monthly' && pricing.monthly_discount > 0)
                                    || (plan === 'yearly' && pricing.yearly_discount > 0);
                                return (
                                    <button
                                        key={plan}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, package_type: plan }))}
                                        className={`rounded-xl border px-4 py-3 text-left transition-colors ${isActive
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            } ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white hover:border-zinc-600' : ''}`}
                                    >
                                        <div className="text-[10px] text-secondary uppercase tracking-wide">
                                            {plan === 'pay_as_you_go' ? 'Per Key Exchange' : plan === 'monthly' ? 'Per Month' : 'Per Year'}
                                        </div>
                                        <div className={`mt-1 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {getPlanLabel(plan)}
                                        </div>
                                        <div className={`mt-1 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            ${getPlanPrice(plan)}
                                        </div>
                                        {showDiscount && (
                                            <div className="text-xs text-green-600 font-semibold">
                                                {plan === 'monthly' ? pricing.monthly_discount : pricing.yearly_discount}% OFF
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

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
                        {formData.photo && (
                            <div className="mb-3">
                                <div className="h-40 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                                    <img
                                        src={getKeyPhotoSrc(formData.photo)}
                                        alt="Key preview"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="No image uploaded"
                                className={`flex w-full overflow-hidden px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow transition-all text-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50/50 border-gray-200 placeholder-gray-400'}`}
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

export default KeyRegisTrationNew;
