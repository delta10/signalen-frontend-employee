'use client';

import { useEffect } from 'react';
import * as React from 'react';
import 'leaflet/dist/leaflet.css';
// De CSS voor react-leaflet-cluster wordt automatisch geïnjecteerd.
import Link from 'next/link';
import L, { LatLngExpression } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// We exporteren het Signal type zodat onze pagina het kan gebruiken.
export type Signal = {
  id: string;
  title?: string;
  text?: string;
  text_extra?: string;
  _display?: string;
  status?:
    | 'open'
    | 'in_progress'
    | 'closed'
    | string
    | { state?: string; text?: string; state_display?: string };
  priority?: 'hoog' | 'normaal' | 'laag';
  category?: string;
  created_at?: string; // API geeft string, we parsen dit naar een Date
  assignee?: { first_name: string; last_name: string } | null;
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

// Helper om de datum netjes te formatteren (NL)
const formatNLDate = (date: Date) => {
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

// Helper voor de status badge in de popup
const getStatusInfoForPopup = (status: Signal['status']) => {
  const state =
    typeof status === 'object' && status !== null ? status.state : status;

  if (['b', 'in_progress'].includes(state ?? '')) {
    return {
      label: 'In behandeling',
      icon: <Clock className='mr-1.5 h-3.5 w-3.5' />,
      className:
        'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
  }
  if (['o', 'closed'].includes(state ?? '')) {
    return {
      label: 'Afgehandeld',
      icon: <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />,
      className:
        'border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300',
    };
  }
  if (['a', 'cancelled'].includes(state ?? '')) {
    return {
      label: 'Geannuleerd',
      icon: <XCircle className='mr-1.5 h-3.5 w-3.5' />,
      className:
        'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };
  }
  return {
    label: 'Gemeld',
    icon: <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />, // Using CheckCircle for Open as a default
    className:
      'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  };
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
      return 'Gemeld';
    default:
      return 'Onbekend';
  }
};

// Dit is het nieuwe Legenda component.
function MapLegend() {
  return (
    <div className='leaflet-bottom leaflet-right'>
      <div className='leaflet-control leaflet-bar rounded-md bg-white p-2 shadow-lg'>
        <h4 className='mb-1 font-bold'>Legenda</h4>
        <ul>
          <li className='mb-1 flex items-center'>
            <img
              src={blueIcon.options.iconUrl}
              alt='Open'
              className='mr-2 h-4 w-auto'
            />
            <span>Gemeld</span>
          </li>
          <li className='mb-1 flex items-center'>
            <img
              src={yellowIcon.options.iconUrl}
              alt='In behandeling'
              className='mr-2 h-4 w-auto'
            />
            <span>In behandeling</span>
          </li>
          <li className='mb-1 flex items-center'>
            <img
              src={greenIcon.options.iconUrl}
              alt='Afgehandeld'
              className='mr-2 h-4 w-auto'
            />
            <span>Afgehandeld</span>
          </li>
          <li className='flex items-center'>
            <img
              src={greyIcon.options.iconUrl}
              alt='Geannuleerd'
              className='mr-2 h-4 w-auto'
            />
            <span>Geannuleerd</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Functie om aangepaste cluster-iconen te maken.
// Dit maakt de clusters duidelijker door ze een kleur en grootte te geven
// op basis van het aantal meldingen dat ze bevatten.
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let sizeClass = '';
  let iconSize: [number, number];

  if (count < 10) {
    sizeClass = 'bg-sky-500'; // Blauw voor kleine clusters
    iconSize = [30, 30];
  } else if (count < 100) {
    sizeClass = 'bg-yellow-500'; // Geel voor medium clusters
    iconSize = [40, 40];
  } else {
    sizeClass = 'bg-red-500'; // Rood voor grote clusters
    iconSize = [50, 50];
  }

  return L.divIcon({
    html: `<div class="flex h-full w-full items-center justify-center rounded-full text-white font-bold text-sm ${sizeClass}">${count}</div>`,
    className:
      'marker-cluster-custom rounded-full border-2 border-white shadow-md',
    iconSize: iconSize,
  });
};

const mockSignalsForMap: Signal[] = [
  {
    id: 'MOCK-001',
    title: 'Losliggende stoeptegel',
    location: {
      address_text: 'Domplein, Utrecht',
      geometrie: {
        type: 'Point',
        coordinates: [5.1216, 52.0907], // [lon, lat]
      },
    },
    status: { state: 'm', state_display: 'Gemeld' },
    priority: 'hoog',
    created_at: '2024-05-21T11:00:00Z',
  },
  {
    id: 'MOCK-002',
    title: 'Overvolle prullenbak',
    location: {
      address_text: 'Ledig Erf, Utrecht',
      geometrie: {
        type: 'Point',
        coordinates: [5.123, 52.0825], // [lon, lat]
      },
    },
    status: { state: 'b', state_display: 'In behandeling' },
    priority: 'normaal',
    created_at: '2024-05-20T15:00:00Z',
  },
  {
    id: 'MOCK-003',
    title: 'Gat in de weg',
    location: {
      address_text: 'Amsterdamsestraatweg 100, Utrecht',
      geometrie: {
        type: 'Point',
        coordinates: [5.098, 52.098], // [lon, lat]
      },
    },
    status: { state: 'o', state_display: 'Afgehandeld' },
    priority: 'laag',
    created_at: '2024-05-19T09:00:00Z',
  },
];

export default function Map({ signals: signalsFromProps = [] }: MapProps) {
  const [signals, setSignals] = React.useState<Signal[]>(signalsFromProps);

  useEffect(() => {
    setSignals(signalsFromProps);
  }, [signalsFromProps]);

  const handleLoadMockData = () => {
    setSignals(mockSignalsForMap);
  };

  return (
    <div className='relative h-full w-full'>
      {signals.length === 0 && (
        <div className='absolute inset-0 z-[1000] flex items-center justify-center'>
          <Button
            onClick={handleLoadMockData}
            variant='default'
            spellCheck='false'
          >
            Fout bij laden, toon voorbeelddata
          </Button>
        </div>
      )}
      <MapContainer
        center={[52.0907, 5.1214]} // Startpunt
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className={signals.length === 0 ? 'opacity-50' : ''}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {/* Leaflet-specifieke componenten moeten directe kinderen zijn */}
        <MarkerClusterGroup
          // Optie om clustering uit te schakelen bij een hoog zoomniveau.
          // Vanaf zoomniveau 16 worden alle markers individueel getoond.
          // Dit is handig om alle details te zien als je ver bent ingezoomd.
          disableClusteringAtZoom={16}
          iconCreateFunction={createClusterCustomIcon}
        >
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
              const statusInfo = getStatusInfoForPopup(signal.status);
              const locationText =
                typeof signal.location === 'object'
                  ? signal.location.address_text
                  : signal.location;
              const descriptionText =
                (typeof signal.status === 'object' && signal.status?.text) ||
                signal.text_extra;

              return (
                <Marker key={signal.id} position={position} icon={icon}>
                  <Popup minWidth={240} maxWidth={320}>
                    <div className='text-sm text-slate-800'>
                      {/* Bovenste sectie: Status en Prioriteit */}
                      <div className='mb-3 flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className={`font-semibold ${statusInfo.className}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                          <span className='font-mono text-sm text-slate-500'>
                            #{signal.id}
                          </span>
                        </div>
                        {signal.priority === 'hoog' && (
                          <div className='flex items-center text-xs font-semibold text-orange-600'>
                            <AlertTriangle className='mr-1 h-4 w-4' />
                            Hoge prioriteit
                          </div>
                        )}
                      </div>

                      {/* Melding informatie */}
                      <div className='flex flex-col gap-2.5'>
                        <h3 className='line-clamp-2 leading-tight font-semibold text-slate-900'>
                          {displayTitle}
                        </h3>
                        <p className='line-clamp-2 text-slate-600'>
                          {descriptionText}
                        </p>

                        <div className='border-t border-slate-200 pt-2.5'>
                          {locationText && (
                            <div className='flex items-center text-slate-600'>
                              <span className='mr-2'>📍</span>
                              <span>{locationText}</span>
                            </div>
                          )}
                          {signal.created_at && (
                            <div className='mt-1.5 flex items-center text-slate-600'>
                              <span className='mr-2'>🕐</span>
                              <span>
                                {formatNLDate(new Date(signal.created_at))}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Link naar details */}
                        <div className='mt-3 border-t border-slate-200 pt-3'>
                          <Link
                            href={`/signal/${signal.id}`}
                            className='font-semibold text-sky-600 hover:underline'
                          >
                            Bekijk details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MarkerClusterGroup>
      </MapContainer>
      {/* Niet-Leaflet componenten zoals de legenda worden buiten de MapContainer geplaatst */}
      <MapLegend />
    </div>
  );
}
