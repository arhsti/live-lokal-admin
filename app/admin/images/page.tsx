'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageData {
  id: string;
  image_url: string;
  created_at?: string;
  tags?: { player: string; number: string };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [editing, setEditing] = useState<Record<string, { player: string; number: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  
  // Back to home navigation helper will be a link rendered below

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
    setUploadError(null);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const file = formData.get('file') as File;

    if (!file) {
      setUploadError('No file selected');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadImages();
        formRef.current.reset();
        // Notify other parts of the admin UI that images changed
        try { window.dispatchEvent(new CustomEvent('images:updated')); } catch (e) {}
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed response:', errorData);
        setUploadError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed');
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
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Image Library</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">Back to Home</a>
        </div>
        <form ref={formRef} onSubmit={handleUpload} encType="multipart/form-data" className="flex items-center space-x-4">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png"
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
        {uploadError && <p className="text-red-600 mt-2">{uploadError}</p>}
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
          {images.map((image) => {
            const current = editing[image.id] || { player: image.tags?.player || '', number: image.tags?.number || '' };
            return (
              <div key={image.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square">
                  <img src={image.image_url} alt={`Image ${image.id}`} className="w-full h-full object-cover" />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{image.created_at ? new Date(image.created_at).toLocaleDateString() : ''}</p>
                    <a href="/" className="text-sm text-blue-600 hover:underline">Back to Home</a>
                  </div>

                  <div className="text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">#player:</span>
                      <input
                        value={current.player}
                        onChange={(e) => setEditing(prev => ({ ...prev, [image.id]: { ...current, player: e.target.value } }))}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-gray-500">#number:</span>
                      <input
                        value={current.number}
                        onChange={(e) => setEditing(prev => ({ ...prev, [image.id]: { ...current, number: e.target.value } }))}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        const toSave = editing[image.id] || { player: image.tags?.player || '', number: image.tags?.number || '' };
                        setSaving(prev => ({ ...prev, [image.id]: true }));
                        try {
                          const res = await fetch(`/api/images/${image.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ player: toSave.player, number: toSave.number }),
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            // Update images state
                            setImages(prev => prev.map(im => im.id === image.id ? { ...im, tags: updated.tags, created_at: updated.created_at || im.created_at } : im));
                            // Dispatch global update
                            try { window.dispatchEvent(new CustomEvent('images:updated')); } catch (e) {}
                          } else {
                            const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                            console.error('Failed to save tags', err);
                            setUploadError(err.error || 'Failed to save tags');
                          }
                        } catch (err) {
                          console.error('Save tags error', err);
                          setUploadError('Failed to save tags');
                        } finally {
                          setSaving(prev => ({ ...prev, [image.id]: false }));
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      disabled={saving[image.id]}
                    >
                      {saving[image.id] ? 'Saving...' : 'Save Tags'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
