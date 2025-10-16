'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ListAllSignals } from '@/server/listAllSignals';
import { useEffect } from 'react';
import Link from 'next/dist/client/link';

interface ListSignal {
    id: string;
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
  const responseSignals = await ListAllSignals();
  console.log("responseSignals", responseSignals);


  if (!Array.isArray(responseSignals)) {
    console.error("Expected an array of signals, but got:", responseSignals);
    return [];
  }
  const signals: ListSignal[] = [];
  for (const s of responseSignals) {
    signals.push({
      id: s.id,
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
      //directing_department: {
      //  name: s.directing_department.name
      //},
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


    useEffect(() => {
    const loadSignals = async () => {
      const fetchedSignals = await grabSignals();
      console.log("fetchedSignals", fetchedSignals);
      setSignals(fetchedSignals);
    };
    loadSignals();
    
  }, []);


  return (
    <div className='min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-12 dark:bg-slate-900 dark:text-slate-100'>
      <header className='mx-auto mb-8 max-w-6xl'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
          </div>

          <div className='hidden gap-2 sm:flex'>
            <Button onClick={() => console.log('Nieuwe melding')}>
              Nieuwe melding
            </Button>
          </div>
        </div>

        <div className='mt-6'>
        </div>
      </header>

      {signals.map(signal => (
        <div
          key={signal.id_display}
          className="flex items-center justify-between bg-secondary-700 border border-transparent rounded-lg px-5 py-4
          hover:border-secondary-500 duration-300"
        >
          <Link
            href={`/overview/melding/${signal.id}`}
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
        </div>
    </div>
  );
}
