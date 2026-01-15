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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(151, 191, 195)' }}>Image Library</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">Back to Home</a>
        </div>
        <form ref={formRef} onSubmit={handleUpload} encType="multipart/form-data" className="flex items-center space-x-4">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png"
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          <button
            type="submit"
            disabled={uploading}
            className="btn-accent disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => {
            const current = editing[image.id] || { player: image.tags?.player || '', number: image.tags?.number || '', eventType: image.tags?.eventType || 'Alle' };
            return (
              <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-transparent hover:border-gray-200 transition">
                <div className="w-full h-72 md:h-80 bg-gray-50 overflow-hidden">
                  <img src={image.image_url} alt={`Image ${image.id}`} className="w-full h-full object-cover transform hover:scale-105 transition duration-200" />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{image.created_at ? new Date(image.created_at).toLocaleDateString() : ''}</p>
                    <a href="/" className="text-sm text-gray-600 hover:underline">Back to Home</a>
                  </div>

                  <div className="text-sm text-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Spiller</label>
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
                          className="input w-full text-sm mt-1"
                          aria-label="Spiller"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">Draktnummer</label>
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
                          className="input w-full text-sm mt-1"
                          aria-label="Draktnummer"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500">Hendelse</label>
                        <select
                          value={current.eventType}
                          onChange={(e) => { const v = e.target.value; setEditing(prev => ({ ...prev, [image.id]: { ...current, eventType: v } })); setSaveSuccess(prev => ({ ...prev, [image.id]: false })); setSaveErrors(prev => ({ ...prev, [image.id]: null })); setDirty(prev => ({ ...prev, [image.id]: current.player !== (image.tags?.player || '') || current.number !== (image.tags?.number || '') || v !== (image.tags?.eventType || 'Alle') })); }}
                          className="input w-full text-sm mt-1"
                          aria-label="Hendelse"
                        >
                          <option value="Alle">Alle</option>
                          <option value="Mål">Mål</option>
                          <option value="Kort">Kort</option>
                          <option value="Bytte">Bytte</option>
                        </select>
                      </div>
                    </div>
                  </div>

                    <div className="flex items-center space-x-2">
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
                        className="btn-accent text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        disabled={saving[image.id]}
                      >
                        {saving[image.id] ? 'Saving...' : 'Save Tags'}
                      </button>
                      {saveErrors[image.id] && <p className="field-error ml-2">{saveErrors[image.id]}</p>}
                      {saveSuccess[image.id] && <p className="ml-2 text-sm text-green-600">Lagret ✓</p>}
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
