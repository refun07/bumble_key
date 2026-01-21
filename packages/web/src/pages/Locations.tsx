import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Hive {
    id: number;
    name: string;
    location_name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    total_cells: number;
    available_cells: number;
    operating_hours: { open: string; close: string } | null;
    photos: string[] | null;
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

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: -33.8688,
    lng: 151.2093
};

// Light gray map style matching the reference
const mapStyles = [
    {
        featureType: 'all',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f5f5f5' }]
    },
    {
        featureType: 'all',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#e0e0e0' }]
    },
    {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }]
    },
    {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#ffffff' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
    },
    {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#dadada' }]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c9c9c9' }]
    },
    {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'transit',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#c9c9c9' }]
    }
];

    const getMarkerIcon = (isSelected: boolean) => ({
        url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
                <path
                    d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"
                    fill="${isSelected ? '#111827' : '#EA580C'}"
                />
                <circle cx="12" cy="11" r="${isSelected ? 5 : 4}" fill="#ffffff"/>
            </svg>
        `),
        scaledSize: new google.maps.Size(
            isSelected ? 36 : 28,
            isSelected ? 48 : 38
        ),
        anchor: new google.maps.Point(
            isSelected ? 18 : 14,
            isSelected ? 48 : 38
        ),
    });


const Locations = () => {
    const [hives, setHives] = useState<Hive[]>([]);
    const [filteredHives, setFilteredHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [showPlanSelect, setShowPlanSelect] = useState(false);
    const [activePlan, setActivePlan] = useState<'pay_as_you_go' | 'monthly' | 'yearly'>('monthly');
    const [pricing, setPricing] = useState<PricingData>({
        pay_as_you_go_price: 5,
        monthly_price: 29,
        yearly_price: 290,
        monthly_discount: 0,
        yearly_discount: 0,
        monthly_discounted_price: 29,
        yearly_discounted_price: 290,
        trial_days: 14,
        currency: 'AUD'
    });

    useEffect(() => {
        setSelectedHive(null);
        setShowPlanSelect(false);
    }, []);

    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    useEffect(() => {
        fetchHives();
    }, []);

    useEffect(() => {
    // Immediate reset
    window.scrollTo(0, 0);

    // Backup reset after map render
    const t = setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);

    return () => clearTimeout(t);
}, []);


    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await api.get('/pricing');
                setPricing(response.data);
            } catch (error) {
                console.error('Failed to fetch pricing:', error);
            }
        };
        fetchPricing();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = hives.filter(hive =>
                hive.name.toLowerCase().includes(search.toLowerCase()) ||
                hive.location_name?.toLowerCase().includes(search.toLowerCase()) ||
                hive.address.toLowerCase().includes(search.toLowerCase()) ||
                hive.city.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredHives(filtered);
            setShowDropdown(true);
        } else {
            setFilteredHives(hives);
            setShowDropdown(false);
        }
    }, [search, hives]);

    useEffect(() => {
        if (map && hives.length > 0 && !search) {
            const bounds = new google.maps.LatLngBounds();
            hives.forEach(hive => {
                if (hive.latitude && hive.longitude) {
                    bounds.extend({ lat: Number(hive.latitude), lng: Number(hive.longitude) });
                }
            });
            map.fitBounds(bounds);
        }
    }, [map, hives, search]);

    const fetchHives = async () => {
        try {
            const response = await api.get('/hives/public');
            setHives(response.data);
            setFilteredHives(response.data);
        } catch (error) {
            console.error('Failed to fetch hives:', error);
        } finally {
            setLoading(false);
        }
    };

 

        // const handleMarkerClick = (hive: Hive) => {
        //     if (selectedHive?.id === hive.id) return;

        //     setSelectedHive(hive);

        //     console.log(hive);

        //     if (map && hive.latitude && hive.longitude) {
        //         const lat = Number(hive.latitude);
        //         const lng = Number(hive.longitude);

        //         map.panTo({
        //             lat: isMobile ? lat - 0.002 : lat,
        //             lng,
        //         });

        //         map.setZoom(15);
        //     }
        // };

        const handleMarkerClick = (hive: Hive) => {
    setSelectedHive(prev => {
        if (prev?.id === hive.id) return prev;
        return hive;
    });

    if (map && hive.latitude && hive.longitude) {
        const lat = Number(hive.latitude);
        const lng = Number(hive.longitude);

        map.panTo({
            lat: isMobile ? lat - 0.0025 : lat,
            lng,
        });

        map.setZoom(15);
    }
};


    const handleSearchItemClick = (hive: Hive) => {
        setSelectedHive(hive);
        setSearch('');
        setShowDropdown(false);
        if (map && hive.latitude && hive.longitude) {
            map.panTo({ lat: Number(hive.latitude), lng: Number(hive.longitude) });
            map.setZoom(15);
        }
    };

    const handleUseHive = () => {
        if (!selectedHive) return;
        localStorage.setItem('public_bumblekey_selection', JSON.stringify(selectedHive));
        setShowPlanSelect(true);
    };

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

    const handlePlanContinue = () => {
        const selectedPlan = {
            id: activePlan,
            label: getPlanLabel(activePlan),
            price: getPlanPrice(activePlan),
            currency: pricing.currency,
        };
        localStorage.setItem('public_bumblekey_plan', JSON.stringify(selectedPlan));
        navigate('/host/signup');
    };

    return (
     <div className="
            relative w-full bg-gray-100 overflow-hidden
            h-[85vh]
            md:h-[90vh]
            lg:h-[92vh]
            max-md:h-[70vh]
        ">



            {/* Full Screen Map */}
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={10}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={() => {
                    // Only close if a hive is already open
                        if (selectedHive) {
                            setSelectedHive(null);
                        }
                    }}

                    options={{
                        styles: mapStyles,
                        disableDefaultUI: true,
                        zoomControl: true,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_CENTER
                        },
                        fullscreenControl: false,
                        gestureHandling: 'greedy'
                    }}
                >
                    {/* Markers */}
                   {hives.map((hive) => {
                    const isSelected = selectedHive?.id === hive.id;

                    return (
                        hive.latitude &&
                        hive.longitude && (
                            <Marker
                                key={hive.id}
                                position={{
                                    lat: Number(hive.latitude),
                                    lng: Number(hive.longitude),
                                }}
                                onClick={() => handleMarkerClick(hive)}
                                icon={getMarkerIcon(isSelected)}
                                zIndex={isSelected ? 999 : 1}
                            />
                        )
                    );
                })}


                    {/* Custom Popup Card */}
                {!isMobile && selectedHive && selectedHive.latitude && selectedHive.longitude && (
                        <div
                            className="relative bg-white rounded-lg shadow-xl w-72 overflow-hidden
                                    touch-manipulation select-none"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >


                        <OverlayView
                            position={{
                                lat: Number(selectedHive.latitude),
                                lng: Number(selectedHive.longitude),
                            }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            getPixelPositionOffset={(width, height) => {
                            const padding = 12;

                            if (isMobile) {
                                const maxWidth = window.innerWidth - padding * 2;

                                const safeX =
                                    width > maxWidth
                                        ? -(maxWidth / 2)
                                        : -(width / 2);

                                return {
                                    x: safeX,
                                    y: padding + 12, // below marker
                                };
                            }

                            return {
                                x: -(width / 2),
                                y: -(height + padding + 38),
                            };
                        }}

                            >
                            <div
                                className="relative bg-white rounded-lg shadow-xl w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedHive(null);
                                }}
                                className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                                >
                                <XMarkIcon className="w-4 h-4 text-gray-600" />
                                </button>

                                {/* Image */}
                                <div className="relative h-36 bg-gray-200">
                                {selectedHive.photos && selectedHive.photos.length > 0 ? (
                                    <img
                                    src={selectedHive.photos[0]}
                                    alt={selectedHive.name}
                                    className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                    src="/bumblehive_location_default.png"
                                    alt="BumbleHive Location"
                                    className="w-full h-full object-cover"
                                    />
                                )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-base mb-1">
                                    {selectedHive.location_name} - {selectedHive.name}
                                </h3>

                                <p className="text-sm text-gray-600 mb-3">
                                    {selectedHive.address}, {selectedHive.city}{" "}
                                    {selectedHive.postal_code}, {selectedHive.country}
                                </p>

                                {selectedHive.operating_hours && (
                                    <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                                        Opening Hours
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Mon - Sat: {selectedHive.operating_hours.open} -{" "}
                                        {selectedHive.operating_hours.close}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Sun: {selectedHive.operating_hours.open} -{" "}
                                        {selectedHive.operating_hours.close}
                                    </p>
                                    </div>
                                )}

                                <button
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleUseHive();
                                    }}
                                    className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors"
                                >
                                    Use This BumbleHive
                                </button>
                                </div>
                            </div>
                        </OverlayView>
                        </div>

                    )}
                </GoogleMap>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-400">Loading map...</p>
                </div>
            )}

            {/* Centered Floating Search Box */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Search Input */}
                    <div className="relative flex items-center">
                        <MagnifyingGlassIcon className="absolute left-4 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find a BumbleHive in the Map"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => hives.length > 0 && setShowDropdown(true)}
                            className="w-full pl-12 pr-12 py-4 border-0 focus:ring-0 outline-none text-gray-900 placeholder-gray-400 text-sm"
                        />
                        <button className="absolute right-4 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Dropdown Results */}
                    {showDropdown && (
                        <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                            ) : (search ? filteredHives : hives).length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">No locations found</div>
                            ) : (
                                (search ? filteredHives : hives).slice(0, 6).map((hive) => (
                                    <button
                                        key={hive.id}
                                        onClick={() => handleSearchItemClick(hive)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                                    >
                                        <div className="w-5 h-5 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" className="w-5 h-5">
                                                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#EA580C" />
                                                <circle cx="12" cy="11" r="4" fill="#ffffff" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 text-sm truncate">
                                            {hive.city}: {hive.name}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Location Count Badge */}
            <div className="absolute bottom-6 left-6 z-10">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100">
                    <p className="text-sm font-medium text-gray-700">
                        <span className="text-orange-600 font-bold">{hives.length}</span> locations found
                    </p>
                </div>
            </div>

            {showPlanSelect && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Subscribe to a Plan</h2>
                            <button
                                onClick={() => setShowPlanSelect(false)}
                                className="rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(['pay_as_you_go', 'monthly', 'yearly'] as const).map((plan) => {
                                const isActive = activePlan === plan;
                                const showDiscount = (plan === 'monthly' && pricing.monthly_discount > 0)
                                    || (plan === 'yearly' && pricing.yearly_discount > 0);
                                return (
                                    <button
                                        key={plan}
                                        onClick={() => setActivePlan(plan)}
                                        className={`w-full rounded-xl border px-5 py-4 text-left transition-colors ${isActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{getPlanLabel(plan)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {plan === 'pay_as_you_go' ? 'Per Key Exchange' : plan === 'monthly' ? 'Per Month' : 'Per Year'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">
                                                    ${getPlanPrice(plan)}
                                                </div>
                                                {showDiscount && (
                                                    <div className="text-xs text-green-600 font-semibold">
                                                        {plan === 'monthly' ? pricing.monthly_discount : pricing.yearly_discount}% OFF
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {showDiscount && (
                                            <div className="mt-1 text-xs text-gray-400 line-through">
                                                Was ${plan === 'monthly' ? pricing.monthly_price : pricing.yearly_price}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handlePlanContinue}
                            className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}


            {/* Mobile Bottom Action Bar */}
      {isMobile && selectedHive && (
            <div className="fixed inset-0 flex items-end z-10">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 transition-opacity"
                    onClick={() => setSelectedHive(null)}
                />

                {/* Bottom Sheet */}
                <div
                    className="
                        relative w-full rounded-t-2xl bg-white shadow-2xl
                        transform transition-transform duration-300 ease-out
                     
                    "
                   
                >
                    {/* Handle */}
                    <div className="flex justify-center pt-3">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedHive(null)}
                        className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="px-5 pt-6 pb-6 space-y-4">
                        {/* Title */}
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                {selectedHive.location_name} – {selectedHive.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {selectedHive.address}, {selectedHive.city},{" "}
                                {selectedHive.postal_code}
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Available Cells</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedHive.available_cells} / {selectedHive.total_cells}
                                </p>
                            </div>

                            {selectedHive.operating_hours && (
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Operating Hours</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedHive.operating_hours.open} –{" "}
                                        {selectedHive.operating_hours.close}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleUseHive}
                            className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:scale-[0.98]"
                        >
                            Use This BumbleHive
                        </button>
                    </div>
                </div>
            </div>
        )}


        </div>
    );
};

export default Locations;
