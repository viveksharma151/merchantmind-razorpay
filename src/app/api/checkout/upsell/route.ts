import { NextRequest, NextResponse } from 'next/server';
import { runUpsellAgent } from '@/lib/agents/upsellAgent';
import { UpsellRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: UpsellRequest = await req.json();
    if (!body.product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const result = await runUpsellAgent(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Upsell API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
