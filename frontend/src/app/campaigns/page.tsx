'use client';
import { useEffect, useState } from 'react';
import { getAllProducts, createCampaign, CampaignResult } from '@/lib/api';
import { Megaphone, Loader2, Link2, Mail, MessageSquare, Share2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product { id: string; name: string; category: string; price: number; description: string; }

const CAMPAIGN_TYPES = [
  { id: 'email', label: 'Email', icon: Mail, color: 'blue' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, color: 'green' },
  { id: 'social', label: 'Social Media', icon: Share2, color: 'purple' },
];

export default function CampaignsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [campaignType, setCampaignType] = useState('email');
  const [audience, setAudience] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAllProducts().then(d => setProducts((d.products || []).slice(0, 12)));
  }, []);

  const toggleProduct = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!selected.length) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await createCampaign(selected, campaignType, audience);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.campaign_copy) {
      navigator.clipboard.writeText(result.campaign_copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Campaign Orchestrator</h1>
          <span className="badge text-purple-400 bg-purple-400/10 border-purple-400/20">AI Agent</span>
        </div>
        <p className="text-gray-400">Select products, choose campaign type, and let AI generate copy + Razorpay payment links.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="space-y-6">
          {/* Campaign type */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Campaign Type</h3>
            <div className="space-y-2">
              {CAMPAIGN_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCampaignType(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    campaignType === id ? 'bg-blue-600 text-white' : 'bg-[#0A0A0F] text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Target Audience</h3>
            <select
              value={audience}
              onChange={e => setAudience(e.target.value)}
              className="input"
            >
              <option value="general">General</option>
              <option value="students">Students</option>
              <option value="professionals">Professionals</option>
              <option value="fitness enthusiasts">Fitness Enthusiasts</option>
              <option value="tech savvy">Tech Savvy</option>
            </select>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!selected.length || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            {selected.length ? `Create Campaign (${selected.length} products)` : 'Select products first'}
          </button>
        </div>

        {/* Product selection */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Select Products ({selected.length} selected)</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map(p => (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selected.includes(p.id) ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-[#0A0A0F] hover:bg-[#1A1A2A]'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selected.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
                }`}>
                  {selected.includes(p.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <span className="text-sm font-bold text-blue-400">{formatCurrency(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Generated Campaign</h3>
                  <button onClick={handleCopy} className="btn-secondary text-sm py-1.5 px-3">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0A0A0F] rounded-xl p-4 max-h-60 overflow-y-auto">
                  {result.campaign_copy}
                </pre>
              </div>

              <div className="card">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-400" /> Payment Links
                  <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20 text-[10px]">{result.payment_links.length} created</span>
                </h3>
                <div className="space-y-2">
                  {result.payment_links.map((link, i) => {
                    const l = link as Record<string, unknown>;
                    return (
                      <div key={i} className="bg-[#0A0A0F] rounded-xl p-3">
                        <p className="text-sm font-medium text-white mb-1">{l.product_name as string}</p>
                        <p className="text-xs text-blue-400 font-mono">{l.short_url as string}</p>
                        {l.mock && <span className="badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20 text-[10px] mt-1">MOCK</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card border-purple-500/20">
                <p className="text-xs text-gray-400">
                  <span className="text-purple-400 font-medium">Agent reasoning: </span>
                  {result.reasoning}
                </p>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <Megaphone className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Select products and create a campaign to see AI-generated copy and payment links here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
