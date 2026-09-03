import { NextResponse } from 'next/server';
import { getAuditStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getAuditStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    console.error('Audit stats API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
