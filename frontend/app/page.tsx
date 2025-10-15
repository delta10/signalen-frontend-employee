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

type Signal = {
  id: string;
  title?: string;
  location?: string;
  reporter?: string;
  status?: 'open' | 'in_progress' | 'closed' | string;
};

export default function Home() {
  const [signals, setSignals] = React.useState<Signal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | string>('all');

  const fetchSignals = React.useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // gebruik NEXT_PUBLIC_API_BASE of fallback naar localhost:8000
    const API_BASE = (
      process.env.NEXT_PUBLIC_API_BASE ||
      'https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/?page=1&page_size=50'
    ).replace(/\/$/, '');
    fetch(`${API_BASE}/api/signals`, {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImI3MDJkNTU3MTU0OGI1ZjRlZjRhNzdiYzZiMTIzMjY0NzM1OTFjYWUifQ.eyJpc3MiOiJodHRwczovL21lbGRpbmdlbi51dHJlY2h0LmRlbW8uZGVsdGExMC5jbG91ZC9kZXgiLCJzdWIiOiJFZ1ZzYjJOaGJBIiwiYXVkIjoic2lnbmFsZW4iLCJleHAiOjE3NjA1NTUxMzIsImlhdCI6MTc2MDUxMTkzMiwibm9uY2UiOiIrUXA5YW9MSFNUY1BrTVJJcnN4TlJnPT0iLCJhdF9oYXNoIjoib2NqekIyTThmTUVZRHBqY2lUSTA4dyIsImVtYWlsIjoiYWRtaW5AbWVsZGluZ2VuLnV0cmVjaHQuZGVtby5kZWx0YTEwLmNsb3VkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJhZG1pbiJ9.PXUiDjXGOVa7TRf6Pb44GCb2gdZ0pptxgJlqnm71WtQ3JJNfIkkv7XkyCEty360DjemcS7rYmbi5E_Ajb-JpjPXiwIobDzQ9_4u_JUjXcDcT3V71uBua35VHLRY5n866PIjul3iG6doFWcndtnP5vpqorYvoKqzOZ7j1rR05u3ITYukM-rRD0qi6o53hnydmjTj9ItQ63bV0wiF51payq6TgRMLjDZjS6rY3Fm8a9IgTP731sMq36BagdMRQuIHpjPZdmSpg1SAgQt6ivKzvh-CGDjBdlPTLnGu9H_69qSVNsR5rJ-jDqyZ5vvc7OVE0MeXhrl1Lr-FfgLCDnH9QyQ',
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText || 'Netwerkfout');
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        // backend geeft { count, results: [...] } — gebruik results als array
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        setSignals(items);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? 'Fout bij laden');
        setSignals([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const cleanup = fetchSignals();
    return () => cleanup && cleanup();
  }, [fetchSignals]);

  const loadMockData = () => {
    setSignals([
      {
        id: 'S-001',
        title: 'Kapotte lantaarnpaal',
        location: 'Parkstraat 12',
        reporter: 'J. de Boer',
        status: 'open',
      },
      {
        id: 'S-002',
        title: 'Zwerfvuil bij speeltuin',
        location: 'Dorpsplein',
        reporter: 'M. van Dijk',
        status: 'in_progress',
      },
      {
        id: 'S-003',
        title: 'Verstopte put',
        location: 'Stationsweg 3',
        reporter: 'A. Klaassen',
        status: 'closed',
      },
    ]);
    setError(null);
    setLoading(false);
  };

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

  const filtered = signals.filter((s) => {
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
        <section className='rounded-md bg-white p-4 shadow-sm dark:bg-slate-800'>
          {loading ? (
            <div className='p-6 text-center'>Laden…</div>
          ) : error ? (
            <div className='p-6 text-center text-red-600'>
              <div>Fout: {error}</div>
              <div className='mt-3 flex justify-center gap-2'>
                <Button onClick={() => fetchSignals()}>Opnieuw proberen</Button>
                <Button onClick={() => loadMockData()}>
                  Laad voorbeelddata
                </Button>
              </div>
            </div>
          ) : signals.length === 0 ? (
            <div className='p-6 text-center'>
              Geen signalen gevonden
              <div className='mt-3'>
                <Button onClick={() => loadMockData()}>
                  Laad voorbeelddata
                </Button>
              </div>
            </div>
          ) : (
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
                    const statusText = statusObj?.state_display ?? state ?? '—';

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
                            <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700'>
                              <img
                                src='/icons/urgent.svg'
                                alt='Urgentie'
                                className='h-4 w-4'
                              />
                            </span>
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
          )}
        </section>

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
