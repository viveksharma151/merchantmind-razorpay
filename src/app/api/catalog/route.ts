import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/catalog';

export async function GET() {
  const all = getAllProducts();
  const categories = Array.from(new Set(all.map(p => p.category)));

  return NextResponse.json({
    total: all.length,
    categories,
    products: all,
  });
}
