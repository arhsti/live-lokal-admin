import { useEffect, useState } from 'react';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="events-container">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      {loading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div>No events found.</div>
      ) : (
        <ul className="space-y-2">
          {events.map(event => (
            <li key={event.eventId} className="border rounded p-4 bg-white shadow">
              <div className="font-mono text-xs text-gray-500">{event.eventId}</div>
              <div>Match: {event.matchId}</div>
              <div>Status: {event.status}</div>
              <div>Timestamp: {event.timestamp}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
