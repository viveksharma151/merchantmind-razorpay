'use client';
import { useEffect, useState } from 'react';
import { getAllProducts, createCampaign } from '@/lib/api';
import { CampaignResult, Product } from '@/lib/types';
import { Megaphone, Loader2, Link2, Mail, MessageSquare, Share2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const CAMPAIGN_TYPES = [
  { id: 'email', label: 'Email Campaign', icon: Mail },
  { id: 'sms', label: 'SMS Blast', icon: MessageSquare },
  { id: 'social', label: 'Social Media Post', icon: Share2 },
] as const;

export default function CampaignsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [campaignType, setCampaignType] = useState<'email' | 'sms' | 'social'>('email');
  const [audience, setAudience] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAllProducts().then(d => setProducts((d.products || []).slice(0, 12)));
  }, []);

  const toggleProduct = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleCreate = async () => {
    if (!selected.length) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await createCampaign(selected, campaignType, audience);
      setResult(res);
    } catch {
      alert('Failed to generate campaign. Please verify the local server.');
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
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Megaphone className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Campaign Orchestrator Agent</h1>
          <span className="badge text-purple-400 bg-purple-400/10 border-purple-400/20">
            Razorpay Payment Links API
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Select merchandise, choose a target channel, and let the AI generate high-converting copy
          automatically embedded with secure Razorpay Payment Links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3 text-sm">1. Select Channel</h3>
            <div className="space-y-2">
              {CAMPAIGN_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCampaignType(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    campaignType === id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-[#0A0A0F] text-gray-400 hover:text-white border border-[#1E1E2E]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-2 text-sm">2. Target Audience</h3>
            <select
              value={audience}
              onChange={e => setAudience(e.target.value)}
              className="input"
            >
              <option value="general">General Audience</option>
              <option value="students">Students &amp; Learners</option>
              <option value="professionals">Working Professionals</option>
              <option value="fitness enthusiasts">Fitness &amp; Wellness Seekers</option>
              <option value="tech savvy">Tech Enthusiasts &amp; Developers</option>
            </select>
          </div>

          <button
            onClick={handleCreate}
            disabled={!selected.length || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            {selected.length
              ? `Orchestrate Campaign (${selected.length} items)`
              : 'Select products first'}
          </button>
        </div>

        {/* Product Picker Column */}
        <div className="card flex flex-col h-[70vh]">
          <h3 className="font-semibold text-white mb-3 text-sm flex items-center justify-between">
            <span>Choose Products</span>
            <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">
              {selected.length} selected
            </span>
          </h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {products.map(p => (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selected.includes(p.id)
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : 'bg-[#0A0A0F] hover:bg-[#151522] border border-[#1E1E2E]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
                  }`}
                >
                  {selected.includes(p.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-500">{p.category}</p>
                </div>
                <span className="text-xs font-bold text-blue-400">
                  {formatCurrency(p.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Results Column */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white text-sm">Generated Copy</h3>
                  <button onClick={handleCopy} className="btn-secondary text-xs py-1 px-2.5">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0A0A0F] rounded-xl p-3 max-h-56 overflow-y-auto border border-[#1E1E2E]">
                  {result.campaign_copy}
                </pre>
              </div>

              <div className="card">
                <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-400" /> Razorpay Payment Links
                  <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20 text-[10px]">
                    {result.payment_links.length} Gated Links
                  </span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {result.payment_links.map((link, i) => (
                    <div
                      key={i}
                      className="bg-[#0A0A0F] rounded-xl p-2.5 border border-[#1E1E2E] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-white truncate max-w-[180px]">
                          {link.product_name}
                        </p>
                        <span className="text-[11px] font-bold text-blue-400">
                          {formatCurrency(link.price)}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-400 font-mono truncate">{link.short_url}</p>
                      {link.mock && (
                        <span className="badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20 text-[9px] self-start mt-0.5">
                          TEST MODE LINK
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card border-purple-500/20 bg-purple-500/5">
                <p className="text-xs text-gray-300">
                  <span className="text-purple-400 font-semibold">Agent Reasoning: </span>
                  {result.reasoning}
                </p>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center h-[70vh] text-center">
              <Megaphone className="w-12 h-12 text-gray-600 mb-3 opacity-40" />
              <p className="text-gray-400 text-xs max-w-xs">
                Select one or more products and hit &quot;Orchestrate Campaign&quot; to see copy and
                Razorpay payment links generated automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
