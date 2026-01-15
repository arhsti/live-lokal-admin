'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'images' | 'templates'>('dashboard');
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchImageCount();
    }
  }, [activeTab]);

  // Listen for image updates from the images page and refresh count
  useEffect(() => {
    const handler = () => fetchImageCount();
    window.addEventListener('images:updated', handler);
    return () => window.removeEventListener('images:updated', handler);
  }, []);

  const fetchImageCount = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const images = await response.json();
        setImageCount(images.length);
      }
    } catch (error) {
      console.error('Failed to fetch image count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Live Lokal
                </Link>
                <div className="text-sm text-gray-600">Live Lokal – Admin Dashboard</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-2 bg-white p-1 rounded-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'images', label: 'Images', icon: '🖼️' },
              { id: 'templates', label: 'Templates', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? ''
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                style={activeTab === tab.id ? { background: 'rgb(151, 191, 195)', color: '#ffffff' } : undefined}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardContent imageCount={imageCount} loading={loading} />}
        {activeTab === 'images' && <ImagesContent />}
        {activeTab === 'templates' && <TemplatesContent />}
      </div>
    </main>
  );
}

function DashboardContent({ imageCount, loading }: { imageCount: number; loading: boolean }) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : imageCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-2xl text-white">🖼️</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-2xl text-white">📝</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stories Rendered</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-2xl text-white">📸</span>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/images" className="card p-4 flex items-start space-x-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="text-xl text-white">📤</span>
          </div>
          <div>
            <p className="font-semibold">Upload New Image</p>
            <p className="text-sm text-gray-600">Add images to your library</p>
          </div>
        </Link>

        <Link href="/admin/templates" className="card p-4 flex items-start space-x-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="text-xl text-white">🎨</span>
          </div>
          <div>
            <p className="font-semibold">Create Template</p>
            <p className="text-sm text-gray-600">Design reusable story templates</p>
          </div>
        </Link>
      </div>

      {/* API Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <code className="text-sm font-mono">GET /api/images</code>
              <p className="text-sm text-gray-600">Retrieve all uploaded images</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <code className="text-sm font-mono">POST /api/upload-image</code>
              <p className="text-sm text-gray-600">Upload images to storage</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <code className="text-sm font-mono">POST /api/render-story</code>
              <p className="text-sm text-gray-600">Generate story images with text overlays</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
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
