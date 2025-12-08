'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { FetchListSignals } from '@/server/fetch-list-signals';
import { useEffect } from 'react';
import Link from 'next/dist/client/link';
import { ListSignal } from '@/interfaces/list-signal'

async function fetchSignals() {
  const responseSignals = await FetchListSignals();

  const signals: ListSignal[] = [];
  for (const s of responseSignals) {
    signals.push({
      id: s.id,
      id_display: s.id_display,
      text: s.text,
      priority: {
        priority: s.priority?.priority,
      }, 
      category: {
        main: s.category?.main,
        sub: s.category?.sub,
      },
      location: {
        area_name: s.location?.area_name,
        address_text: s.location?.address_text,
        geometrie: {
          type: s.location?.geometrie?.type,
          coordinates: s.location?.geometrie?.coordinates,
        },
      },
      created_at: s.created_at,
      assigned_user_email: s.assigned_user_email,
      directing_department: s.directing_department,
      routing_department: s.routing_department,
      status: {
        text: s.status?.text,
        state: s.status?.state,
        state_display: s.status?.state_display,
      },
    });
  }

  return signals;
}

export default function Home() {
  const [signals, setSignals] = React.useState<ListSignal[]>([]);

  useEffect(() => {
    const loadSignals = async () => {
      const fetchedSignals = await fetchSignals();
      setSignals(fetchedSignals);
    };
    loadSignals();
  }, []);

  return (
    <div className='min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-12 dark:bg-slate-900 dark:text-slate-100'>
      <header className='mx-auto mb-8 max-w-6xl'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-4'></div>

          <div className='hidden gap-2 sm:flex'>
            <Button onClick={() => console.log('Nieuwe melding')}>
              Nieuwe melding
            </Button>
          </div>
        </div>

        <div className='mt-6'></div>
      </header>

      {signals.map((signal) => (
        <div
          key={signal.id_display}
          className='bg-secondary-700 hover:border-secondary-500 flex items-center justify-between rounded-lg border border-transparent px-5 py-4 duration-300'
        >
          <Link
            href={`/overview/melding/${signal.id}`}
            className='flex flex-1 items-center gap-2 text-sm'
          >
            <div>
              <div className='flex items-center gap-x-2'>
                <h2 className='text-secondary-100 text-lg font-medium'>
                  {signal.category?.main}
                </h2>
                <span
                  className={`badge badge-variant-secondary m-1 ${
                    signal.status?.state_display === 'gemeld'
                      ? 'badge-success'
                      : 'badge-danger'
                  }`}
                >
                  {signal.status?.state_display}
                </span>
              </div>
              <span className='block w-[200px] overflow-hidden text-sm text-ellipsis whitespace-nowrap'>
                {signal.status?.text}
              </span>
            </div>
            <div className='w-48'>
              <span className='text-secondary-300 text-sm font-medium'>
                Toegewezen aan
              </span>
              <p>{signal.assigned_user_email}</p>
            </div>
            <div className='w-48'>
              <span className='text-secondary-300 text-sm font-medium'>
                Gemeld op
              </span>
              <p>{signal.created_at}</p>
            </div>
          </Link>
          <div className='text-secondary-300 w-48 cursor-pointer text-sm font-medium'>
            <span className='text-2xl'>...</span>
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
