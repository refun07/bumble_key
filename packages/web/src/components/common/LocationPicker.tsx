import { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
    label?: string;
    error?: string;
}

const LocationPicker = ({ latitude, longitude, onChange, label = "Set Location on Google Map", error }: LocationPickerProps) => {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [manualLat, setManualLat] = useState(latitude?.toString() || '');
    const [manualLng, setManualLng] = useState(longitude?.toString() || '');

    useEffect(() => {
        if (latitude) setManualLat(latitude.toString());
        if (longitude) setManualLng(longitude.toString());
    }, [latitude, longitude]);

    // Manual change handler removed as it was unused
    /*
    const handleManualChange = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (!isNaN(lat) && !isNaN(lng)) {
            onChange(lat, lng);
        }
    };
    */

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{label}</label>

            <div
                className={`relative w-full h-64 rounded-3xl border-2 border-dashed ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group`}
                onClick={() => setIsMapOpen(!isMapOpen)}
            >
                {latitude && longitude ? (
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-bumble-yellow/20 flex items-center justify-center mx-auto text-bumble-yellow-dark">
                            <MapPinIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Location Selected</p>
                            <p className="text-sm text-gray-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
                        </div>
                        <p className="text-xs text-gray-400 group-hover:text-bumble-yellow transition-colors">Click to change</p>
                    </div>
                ) : (
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-gray-400 group-hover:scale-110 transition-transform duration-300">
                            <MapPinIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">Google Maps Integration</p>
                            <p className="text-gray-500">Click to set coordinates</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Input Fallback (Visible when map is "open" or for fine-tuning) */}
            {isMapOpen && (
                <div className="bg-gray-50 rounded-[32px] p-8 mt-4 animate-fade-in-up">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={manualLat}
                                onChange={(e) => {
                                    setManualLat(e.target.value);
                                    const lat = parseFloat(e.target.value);
                                    const lng = parseFloat(manualLng);
                                    if (!isNaN(lat) && !isNaN(lng)) onChange(lat, lng);
                                }}
                                className="w-full bg-transparent border-none p-0 text-gray-500 placeholder-gray-300 focus:ring-0 text-lg font-medium"
                                placeholder="-37.8136"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={manualLng}
                                onChange={(e) => {
                                    setManualLng(e.target.value);
                                    const lat = parseFloat(manualLat);
                                    const lng = parseFloat(e.target.value);
                                    if (!isNaN(lat) && !isNaN(lng)) onChange(lat, lng);
                                }}
                                className="w-full bg-transparent border-none p-0 text-gray-500 placeholder-gray-300 focus:ring-0 text-lg font-medium"
                                placeholder="144.9631"
                            />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200/50">
                        <p className="text-xs text-gray-400 font-medium">
                            * Enter coordinates manually or use the map picker (requires API key).
                        </p>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default LocationPicker;
