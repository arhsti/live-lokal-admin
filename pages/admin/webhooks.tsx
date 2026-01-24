import { useEffect, useState } from 'react';

interface WebhookLogEntry {
  id: string;
  receivedAt: string;
  clubId?: string;
  matchId?: string;
  isRelevant: boolean;
  reason?: string;
  payload: Record<string, any>;
}

function fetchLogs(filter: string, matchId: string) {
  const params = new URLSearchParams();
  if (filter && filter !== 'all') params.append('filter', filter);
  if (matchId) params.append('matchId', matchId);
  return fetch(`/api/webhooks/logs?${params}`)
    .then(r => r.json());
}

function fetchStats() {
  return fetch('/api/webhooks/logs?stats=1').then(r => r.json());
}

export default function WebhookAdmin() {
  const [logs, setLogs] = useState<WebhookLogEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, relevant: 0, ignored: 0 });
  const [filter, setFilter] = useState<'all' | 'relevant' | 'ignored'>('all');
  const [matchId, setMatchId] = useState('');
  const [selected, setSelected] = useState<WebhookLogEntry | null>(null);

  useEffect(() => {
    fetchLogs(filter, matchId).then(setLogs);
    fetchStats().then(setStats);
  }, [filter, matchId]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <h1 className="mb-2">Webhook-innkommende trafikk</h1>
      <p className="text-[#64748B] mb-8">Sanntidslogg for alle innkommende webhook-events. Kun for admin/debug.</p>

      {/* SUMMARY */}
      <div className="flex gap-8 mb-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex-1">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-[#64748B]">Totalt (24t)</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex-1">
          <div className="text-2xl font-bold text-[#10B981]">{stats.relevant}</div>
          <div className="text-[#64748B]">Relevante</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex-1">
          <div className="text-2xl font-bold text-[#94A3B8]">{stats.ignored}</div>
          <div className="text-[#64748B]">Ignorerte</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs mb-1 text-[#64748B]">Vis</label>
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className="px-4 py-2 border border-[#E2E8F0] rounded-lg">
            <option value="all">Alle</option>
            <option value="relevant">Relevante</option>
            <option value="ignored">Ignorerte</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1 text-[#64748B]">Match ID</label>
          <input value={matchId} onChange={e => setMatchId(e.target.value)} placeholder="F.eks. 1234567" className="px-4 py-2 border border-[#E2E8F0] rounded-lg" />
        </div>
      </div>

      {/* EVENT TABLE */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] text-[#64748B]">
              <th className="py-3 px-4 text-left">Tid</th>
              <th className="py-3 px-4 text-left">Match ID</th>
              <th className="py-3 px-4 text-left">Relevant</th>
              <th className="py-3 px-4 text-left">Klubb-ID</th>
              <th className="py-3 px-4 text-left">Årsak</th>
              <th className="py-3 px-4 text-left">Handling</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t hover:bg-[#F1F5F9]">
                <td className="py-2 px-4 font-mono">{new Date(log.receivedAt).toLocaleTimeString()}</td>
                <td className="py-2 px-4 font-mono">{log.matchId || '-'}</td>
                <td className="py-2 px-4">
                  {log.isRelevant ? (
                    <span className="inline-block px-2 py-1 rounded bg-[#D1FAE5] text-[#059669] text-xs font-semibold">Ja</span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded bg-[#F1F5F9] text-[#64748B] text-xs font-semibold">Nei</span>
                  )}
                </td>
                <td className="py-2 px-4 font-mono">{log.clubId || '-'}</td>
                <td className="py-2 px-4 text-xs">{log.reason || '-'}</td>
                <td className="py-2 px-4">
                  <button onClick={() => setSelected(log)} className="text-[#0EA5E9] underline text-xs">Vis payload</button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-[#94A3B8]">Ingen events funnet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAYLOAD MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-4 text-2xl text-[#64748B] hover:text-black" onClick={() => setSelected(null)}>&times;</button>
            <h2 className="mb-4 text-lg font-semibold">Payload</h2>
            <pre className="bg-[#F8FAFC] rounded p-4 text-xs overflow-x-auto max-h-[60vh] font-mono whitespace-pre-wrap">{JSON.stringify(selected.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
