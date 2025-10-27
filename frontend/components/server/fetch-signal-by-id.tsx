'use server';
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
  notes?: {
    text?: string;
    created_by?: string;
  }

  directing_department?: string;
  routing_department?: string;

  assigned_user_email?: string;
};
export async function FetchSignalByID(id: string) {
    // Fetch data from API using signal ID, domain and bearer tokens from environment variables
   const res = await fetch(`${process.env.DOMAIN_NAME}/signals/v1/private/signals/${id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`
        },
        cache: 'no-store',
    });

    let responseData;

    if (res.ok) {
        responseData = await res.json();
        // Prepare json Data to be used as array
        responseData = [responseData];
        return responseData as Array<FullSignal>;
    } else {
        const responseText = await res.text();
        console.log("Full response body:", responseText);
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.log("Failed to parse response as JSON:", e);
        }
        console.log(res)
        throw new Error(`Failed to list signals: ${responseData?.error || "Unknown error"} - Status: ${res.status}`);
    }
}
