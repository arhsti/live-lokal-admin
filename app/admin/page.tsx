"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImageCount();
    const handler = () => fetchImageCount();
    window.addEventListener('images:updated', handler);
    return () => window.removeEventListener('images:updated', handler);
  }, []);

  const fetchImageCount = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImageCount(data.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Admin</h1>
          <p className="text-sm text-gray-600 mt-1">Oversikt over innhold og verktøy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/images" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bilder</h2>
            <span className="text-2xl">🖼️</span>
          </div>
          <p className="text-sm text-gray-600 mt-3">Last opp og administrer bilder.</p>
          <p className="text-xs text-gray-500 mt-2">Totalt: {loading ? '...' : imageCount}</p>
        </Link>

        <Link href="/admin/templates" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates</h2>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-sm text-gray-600 mt-3">Lag og administrer story-maler.</p>
          <p className="text-xs text-gray-500 mt-2">Opprett og rediger visuelt.</p>
        </Link>

        <Link href="/admin/stories" className="card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Stories rendered</h2>
            <span className="text-2xl">📸</span>
          </div>
          <p className="text-sm text-gray-600 mt-3">Oversikt over genererte stories.</p>
          <ul className="text-xs text-gray-500 mt-3 space-y-1">
            <li>• Placeholder-liste</li>
            <li>• Kommer snart</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
