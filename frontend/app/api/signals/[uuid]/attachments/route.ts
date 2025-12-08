import { NextRequest, NextResponse } from 'next/server';

const API_TOKEN = process.env.API_TOKEN;
const API_BASE = (process.env.API_URL || "https://api.meldingen.utrecht.demo.delta10.cloud").replace(/\/$/, "");

type RouteParams = { params: Promise<{ uuid: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { uuid } = await params;
  const externalUrl = `${API_BASE}/signals/v1/private/signals/${uuid}/attachments/`;

  try {
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[GET] Error fetching attachments: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Fetch failed' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET] Network error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { uuid } = await params;
  const externalUrl = `${API_BASE}/signals/v1/private/signals/${uuid}/attachments/`;

  console.log(`[POST] Proxying upload to: ${externalUrl}`);

  try {
    const formData = await request.formData();
    
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${API_TOKEN}`,
      }, 
      body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[POST] Upload failed. Status: ${response.status}`);
        
        if (errorText.includes("<!DOCTYPE html>") || errorText.includes("<html>")) {
             return NextResponse.json({ error: 'Server blocked the upload (likely file size too large)' }, { status: response.status });
        }

        return NextResponse.json({ error: errorText || 'Upload failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[POST] Internal Proxy Error:", error);
    return NextResponse.json({ error: 'Internal upload error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { uuid } = await params;
  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get('attachmentId');

  if (!attachmentId) {
    return NextResponse.json({ error: 'Missing attachmentId' }, { status: 400 });
  }

  // Debuggen van de URL constructie
  const externalUrl = `${API_BASE}/signals/v1/private/signals/${uuid}/attachments/${attachmentId}/`;
  
  console.log(`[DELETE] Proxying delete to: ${externalUrl}`);

  try {
    const response = await fetch(externalUrl, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      console.error(`[DELETE] Upstream failed: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: `Upstream error: ${response.status}` }, { status: response.status });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE] Internal Proxy Error:", error);
    return NextResponse.json({ error: 'Delete error' }, { status: 500 });
  }
}