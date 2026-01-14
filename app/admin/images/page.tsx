'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ImagesPage() {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ id: string; url: string; name: string; uploadedAt: string }>>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // Changed from 'image' to 'file' to match backend

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setImages(prev => [...prev, {
          id: result.id, // Use the ID from backend response
          url: result.image_url, // Use the URL from backend response
          name: file.name,
          uploadedAt: new Date().toISOString(),
        }]);
        // Clear the file input
        event.target.value = '';
      } else {
        const errorData = await response.json();
        alert(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Live Lokal
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">Image Library</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{uploading ? '⏳' : '📤'}</span>
              </div>
              <p className="text-lg font-medium mb-2">
                {uploading ? 'Uploading...' : 'Click to upload an image'}
              </p>
              <p className="text-gray-600">
                PNG, JPG, JPEG up to 10MB
              </p>
            </label>
          </div>
        </div>

        {/* Images Grid */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Your Images ({images.length})</h2>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🖼️</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No images uploaded yet</h3>
              <p className="text-gray-600">Upload your first image above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium truncate" title={image.name}>
                      {image.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(image.url)}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Copy URL
                      </button>
                      <button className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}