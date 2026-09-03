import productsData from '@/data/products.json';
import { Product } from './types';

export const products: Product[] = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

export function searchProductsSimple(query: string): Product[] {
  const queryLower = query.toLowerCase();
  const scored: { score: number; product: Product }[] = [];

  for (const p of products) {
    let score = 0;
    const nameWords = p.name.toLowerCase().split(/\s+/);
    for (const w of nameWords) {
      if (w.length > 2 && queryLower.includes(w)) score += 3;
    }
    if (p.name.toLowerCase().includes(queryLower)) score += 4;
    if (p.description.toLowerCase().includes(queryLower)) score += 2;
    if (p.category.toLowerCase().includes(queryLower)) score += 2;
    for (const tag of p.tags) {
      if (queryLower.includes(tag.toLowerCase())) score += 2;
    }

    if (score > 0) {
      scored.push({ score, product: p });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.product);
}
