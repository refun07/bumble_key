import { useState } from 'react';
import {
  GoogleMap,
  Marker,
  Autocomplete,
  InfoWindow,
  useJsApiLoader,
} from '@react-google-maps/api';
import api from '../../services/api';
import Button from '../../components/common/Button';

interface Hive {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos?: string[];
}

const containerStyle = {
  width: '100%',
  height: '60vh',
};

const defaultCenter = {
  lat: 51.5074,
  lng: -0.1278,
};

const MapSearchStep = ({
  onSelectHive,
}: {
  onSelectHive: (hive: Hive) => void;
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [hives, setHives] = useState<Hive[]>([]);
  const [activeHive, setActiveHive] = useState<Hive | null>(null);

  const onPlaceChanged = async () => {
    if (!autocomplete || !map) return;

    const place = autocomplete.getPlace();
    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    map.panTo({ lat, lng });
    map.setZoom(14);

    const res = await api.get('/public/hives/nearby', {
      params: { lat, lng },
    });

    setHives(res.data.data || []);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">
        Find a BumbleKey Nest
      </h1>

      <Autocomplete
        onLoad={setAutocomplete}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          className="w-full mb-4 px-5 py-4 rounded-xl border"
          placeholder="Search any address or place"
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={6}
        onLoad={setMap}
      >
        {hives.map((hive) => (
          <Marker
            key={hive.id}
            position={{
              lat: hive.latitude,
              lng: hive.longitude,
            }}
            onClick={() => setActiveHive(hive)}
          />
        ))}

        {activeHive && (
          <InfoWindow
            position={{
              lat: activeHive.latitude,
              lng: activeHive.longitude,
            }}
            onCloseClick={() => setActiveHive(null)}
          >
            <div className="w-56">
              <div className="font-bold">{activeHive.name}</div>
              <p className="text-xs mt-1">{activeHive.address}</p>

              <Button
                variant="bumble"
                className="mt-3 w-full text-xs"
                onClick={() => onSelectHive(activeHive)}
              >
                Use this BumbleKey Nest
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
};

export default MapSearchStep;
