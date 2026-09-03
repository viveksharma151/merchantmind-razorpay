export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  stock: number;
  rating: number;
  upsell_ids?: string[];
}

export interface CheckoutRequest {
  message: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface CheckoutResult {
  success: boolean;
  message: string;
  product?: Product;
  order?: Record<string, unknown>;
  upsell_prompt?: string;
  audit_trail: Record<string, unknown>[];
}

export interface UpsellRequest {
  product_id: string;
  customer_history?: string[];
}

export interface UpsellResult {
  suggestions: Product[];
  reasoning: string;
  audit_trail: Record<string, unknown>[];
}

export interface CatalogQuery {
  query: string;
}

export interface CatalogResult {
  products: Product[];
  explanation: string;
  total_found: number;
}

export interface CampaignRequest {
  product_ids: string[];
  campaign_type: 'email' | 'sms' | 'social';
  target_audience?: string;
}

export interface PaymentLinkData {
  product_id: string;
  product_name: string;
  price: number;
  link_id: string;
  short_url: string;
  mock: boolean;
}

export interface CampaignResult {
  campaign_copy: string;
  payment_links: PaymentLinkData[];
  subject?: string;
  reasoning: string;
  audit_trail: Record<string, unknown>[];
}

export type AuditStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL';

export interface AuditEntry {
  id: number;
  agent: string;
  action: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  reasoning: string;
  status: AuditStatus;
  explainability: string;
  timestamp: string;
}

export interface AuditStats {
  total_actions: number;
  successful: number;
  failed: number;
  agents_active: number;
}
