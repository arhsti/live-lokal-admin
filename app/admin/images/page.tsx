'use client';

import { useState, useEffect } from 'react';

interface ImageData {
  id: string;
  image_url: string;
  created_at: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load images from backend on component mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        console.error('Failed to load images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('image') as File;

    if (!file) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        // Reload images from backend to get the updated list
        await loadImages();
        // Clear the file input
        event.currentTarget.reset();
      } else {
        const errorData = await response.json();
        alert(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Image Library</h1>
        <form onSubmit={handleUpload} className="flex items-center space-x-4">
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🖼️</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No images uploaded yet</h3>
          <p className="text-gray-600">Upload your first image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square">
                <img
                  src={image.image_url}
                  alt="Uploaded image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
