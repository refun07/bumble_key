import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
    latitude: number;
    longitude: number;
    zoom?: number;
    onChange: (lat: number, lng: number) => void;
}

const RecenterMap = ({ latitude, longitude, zoom = 16 }: Props) => {
    const map = useMap();

    useEffect(() => {
        if (latitude && longitude) {
            map.setView([latitude, longitude], zoom, {
                animate: true
            });
        }
    }, [latitude, longitude, zoom, map]);

    return null;
};

const DraggableMarker = ({ latitude, longitude, onChange }: Props) => {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        }
    });

    return (
        <Marker
            position={[latitude, longitude]}
            draggable
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    onChange(pos.lat, pos.lng);
                }
            }}
        />
    );
};

const LocationPicker = ({ latitude, longitude, zoom = 16, onChange }: Props) => {
    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-default">
            <MapContainer
                center={[latitude || 51.5074, longitude || -0.1278]}
                zoom={zoom}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap
                    latitude={latitude}
                    longitude={longitude}
                    zoom={zoom}
                    onChange={onChange}
                />
                <DraggableMarker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={onChange}
                />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
