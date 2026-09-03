'use client';
import { useEffect, useState } from 'react';
import { getAuditLog, getAuditStats, AuditEntry } from '@/lib/api';
import AuditTimeline from '@/components/AuditTimeline';
import { Shield, RefreshCw, Activity, CheckCircle2, XCircle, Bot, Loader2 } from 'lucide-react';

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const [log, s] = await Promise.all([getAuditLog(100), getAuditStats()]);
      setEntries(log.entries);
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? entries : entries.filter(e => e.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
            <span className="badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20">Immutable Log</span>
          </div>
          <p className="text-gray-400">Every money action logged with full explainability. Bounded and gated.</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Actions', value: stats.total_actions ?? 0, icon: Activity, color: 'text-blue-400' },
          { label: 'Successful', value: stats.successful ?? 0, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Failed', value: stats.failed ?? 0, icon: XCircle, color: 'text-red-400' },
          { label: 'Agents', value: stats.agents_active ?? 0, icon: Bot, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'SUCCESS', 'FAILED', 'PARTIAL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-[#1E1E2E] text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} entries</span>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      ) : (
        <AuditTimeline entries={filtered} />
      )}
    </div>
  );
}
