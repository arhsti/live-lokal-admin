'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface ImageData {
  id: string;
  image_url: string;
}

interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  placeholderKey: string;
}

interface Template {
  id: string;
  name: string;
  image_id: string;
  image_url: string;
  text_boxes: TextBox[];
}

const PLACEHOLDERS = [
  '{{player_number}}',
  '{{event_type}}',
  '{{team_name}}',
  '{{custom_text}}',
];

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

export default function TemplatesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Template | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<null | {
    id: string;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    origin: { x: number; y: number; width: number; height: number };
  }>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, type, startX, startY, origin } = dragRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      setDraft(prev => {
        if (!prev) return prev;
        const next = prev.text_boxes.map(box => {
          if (box.id !== id) return box;
          if (type === 'move') {
            const nextX = Math.min(Math.max(0, origin.x + dx), CANVAS_WIDTH - box.width);
            const nextY = Math.min(Math.max(0, origin.y + dy), CANVAS_HEIGHT - box.height);
            return { ...box, x: nextX, y: nextY };
          }
          const nextWidth = Math.min(Math.max(40, origin.width + dx), CANVAS_WIDTH - box.x);
          const nextHeight = Math.min(Math.max(24, origin.height + dy), CANVAS_HEIGHT - box.y);
          return { ...box, width: nextWidth, height: nextHeight };
        });
        return { ...prev, text_boxes: next };
      });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [imagesRes, templatesRes] = await Promise.all([
        fetch('/api/images'),
        fetch('/api/templates'),
      ]);
      const imagesData = imagesRes.ok ? await imagesRes.json() : [];
      const templatesData = templatesRes.ok ? await templatesRes.json() : [];
      setImages(Array.isArray(imagesData) ? imagesData : []);
      const safeTemplates = Array.isArray(templatesData)
        ? templatesData.map((template: Template) => ({
            ...template,
            text_boxes: Array.isArray(template.text_boxes) ? template.text_boxes : [],
          }))
        : [];
      setTemplates(safeTemplates);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste data. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }

  const selectedBox = useMemo(() => {
    if (!draft || !selectedBoxId) return null;
    return draft.text_boxes.find(b => b.id === selectedBoxId) || null;
  }, [draft, selectedBoxId]);

  const handleCreateTemplate = () => {
    setDraft({
      id: '',
      name: '',
      image_id: '',
      image_url: '',
      text_boxes: [],
    });
    setSelectedBoxId(null);
    setShowImagePicker(true);
  };

  const handleSelectTemplate = (template: Template) => {
    setDraft(template);
    setSelectedBoxId(null);
    setShowImagePicker(false);
  };

  const handleSelectImage = (image: ImageData) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, image_id: image.id, image_url: image.image_url };
    });
    setShowImagePicker(false);
  };

  const handleAddTextBox = () => {
    const nextId = `box_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setDraft(prev => {
      if (!prev) return prev;
      const nextBox: TextBox = {
        id: nextId,
        x: 24,
        y: 24,
        width: 180,
        height: 48,
        fontSize: 22,
        alignment: 'left',
        placeholderKey: PLACEHOLDERS[0],
      };
      return { ...prev, text_boxes: [...prev.text_boxes, nextBox] };
    });
    setSelectedBoxId(nextId);
  };

  const handleDeleteBox = (boxId: string) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, text_boxes: prev.text_boxes.filter(box => box.id !== boxId) };
    });
    if (selectedBoxId === boxId) setSelectedBoxId(null);
  };

  const updateSelectedBox = (changes: Partial<TextBox>) => {
    setDraft(prev => {
      if (!prev || !selectedBoxId) return prev;
      const next = prev.text_boxes.map(box => (box.id === selectedBoxId ? { ...box, ...changes } : box));
      return { ...prev, text_boxes: next };
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError('Gi templaten et navn før du lagrer.');
      return;
    }
    if (!draft.image_id || !draft.image_url) {
      setError('Velg et bilde før du lagrer.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: draft.name,
        image_id: draft.image_id,
        image_url: draft.image_url,
        text_boxes: draft.text_boxes,
      };

      const res = draft.id
        ? await fetch(`/api/templates/${draft.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }));
        throw new Error(err.error || 'Failed to save');
      }

      const saved = await res.json().catch(() => null);
      if (saved) {
        setDraft(saved);
      }
      await loadData();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Kunne ikke lagre template.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Laster templates...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-gray-600 mt-1">Lag maler med bilde og tekstplassholdere.</p>
        </div>
        <button className="btn-primary" onClick={handleCreateTemplate}>Create template</button>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6">
        <div className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">Templates</h2>
          <div className="space-y-2">
            {templates.length === 0 && (
              <div className="text-xs text-gray-500">Ingen templates enda.</div>
            )}
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${draft?.id === template.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-medium text-gray-800">{template.name}</div>
                <div className="text-xs text-gray-500">{template.text_boxes?.length || 0} tekstfelt</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={draft?.name || ''}
                onChange={(e) => setDraft(prev => (prev ? { ...prev, name: e.target.value } : prev))}
                placeholder="Templatename"
                className="input text-sm h-9 px-3 flex-1 min-w-[180px]"
              />
              <button className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50" onClick={() => setShowImagePicker(prev => !prev)}>
                {draft?.image_id ? 'Bytt bilde' : 'Velg bilde'}
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50" onClick={handleAddTextBox} disabled={!draft}>
                Add text box
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={!draft || saving}>
                {saving ? 'Saving...' : 'Save template'}
              </button>
            </div>

            {showImagePicker && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="text-xs text-gray-600 mb-2">Velg bilde</div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {images.map(img => (
                    <button
                      key={img.id}
                      onClick={() => handleSelectImage(img)}
                      className={`relative rounded-md overflow-hidden border ${draft?.image_id === img.id ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      <img src={img.image_url} alt={img.id} className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">Canvas</div>
            <div
              className="mx-auto bg-gray-100 rounded-lg overflow-hidden relative"
              style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
              onMouseDown={() => setSelectedBoxId(null)}
            >
              {draft?.image_url ? (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${draft.image_url})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                  Velg et bilde for å starte
                </div>
              )}

              {(draft?.text_boxes || []).map(box => (
                <div
                  key={box.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedBoxId(box.id);
                    dragRef.current = {
                      id: box.id,
                      type: 'move',
                      startX: e.clientX,
                      startY: e.clientY,
                      origin: { x: box.x, y: box.y, width: box.width, height: box.height },
                    };
                  }}
                  className={`absolute cursor-move border ${selectedBoxId === box.id ? 'border-blue-500' : 'border-white/70'} bg-white/60`}
                  style={{
                    left: box.x,
                    top: box.y,
                    width: box.width,
                    height: box.height,
                    fontSize: box.fontSize,
                    textAlign: box.alignment as any,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 6px',
                    color: '#1f2937',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  {box.placeholderKey}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedBoxId(box.id);
                      dragRef.current = {
                        id: box.id,
                        type: 'resize',
                        startX: e.clientX,
                        startY: e.clientY,
                        origin: { x: box.x, y: box.y, width: box.width, height: box.height },
                      };
                    }}
                    className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border border-gray-300 rounded-sm cursor-se-resize"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">Egenskaper</h2>
          {!selectedBox && (
            <div className="text-xs text-gray-500">Velg et tekstfelt for å redigere.</div>
          )}
          {selectedBox && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Placeholder</label>
                <select
                  value={selectedBox.placeholderKey}
                  onChange={(e) => updateSelectedBox({ placeholderKey: e.target.value })}
                  className="input text-sm h-9 w-full mt-1"
                >
                  {PLACEHOLDERS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Font size</label>
                  <input
                    type="number"
                    value={selectedBox.fontSize}
                    onChange={(e) => updateSelectedBox({ fontSize: Number(e.target.value) || 12 })}
                    className="input text-sm h-9 w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Alignment</label>
                  <select
                    value={selectedBox.alignment}
                    onChange={(e) => updateSelectedBox({ alignment: e.target.value as TextBox['alignment'] })}
                    className="input text-sm h-9 w-full mt-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Width</label>
                  <input
                    type="number"
                    value={selectedBox.width}
                    onChange={(e) => updateSelectedBox({ width: Math.max(40, Number(e.target.value) || 40) })}
                    className="input text-sm h-9 w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height</label>
                  <input
                    type="number"
                    value={selectedBox.height}
                    onChange={(e) => updateSelectedBox({ height: Math.max(24, Number(e.target.value) || 24) })}
                    className="input text-sm h-9 w-full mt-1"
                  />
                </div>
              </div>

              <button className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50" onClick={() => handleDeleteBox(selectedBox.id)}>
                Remove text box
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
