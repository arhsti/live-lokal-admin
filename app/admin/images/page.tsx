'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageData {
  id: string;
  image_url: string;
  created_at?: string;
  tags?: { player: string; number: string; eventType?: string };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [editing, setEditing] = useState<Record<string, { player: string; number: string; eventType: string }>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string | null>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  
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
      {/* Tab navigation like reference */}
      <div className="mb-6">
        <div className="bg-white rounded-full p-2 shadow-sm max-w-full overflow-auto">
          <div className="flex items-center space-x-2">
            <a href="/admin" className="px-4 py-2 rounded-full text-sm flex items-center space-x-2">
              <span>📊</span>
              <span>Dashboard</span>
            </a>
            <button className="px-4 py-2 rounded-full text-sm bg-blue-600 text-white flex items-center space-x-2">
              <span>🖼️</span>
              <span>Images</span>
            </button>
            <a href="/admin/templates" className="px-4 py-2 rounded-full text-sm flex items-center space-x-2">
              <span>📝</span>
              <span>Templates</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Image Library</h1>
          <p className="text-sm text-gray-600">Manage uploaded images and metadata</p>
        </div>

        <div className="flex items-center space-x-4">
          <form ref={formRef} onSubmit={handleUpload} encType="multipart/form-data" className="hidden">
            <input
              id="file-input"
              type="file"
              name="file"
              accept="image/jpeg,image/png"
              required
              onChange={() => { try { formRef.current?.requestSubmit(); } catch (e) {} }}
            />
          </form>

          <button
            onClick={() => {
              const el = document.getElementById('file-input') as HTMLInputElement | null;
              el?.click();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Upload Image
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🖼️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No images uploaded yet</h3>
          <p className="text-gray-600 mb-6">Upload your first image to get started with story creation.</p>
          <div>
            <button
              onClick={() => {
                const el = document.getElementById('file-input') as HTMLInputElement | null;
                el?.click();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium"
            >
              Upload Your First Image
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => {
            const current = editing[image.id] || { player: image.tags?.player || '', number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
            return (
              <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-transparent hover:border-gray-200 transition">
                {/* Image area (portrait-style) */}
                <div className="relative bg-gray-100">
                  <div className="w-full h-96 overflow-hidden bg-black">
                    <img src={image.image_url} alt={`Image ${image.id}`} className="w-full h-full object-cover transform hover:scale-105 transition duration-300" />
                  </div>

                  {/* Draktnummer badge overlay */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xl shadow-lg">
                    #{current.number || image.tags?.number || '—'}
                  </div>
                </div>

                {/* Info panel (solid color) */}
                <div className="px-4 py-3 bg-gray-900 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">Spiller</div>
                      <input
                        value={current.player}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEditing(prev => ({ ...prev, [image.id]: { ...current, player: v } }));
                          setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                          setSaveSuccess(prev => ({ ...prev, [image.id]: false }));
                          const original = image.tags?.player || '';
                          setDirty(prev => ({ ...prev, [image.id]: v !== original || (current.number !== (image.tags?.number || '')) || current.eventType !== (image.tags?.eventType || 'Alle') }));
                        }}
                        className="bg-transparent border-0 text-white font-semibold text-lg mt-1 w-full placeholder-gray-400 focus:outline-none"
                        placeholder="Spiller navn"
                        aria-label="Spiller"
                      />
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-xs text-gray-400">Hendelse</div>
                      <select
                        value={current.eventType}
                        onChange={(e) => { const v = e.target.value; setEditing(prev => ({ ...prev, [image.id]: { ...current, eventType: v } })); setSaveSuccess(prev => ({ ...prev, [image.id]: false })); setSaveErrors(prev => ({ ...prev, [image.id]: null })); setDirty(prev => ({ ...prev, [image.id]: current.player !== (image.tags?.player || '') || current.number !== (image.tags?.number || '') || v !== (image.tags?.eventType || 'Alle') })); }}
                        className="bg-transparent border-0 text-white font-medium mt-1 focus:outline-none"
                        aria-label="Hendelse"
                      >
                        <option value="Alle">Alle</option>
                        <option value="Mål">Mål</option>
                        <option value="Kort">Kort</option>
                        <option value="Bytte">Bytte</option>
                      </select>

                      <div className="text-xs text-gray-400 mt-2">Dato</div>
                      <div className="text-sm text-gray-300">{image.created_at ? new Date(image.created_at).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {saveErrors[image.id] && <div className="text-sm text-red-400">{saveErrors[image.id]}</div>}
                      {saveSuccess[image.id] && <div className="text-sm text-green-400">Lagret ✓</div>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={1}
                        max={99}
                        value={current.number}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v) {
                            let n = parseInt(v, 10);
                            if (n < 1) n = 1;
                            if (n > 99) n = 99;
                            v = String(n);
                          }
                          setEditing(prev => ({ ...prev, [image.id]: { ...current, number: v } }));
                          setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                          setSaveSuccess(prev => ({ ...prev, [image.id]: false }));
                          const originalN = image.tags?.number || '';
                          setDirty(prev => ({ ...prev, [image.id]: current.player !== (image.tags?.player || '') || v !== originalN || current.eventType !== (image.tags?.eventType || 'Alle') }));
                        }}
                        className="w-20 bg-white text-gray-900 rounded-md px-2 py-1 text-sm font-semibold"
                        aria-label="Draktnummer"
                      />

                      <button
                        onClick={async () => {
                          const toSave = editing[image.id] || { player: image.tags?.player || '', number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };

                          // Frontend validation
                          if (!toSave.player || String(toSave.player).trim() === '') {
                            setSaveErrors(prev => ({ ...prev, [image.id]: 'Spiller må fylles ut' }));
                            return;
                          }
                          const num = parseInt(String(toSave.number || ''), 10);
                          if (isNaN(num) || num < 1 || num > 99) {
                            setSaveErrors(prev => ({ ...prev, [image.id]: 'Draktnummer må være et tall mellom 1 og 99' }));
                            return;
                          }

                          setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                          setSaving(prev => ({ ...prev, [image.id]: true }));
                          try {
                            const res = await fetch(`/api/images/${image.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ player: toSave.player, number: String(num), eventType: toSave.eventType }),
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                // Update images state
                                setImages(prev => prev.map(im => im.id === image.id ? { ...im, tags: updated.tags, created_at: updated.created_at || im.created_at } : im));
                                // Clear any save error
                                setSaveErrors(prev => ({ ...prev, [image.id]: null }));
                                // Show success briefly
                                setSaveSuccess(prev => ({ ...prev, [image.id]: true }));
                                setTimeout(() => setSaveSuccess(prev => ({ ...prev, [image.id]: false })), 2500);
                                // mark not dirty
                                setDirty(prev => ({ ...prev, [image.id]: false }));
                                // Dispatch global update
                                try { window.dispatchEvent(new CustomEvent('images:updated')); } catch (e) {}
                              } else {
                                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                                console.error('Failed to save tags', err);
                                setSaveErrors(prev => ({ ...prev, [image.id]: err.error || 'Failed to save tags' }));
                              }
                          } catch (err) {
                            console.error('Save tags error', err);
                            setSaveErrors(prev => ({ ...prev, [image.id]: 'Failed to save tags' }));
                          } finally {
                            setSaving(prev => ({ ...prev, [image.id]: false }));
                          }
                        }}
                        className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold disabled:opacity-50"
                        disabled={saving[image.id]}
                      >
                        {saving[image.id] ? 'Saving...' : 'Save'}
                      </button>
                    </div>
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
