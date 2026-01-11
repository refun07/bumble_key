import { useState, useCallback, useMemo } from 'react';
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
        <div className="h-[calc(100vh-64px)] relative overflow-hidden bg-gray-100 p-4">
            {/* Map Container with Blue Border */}
            <div className="w-full h-full rounded-xl border-2 border-[#3B82F6] overflow-hidden relative shadow-2xl">
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
                                <div className="max-w-[320px] bg-white rounded-2xl overflow-hidden -m-2">
                                    <div className="relative h-40">
                                        <img
                                            src="/bumblehive_preview.png"
                                            alt={selectedHive.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full">
                                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{selectedHive.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{selectedHive.address}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Opening Hours</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Mon - Sat:</span>
                                                    <span className="font-bold text-gray-900">08:00 - 23:00</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Sun:</span>
                                                    <span className="font-bold text-gray-900">08:00 - 22:30</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                                                    <span>25/12/2025:</span>
                                                    <span>9am - 9pm</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-400">
                                                    <span>26/12/2025:</span>
                                                    <span>9am - 9pm</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            className="w-full py-3 bg-[#374151] text-white hover:bg-gray-800 rounded-xl font-bold text-xs"
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bumble-yellow"></div>
                    </div>
                )}

                {/* Floating Search Bar */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-bumble-yellow transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-12 py-4 bg-white border-none rounded-xl shadow-2xl focus:ring-2 focus:ring-bumble-yellow text-sm font-medium transition-all"
                            placeholder="Find a BumbleHive in the Map"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery && (
                            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-2">
                                {hives.map(hive => (
                                    <button
                                        key={hive.id}
                                        className="w-full px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                                        onClick={() => {
                                            setSelectedHive(hive);
                                            setSearchQuery('');
                                            map?.panTo(hive.position);
                                            map?.setZoom(16);
                                        }}
                                    >
                                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{hive.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{hive.address}</p>
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
