import { NextResponse } from 'next/server';
import { getRazorpayPublicConfig } from '@/lib/razorpay';

export async function GET() {
  return NextResponse.json(getRazorpayPublicConfig());
}
