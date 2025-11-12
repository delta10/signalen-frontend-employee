import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiToken = process.env.API_TOKEN;
  const apiUrl = process.env.API_URL;
  // Snelheidscontrole voor de configuratie: als de token ontbreekt, stuur 500.
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Serverconfiguratiefout: API-token ontbreekt.' }, 
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Geen bestand opgegeven' }, { status: 400 });
    }

    // Lees de file-inhoud als een ArrayBuffer en maak een nieuwe Blob aan.
    const fileBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: file.type });

    // Maak het nieuwe FormData object voor de externe API
    const apiFormData = new FormData();
    apiFormData.append('file', fileBlob, file.name);

    // Stuur door naar de externe API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      body: apiFormData,
    });

    // Robuuste afhandeling van niet-succesvolle responses (4xx, 5xx)
    if (!response.ok) {
      const errorText = await response.text(); 
      let errorJson;

      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // Als de foutmelding geen JSON is (zoals de 403 HTML die we zagen)
        return NextResponse.json(
          { error: errorText || 'Upload mislukt door een externe API-fout' },
          { status: response.status }
        );
      }
      
      // Als de foutmelding wel JSON is
      return NextResponse.json(
        { error: errorJson.message || errorJson.error || 'Upload mislukt' },
        { status: response.status }
      );
    }

    // Success response (2xx status)
    const data = await response.json();

    return NextResponse.json({
      success: true,
      attachment: data,
    });

  } catch (error) {
    // Catch-all voor onverwachte fouten (netwerkfout, ArrayBuffer-fout, etc.)
    return NextResponse.json(
      { error: 'Interne serverfout tijdens het uploadproces' },
      { status: 500 }
    );
  }
}