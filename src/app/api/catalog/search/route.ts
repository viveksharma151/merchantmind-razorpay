import { NextRequest, NextResponse } from 'next/server';
import { runCatalogAgent } from '@/lib/agents/catalogAgent';
import { CatalogQuery } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: CatalogQuery = await req.json();
    const result = await runCatalogAgent(body || { query: '' });
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Catalog search API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
