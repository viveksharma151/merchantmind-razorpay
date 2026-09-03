'use client';
import ChatWidget from '@/components/ChatWidget';
import { ShoppingCart, Bot, Shield, Zap } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Checkout Agent</h1>
          <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">Conversational</span>
        </div>
        <p className="text-gray-400">Buy anything in plain English. The AI agent handles product matching, order creation, and upselling.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat - takes 2/3 */}
        <div className="lg:col-span-2">
          <div className="card p-0 h-[70vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#1E1E2E] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Shopping Assistant</p>
                <p className="text-xs text-emerald-400">● Online</p>
              </div>
            </div>
            <ChatWidget />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> How It Works
            </h3>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Type your purchase intent in natural language' },
                { step: '2', text: 'AI agent parses intent using Gemini AI' },
                { step: '3', text: 'Product matched from catalog with confidence score' },
                { step: '4', text: 'Razorpay order created via API' },
                { step: '5', text: 'Upsell suggestions generated automatically' },
                { step: '6', text: 'All steps logged to immutable audit trail' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{step}</span>
                  <p className="text-sm text-gray-400">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-yellow-400 text-sm">Bounded &amp; Gated</h3>
            </div>
            <p className="text-xs text-gray-400">
              Every order is created via Razorpay API with a fixed amount. The customer cannot modify the price.
              All actions are logged with full explainability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
