'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';
import { sendCheckoutMessage, getUpsells, CheckoutResult } from '@/lib/api';
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
];

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI shopping assistant. Tell me what you want to buy in plain English and I\'ll handle the checkout for you!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [upsells, setUpsells] = useState<Record<string, unknown>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (message: string) => {
    if (!message.trim() || loading) return;
    setInput('');
    setUpsells([]);

    setMessages(prev => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: '', loading: true },
    ]);
    setLoading(true);

    try {
      const result = await sendCheckoutMessage({ message, customer_name: 'Demo Customer' });

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: result.message, result },
      ]);

      // Fetch upsells if successful
      if (result.success && result.product) {
        const productId = (result.product as Record<string, unknown>).id as string;
        try {
          const upsellData = await getUpsells(productId);
          setUpsells(upsellData.suggestions || []);
        } catch {
          // Upsells are optional
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: '❌ Sorry, I couldn\'t connect to the backend. Make sure it\'s running on port 8000.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-blue-600' : 'bg-[#1E1E2E]'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-[#111118] border border-[#1E1E2E] text-gray-100 rounded-tl-sm'
              }`}>
                {msg.loading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing your request...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                )}
              </div>

              {/* Order Card */}
              {msg.result?.success && msg.result.order && (
                <div className="card w-full border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Order Created!</span>
                    {(msg.result.order as Record<string, unknown>).mock && (
                      <span className="badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20 text-[10px]">MOCK</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Order ID</p>
                      <p className="font-mono text-blue-400 text-xs">{(msg.result.order as Record<string, unknown>).id as string}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Amount</p>
                      <p className="font-bold">{formatCurrency(((msg.result.order as Record<string, unknown>).amount as number) / 100)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Status</p>
                      <p className="text-emerald-400 capitalize">{(msg.result.order as Record<string, unknown>).status as string}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Currency</p>
                      <p>{(msg.result.order as Record<string, unknown>).currency as string}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-[#0A0A0F] rounded-lg">
                    <p className="text-[10px] text-gray-500">AUDIT</p>
                    <p className="text-xs text-gray-300 mt-1">{msg.result.audit_trail.length} steps logged to audit trail</p>
                  </div>
                </div>
              )}

              {/* Failed card */}
              {msg.result && !msg.result.success && (
                <div className="card w-full border-red-500/30">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Graceful failure handled</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Exception logged to audit trail for review.</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upsells */}
        {upsells.length > 0 && (
          <div className="card border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">You might also like</span>
              <span className="badge text-purple-400 bg-purple-400/10 border-purple-400/20 text-[10px]">AI Upsell Agent</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {upsells.slice(0, 3).map((s, i) => {
                const prod = s as Record<string, unknown>;
                return (
                  <div key={i} className="bg-[#0A0A0F] rounded-xl p-3">
                    <p className="text-xs font-medium text-white mb-1 line-clamp-2">{prod.name as string}</p>
                    <p className="text-sm font-bold text-blue-400">{formatCurrency(prod.price as number)}</p>
                    <button
                      onClick={() => send(`I want to buy ${prod.name as string}`)}
                      className="mt-2 w-full text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg py-1 transition-colors"
                    >
                      Buy This Too
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
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

      {/* Input */}
      <div className="p-4 border-t border-[#1E1E2E]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Tell me what you want to buy..."
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
