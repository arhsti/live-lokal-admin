import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import TemplateCanvas, { TemplateTextBox } from '../../components/TemplateCanvas';

interface ImageData {
  id: string;
  image_url: string;
}

interface TemplateItem {
  id: string;
  name: string;
  image_id: string;
  image_url: string;
  text_boxes: TemplateTextBox[];
}

const PLACEHOLDERS = ['{{player_number}}', '{{event_type}}', '{{team_name}}', '{{custom_text}}'];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [draft, setDraft] = useState<TemplateItem | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadImages();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = res.ok ? await res.json() : [];
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadImages = async () => {
    try {
      const res = await fetch('/api/images');
      const data = res.ok ? await res.json() : [];
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedBox = useMemo(() => {
    if (!draft || !selectedBoxId) return null;
    return draft.text_boxes.find((box) => box.id === selectedBoxId) || null;
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

  const handleSelectImage = (image: ImageData) => {
    setDraft((prev) => (prev ? { ...prev, image_id: image.id, image_url: image.image_url } : prev));
    setShowImagePicker(false);
  };

  const handleAddBox = () => {
    if (!draft) return;
    const nextId = `box_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nextBox: TemplateTextBox = {
      id: nextId,
      x: 24,
      y: 24,
      width: 180,
      height: 48,
      fontSize: 22,
      alignment: 'left',
      placeholderKey: PLACEHOLDERS[0],
    };
    setDraft({ ...draft, text_boxes: [...draft.text_boxes, nextBox] });
    setSelectedBoxId(nextId);
  };

  const updateSelectedBox = (changes: Partial<TemplateTextBox>) => {
    if (!draft || !selectedBoxId) return;
    const next = draft.text_boxes.map((box) => (box.id === selectedBoxId ? { ...box, ...changes } : box));
    setDraft({ ...draft, text_boxes: next });
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError('Gi templaten et navn før du lagrer.');
      return;
    }
    if (!draft.image_id) {
      setError('Velg et bilde før du lagrer.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id || undefined,
          name: draft.name,
          image_id: draft.image_id,
          image_url: draft.image_url,
          text_boxes: draft.text_boxes,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }));
        setError(err.error || 'Failed to save');
        return;
      }

      const saved = await res.json().catch(() => null);
      if (saved) {
        setDraft(saved);
      }
      await loadTemplates();
    } catch (e) {
      console.error(e);
      setError('Kunne ikke lagre template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="Templates" />
      <main className="container-base space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Templates</h1>
            <p className="text-sm text-gray-600 mt-1">Create story templates</p>
          </div>
          <button className="btn-primary" onClick={handleCreateTemplate}>Create template</button>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="card p-4">
          <div className="text-sm font-semibold text-gray-600 mb-2">Templates</div>
          {templates.length === 0 ? (
            <div className="text-sm text-gray-500">Ingen templates opprettet enda</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.text_boxes?.length || 0} tekstfelt</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {draft && (
          <div className="card p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Templatename"
                className="input flex-1 min-w-[180px]"
              />
              <button className="btn-secondary" onClick={() => setShowImagePicker((prev) => !prev)}>
                Velg bilde
              </button>
              <button className="btn-secondary" onClick={handleAddBox} disabled={!draft.image_id}>
                Legg til tekstfelt
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save template'}
              </button>
            </div>

            {showImagePicker && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="text-xs text-gray-600 mb-2">Velg bilde</div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => handleSelectImage(img)}
                      className={`relative rounded-md overflow-hidden border ${draft.image_id === img.id ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      <img src={img.image_url} alt={img.id} className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
              <div>
                <TemplateCanvas
                  imageUrl={draft.image_url}
                  boxes={draft.text_boxes}
                  selectedId={selectedBoxId}
                  onSelect={setSelectedBoxId}
                  onChange={(boxes) => setDraft({ ...draft, text_boxes: boxes })}
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-600">Text box</div>
                {!selectedBox && <div className="text-xs text-gray-500">Velg et tekstfelt</div>}
                {selectedBox && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Placeholder</label>
                      <select
                        value={selectedBox.placeholderKey}
                        onChange={(e) => updateSelectedBox({ placeholderKey: e.target.value })}
                        className="input w-full mt-1"
                      >
                        {PLACEHOLDERS.map((p) => (
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
                          className="input w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Alignment</label>
                        <select
                          value={selectedBox.alignment}
                          onChange={(e) => updateSelectedBox({ alignment: e.target.value as TemplateTextBox['alignment'] })}
                          className="input w-full mt-1"
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
                          className="input w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Height</label>
                        <input
                          type="number"
                          value={selectedBox.height}
                          onChange={(e) => updateSelectedBox({ height: Math.max(24, Number(e.target.value) || 24) })}
                          className="input w-full mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
