import { NextRequest, NextResponse } from 'next/server';

// De token en basis-URL worden VEILIG op de server opgehaald uit .env
const AUTH_TOKEN = process.env.API_TOKEN; 
const API_BASE = process.env.API_URL;

// Valideer of de token bestaat voor gebruik
if (!AUTH_TOKEN) {
  console.error("CRITICAL: INTERNAL_API_TOKEN is not configured in .env!");
}

interface Context {
  params: {
    uuid: string; // Let op: je component gebruikt 'uuid'
  };
}

// ------------------------------------
// 1. GET (Ophalen van bijlagen)
// ------------------------------------
export async function GET(request: NextRequest, { params }: Context) {
  const { uuid } = params;
  
  if (!AUTH_TOKEN) {
    return NextResponse.json({ error: 'Serverconfiguratiefout: Token ontbreekt' }, { status: 500 });
  }

  const externalUrl = `${API_BASE}/signals/v1/private/signals/${uuid}/attachments/`;

  try {
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Externe API GET-fout: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: 'Fout bij het ophalen van bijlagen' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy GET-fout:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// ------------------------------------
// 2. POST (Uploaden van bijlagen)
// ------------------------------------
export async function POST(request: NextRequest, { params }: Context) {
  const { uuid } = params;
  
  if (!AUTH_TOKEN) {
    return NextResponse.json({ error: 'Serverconfiguratiefout: Token ontbreekt' }, { status: 500 });
  }

  const externalUrl = `${API_BASE}/signals/v1/private/signals/${uuid}/attachments/`;

  try {
    const formData = await request.formData();
    
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData = await response.text();
      try {
        errorData = JSON.parse(errorData);
      } catch { /* not json */ }

      console.error(`Externe API POST-fout: ${response.status}`, errorData);
      return NextResponse.json({ error: errorData.error || 'Upload mislukt' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data); // Geef de respons van de externe API terug

  } catch (error) {
    console.error('Proxy POST-fout:', error);
    return NextResponse.json({ error: 'Interne serverfout tijdens upload' }, { status: 500 });
  }
}

// ------------------------------------
// 3. DELETE (Verwijderen van bijlagen)
// ------------------------------------
export async function DELETE(request: NextRequest, { params }: Context) {
  const { uuid } = params;
  
  if (!AUTH_TOKEN) {
    return NextResponse.json({ error: 'Serverconfiguratiefout: Token ontbreekt' }, { status: 500 });
  }
  
  // De client stuurt de ID van de bijlage mee als query parameter
  const searchParams = request.nextUrl.searchParams;
  const attachmentId = searchParams.get('attachmentId');

  if (!attachmentId) {
    return NextResponse.json({ error: 'Bijlage ID ontbreekt' }, { status: 400 });
  }

  const externalUrl = `${API_BASE}/signals/v1/private/signals/${uuid}/attachments/${attachmentId}/`;

  try {
    const response = await fetch(externalUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`Externe API DELETE-fout: ${response.status}`);
      return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: response.status });
    }

    // De DELETE-request geeft vaak een 204 No Content, we sturen een succesvolle lege respons terug.
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Proxy DELETE-fout:', error);
    return NextResponse.json({ error: 'Interne serverfout tijdens verwijderen' }, { status: 500 });
  }
}