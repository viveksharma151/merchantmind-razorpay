import {
  AuditEntry,
  AuditStats,
  CampaignResult,
  CatalogResult,
  CheckoutRequest,
  CheckoutResult,
  Product,
  UpsellResult,
} from './types';

// Checkout
export async function sendCheckoutMessage(req: CheckoutRequest): Promise<CheckoutResult> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getUpsells(productId: string): Promise<UpsellResult> {
  const res = await fetch('/api/checkout/upsell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getRazorpayConfig(): Promise<{ key_id: string; mock_mode: boolean }> {
  const res = await fetch('/api/checkout/config');
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Catalog
export async function getAllProducts(): Promise<{
  total: number;
  categories: string[];
  products: Product[];
}> {
  const res = await fetch('/api/catalog');
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function searchCatalog(query: string): Promise<CatalogResult> {
  const res = await fetch('/api/catalog/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Campaigns
export async function createCampaign(
  productIds: string[],
  campaignType: 'email' | 'sms' | 'social',
  targetAudience: string
): Promise<CampaignResult> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_ids: productIds,
      campaign_type: campaignType,
      target_audience: targetAudience,
    }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Audit
export async function getAuditLog(limit = 50): Promise<{ total: number; entries: AuditEntry[] }> {
  const res = await fetch(`/api/audit?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getAuditStats(): Promise<AuditStats> {
  const res = await fetch('/api/audit/stats');
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}
