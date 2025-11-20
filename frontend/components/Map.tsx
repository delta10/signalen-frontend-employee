'use client';

import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// We exporteren het Signal type zodat onze pagina het kan gebruiken.
export type Signal = {
  id: string;
  title?: string;
  text?: string;
  _display?: string;
  status?: 'open' | 'in_progress' | 'closed' | string | { state?: string };
  id_display?: string;
  location?:
    | {
        address_text?: string;
        geometrie?: {
          type: 'Point';
          coordinates: [number, number]; // [longitude, latitude]
        };
      }
    | string;
};

type MapProps = {
  signals: Signal[];
};

// --- Gekleurde Iconen ---
// We definiëren verschillende iconen voor verschillende statussen.
const blueIcon = L.icon({
  // Standaard / Open
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const yellowIcon = L.icon({
  // In behandeling
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = L.icon({
  // Afgehandeld
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greyIcon = L.icon({
  // Geannuleerd
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Functie om het juiste icoon te kiezen op basis van de status.
const getIconForStatus = (status: Signal['status']) => {
  const state =
    typeof status === 'object' && status !== null ? status.state : status;
  if (['o', 'closed'].includes(state ?? '')) return greenIcon; // Afgehandeld
  if (['b', 'in_progress'].includes(state ?? '')) return yellowIcon; // In behandeling
  if (['a', 'cancelled'].includes(state ?? '')) return greyIcon; // Geannuleerd
  return blueIcon; // Standaard voor 'open' en andere statussen
};

// Functie om een leesbare statusnaam te krijgen.
const getStatusDisplayName = (status: Signal['status']): string => {
  const state =
    typeof status === 'object' && status !== null ? status.state : status;
  switch (state) {
    case 'o':
    case 'closed':
      return 'Afgehandeld';
    case 'b':
    case 'in_progress':
      return 'In behandeling';
    case 'a':
    case 'cancelled':
      return 'Geannuleerd';
    case 'm':
    case 'open':
      return 'Open';
    default:
      return 'Onbekend';
  }
};

// Dit component zorgt voor het automatisch inzoomen op de markers.
function AutoZoomController({ signals }: { signals: Signal[] }) {
  const map = useMap();

  useEffect(() => {
    // Verzamel alle geldige coördinaten in een array in plaats van een featureGroup te gebruiken.
    const latLngs: L.LatLngExpression[] = [];

    // Voeg elke geldige coördinaat toe aan de array.
    signals.forEach((signal) => {
      // VEILIGE CHECK: Controleer of 'location' bestaat en een object is (en geen string of null).
      const coords =
        signal.location && typeof signal.location === 'object'
          ? signal.location.geometrie?.coordinates
          : undefined;
      if (
        coords &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number'
      ) {
        latLngs.push([coords[1], coords[0]] as L.LatLngExpression);
      }
    });

    // Als we coördinaten hebben, bepaal de bounds via L.latLngBounds en zoom daar naartoe.
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);

      // ...en controleer of die grenzen geldig zijn...
      if (bounds.isValid()) {
        // ...wacht dan een fractie van een seconde om de kaart de tijd te geven om te renderen...
        setTimeout(() => {
          // ...en voer de zoom alleen uit als de kaart een zichtbare grootte heeft.
          const mapSize = map.getSize();
          if (mapSize.x > 0 && mapSize.y > 0) {
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
          }
        }, 100);
      }
    }
  }, [signals, map]);

  return null; // Dit component rendert zelf niets.
}

// Dit is het nieuwe Legenda component.
function MapLegend() {
  return (
    <div className='leaflet-bottom leaflet-right'>
      <div className='leaflet-control leaflet-bar bg-white p-2 rounded-md shadow-lg'>
        <h4 className='font-bold mb-1'>Legenda</h4>
        <ul>
          <li className='flex items-center mb-1'>
            <img src={blueIcon.options.iconUrl} alt='Open' className='h-4 w-auto mr-2' />
            <span>Open</span>
          </li>
          <li className='flex items-center mb-1'>
            <img src={yellowIcon.options.iconUrl} alt='In behandeling' className='h-4 w-auto mr-2' />
            <span>In behandeling</span>
          </li>
          <li className='flex items-center mb-1'>
            <img src={greenIcon.options.iconUrl} alt='Afgehandeld' className='h-4 w-auto mr-2' />
            <span>Afgehandeld</span>
          </li>
          <li className='flex items-center'>
            <img src={greyIcon.options.iconUrl} alt='Geannuleerd' className='h-4 w-auto mr-2' />
            <span>Geannuleerd</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Map({ signals }: MapProps) {
  return (
    <MapContainer
      center={[52.0907, 5.1214]} // Startpunt, wordt overschreven door AutoZoom
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {signals.map((signal) => {
        const coords =
          signal.location && typeof signal.location === 'object'
            ? signal.location.geometrie?.coordinates
            : undefined;
        if (
          coords &&
          typeof coords[0] === 'number' &&
          typeof coords[1] === 'number'
        ) {
          const position: LatLngExpression = [coords[1], coords[0]];
          const displayTitle =
            signal.title || signal.text || signal._display || 'Geen titel';
          const icon = getIconForStatus(signal.status);
          const statusText = getStatusDisplayName(signal.status);

          return (
            <Marker key={signal.id} position={position} icon={icon}>
              <Popup>
                <b>{displayTitle}</b>
                <br />
                Status: {statusText}
                <br />
                {/* Voeg een link toe naar de detailpagina */}
                <Link
                  href={`/signal/${signal.id}`}
                  className='text-blue-600 hover:underline'
                >
                  Bekijk details
                </Link>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}

      <AutoZoomController signals={signals} />
      <MapLegend />
    </MapContainer>
  );
}
