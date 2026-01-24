import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { spacing, colors, font, radii } from '@/src/design-system';

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
    <div
      style={{
        maxWidth: spacing.containerMaxWidth,
        margin: '0 auto',
        padding: spacing.pagePaddingDesktop,
        fontFamily: font.body,
        background: colors.background,
        minHeight: '100vh',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem', fontFamily: font.heading, fontWeight: 700 }}>Webhook-innkommende trafikk</h1>
      <p style={{ color: colors.mutedText, marginBottom: spacing.sectionSpacing }}>Sanntidslogg for alle innkommende webhook-events. Kun for admin/debug.</p>

      {/* SUMMARY */}
      <Grid gap="gridGap" columns={3} style={{ marginBottom: spacing.cardPadding }}>
        <Card>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.total}</div>
          <div style={{ color: colors.mutedText }}>Totalt (24t)</div>
        </Card>
        <Card>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{stats.relevant}</div>
          <div style={{ color: colors.mutedText }}>Relevante</div>
        </Card>
        <Card>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#94A3B8' }}>{stats.ignored}</div>
          <div style={{ color: colors.mutedText }}>Ignorerte</div>
        </Card>
      </Grid>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: spacing.gridGap, marginBottom: spacing.cardPadding, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: font.label.size, marginBottom: '0.25rem', color: colors.mutedText }}>Vis</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.input,
              fontSize: font.input.size,
              background: colors.card,
            }}
          >
            <option value="all">Alle</option>
            <option value="relevant">Relevante</option>
            <option value="ignored">Ignorerte</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: font.label.size, marginBottom: '0.25rem', color: colors.mutedText }}>Match ID</label>
          <Input value={matchId} onChange={e => setMatchId(e.target.value)} placeholder="F.eks. 1234567" style={{ minWidth: 180 }} />
        </div>
      </div>

      {/* EVENT TABLE */}
      <Card padding={undefined} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ minWidth: '100%', fontSize: '0.95rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', color: colors.mutedText }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Tid</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Match ID</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Relevant</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Klubb-ID</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Årsak</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Handling</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderTop: `1px solid ${colors.border}`, cursor: 'pointer', background: 'inherit' }} onMouseOver={e => (e.currentTarget.style.background = '#F1F5F9')} onMouseOut={e => (e.currentTarget.style.background = 'inherit')}>
                <td style={{ padding: '0.5rem 1rem', fontFamily: font.mono }}>{new Date(log.receivedAt).toLocaleTimeString()}</td>
                <td style={{ padding: '0.5rem 1rem', fontFamily: font.mono }}>{log.matchId || '-'}</td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  {log.isRelevant ? (
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: radii.input, background: '#D1FAE5', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>Ja</span>
                  ) : (
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: radii.input, background: '#F1F5F9', color: colors.mutedText, fontSize: '0.8rem', fontWeight: 600 }}>Nei</span>
                  )}
                </td>
                <td style={{ padding: '0.5rem 1rem', fontFamily: font.mono }}>{log.clubId || '-'}</td>
                <td style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{log.reason || '-'}</td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <Button variant="secondary" style={{ textDecoration: 'underline', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }} onClick={() => setSelected(log)}>Vis payload</Button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Ingen events funnet</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* PAYLOAD MODAL */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setSelected(null)}
        >
          <Card style={{ maxWidth: 600, width: '100%', padding: spacing.dashboardCardPadding, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              style={{
                position: 'absolute',
                top: 16,
                right: 24,
                fontSize: '2rem',
                color: colors.mutedText,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: radii.modalClose,
                transition: 'color 0.2s',
              }}
              onClick={() => setSelected(null)}
              onMouseOver={e => (e.currentTarget.style.color = colors.primary)}
              onMouseOut={e => (e.currentTarget.style.color = colors.mutedText)}
            >
              &times;
            </button>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Payload</h2>
            <pre style={{ background: '#F8FAFC', borderRadius: radii.input, padding: '1rem', fontSize: '0.9rem', overflowX: 'auto', maxHeight: '60vh', fontFamily: font.mono, whiteSpace: 'pre-wrap' }}>{JSON.stringify(selected.payload, null, 2)}</pre>
          </Card>
        </div>
      )}
    </div>
  );
}
