'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuditStats } from '@/lib/api';
import {
  ShoppingCart, Package, Megaphone, Shield, TrendingUp,
  Bot, ArrowRight, Activity, CheckCircle2, XCircle, Zap
} from 'lucide-react';

interface Stats {
  total_actions: number;
  successful: number;
  failed: number;
  agents_active: number;
}

const AGENTS = [
  {
    icon: ShoppingCart, title: 'Checkout Agent', href: '/checkout',
    description: 'Conversational in-app checkout. Buy anything in plain English.',
    color: 'blue', tag: 'Live'
  },
  {
    icon: Package, title: 'Catalog Agent', href: '/catalog',
    description: 'Agent-readable product catalog with AI-powered search.',
    color: 'green', tag: 'Live'
  },
  {
    icon: Megaphone, title: 'Campaign Agent', href: '/campaigns',
    description: 'Orchestrate email, SMS and social campaigns with payment links.',
    color: 'purple', tag: 'Live'
  },
  {
    icon: Shield, title: 'Audit Trail', href: '/audit',
    description: 'Every money action explainable, bounded and gated.',
    color: 'yellow', tag: 'Live'
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-400/10 group-hover:bg-blue-400/20',
  green: 'text-emerald-400 bg-emerald-400/10 group-hover:bg-emerald-400/20',
  purple: 'text-purple-400 bg-purple-400/10 group-hover:bg-purple-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 group-hover:bg-yellow-400/20',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAuditStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">
              <Zap className="w-3 h-3 mr-1" /> Razorpay Buildathon 2026
            </span>
            <span className="badge text-purple-400 bg-purple-400/10 border-purple-400/20">Track 01</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            AI Growth &amp; Agentic Commerce
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-8">
            An AI agent that grows merchant revenue by automating checkout, catalog discovery,
            upselling and campaign orchestration using Razorpay APIs.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/checkout" className="btn-primary flex items-center gap-2">
              <Bot className="w-4 h-4" /> Try Checkout Agent <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/audit" className="btn-secondary flex items-center gap-2">
              <Shield className="w-4 h-4" /> View Audit Trail
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Agent Actions', value: stats?.total_actions ?? '—', icon: Activity, color: 'text-blue-400' },
            { label: 'Successful', value: stats?.successful ?? '—', icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Failed (Handled)', value: stats?.failed ?? '—', icon: XCircle, color: 'text-red-400' },
            { label: 'Agents Active', value: stats?.agents_active ?? '—', icon: TrendingUp, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Agent cards */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" /> Active Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map(({ icon: Icon, title, href, description, color, tag }) => (
            <Link key={href} href={href} className="card group hover:border-[#2A2A4A] transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${COLOR_MAP[color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20 text-[10px]">● {tag}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* The Bar */}
        <div className="mt-8 card border-yellow-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">The Bar — Met</h3>
              <p className="text-sm text-gray-400">
                Every money action is <strong className="text-white">explainable</strong> (audit trail),
                <strong className="text-white"> bounded</strong> (fixed Razorpay orders/payment links),
                and <strong className="text-white">gated</strong> (no amount modification possible).
                Failures are handled gracefully with detailed exception logs.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
            ⚠️ Backend not connected. Start the FastAPI server on port 8000.
          </div>
        )}
      </div>
    </div>
  );
}
