'use client';

import { useSearchParams } from 'next/navigation'; // Import hook to read URL params
import Link from 'next/link';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { Button } from '@/components/ui/button';

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => (
    <div className='flex h-full items-center justify-center'>
      Kaart laden...
    </div>
  ),
  ssr: false, // Belangrijk: laad de kaart alleen in de browser.
});

// --- Gekopieerde logica van page.tsx ---
// We importeren het Signal type nu uit de Map component, zodat ze altijd overeenkomen.
import type { Signal } from '@/components/Map';

// Deze logica is niet meer nodig op deze pagina, omdat de Map component het afhandelt.
const getState = (item: Signal): string => {
  if (!item || !item.status) return '';
  if (typeof item.status === 'string') return item.status;
  return item.status?.state ?? '';
};

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
// --- Einde gekopieerde logica ---

export default function MapPage() {
  const [signals, setSignals] = React.useState<Signal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const searchParams = useSearchParams();

  const fetchSignals = React.useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const API_BASE = (
      process.env.NEXT_PUBLIC_API_BASE ||
      'https://api.meldingen.utrecht.demo.delta10.cloud/signals/v1/private/signals/?page=1&page_size=50'
    ).replace(/\/$/, '');
    fetch(API_BASE, {
      // Gebruik de correcte API_BASE zonder toevoegingen
      // Gebruik de correcte API_BASE zonder toevoegingen
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhZDhjMTlhY2MzZGYzYTEwYjEwYjI3MTdiZTllMjFiNTVjOWE3NzcifQ.eyJpc3MiOiJodHRwczovL21lbGRpbmdlbi51dHJlY2h0LmRlbW8uZGVsdGExMC5jbG91ZC9kZXgiLCJzdWIiOiJFZ1ZzYjJOaGJBIiwiYXVkIjoic2lnbmFsZW4iLCJleHAiOjE3NjM2Nzg3NDEsImlhdCI6MTc2MzYzNTU0MSwibm9uY2UiOiJFWmlkTzlFTHVYTklpSVpCUGdlUUNBPT0iLCJhdF9oYXNoIjoibkl1ZDh4OUltWDNGYzhiNzMxa3otUSIsImVtYWlsIjoiYWRtaW5AbWVsZGluZ2VuLnV0cmVjaHQuZGVtby5kZWx0YTEwLmNsb3VkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJhZG1pbiJ9.QPDDkcsLlifNPzLny21MIzWoz7KPYO8-79EoSDgi8ImFZXm-nKUB0rZmYH6OsqT1tXea1qCKxz08kzMFhLq5iBTUXVHCsu-yQy9vUwExFtCHm_AQd29nobXIwG7FsY6fFWvHYDz1XcW0Rd6Ai1f6Pt4_44QXRbi9T8JoErWkwtEJqOQHomxx23o5bh3No-hlWtfMvYVEA2vp6vRIjOrHxBYqhz13GSDa3tOJ1PDF97IrA7AUFo48kz7L9UMSV5lmcygdaW41f68HOBSUsU9LgoyGa6Qo6rQ3z7twey_7zLAaqBp-PdU2Tfzed3IJF7x9NTJ4WC2y-QS72Dr-me0IPg',
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText || 'Netwerkfout');
        return r.json();
      })
      .then((data) => {
        // --- CONTROLEER HIER DE DATA ---
        console.log('API Data ontvangen:', data);
        // -----------------------------

        if (!mounted) return;
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

  // Filter de signalen op basis van de URL parameters
  const filteredSignals = React.useMemo(() => {
    const query = searchParams.get('q') || '';
    const statusFilter = searchParams.get('status') || 'all';

    return signals.filter((s) => {
      // Status filter
      if (statusFilter !== 'all') {
        const desired = statusFilterMap[statusFilter] ?? [statusFilter];
        const state = getState(s);
        if (!desired.includes(state)) return false;
      }

      // Tekst-zoeking
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const idString = String(s.id_display ?? s.id ?? '').toLowerCase();
      return (
        idString.includes(q) ||
        String(s.title ?? s.text ?? s._display ?? '')
          .toLowerCase()
          .includes(q) ||
        String(
          (typeof s.location === 'object' && s.location?.address_text) ||
            (typeof s.location === 'string' && s.location) ||
            '',
        )
          .toLowerCase()
          .includes(q)
      );
    });
  }, [signals, searchParams]);

  return (
    <div className='min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-12 dark:bg-slate-900 dark:text-slate-100'>
      <header className='mx-auto mb-8 max-w-7xl'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Kaartweergave</h1>
          <Link href='/' passHref>
            <Button variant='outline'>Terug naar overzicht</Button>
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-7xl'>
        <section className='h-[75vh] w-full rounded-md bg-white shadow-sm dark:bg-slate-800'>
          {loading ? (
            <div className='flex h-full items-center justify-center'>
              Laden…
            </div>
          ) : error ? (
            <div className='flex h-full flex-col items-center justify-center text-red-600'>
              <div>Fout: {error}</div>
              <Button onClick={() => fetchSignals()} className='mt-4'>
                Opnieuw proberen
              </Button>
            </div>
          ) : (
            <Map signals={filteredSignals} />
          )}
        </section>
      </main>
    </div>
  );
}
