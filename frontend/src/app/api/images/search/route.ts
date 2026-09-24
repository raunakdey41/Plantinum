import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ 
      error: 'PEXELS_API_KEY is not configured in .env.local. Please provide your Pexels API Key.' 
    }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9&orientation=square`, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Pexels API error (${response.status}): ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const images = (data.photos || []).map((photo: any) => photo.src.large || photo.src.medium || photo.src.original);

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Pexels image search error:", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch from Pexels API' }, { status: 500 });
  }
}

