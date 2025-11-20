'use client';

import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// DE SIMPELE FIX: We maken één icoon-object met directe links naar de afbeeldingen.
// Dit voorkomt alle "iconUrl not set" fouten.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Het Signal type, dit moet overeenkomen met het type in je pagina's.
export type Signal = {
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

// Dit component zorgt voor het automatisch inzoomen op de markers.
function AutoZoomController({ signals }: { signals: Signal[] }) {
  const map = useMap();

  useEffect(() => {
    // Maak een onzichtbare laag voor de markers.
    const markerGroup = L.featureGroup();

    // Voeg elke marker toe aan deze laag.
    signals.forEach((signal) => {
      const coords =
        typeof signal.location === 'object'
          ? signal.location.geometrie?.coordinates
          : undefined;
      if (
        coords &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number'
      ) {
        L.marker([coords[1], coords[0]]).addTo(markerGroup);
      }
    });

    // Als er markers zijn...
    if (markerGroup.getLayers().length > 0) {
      // ...vraag aan Leaflet zelf wat de grenzen zijn...
      const bounds = markerGroup.getBounds();

      // ...en controleer of die grenzen geldig zijn...
      if (bounds.isValid()) {
        // ...wacht dan een fractie van een seconde om de kaart de tijd te geven om te renderen...
        setTimeout(() => {
          // ...en voer de zoom alleen uit als de kaart een zichtbare grootte heeft.
          if (map.getSize().x > 0 && map.getSize().y > 0) {
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
          }
        }, 100);
      }
    }
  }, [signals, map]);

  return null; // Dit component rendert zelf niets.
}

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
            <Marker key={signal.id} position={position} icon={defaultIcon}>
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

      <AutoZoomController signals={signals} />
    </MapContainer>
  );
}
