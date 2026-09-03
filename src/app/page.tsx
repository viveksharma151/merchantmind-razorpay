'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuditStats } from '@/lib/api';
import { AuditStats } from '@/lib/types';
import {
  ShoppingCart,
  Package,
  Megaphone,
  Shield,
  TrendingUp,
  Bot,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';

const AGENTS = [
  {
    icon: ShoppingCart,
    title: 'Checkout Agent',
    href: '/checkout',
    description: 'Conversational in-app checkout. Transact and create Razorpay orders in plain English.',
    color: 'blue',
    tag: 'Autonomous',
  },
  {
    icon: Package,
    title: 'Catalog Agent',
    href: '/catalog',
    description: 'Agent-readable product catalog with semantic entity extraction & tagging.',
    color: 'green',
    tag: 'Structured',
  },
  {
    icon: Megaphone,
    title: 'Campaign Orchestrator',
    href: '/campaigns',
    description: 'Auto-generates marketing copy with embedded, bounded Razorpay Payment Links.',
    color: 'purple',
    tag: 'Revenue Driver',
  },
  {
    icon: Shield,
    title: 'Immutable Audit Trail',
    href: '/audit',
    description: 'Every money action explainable, bounded, and gated with diagnostic inspection.',
    color: 'yellow',
    tag: 'Compliance Bar',
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-400/10 group-hover:bg-blue-400/20',
  green: 'text-emerald-400 bg-emerald-400/10 group-hover:bg-emerald-400/20',
  purple: 'text-purple-400 bg-purple-400/10 group-hover:bg-purple-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 group-hover:bg-yellow-400/20',
};

export default function Dashboard() {
  const [stats, setStats] = useState<AuditStats | null>(null);

  useEffect(() => {
    getAuditStats()
      .then(setStats)
      .catch(() => {
        setStats({
          total_actions: 0,
          successful: 0,
          failed: 0,
          agents_active: 4,
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">
              <Zap className="w-3 h-3 mr-1" /> Razorpay Buildathon 2026
            </span>
            <span className="badge text-purple-400 bg-purple-400/10 border-purple-400/20">
              Track 01: AI Growth &amp; Agentic Commerce
            </span>
            <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
              ● 100% Full-Stack Next.js &amp; Node.js
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Grow Merchant Revenue with <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              Autonomous Commerce Agents
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-8">
            An end-to-end agentic platform that makes merchants transactable by AI buyers, drives
            automatic upsells, and generates campaigns with secure Razorpay Payment Links.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/checkout" className="btn-primary flex items-center gap-2">
              <Bot className="w-4 h-4" /> Try Conversational Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/audit" className="btn-secondary flex items-center gap-2">
              <Shield className="w-4 h-4" /> View Audit Trail
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: 'Total Agent Actions',
              value: stats ? stats.total_actions : '—',
              icon: Activity,
              color: 'text-blue-400',
            },
            {
              label: 'Successful Orders / Actions',
              value: stats ? stats.successful : '—',
              icon: CheckCircle2,
              color: 'text-emerald-400',
            },
            {
              label: 'Graceful Failures Handled',
              value: stats ? stats.failed : '—',
              icon: XCircle,
              color: 'text-red-400',
            },
            {
              label: 'Autonomous Agents Active',
              value: stats ? stats.agents_active : 4,
              icon: TrendingUp,
              color: 'text-purple-400',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Agent Cards Grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" /> Active Autonomous Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map(({ icon: Icon, title, href, description, color, tag }) => (
            <Link
              key={href}
              href={href}
              className="card group hover:border-[#2A2A4A] transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${COLOR_MAP[color]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <span className="badge text-emerald-400 bg-emerald-400/10 border-emerald-400/20 text-[10px]">
                      ● {tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* The Bar Banner */}
        <div className="mt-10 card border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">
                The Bar: Every Money Action Explainable, Bounded, and Gated
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                In strict compliance with Razorpay&apos;s Track 01 standard, every transaction and
                recommendation generated by MerchantMind is strictly bounded on the server side
                against price tampering. An immutable audit log records each intent, internal
                reasoning, and execution status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
