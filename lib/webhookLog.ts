// Lightweight in-memory capped log for webhook events (dev/demo only)
// Resets on deploy/restart

export interface WebhookLogEntry {
  id: string;
  receivedAt: string;
  clubId?: string;
  matchId?: string;
  isRelevant: boolean;
  reason?: string;
  payload: Record<string, any>;
}

const MAX_LOGS = 1000;
const logs: WebhookLogEntry[] = [];

export function addWebhookLog(entry: WebhookLogEntry) {
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
}

export function getWebhookLogs({ filter, matchId }: { filter?: 'all' | 'relevant' | 'ignored', matchId?: string } = {}) {
  let result = logs;
  if (filter === 'relevant') result = result.filter(e => e.isRelevant);
  if (filter === 'ignored') result = result.filter(e => !e.isRelevant);
  if (matchId) result = result.filter(e => e.matchId === matchId);
  return result;
}

export function getWebhookStats() {
  const now = Date.now();
  const last24h = logs.filter(e => now - new Date(e.receivedAt).getTime() < 24*60*60*1000);
  return {
    total: last24h.length,
    relevant: last24h.filter(e => e.isRelevant).length,
    ignored: last24h.filter(e => !e.isRelevant).length,
  };
}
