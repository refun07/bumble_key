import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../store/theme';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 51.5074,
    lng: -0.1278
};

const mapOptions = {
    styles: [
        {
            "featureType": "all",
            "elementType": "all",
            "stylers": [
                { "saturation": -100 },
                { "gamma": 0.5 }
            ]
        }
    ],
    disableDefaultUI: true,
    zoomControl: false,
};

const BumbleHiveMap = () => {
    const { isDarkMode } = useTheme();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "" // Placeholder for API Key
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHive, setSelectedHive] = useState<any>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const hives = useMemo(() => [
        { id: 1, name: 'Melbourne - IGA Xpress St Kilda Road', address: '21-22 Embankment Pl, London WC2N 6NN, UK', position: { lat: 51.5094, lng: -0.1298 } },
        { id: 2, name: 'Melbourne: Ezymart Bourke Street', address: 'Bourke St, Melbourne VIC 3000', position: { lat: 51.5054, lng: -0.1258 } },
        { id: 3, name: 'Melbourne - Flinders Gifts', address: 'Flinders St, Melbourne VIC 3000', position: { lat: 51.5034, lng: -0.1238 } },
        { id: 4, name: 'Melbourne: Ezymart 180 Russell', address: 'Russell St, Melbourne VIC 3000', position: { lat: 51.5114, lng: -0.1318 } },
        { id: 5, name: 'Embakment - Ap Food Express', address: '21-22 Embankment Pl, London WC2N 6NN, UK', position: { lat: 51.5074, lng: -0.1278 }, isMain: true },
    ], []);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    return (
        <div className={`h-[calc(100vh-64px)] relative overflow-hidden p-4 ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-100'}`}>
            {/* Map Container with Blue Border */}
            <div className={`w-full h-full rounded-xl border-2 overflow-hidden relative shadow-2xl ${isDarkMode ? 'border-zinc-800' : 'border-[#3B82F6]'}`}>
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={14}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={mapOptions}
                    >
                        {hives.map(hive => (
                            <Marker
                                key={hive.id}
                                position={hive.position}
                                onClick={() => setSelectedHive(hive)}
                                icon={{
                                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                                    fillColor: "#F97316",
                                    fillOpacity: 1,
                                    strokeWeight: 2,
                                    strokeColor: "#FFFFFF",
                                    scale: 2,
                                    anchor: new google.maps.Point(12, 22)
                                }}
                            />
                        ))}

                        {selectedHive && (
                            <InfoWindow
                                position={selectedHive.position}
                                onCloseClick={() => setSelectedHive(null)}
                            >
                                <div className={`max-w-[320px] rounded-2xl overflow-hidden -m-2 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                    <div className="relative h-40">
                                        <img
                                            src="/bumblehive_preview.png"
                                            alt={selectedHive.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <div className={`backdrop-blur-md p-1.5 rounded-full ${isDarkMode ? 'bg-black/20' : 'bg-white/20'}`}>
                                                <svg className={`h-4 w-4 ${isDarkMode ? 'text-white/70' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary">{selectedHive.name}</h3>
                                            <p className="text-xs text-secondary mt-1 leading-relaxed">{selectedHive.address}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Opening Hours</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-secondary">Mon - Sat:</span>
                                                    <span className="font-bold text-primary">08:00 - 23:00</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-secondary">Sun:</span>
                                                    <span className="font-bold text-primary">08:00 - 22:30</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-secondary pt-1">
                                                    <span>25/12/2025:</span>
                                                    <span>9am - 9pm</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-secondary">
                                                    <span>26/12/2025:</span>
                                                    <span>9am - 9pm</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${isDarkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-[#374151] text-white hover:bg-gray-800'}`}
                                            onClick={() => console.log('Selected Hive:', selectedHive.id)}
                                        >
                                            Use This BumbleHive
                                        </Button>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
                    </div>
                )}

                {/* Floating Search Bar */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className={`h-5 w-5 group-focus-within:text-bumble-yellow transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            className={`block w-full pl-12 pr-12 py-4 border-none rounded-xl shadow-2xl focus:ring-2 focus:ring-bumble-yellow text-sm font-medium transition-all ${isDarkMode ? 'bg-zinc-800 text-white placeholder-zinc-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                            placeholder="Find a BumbleHive in the Map"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <button className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-50'}`}>
                                <svg className={`h-5 w-5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery && (
                            <div className={`absolute top-full mt-2 w-full rounded-xl shadow-2xl border overflow-hidden py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                {hives.map(hive => (
                                    <button
                                        key={hive.id}
                                        className={`w-full px-6 py-3 flex items-center gap-4 transition-colors text-left ${isDarkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-50'}`}
                                        onClick={() => {
                                            setSelectedHive(hive);
                                            setSearchQuery('');
                                            map?.panTo(hive.position);
                                            map?.setZoom(16);
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
        </div>
    );
};

export default BumbleHiveMap;
