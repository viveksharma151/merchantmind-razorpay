'use client';
import { useEffect, useState } from 'react';
import { getAuditLog, getAuditStats } from '@/lib/api';
import { AuditEntry, AuditStats } from '@/lib/types';
import AuditTimeline from '@/components/AuditTimeline';
import { Shield, RefreshCw, Activity, CheckCircle2, XCircle, Bot, Loader2 } from 'lucide-react';

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const [log, s] = await Promise.all([getAuditLog(100), getAuditStats()]);
      setEntries(log.entries || []);
      setStats(s);
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === 'ALL' ? entries : entries.filter(e => e.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Shield className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Autonomous Agent Audit Trail</h1>
            <span className="badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
              The Bar: Explainable &amp; Gated
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Every transaction, catalog query, and campaign generation logs full explainability,
            internal reasoning, and input/output payloads.
          </p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="w-4 h-4" /> Refresh Ledger
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Monitored Actions',
            value: stats ? stats.total_actions : 0,
            icon: Activity,
            color: 'text-blue-400',
          },
          {
            label: 'Successful Executions',
            value: stats ? stats.successful : 0,
            icon: CheckCircle2,
            color: 'text-emerald-400',
          },
          {
            label: 'Graceful Failures Handled',
            value: stats ? stats.failed : 0,
            icon: XCircle,
            color: 'text-red-400',
          },
          {
            label: 'Autonomous Agents',
            value: stats ? stats.agents_active : 4,
            icon: Bot,
            color: 'text-purple-400',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['ALL', 'SUCCESS', 'FAILED', 'PARTIAL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-[#1E1E2E] text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          Showing {filtered.length} of {entries.length} records
        </span>
      </div>

      {/* Audit Timeline */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      ) : (
        <AuditTimeline entries={filtered} />
      )}
    </div>
  );
}
