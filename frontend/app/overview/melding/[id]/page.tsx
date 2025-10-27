import * as React from 'react';
import { FetchSignalByID } from '@/server/fetch-signal-by-id';
import Link from 'next/link';

interface FullSignal {
  id: string;
  id_display: string;
  source?: string;
  text?: string;

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

  location?: {
    stadsdeel?: string;
    area_name?: string;
    address_text?: string;
    geometrie?: {
      type?: string;
      coordinates?: Array<number>;
    };
  };

  category?: {
    main?: string;
    sub?: string;
  };

  reporter?: {
    email?: string;
    phone?: string;
    sharing_allowed?: boolean;
    allows_contact?: boolean;
  };

  priority?: {
    priority?: string;
  }

  type?: {
    code?: string;
  };

  created_at?: string;
  updated_at?: string;
  incident_date_start?: string;
  incident_date_end?: string;
  has_attachments?: boolean;
  directing_department?: string;
  routing_department?: string;
  assigned_user_email?: string;
  notes?: {
    text?: string;
    created_by?: string;
  };
};

async function fetchSignalByID(id: string) {
  const responseSignals = await FetchSignalByID(id);
  console.log("responseSignals", responseSignals);


  if (!Array.isArray(responseSignals)) {
    console.error("Expected an array of signals, but got:", responseSignals);
    return [];
  }
  const signals: FullSignal[] = [];
  for (const s of responseSignals) {
    signals.push({
      id: s.id,
      id_display: s.id_display,
      source: s.source,
      text: s.text,
      status: {
        text: s.status?.text,
        state_display: s.status?.state_display
      },
      location:{
        stadsdeel: s.location?.stadsdeel,
        area_name: s.location?.area_name,
        address_text: s.location?.address_text,
        geometrie: {
          type: s.location?.geometrie?.type,
          coordinates: s.location?.geometrie?.coordinates,
        },
      },
      category: {
        main: s.category?.main,
        sub: s.category?.sub,
      },
      reporter: {
        email: s.reporter?.email,
        phone: s.reporter?.phone,
        sharing_allowed: s.reporter?.sharing_allowed,
        allows_contact: s.reporter?.allows_contact,
      },
      priority: {
        priority: s.priority?.priority,
      },
      type: {
        code: s.type?.code,
      },
      created_at: s.created_at,
      updated_at: s.updated_at,
      incident_date_start: s.incident_date_start,
      incident_date_end: s.incident_date_end,
      has_attachments: s.has_attachments,
      notes: {
        text: s.notes?.text,
        created_by: s.notes?.created_by,
      },
      directing_department: s.directing_department,
      routing_department: s.routing_department,
      assigned_user_email: s.assigned_user_email,
      });
  }

  return signals;
}


export default async function Page({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const signals = await fetchSignalByID(id);

  return (
    <div className='min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-12 dark:bg-slate-900 dark:text-slate-100'>

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
            <span className="font-medium">{signal.id_display}</span>
            <span className="text-secondary-300">{signal.source}</span>
            <span className="text-secondary-300">{signal.text}</span>
            <span className="text-secondary-300">{signal.status?.text}</span>
            <span className="text-secondary-300">{signal.status?.state_display}</span>            
            <span className="text-secondary-300">{signal.location?.stadsdeel}</span>
            <span className="text-secondary-300">{signal.location?.area_name}</span>
            <span className="text-secondary-300">{signal.location?.address_text}</span>
            <span className="text-secondary-300">{signal.location?.geometrie?.type}</span>
            <span className="text-secondary-300">{String(signal.location?.geometrie?.coordinates)}</span>
            <span className="text-secondary-300">{signal.category?.main}</span>
            <span className="text-secondary-300">{signal.category?.sub}</span>
            <span className="text-secondary-300">{signal.reporter?.email}</span>
            <span className="text-secondary-300">{signal.reporter?.phone}</span>
            <span className="text-secondary-300">{String(signal.reporter?.sharing_allowed)}</span>
            <span className="text-secondary-300">{String(signal.reporter?.allows_contact)}</span>            
            <span className="text-secondary-300">{signal.priority?.priority}</span>
            <span className="text-secondary-300">{signal.type?.code}</span>
            <span className="text-secondary-300">{signal.created_at}</span>
            <span className="text-secondary-300">{signal.updated_at}</span>
            <span className="text-secondary-300">{signal.incident_date_start}</span>
            <span className="text-secondary-300">{signal.incident_date_end}</span>
            <span className="text-secondary-300">{String(signal.has_attachments)}</span>
            <span className="text-secondary-300">{signal.notes?.text}</span>
            <span className="text-secondary-300">{signal.notes?.created_by}</span>
            <span className="text-secondary-300">{signal.directing_department}</span>
            <span className="text-secondary-300">{signal.routing_department}</span>
            <span className="text-secondary-300">{signal.assigned_user_email}</span>
          </Link>
        </div>
      ))}

    </div>
  );
}
