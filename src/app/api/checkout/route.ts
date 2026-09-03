import { NextRequest, NextResponse } from 'next/server';
import { runCheckoutAgent } from '@/lib/agents/checkoutAgent';
import { CheckoutRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();
    if (!body.message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await runCheckoutAgent(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
