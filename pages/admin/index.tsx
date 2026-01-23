import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';

export default function Admin() {
  const [imageCount, setImageCount] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);

  useEffect(() => {
    loadImageCount();
    loadEventCount();
  }, []);

  async function loadImageCount() {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) return;
      const data = await res.json();
      setImageCount(Array.isArray(data) ? data.length : 0);
    } catch (_e) {
      setImageCount(0);
    }
  }

  async function loadEventCount() {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setEventCount(data.length);
    } catch (_e) {
      setEventCount(0);
    }
  }

  return (
    <>
      <Header title="Dashboard" />
      <main>
        <Dashboard imageCount={imageCount} eventCount={eventCount} />
      </main>
    </>
  );
}
