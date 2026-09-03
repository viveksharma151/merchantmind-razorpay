import { NextRequest, NextResponse } from 'next/server';
import { runCampaignAgent } from '@/lib/agents/campaignAgent';
import { CampaignRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: CampaignRequest = await req.json();
    if (!body.product_ids || !Array.isArray(body.product_ids) || body.product_ids.length === 0) {
      return NextResponse.json({ error: 'product_ids array is required' }, { status: 400 });
    }

    const result = await runCampaignAgent(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Campaign API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
