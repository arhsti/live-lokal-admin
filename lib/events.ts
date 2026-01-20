import { r2Get, r2Put, readBodyAsString } from './r2';

export interface MatchEvent {
  id: string;
  hendelse: string;
  tidspunkt: string;
  draktnummer: string;
  createdAt: string;
  status: 'pending' | 'posted' | 'failed';
}

const EVENTS_KEY = 'events/metadata.json';

async function loadEvents(): Promise<MatchEvent[]> {
  try {
    const obj = await r2Get(EVENTS_KEY);
    const raw = await readBodyAsString(obj.Body);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((event) => ({
      ...event,
      status: event.status || 'pending',
    }));
  } catch {
    return [];
  }
}

async function saveEvents(events: MatchEvent[]) {
  await r2Put(EVENTS_KEY, JSON.stringify(events, null, 2));
}

export async function listEvents(): Promise<MatchEvent[]> {
  const events = await loadEvents();
  return events.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function getEventById(id: string): Promise<MatchEvent | null> {
  const events = await loadEvents();
  return events.find(event => event.id === id) || null;
}

export async function addEvent(event: MatchEvent) {
  const events = await loadEvents();
  events.push(event);
  await saveEvents(events);
  return event;
}

export async function updateEventStatus(id: string, status: MatchEvent['status']) {
  const events = await loadEvents();
  const next = events.map(event => event.id === id ? { ...event, status } : event);
  await saveEvents(next);
  return next.find(event => event.id === id) || null;
}
