'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { FetchListSignals } from '@/server/fetch-list-signals';
// Dynamically import the Map component to prevent SSR issues with Leaflet (window is not defined)
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Kaart wordt geladen...</p>,
});
import type { Signal as MapSignal } from '@/components/Map';
import { Button } from '@/components/ui/button';
import { ListSignal } from '@/interfaces/list-signal';

async function fetchSignals() {
  const responseSignals = await FetchListSignals();
} 

type ListSignal = MapSignal; // Gebruik het Signal type van de Map component

export default function Home() {
  const [signals, setSignals] = React.useState<ListSignal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | string>('all');
  const [view, setView] = React.useState<'table' | 'map'>('table'); // State voor de weergave

  React.useEffect(() => {
    const loadSignals = async () => {
      const fetchedSignals = await fetchSignals();
      setSignals(fetchedSignals);
    };
    loadSignals();
  }, []);


  // helper: bepaal de 'state' van een item (backend geeft object of string)
  const getState = (item: any) => {
    if (!item) return '';
    if (typeof item.status === 'string') return item.status;
    return item.status?.state ?? String(item.status ?? '');
  };

  // map UI-filterwaarden naar backend-state codes (pas aan indien nodig)
  const statusFilterMap: Record<string, string[]> = {
    open: ['m'], // "Gemeld"
    in_progress: ['b'], // "In behandeling"
    closed: ['o'], // "Afgehandeld"
    afwachting: ['i'], // "In afwachting van behandeling"
    door_extern: ['forward to external'], // "Doorgezet naar extern"
    reactie_gevraagd: ['reaction requested'], // "Reactie gevraagd"
    ingepland: ['ingepland'], // "Ingepland"
    verzoek_afhandeling_extern: ['closure requested'], // "Extern: verzoek tot afhandeling"
    geannuleerd: ['a'], // "Geannuleerd"
  };

  // labels voor weergave in UI en teller per state
  const statusLabels: Record<string, string> = {
    m: 'Gemeld',
    b: 'In behandeling',
    o: 'Afgehandeld',
    a: 'Geannuleerd',
    i: 'In afwachting',
    'forward to external': 'Doorgezet naar extern',
    'reaction requested': 'Reactie gevraagd',
    ingepland: 'Ingepland',
    'closure requested': 'Verzoek afhandeling extern',
  };

  const countsByState = React.useMemo(() => {
    const map: Record<string, number> = {};
    (signals || []).forEach((s: any) => {
      const st = getState(s) || 'unknown';
      map[st] = (map[st] || 0) + 1;
    });
    return map;
  }, [signals]);

  const filtered = React.useMemo(() => {
    return signals.filter((s) => {
      // status filter: vergelijk backend state codes
      if (statusFilter !== 'all') {
        const desired = statusFilterMap[statusFilter] ?? [statusFilter];
        const state = getState(s);
        if (!desired.includes(state)) return false;
      }

      // tekst-zoeking (veilig: zet id en velden om naar strings)
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const idString = String(
        (s as any).id_display ?? (s as any).id ?? '',
      ).toLowerCase();
      return (
        idString.includes(q) ||
        String((s as any).title ?? (s as any).text ?? (s as any)._display ?? '')
          .toLowerCase()
          .includes(q) ||
        String((s as any).location?.address_text ?? (s as any).location ?? '')
          .toLowerCase()
          .includes(q) ||
        String((s as any).reporter?.email ?? (s as any).reporter ?? '')
          .toLowerCase()
          .includes(q)
      );
    });
  }, [signals, query, statusFilter]);

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
            <Button onClick={() => fetchSignals()}>Ververs</Button>
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
        {/* snelle status-chips */}
        <div className='mt-4 flex flex-wrap gap-2'>
          {['m', 'b', 'o', 'a', 'i', 'forward to external'].map((code) => (
            <button
              key={code}
              onClick={() => setStatusFilter(code)}
              className={`rounded border px-2 py-1 text-xs ${
                statusFilter === code
                  ? 'border-sky-300 bg-sky-100'
                  : 'border-slate-200 bg-white'
              } dark:border-slate-700 dark:bg-slate-800`}
              title={statusLabels[code] ?? code}
            >
              {statusLabels[code] ?? code} ({countsByState[code] ?? 0})
            </button>
          ))}
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded border px-2 py-1 text-xs ${statusFilter === 'all' ? 'border-sky-300 bg-sky-100' : 'border-slate-200 bg-white'} dark:border-slate-700 dark:bg-slate-800`}
          >
            Alle ({signals.length})
          </button>
        </div>
      </header>

      <main className='mx-auto max-w-7xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Signalen overzicht</h2>
          <Button
            variant='outline'
            onClick={() => setView(view === 'table' ? 'map' : 'table')}
          >
            {view === 'table' ? 'Toon kaart' : 'Toon tabel'}
          </Button>
        </div>
        {loading ? (
          <div className='rounded-md bg-white p-6 text-center shadow-sm dark:bg-slate-800'>
            Laden…
          </div>
        ) : error ? (
          <div className='rounded-md bg-white p-4 shadow-sm dark:bg-slate-800'>
            <div className='p-6 text-center text-red-600'>
              <div>Fout: {error}</div>
              <div className='mt-3 flex justify-center gap-2'>
                <Button onClick={() => fetchSignals()}>Opnieuw proberen</Button>
              </div>
            </div>
          </div>
        ) : view === 'map' ? (
          <div className='h-[600px] w-full rounded-md bg-white p-4 shadow-sm dark:bg-slate-800'>
            <Map
              signals={filtered}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </div>
        ) : (
          // START van de 'else'-tak voor de hoofdcontent
          <section className='rounded-md bg-white p-4 shadow-sm dark:bg-slate-800'>
            {signals.length === 0 && !loading ? (
              <div className='p-6 text-center'>Geen signalen gevonden</div>
            ) : signals.length > 0 ? (
              // START van de 'else'-tak voor de tabel
              <>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='text-sm text-slate-600 dark:text-slate-400'>
                    Totaal: {signals.length}
                  </div>
                  <div className='text-sm text-slate-600 dark:text-slate-400'>
                    Getoond: {filtered.length}
                  </div>
                </div>

                <Table>
                  <TableCaption>Signalen overzicht</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-28'>Id</TableHead>
                      {/* Urgentie-icoon kolom (geen tekst, alleen klein bolletje/icoon) */}
                      <TableHead className='w-10' aria-label='Urgentie' />
                      <TableHead className='min-w-[28ch]'>Titel</TableHead>
                      <TableHead className='hidden min-w-[24ch] md:table-cell'>
                        Locatie
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Melder
                      </TableHead>
                      <TableHead className='w-36'>Status</TableHead>
                      <TableHead className='w-20 text-right'>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s: any) => {
                      // veilige weergavewaarden (backend kan objecten teruggeven)
                      const displayId =
                        s.id ?? (s.id !== undefined ? String(s.id) : '');
                      const title = s.title ?? s.text ?? s._display ?? '—';

                      const loc = s.location;
                      const locationText =
                        typeof loc === 'string'
                          ? loc
                          : (loc?.address_text ??
                            (loc?.address
                              ? `${loc.address.openbare_ruimte ?? ''} ${loc.address.huisnummer ?? ''}`.trim()
                              : 'Onbekend'));

                      const rep = s.reporter;
                      const reporterText =
                        typeof rep === 'string'
                          ? rep
                          : rep?.email || rep?.phone || 'Anoniem';

                      const statusObj = s.status;
                      const state =
                        statusObj?.state ??
                        (typeof statusObj === 'string' ? statusObj : undefined);
                      const statusText =
                        statusObj?.state_display ?? state ?? '—';

                      return (
                        <SheetDemo
                          key={displayId || Math.random()}
                          id={String(s.id ?? s.signal_id ?? displayId)}
                          title={title}
                          body={String(s.text ?? '')}
                        >
                          {/* TableRow is the SheetTrigger (asChild) — clicking the row opens the Sheet */}
                          <TableRow
                            className='cursor-pointer hover:bg-slate-50 focus:ring-2 focus:ring-sky-300 focus:outline-none'
                            tabIndex={0}
                            role='button'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                (e.currentTarget as HTMLElement).click();
                                e.preventDefault();
                              }
                            }}
                          >
                            <TableCell className='font-mono text-sm'>
                              {displayId}
                            </TableCell>

                            {/* Urgentie-cel */}
                            <TableCell className='px-2'>
                              {((typeof s.priority === 'object' &&
                                s.priority?.priority === 'high') ||
                                s.priority === 'hoog') && (
                                <div className='flex items-center justify-center text-orange-600'>
                                  <AlertTriangle className='h-5 w-5' />
                                </div>
                              )}
                            </TableCell>

                            {/* titel met truncatie zodat rijen netjes blijven */}
                            <TableCell className='max-w-[28ch]'>
                              <div className='truncate' title={title}>
                                {title}
                              </div>
                            </TableCell>
                            <TableCell className='hidden md:table-cell'>
                              {locationText}
                            </TableCell>
                            <TableCell className='hidden lg:table-cell'>
                              {reporterText}
                            </TableCell>

                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                                  state === 'open'
                                    ? 'bg-green-100 text-green-800'
                                    : state === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {statusText}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className='flex items-center justify-end gap-2'>
                                {/* stopPropagation zodat klikken op deze knop de sheet niet opent */}
                                <Button
                                  size='sm'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Toewijzen', displayId);
                                  }}
                                >
                                  Toewijzen
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </SheetDemo>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className='p-6 text-center'>Geen signalen gevonden</div>
            )}
          </section>
        )}
        {/* EINDE van de 'else'-tak voor de hoofdcontent */}
        <div className='mt-4 flex gap-2 sm:hidden'>
          <Button onClick={() => console.log('Nieuwe melding')}>
            Nieuwe melding
          </Button>
          <Button onClick={() => fetchSignals()}>Ververs</Button>
        </div>
      </main>
    </div>
  );
}
