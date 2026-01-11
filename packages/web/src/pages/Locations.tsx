import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { Link } from 'react-router-dom';

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

const Locations = () => {
    const [hives, setHives] = useState<Hive[]>([]);
    const [filteredHives, setFilteredHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);

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

    const handleMarkerClick = (hive: Hive) => {
        setSelectedHive(hive);
        if (map && hive.latitude && hive.longitude) {
            map.panTo({ lat: Number(hive.latitude), lng: Number(hive.longitude) });
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

    return (
        <div className="h-screen w-full relative bg-gray-100">
            {/* Full Screen Map */}
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={10}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={() => setSelectedHive(null)}
                    options={{
                        styles: mapStyles,
                        disableDefaultUI: true,
                        zoomControl: true,
                        zoomControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_CENTER
                        },
                        fullscreenControl: false
                    }}
                >
                    {/* Markers */}
                    {hives.map((hive) => (
                        hive.latitude && hive.longitude && (
                            <Marker
                                key={hive.id}
                                position={{ lat: Number(hive.latitude), lng: Number(hive.longitude) }}
                                onClick={() => handleMarkerClick(hive)}
                                icon={{
                                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38">
                                            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#EA580C"/>
                                            <circle cx="12" cy="11" r="4" fill="#ffffff"/>
                                        </svg>
                                    `),
                                    scaledSize: new google.maps.Size(28, 38),
                                    anchor: new google.maps.Point(14, 38)
                                }}
                            />
                        )
                    ))}

                    {/* Custom Popup Card */}
                    {selectedHive && selectedHive.latitude && selectedHive.longitude && (
                        <OverlayView
                            position={{ lat: Number(selectedHive.latitude), lng: Number(selectedHive.longitude) }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            getPixelPositionOffset={(width, height) => ({
                                x: -(width / 2),
                                y: -(height + 45)
                            })}
                        >
                            <div className="bg-white rounded-lg shadow-xl w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {/* Close button */}
                                <button
                                    onClick={() => setSelectedHive(null)}
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
                                        {selectedHive.address}, {selectedHive.city} {selectedHive.postal_code}, {selectedHive.country}
                                    </p>

                                    {selectedHive.operating_hours && (
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                                                Opening Hours
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Mon - Sat: {selectedHive.operating_hours.open} - {selectedHive.operating_hours.close}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Sun: {selectedHive.operating_hours.open} - {selectedHive.operating_hours.close}
                                            </p>
                                        </div>
                                    )}

                                    <Link to="/host/signup">
                                        <button className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors">
                                            Use This BumbleHive
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </OverlayView>
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
        </div>
    );
};

export default Locations;
