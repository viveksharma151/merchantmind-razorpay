import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export interface CheckoutRequest {
  message: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface CheckoutResult {
  success: boolean;
  message: string;
  product?: Record<string, unknown>;
  order?: Record<string, unknown>;
  upsell_prompt?: string;
  audit_trail: Record<string, unknown>[];
}

export interface UpsellResult {
  suggestions: Record<string, unknown>[];
  reasoning: string;
  audit_trail: Record<string, unknown>[];
}

export interface CatalogResult {
  products: Record<string, unknown>[];
  explanation: string;
  total_found: number;
}

export interface CampaignResult {
  campaign_copy: string;
  payment_links: Record<string, unknown>[];
  subject?: string;
  reasoning: string;
  audit_trail: Record<string, unknown>[];
}

export interface AuditEntry {
  id: number;
  agent: string;
  action: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  reasoning: string;
  status: string;
  explainability: string;
  timestamp: string;
}

// Checkout
export const sendCheckoutMessage = (req: CheckoutRequest) =>
  api.post<CheckoutResult>('/api/checkout/chat', req).then(r => r.data);

export const getUpsells = (productId: string) =>
  api.post<UpsellResult>('/api/checkout/upsell', { product_id: productId }).then(r => r.data);

export const getRazorpayConfig = () =>
  api.get('/api/checkout/config').then(r => r.data);

// Catalog
export const getAllProducts = () =>
  api.get('/api/catalog/products').then(r => r.data);

export const getProduct = (id: string) =>
  api.get(`/api/catalog/products/${id}`).then(r => r.data);

export const searchCatalog = (query: string) =>
  api.post<CatalogResult>('/api/catalog/search', { query }).then(r => r.data);

// Campaigns
export const createCampaign = (productIds: string[], campaignType: string, targetAudience: string) =>
  api.post<CampaignResult>('/api/campaigns/create', {
    product_ids: productIds,
    campaign_type: campaignType,
    target_audience: targetAudience,
  }).then(r => r.data);

// Audit
export const getAuditLog = (limit = 50) =>
  api.get<{ total: number; entries: AuditEntry[] }>(`/api/audit/log?limit=${limit}`).then(r => r.data);

export const getAuditStats = () =>
  api.get('/api/audit/stats').then(r => r.data);

export default api;
