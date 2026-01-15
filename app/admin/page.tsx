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
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Admin overview — quick actions and summaries</p>
        </div>
      </div>

      <DashboardContent imageCount={imageCount} loading={loading} />

      <div>
        <h2 className="text-2xl font-semibold mt-6">Quick Links</h2>
        <div className="mt-4 flex items-center space-x-3">
          <a href="/admin/images" className="btn-primary">Manage Images</a>
          <a href="/admin/templates" className="btn-primary">Manage Templates</a>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ imageCount, loading }: { imageCount: number; loading: boolean }) {
  return (
    <div className="space-y-8">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-3xl text-white">🖼️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Images</p>
              <p className="text-3xl font-bold mt-1">{loading ? '...' : imageCount}</p>
              <p className="text-sm text-gray-500 mt-2">Browse and manage uploaded images.</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/images" className="btn-primary inline-block">Manage Images</Link>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-3xl text-white">📝</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-3xl font-bold mt-1">0</p>
              <p className="text-sm text-gray-500 mt-2">Create and edit story templates.</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/templates" className="btn-primary inline-block">Manage Templates</Link>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-3xl text-white">📸</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stories Rendered</p>
              <p className="text-3xl font-bold mt-1">0</p>
              <p className="text-sm text-gray-500 mt-2">Rendered story images and exports.</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/templates" className="btn-primary inline-block">View Rendered Stories</Link>
          </div>
        </div>
      </div>

      {/* Detailed Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold">Images overview</h3>
          <p className="text-sm text-gray-600 mt-2">Total images: <span className="font-medium">{loading ? '...' : imageCount}</span></p>
          <p className="text-sm text-gray-500 mt-3">Quick access to image management and upload tools.</p>
          <div className="mt-4">
            <Link href="/admin/images" className="btn-primary">Go to Images</Link>
          </div>
        </div>

        <div className="card p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold">Templates overview</h3>
          <p className="text-sm text-gray-600 mt-2">Total templates: <span className="font-medium">0</span></p>
          <p className="text-sm text-gray-500 mt-3">Create and manage reusable templates for stories.</p>
          <div className="mt-4">
            <Link href="/admin/templates" className="btn-primary">Go to Templates</Link>
          </div>
        </div>

        <div className="card p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold">Stories overview</h3>
          <p className="text-sm text-gray-600 mt-2">Rendered stories: <span className="font-medium">0</span></p>
          <p className="text-sm text-gray-500 mt-3">Review and export rendered stories.</p>
          <div className="mt-4">
            <Link href="/admin/templates" className="btn-primary">View Rendered Stories</Link>
          </div>
        </div>
      </div>

      {/* API Information (de-emphasized, bottom) */}
      <div className="mt-6">
        <div className="p-4 rounded-lg bg-gray-50 text-sm text-gray-600">
          <h4 className="font-semibold">API Endpoints (Technical)</h4>
          <div className="mt-3 space-y-2">
            <div><code>GET /api/images</code> — Retrieve all uploaded images</div>
            <div><code>POST /api/upload-image</code> — Upload images to storage</div>
            <div><code>POST /api/render-story</code> — Generate story images with text overlays</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImagesContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Image Library</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          Upload Image
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🖼️</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Navigate to Images Tab</h3>
        <p className="text-gray-600 mb-4">Use the Images tab above to manage your image library.</p>
        <button
          onClick={() => window.location.href = '/admin/images'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Go to Images
        </button>
      </div>
    </div>
  );
}

function TemplatesContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Story Templates</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
          Create Template
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Templates Coming Soon</h3>
        <p className="text-gray-600 mb-4">Template functionality will be available in a future update.</p>
      </div>
    </div>
  );
}
