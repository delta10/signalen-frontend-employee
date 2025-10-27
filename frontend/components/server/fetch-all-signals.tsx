'use server';

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

export async function FetchAllSignals() {
    // Fetch data from API using domain and bearer tokens from environment variables
   const res = await fetch(`${process.env.DOMAIN_NAME}/signals/v1/private/signals/`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`
        },
        cache: 'no-store',
    });

    let requestedData;
    let responseData;

    if (res.ok) {
        requestedData = await res.json();
        // Prepare json Data to be used as array
        responseData = requestedData["results"];
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
    // Return response data as array
    return responseData as Array<ListSignal>;
}
