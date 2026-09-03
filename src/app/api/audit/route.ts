import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const entries = await getAuditLog(limit);

    return NextResponse.json({
      total: entries.length,
      entries,
    });
  } catch (err: unknown) {
    console.error('Audit API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
