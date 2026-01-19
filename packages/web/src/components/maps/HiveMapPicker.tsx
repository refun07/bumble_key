import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { LatLngTuple } from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Hive {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

interface Props {
    hives: Hive[];
    selectedHiveId?: number;
    onSelect: (hive: Hive) => void;
}

/* ---------------- Recenter On Select ---------------- */

const RecenterOnSelect = ({ hive }: { hive?: Hive }) => {
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

/* ---------------- Hive Map Picker ---------------- */

const HiveMapPicker = ({ hives, selectedHiveId, onSelect }: Props) => {
    const selectedHive = hives.find(h => h.id === selectedHiveId);

    const center: LatLngTuple =
        selectedHive
            ? [selectedHive.latitude, selectedHive.longitude]
            : [51.5074, -0.1278]; // London fallback

    return (
        <div className="hive-map-picker h-[300px] w-full rounded-xl overflow-hidden border border-default">
            <MapContainer
                center={center}
                zoom={13}
                className="h-full w-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <RecenterOnSelect hive={selectedHive} />

                {hives.map((hive) => (
                    <Marker
                        key={hive.id}
                        position={[hive.latitude, hive.longitude]}
                        eventHandlers={{
                            click: () => onSelect(hive),
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{hive.name}</strong>
                                <div className="text-xs mt-1">{hive.address}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default HiveMapPicker;
