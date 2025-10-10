'use client';

import Image from 'next/image';
import * as React from 'react';
import { SheetDemo } from '../components/ui/message-popup';
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

import { Sheet } from "lucide-react";

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
          'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImI3MDJkNTU3MTU0OGI1ZjRlZjRhNzdiYzZiMTIzMjY0NzM1OTFjYWUifQ.eyJpc3MiOiJodHRwczovL21lbGRpbmdlbi51dHJlY2h0LmRlbW8uZGVsdGExMC5jbG91ZC9kZXgiLCJzdWIiOiJFZ1ZzYjJOaGJBIiwiYXVkIjoic2lnbmFsZW4iLCJleHAiOjE3NTk3ODM2NTcsImlhdCI6MTc1OTc0MDQ1Nywibm9uY2UiOiJRV05pUFpsQmpDLzRLS3hMVkp5bHV3PT0iLCJhdF9oYXNoIjoiWlNiN3BHSG1QX0gzeUJGTWtUdUZtQSIsImVtYWlsIjoiYWRtaW5AbWVsZGluZ2VuLnV0cmVjaHQuZGVtby5kZWx0YTEwLmNsb3VkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJhZG1pbiJ9.hhzsy9c6g_xUCHseJARxYfJx8LK5QNnWK2VXcXa2K9hLju2hbhh07tSEGD-7btdyDJMsB_Yz7s7f96NzIfHqNcJBd3R0BqsyKipV9Jp0YqB48deIilWcvlhH2n_FGTerF9jiciiMLcoProVilhu-nAUdIiaVqGosiuFPVodfiBYN7TMGR6sw_J_Wnu5oYhdeRj2XszaYKkVVETlaVzyesEBAFlTvWzYfjg4qxKz3-l9g5yIV6xoIk-gkKx4m81FEiUbwWd4PIZGl7Kr06ZXqiLu-E2Vbm2aMf4jpaTz9HZfY6J2bzBloBKPKbaXLHTD_JRJ_6BlHiSFyYGqeGQHjfw',
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
                    <TableHead>Id</TableHead>
                    {/* Urgentie-icoon kolom (geen tekst, alleen klein bolletje/icoon) */}
                    <TableHead className='w-10' aria-label='Urgentie' />
                    <TableHead>Titel</TableHead>
                    <TableHead>Locatie</TableHead>
                    <TableHead>Melder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acties</TableHead>
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
                      <TableRow key={displayId || Math.random()}>
                        <TableCell className='font-mono text-sm'>
                          {displayId}
                        </TableCell>

                        {/* Urgentie-cel: vervang inhoud door jouw eigen icoon */}
                        <TableCell className='px-2'>
                          <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700'>
                            {/* Vervang /icons/urgent.svg door jouw bestand in frontend/public/icons */}
                            <img
                              src='/icons/urgent.svg'
                              alt='Urgentie'
                              className='h-4 w-4'
                            />
                          </span>
                        </TableCell>

                        <TableCell>{title}</TableCell>
                        <TableCell>{locationText}</TableCell>
                        <TableCell>{reporterText}</TableCell>
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
                          <div className='flex gap-2'>
                            <SheetDemo
                              id={String(s.id ?? s.signal_id ?? displayId)}
                              source={s.source ?? ''}
                              text={s.text ?? s.title ?? s._display ?? ''}
                              created_at={s.created_at ?? ''}
                              location={
                                typeof s.location === 'string'
                                  ? { address_text: s.location }
                                  : s.location ?? { address_text: locationText }
                              }
                              category={s.category ?? ''}
                              reporter={
                                typeof s.reporter === 'string'
                                  ? { email: s.reporter, phone: '' }
                                  : s.reporter ?? { email: reporterText, phone: '' }
                              }
                              priority={s.priority ?? ''}
                              state_display={s.status?.state_display ?? s.status?.state ?? ''}
                              deadline={s.deadline ?? ''}
                            >
                              <Button size='sm'>Bekijk</Button>
                            </SheetDemo>
                            <Button
                              size='sm'
                              onClick={() => console.log('Toewijzen', displayId)}
                            >
                              Toewijzen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
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
