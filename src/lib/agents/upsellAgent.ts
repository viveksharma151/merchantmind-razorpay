import { Product, UpsellRequest, UpsellResult } from '../types';
import { getAllProducts, getProductById } from '../catalog';
import { logAudit } from '../db';

export async function runUpsellAgent(request: UpsellRequest): Promise<UpsellResult> {
  const auditTrail: Record<string, unknown>[] = [];
  const allProducts = getAllProducts();
  const product = getProductById(request.product_id);

  if (!product) {
    return {
      suggestions: [],
      reasoning: 'Primary product not found in catalog.',
      audit_trail: [{ step: 'error', message: 'Product not found' }],
    };
  }

  auditTrail.push({
    step: '1_primary_product_loaded',
    product: product.name,
  });

  let suggestions: Product[] = [];
  let reasoning = '';

  // 1. Check direct upsell_ids
  if (product.upsell_ids && product.upsell_ids.length > 0) {
    suggestions = allProducts.filter(p => product.upsell_ids!.includes(p.id));
  }

  // 2. If fewer than 3, add same category products
  if (suggestions.length < 3) {
    const sameCat = allProducts.filter(
      p => p.category === product.category && p.id !== product.id && !suggestions.some(s => s.id === p.id)
    );
    suggestions = [...suggestions, ...sameCat].slice(0, 3);
  }

  reasoning = `Based on purchasing patterns for "${product.name}", customers frequently add complementary accessories or items in ${product.category} to increase utility.`;

  auditTrail.push({
    step: '2_upsell_generated',
    suggestionCount: suggestions.length,
    suggestions: suggestions.map(s => s.name),
  });

  // Log to audit trail
  await logAudit({
    agent: 'upsell_agent',
    action: 'upsell_generated',
    input_data: { product_id: request.product_id, primary_item: product.name },
    output_data: {
      suggestions: suggestions.map(s => ({ id: s.id, name: s.name, price: s.price })),
    },
    reasoning,
    status: 'SUCCESS',
    explainability: `For primary product "${product.name}", generated ${suggestions.length} upsell recommendations to grow merchant basket size and cross-sell related accessories.`,
  });

  return {
    suggestions,
    reasoning,
    audit_trail: auditTrail,
  };
}
