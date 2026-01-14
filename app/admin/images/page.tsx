'use client';

import { useState, useEffect } from 'react';

interface Image {
  id: string;
  image_url: string;
  created_at: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file') as File;

    if (!file) return;

    setUploading(true);
    try {
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        // Refresh images after upload
        await fetchImages();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Image Library</h1>

      <form onSubmit={handleUpload} className="mb-6">
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="mb-2"
        />
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="border rounded p-2">
            <img
              src={image.image_url}
              alt=""
              className="w-full h-48 object-cover rounded"
            />
            <p className="text-sm text-gray-500 mt-2">
              {new Date(image.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
