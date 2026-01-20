import { r2Get, r2Put, readBodyAsString } from './r2';

export interface MatchEvent {
  id: string;
  hendelse: string;
  tidspunkt: string;
  draktnummer: string;
  objectId_match: string;
  createdAt: string;
  status: 'pending' | 'posted' | 'failed';
  fiksid_livelokal: string;
  renderedImageUrl?: string | null;
}

const eventsKey = (club: string) => `${club}/events/metadata.json`;

async function loadEvents(club: string): Promise<MatchEvent[]> {
  try {
    const obj = await r2Get(eventsKey(club));
    const raw = await readBodyAsString(obj.Body);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((event) => ({
      ...event,
      objectId_match: event.objectId_match || event.objectid_match || '',
      status: event.status || 'pending',
      renderedImageUrl: event.renderedImageUrl ?? null,
    }));
  } catch {
    return [];
  }
}

async function saveEvents(club: string, events: MatchEvent[]) {
  await r2Put(eventsKey(club), JSON.stringify(events, null, 2));
}

export async function listEvents(club: string): Promise<MatchEvent[]> {
  const events = await loadEvents(club);
  return events.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function getEventById(club: string, id: string): Promise<MatchEvent | null> {
  const events = await loadEvents(club);
  return events.find(event => event.id === id) || null;
}

export async function addEvent(club: string, event: MatchEvent) {
  const events = await loadEvents(club);
  events.push(event);
  await saveEvents(club, events);
  return event;
}

export async function updateEventStatus(club: string, id: string, status: MatchEvent['status']) {
  return updateEvent(club, id, { status });
}

export async function updateEvent(club: string, id: string, patch: Partial<MatchEvent>) {
  const events = await loadEvents(club);
  const next = events.map(event => event.id === id ? { ...event, ...patch } : event);
  await saveEvents(club, next);
  return next.find(event => event.id === id) || null;
}
