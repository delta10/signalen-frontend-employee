'use client';

import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Fix voor het standaard marker-icoon dat niet goed laadt met Webpack/Next.js.
// Dit zorgt ervoor dat het icoon correct wordt weergegeven.
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Het Signal type, dit moet overeenkomen met het type in je pagina's.
type Signal = {
  id: string;
  title?: string;
  location?:
    | {
        address_text?: string;
        geometrie?: {
          type: 'Point';
          coordinates: [number, number]; // [longitude, latitude]
        };
      }
    | string;
  // Velden toegevoegd voor een completere popup
  text?: string;
  _display?: string;
  id_display?: string;
  status?: 'open' | 'in_progress' | 'closed' | string | { state?: string };
};

type MapProps = {
  center: LatLngExpression;
  signals: Signal[]; // Accepteer een lijst van signalen
};

export default function Map({ center, signals }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {signals.map((signal) => {
        // Controleer of de locatie en coördinaten bestaan
        if (
          typeof signal.location === 'object' && // Locatie is een object
          signal.location.geometrie && // Het bevat geometrie
          signal.location.geometrie.coordinates && // Het bevat coördinaten
          signal.location.geometrie.coordinates.length === 2 // Het is een array met 2 nummers
        ) {
          const coords = signal.location.geometrie.coordinates;
          // Leaflet verwacht [latitude, longitude], de API geeft [longitude, latitude]
          // Dus we draaien ze om: [coords[1], coords[0]]
          const position: LatLngExpression = [coords[1], coords[0]];

          // Gebruik de meest relevante titel voor de popup
          const displayTitle =
            signal.title || signal.text || signal._display || 'Geen titel';

          return (
            <Marker key={signal.id} position={position}>
              <Popup>
                <b>{displayTitle}</b>
                <br />
                {signal.location.address_text || 'Locatie onbekend'}
              </Popup>
            </Marker>
          );
        }
        return null; // Geen marker als er geen coördinaten zijn
      })}
    </MapContainer>
  );
}
