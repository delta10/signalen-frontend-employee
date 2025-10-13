'use client';

import Image from 'next/image';
import * as React from 'react';
import { SheetDemo } from './message';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
//import { List } from 'lucide-react';
import { ListSignals } from '../server/listSignals';
//import { Sign } from 'crypto';
import { useEffect } from 'react';
import Link from 'next/dist/client/link';

const filtered: ListSignal[] = []; // Placeholder for filtered signals
interface ListSignal {
  id_display: string;
  // title?: string;
  priority?: string;
  category?: {
    main?: string;
    sub?: string;
  };
  location?: {
    area_name?: string;
    address_text?: string;
  };
  created_at?: string;
  assigned_user_email?: string;
  directing_department?: {
    name?: string
  };
  status?: {
    text?: string;
    state_display?: 'Gemeld' |
                    'In behandeling' |
                    'afgehandeld' |
                    'In afwachting van behandeling' |
                    'Doorgezet naar extern' |
                    'Reactie gevraagd' |
                    'Ingepland' |
                    'Extern: verzoek tot afhandeling' |
                    'Geannuleerd' |
                    string;
  };
};

async function grabSignals() {
  const testServers = await ListSignals();
  console.log("testServers", testServers);

  if (!Array.isArray(testServers)) {
    //toastr.error("Failed to fetch servers", "Error");
    console.error("Expected an array of signals, but got:", testServers);
    return [];
  }
  const signals: ListSignal[] = [];
  for (const s of testServers) {
    signals.push({
      id_display: s.id_display,
      priority: s.priority,
      category: {
        main: s.category.main,
        sub: s.category.sub,
      },
      location: {
        area_name: s.location.area_name,
        address_text: s.location.address_text,
      },
      created_at: s.created_at,
      assigned_user_email: s.assigned_user_email,
      directing_department: {
        name: s.directing_department.name
      },
      status: {
        text: s.status.text,
        state_display: s.status.state_display
      }
      });
  }
  return signals;
}

export default function Home() {
  const [signals, setSignals] = React.useState<ListSignal[]>([]);
  //const [loading, setLoading] = React.useState(true);
  //const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | string>('all');

    useEffect(() => {
    const loadSignals = async () => {
      const fetchedSignals = await grabSignals();
      console.log("fetchedSignals", fetchedSignals);
      setSignals(Array.isArray(fetchedSignals) ? fetchedSignals : []);
    };
    loadSignals();
  }, []);

  const loadMockData = () => {
    setSignals([
      {
        id_display: 'S-001',
        location: {
          address_text: 'Parkstraat 12',
        },
        assigned_user_email: 'J. de Boer',
        status: {
          state_display: 'open',
          text: 'Kapotte lantaarnpaal',
        },
      },
      {
        id_display: 'S-002',
        location: {
          address_text: 'Dorpsplein',
        },
        assigned_user_email: 'M. van Dijk',
        status: {
          state_display: 'in_progress',
          text: 'Zwerfvuil bij speeltuin',
        },
      },
      {
        id_display: 'S-003',
        location: {
          address_text: 'Stationsweg 3',
        },
        assigned_user_email: 'A. Klaassen',
        status: {
          state_display: 'closed',
          text: 'Gevallen boom verwijderd',
        },
      },
    ]);
  };


  return (
    <div className='min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-12 dark:bg-slate-900 dark:text-slate-100'>
      <header className='mx-auto mb-8 max-w-6xl'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Image
              src='/next.svg'
              alt='Logo'
              width={140}
              height={28}
              className='dark:invert'
            />

          </div>

          <div className='hidden gap-2 sm:flex'>
            <Button onClick={() => console.log('Nieuwe melding')}>
              Nieuwe melding
            </Button>
            <Button onClick={() => grabSignals()}>Ververs</Button>
            <Button onClick={() => loadMockData()}>Load Mock Data</Button>
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Zoek op id, titel, locatie of melder…'
            className='w-full rounded border border-slate-200 bg-white px-3 py-2 focus:ring-2 focus:ring-sky-400 focus:outline-none sm:w-1/3 dark:border-slate-700 dark:bg-slate-800'
          />
          <div className='flex gap-2'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='rounded border border-slate-200 bg-white px-2 py-2 focus:outline-none dark:border-slate-700 dark:bg-slate-800'
            >
              <option value='all'>Alle statussen</option>
              <option value='open'>Gemeld</option>
              <option value='afwachting'>In afwachting van behandeling</option>
              <option value='reactie_gevraagd'>Reactie gevraagd</option>
              <option value='ingepland'>Ingepland</option>
              <option value='in_progress'>In behandeling</option>
              <option value='verzoek_afhandeling_extern'>
                Extern: verzoek tot afhandeling
              </option>
              <option value='door_extern'>Doorgezet naar extern</option>
              <option value='closed'>Afgehandeld</option>
              <option value='geannuleerd'>Geannuleerd</option>
            </select>
            <Button
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </header>

      {signals.map(signal => (
        <div
          key={signal.id_display}
          className="flex items-center justify-between bg-secondary-700 border border-transparent rounded-lg px-5 py-4
          hover:border-secondary-500 duration-300"
        >
          <Link
            href={`/dashboard/server/${signal.id_display}/overview`}
            className="flex items-center gap-2 text-sm flex-1"
          >
            <div>
              <div className="flex items-center gap-x-2">
                <h2 className="text-lg font-medium text-secondary-100">{signal.category?.main}</h2>
                <span
                  className={`badge badge-variant-secondary m-1 ${signal.status?.state_display === 'gemeld' ? 'badge-success' : 'badge-danger'
                    }`}
                >
                  {signal.status?.state_display}
                </span>
              </div>
              <span className="block text-sm w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                {signal.status?.text}
              </span>
            </div>
            <div className="w-48">
              <span className="text-secondary-300 font-medium text-sm">Toegewezen aan</span>
              <p>{signal.assigned_user_email}</p>
            </div>
            <div className="w-48">
              <span className="text-secondary-300 font-medium text-sm">Gemeld op</span>
              <p>{signal.created_at}</p>
            </div>
          </Link>
          <div
            className="w-48 cursor-pointer text-secondary-300 font-medium text-sm"
          >
            <span className="text-2xl">...</span>
          </div>
        </div>
      ))}

        <div className='mt-4 flex gap-2 sm:hidden'>
          <Button onClick={() => console.log('Nieuwe melding')}>
            Nieuwe melding
          </Button>
          <Button onClick={() => grabSignals()}>Ververs</Button>
        </div>
    </div>
  );
}
