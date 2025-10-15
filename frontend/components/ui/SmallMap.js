'use client';

import { useEffect } from 'react';
import L from 'leaflet';

import markerIcon2x from '../../public/leaflet/marker-icon-2x.png';
import markerIcon from '../../public/leaflet/marker-icon.png';
import markerShadow from '../../public/leaflet/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const MAP_CONTAINER_ID = 'map-container';

const SmallMap = ({ lon, lat }) => {
  useEffect(() => {
    if (typeof lon !== 'number' || typeof lat !== 'number') {
      console.error('Ongeldige coördinaten ontvangen in SmallMap');
      return;
    }

    const mapContainer = document.getElementById(MAP_CONTAINER_ID);

    if (mapContainer && !mapContainer._leaflet_id) {

      const map = L.map(MAP_CONTAINER_ID).setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup('De Locatie')
        .openPopup();

      return () => {
        map.remove();
      };
    }
  }, [lon, lat]);

  return (
    <div
      id={MAP_CONTAINER_ID}
      className="h-64 w-full rounded-lg shadow-lg z-0 border border-gray-200"
    />
  );
};

export default SmallMap;