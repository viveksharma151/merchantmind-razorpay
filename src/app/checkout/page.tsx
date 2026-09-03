'use client';
import ChatWidget from '@/components/ChatWidget';
import { ShoppingCart, Shield, Zap } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <ShoppingCart className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Conversational Checkout Agent</h1>
          <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">Autonomous Agent</span>
          <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20">Razorpay Orders API</span>
        </div>
        <p className="text-gray-400 text-sm">
          Allows humans or autonomous AI buyers to purchase products in natural language. Generates
          verifiable Razorpay orders while enforcing price bounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <div className="lg:col-span-2">
          <div className="card p-0 h-[72vh] flex flex-col overflow-hidden border-[#1E1E2E]">
            <ChatWidget />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> How It Works
            </h3>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'AI buyer or user issues natural language purchase query' },
                { step: '2', text: 'Agent matches catalog entities and verifies stock' },
                { step: '3', text: 'Bounded Razorpay Order is generated on the server' },
                { step: '4', text: 'Upsell Agent suggests high-affinity complementary items' },
                { step: '5', text: 'Explainability record & reasoning saved to audit log' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {step}
                  </span>
                  <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-yellow-400 text-sm">Bounded &amp; Gated</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Price calculations are strictly locked on the server. The buyer cannot alter order amounts or currency.
            </p>
          </div>

          <div className="card border-emerald-500/20">
            <h3 className="font-semibold text-emerald-400 text-sm mb-1">Testing &quot;The Bar&quot;</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Try asking for something not in the store like <span className="text-white italic">&quot;Order me a flying saucer&quot;</span>.
              The agent will handle the failure gracefully with diagnostic logs in the Audit Trail!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
