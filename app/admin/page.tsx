"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [imageCount, setImageCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImageCount();
    fetchTemplateCount();
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

  const fetchTemplateCount = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplateCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Admin overview — quick actions and summaries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Images</h2>
              <span className="text-2xl">🖼️</span>
            </div>
            <p className="text-sm text-gray-600 mt-3">Browse and manage uploaded images.</p>
            <p className="text-xs text-gray-500 mt-2">{loading ? '...' : imageCount}</p>
          </div>
          <div className="mt-4">
            <Link href="/admin/images" className="btn-primary inline-block">Manage Images</Link>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Templates</h2>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-sm text-gray-600 mt-3">Create and edit story templates.</p>
            <p className="text-xs text-gray-500 mt-2">{templateCount}</p>
          </div>
          <div className="mt-4">
            <Link href="/admin/templates" className="btn-primary inline-block">Manage Templates</Link>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stories Rendered</h2>
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-sm text-gray-600 mt-3">Rendered story images and exports.</p>
            <p className="text-xs text-gray-500 mt-2">0</p>
          </div>
          <div className="mt-4">
            <Link href="/admin/stories" className="btn-primary inline-block">View Rendered Stories</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
