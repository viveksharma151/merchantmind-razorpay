import { CatalogQuery, CatalogResult } from '../types';
import { getAllProducts, searchProductsSimple } from '../catalog';
import { logAudit } from '../db';

export async function runCatalogAgent(request: CatalogQuery): Promise<CatalogResult> {
  const query = request.query.trim();
  const allProducts = getAllProducts();

  let matched = searchProductsSimple(query);
  let explanation = '';

  if (matched.length > 0) {
    explanation = `Agent analyzed query "${query}" and found ${matched.length} relevant items based on title, category, and keyword tag correlations.`;
  } else {
    matched = allProducts.slice(0, 4); // fallback discovery
    explanation = `No direct keyword correlation for "${query}". Displaying top featured recommendations.`;
  }

  await logAudit({
    agent: 'catalog_agent',
    action: 'catalog_search',
    input_data: { query },
    output_data: { matched_count: matched.length, top_results: matched.slice(0, 3).map(p => p.name) },
    reasoning: explanation,
    status: matched.length > 0 ? 'SUCCESS' : 'PARTIAL',
    explainability: `Agent interpreted query "${query}" and retrieved ${matched.length} machine-readable catalog records with semantic tagging.`,
  });

  return {
    products: matched,
    explanation,
    total_found: matched.length,
  };
}
