import { AuditEntry } from '@/lib/api';
import { getStatusColor, formatDate } from '@/lib/utils';
import { Bot, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

const AGENT_COLORS: Record<string, string> = {
  checkout_agent: 'text-blue-400 bg-blue-400/10',
  upsell_agent: 'text-green-400 bg-green-400/10',
  campaign_agent: 'text-purple-400 bg-purple-400/10',
  catalog_agent: 'text-yellow-400 bg-yellow-400/10',
};

function StatusIcon({ status }: { status: string }) {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'FAILED': return <XCircle className="w-4 h-4 text-red-400" />;
    case 'PARTIAL': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

export default function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No audit entries yet. Start using the agents!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={entry.id ?? i} className="relative pl-6">
          {/* Timeline line */}
          {i < entries.length - 1 && (
            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-[#1E1E2E]" />
          )}
          {/* Status dot */}
          <div className="absolute left-0 top-2">
            <StatusIcon status={entry.status} />
          </div>

          <div className="card ml-2">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${AGENT_COLORS[entry.agent] ?? 'text-gray-400 bg-gray-400/10'}`}>
                  <Bot className="w-3 h-3 mr-1" />{entry.agent}
                </span>
                <span className="text-sm font-semibold text-white">{entry.action.replace(/_/g, ' ')}</span>
                <span className={`badge ${getStatusColor(entry.status)}`}>{entry.status}</span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(entry.timestamp)}</span>
            </div>

            {/* Explainability */}
            <div className="bg-[#0A0A0F] rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                <span className="text-blue-400 font-medium">Explainability: </span>
                {entry.explainability}
              </p>
            </div>

            {/* Reasoning */}
            {entry.reasoning && (
              <p className="text-xs text-gray-400">
                <span className="text-gray-500">Reasoning: </span>{entry.reasoning}
              </p>
            )}

            {/* I/O preview */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">INPUT</p>
                <pre className="text-[10px] text-gray-400 bg-[#0A0A0F] rounded p-2 overflow-hidden max-h-16 line-clamp-3">
                  {JSON.stringify(entry.input_data, null, 1)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">OUTPUT</p>
                <pre className="text-[10px] text-gray-400 bg-[#0A0A0F] rounded p-2 overflow-hidden max-h-16 line-clamp-3">
                  {JSON.stringify(entry.output_data, null, 1)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
