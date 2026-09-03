'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';
import { sendCheckoutMessage, getUpsells } from '@/lib/api';
import { CheckoutResult, Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  result?: CheckoutResult;
  loading?: boolean;
}

const SUGGESTIONS = [
  'I want to buy Sony headphones',
  'Get me a yoga mat',
  'Order 2 books on startups',
  'I need a wireless mouse',
  'Buy me a flying rocket', // tests the "graceful failure" bar requirement!
];

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your Autonomous AI Shopping Assistant. Tell me what you'd like to purchase in plain English, and I'll resolve the catalog and build a bounded Razorpay order for you!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [upsells, setUpsells] = useState<Product[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (messageText: string) => {
    if (!messageText.trim() || loading) return;
    setInput('');
    setUpsells([]);

    setMessages(prev => [
      ...prev,
      { role: 'user', content: messageText },
      { role: 'assistant', content: '', loading: true },
    ]);
    setLoading(true);

    try {
      const result = await sendCheckoutMessage({
        message: messageText,
        customer_name: 'Demo Customer',
      });

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: result.message, result },
      ]);

      // If checkout order succeeded, query the Upsell Agent to grow merchant revenue!
      if (result.success && result.product) {
        try {
          const upsellData = await getUpsells(result.product.id);
          setUpsells(upsellData.suggestions || []);
        } catch {
          // Upsell retrieval is non-blocking
        }
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: '❌ Communication error. Please ensure the local server is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-[#1E1E2E] text-gray-300'
              }`}
            >
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-[#111118] border border-[#1E1E2E] text-gray-100 rounded-tl-sm'
                }`}
              >
                {msg.loading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm">Agent analyzing catalog &amp; bounding order...</span>
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                )}
              </div>

              {/* Order Created Card */}
              {msg.result?.success && msg.result.order && (
                <div className="card w-full border-emerald-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">Razorpay Order Created!</span>
                    </div>
                    {msg.result.order.mock ? (
                      <span className="badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20 text-[10px]">
                        TEST / MOCK
                      </span>
                    ) : (
                      <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20 text-[10px]">
                        LIVE API
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Order ID</p>
                      <p className="font-mono text-blue-400 text-xs truncate">
                        {String(msg.result.order.id)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Total Amount</p>
                      <p className="font-bold text-white">
                        {formatCurrency(Number(msg.result.order.amount) / 100)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Receipt</p>
                      <p className="font-mono text-xs text-gray-300">
                        {String(msg.result.order.receipt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Status</p>
                      <p className="text-emerald-400 capitalize">{String(msg.result.order.status)}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-[#0A0A0F] rounded-lg">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Audit Guarantee</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {msg.result.audit_trail.length} steps recorded to immutable audit ledger.
                    </p>
                  </div>
                </div>
              )}

              {/* Graceful Failure Handled Card ("The Bar") */}
              {msg.result && !msg.result.success && (
                <div className="card w-full border-red-500/30">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">Graceful Failure Handled</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Ambiguous or invalid intent bounded safely without false charges. Exception diagnostic written to audit trail.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upsell Recommendations */}
        {upsells.length > 0 && (
          <div className="card border-blue-500/30 mt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">Upsell &amp; Cross-Sell Agent</span>
              </div>
              <span className="badge text-purple-400 bg-purple-400/10 border-purple-400/20 text-[10px]">
                Revenue Growth
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upsells.slice(0, 3).map((prod, idx) => (
                <div key={idx} className="bg-[#0A0A0F] rounded-xl p-3 border border-[#1E1E2E]">
                  <p className="text-xs font-medium text-white mb-1 line-clamp-1">{prod.name}</p>
                  <p className="text-sm font-bold text-blue-400">{formatCurrency(prod.price)}</p>
                  <button
                    onClick={() => send(`I want to buy ${prod.name}`)}
                    className="mt-2 w-full text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg py-1.5 transition-colors font-medium"
                  >
                    + Add to Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="whitespace-nowrap text-xs bg-[#1E1E2E] hover:bg-[#2A2A3E] text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-[#2A2A3E]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-[#1E1E2E]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Tell me what you want to buy (e.g. 'Order 1 Sony headphones')..."
            className="input flex-1"
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
