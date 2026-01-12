import { useEffect, useState } from 'react';
import { useTheme } from '../../store/theme';
import { PuzzlePieceIcon, CheckCircleIcon, ArrowPathIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../store/toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface IntegrationPlatform {
    id: string;
    name: string;
    description: string;
    logo: string;
    status: 'connected' | 'not_connected' | 'syncing';
    lastSync?: string;
}

interface ExternalListing {
    id: number;
    external_id: string;
    name: string;
    address: string;
    key_id: number | null;
}

const Integration = () => {
    const { isDarkMode } = useTheme();
    const { showToast } = useToast();
    const [platforms, setPlatforms] = useState<IntegrationPlatform[]>([
        {
            id: 'airbnb',
            name: 'Airbnb',
            description: 'Sync your Airbnb bookings and automate key collection codes for your guests.',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Belo.svg/2560px-Airbnb_Logo_Belo.svg.png',
            status: 'not_connected'
        },
        {
            id: 'booking',
            name: 'Booking.com',
            description: 'Connect your Booking.com listings to streamline guest check-ins and key management.',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png',
            status: 'not_connected'
        },
        {
            id: 'vrbo',
            name: 'VRBO',
            description: 'Integrate with VRBO to provide a seamless key exchange experience for your vacation rental guests.',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Vrbo_logo.svg/2560px-Vrbo_logo.svg.png',
            status: 'not_connected'
        }
    ]);

    const [isSyncing, setIsSyncing] = useState(false);
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [listings, setListings] = useState<ExternalListing[]>([]);
    const [keys, setKeys] = useState<any[]>([]);
    // const [isLoadingListings, setIsLoadingListings] = useState(false);

    useEffect(() => {
        fetchIntegrationStatus();
        fetchKeys();
    }, []);

    const fetchIntegrationStatus = async () => {
        try {
            const response = await api.get('/hosts/airbnb/integration');
            const integration = response.data.data;
            if (integration) {
                setPlatforms(prev => prev.map(p =>
                    p.id === 'airbnb'
                        ? { ...p, status: 'connected', lastSync: integration.updated_at }
                        : p
                ));
                setListings(integration.external_listings || []);
            }
        } catch (error) {
            console.error('Failed to fetch integration status', error);
        }
    };

    const fetchKeys = async () => {
        try {
            const response = await api.get('/hosts/keys');
            setKeys(response.data.data);
        } catch (error) {
            console.error('Failed to fetch keys', error);
        }
    };

    const handleConnect = async (platformId: string) => {
        if (platformId !== 'airbnb') return;

        try {
            const response = await api.get('/hosts/airbnb/connect');
            // Mocking the redirect and callback for demo
            console.log('Redirecting to:', response.data.auth_url);

            // In a real app, window.location.href = response.data.auth_url;
            // For demo, we just call the callback directly
            await api.get('/hosts/airbnb/callback');
            fetchIntegrationStatus();
        } catch (error) {
            console.error('Failed to connect', error);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await api.get('/hosts/airbnb/sync-listings');
            await api.get('/hosts/airbnb/sync-bookings');
            fetchIntegrationStatus();
        } catch (error) {
            console.error('Failed to sync', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleMapListing = async (listingId: number, keyId: string) => {
        try {
            await api.post(`/hosts/airbnb/listings/${listingId}/map`, { key_id: keyId });
            showToast('Listing mapped successfully', 'success');
            fetchIntegrationStatus();
        } catch (error) {
            console.error('Failed to map listing', error);
            showToast('Failed to map listing', 'error');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Integrations</h2>
                    <p className="text-secondary">Connect your favorite platforms to automate your key management workflow.</p>
                </div>
                <Button
                    variant="outline"
                    className="px-6 py-3 flex items-center gap-2"
                    onClick={handleSync}
                    isLoading={isSyncing}
                >
                    <ArrowPathIcon className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'} ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync All
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                    <div key={platform.id} className={`rounded-3xl border shadow-sm p-8 flex flex-col h-full hover:shadow-md transition-shadow bg-primary border-default`}>
                        <div className="h-12 mb-6 flex items-center justify-between">
                            <div className="h-8 flex items-center">
                                <img
                                    src={platform.logo}
                                    alt={platform.name}
                                    className="h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement?.insertAdjacentHTML('beforeend', '<div class="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center"><svg class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>');
                                    }}
                                />
                            </div>
                            {platform.status === 'connected' && (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Connected</span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-primary mb-2">{platform.name}</h3>
                        <p className="text-sm text-secondary leading-relaxed mb-8 flex-1">
                            {platform.description}
                        </p>

                        <div className="space-y-4">
                            {platform.status === 'connected' ? (
                                <>
                                    <div className={`flex items-center justify-between text-xs font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                                        <span>Last synced:</span>
                                        <span>{platform.lastSync ? new Date(platform.lastSync).toLocaleString() : 'Never'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                                            onClick={() => setIsListingModalOpen(true)}
                                        >
                                            <Cog6ToothIcon className="h-4 w-4" />
                                            Manage
                                        </Button>
                                        <Button variant="outline" className={`flex-1 py-2.5 text-xs transition-all ${isDarkMode ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-100 text-red-500 hover:bg-red-50'}`}>
                                            Disconnect
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Button
                                    variant="bumble"
                                    className="w-full py-3"
                                    onClick={() => handleConnect(platform.id)}
                                >
                                    Connect Platform
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Custom Integration Card */}
                <div className={`rounded-3xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center gap-4 bg-secondary/30 border-default`}>
                    <div className={`p-4 rounded-2xl shadow-sm bg-primary`}>
                        <PuzzlePieceIcon className={`h-8 w-8 text-secondary`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary mb-1">Request Integration</h3>
                        <p className="text-sm text-secondary">Don't see your platform? Let us know and we'll work on it.</p>
                    </div>
                    <Button variant="outline" className="mt-2 px-6 py-2 text-xs">
                        Send Request
                    </Button>
                </div>
            </div>

            {/* Manage Listings Modal */}
            <Transition show={isListingModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsListingModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className={`fixed inset-0 backdrop-blur-sm transition-opacity ${isDarkMode ? 'bg-black/75' : 'bg-black/25'}`} />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-[32px] p-10 text-left align-middle shadow-xl transition-all ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-primary">
                                            Manage Airbnb Listings
                                        </Dialog.Title>
                                        <button onClick={() => setIsListingModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                                            <XMarkIcon className={`h-6 w-6 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {listings.length === 0 ? (
                                            <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                                                <p className="text-secondary">No listings synced yet. Click "Sync All" to fetch your listings.</p>
                                            </div>
                                        ) : (
                                            <div className={`divide-y border-default`}>
                                                {listings.map((listing) => (
                                                    <div key={listing.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-primary truncate">{listing.name}</h4>
                                                            <p className="text-xs text-secondary mt-1 truncate">{listing.address}</p>
                                                        </div>
                                                        <div className="w-full md:w-64">
                                                            <select
                                                                className={`w-full px-4 py-2 text-xs font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-bumble-yellow/20 transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                                                value={listing.key_id || ''}
                                                                onChange={(e) => handleMapListing(listing.id, e.target.value)}
                                                            >
                                                                <option value="">Map to BumbleKey...</option>
                                                                {keys.map(key => (
                                                                    <option key={key.id} value={key.id}>{key.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-10 flex justify-end">
                                        <Button variant="bumble" className="px-8 py-3" onClick={() => setIsListingModalOpen(false)}>
                                            Done
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Integration;
