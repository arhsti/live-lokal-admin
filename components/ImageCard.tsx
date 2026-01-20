import { ReactNode } from 'react';
import Tooltip from './Tooltip';

interface ImageCardProps {
  imageUrl: string;
  description: string;
  number: string;
  eventType: string;
  onDescriptionChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onEventChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  error?: string | null;
  success?: boolean;
  extraActions?: ReactNode;
}

export default function ImageCard({
  imageUrl,
  description,
  number,
  eventType,
  onDescriptionChange,
  onNumberChange,
  onEventChange,
  onSave,
  saving,
  error,
  success,
  extraActions,
}: ImageCardProps) {
  return (
    <div className="card">
      <div className="bg-gray-100" style={{ height: 180 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Ingen bilde
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500">Beskrivelse</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="input w-full mt-2 text-sm"
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-3">
                Draktnummer
                <Tooltip text="Bilde tilknyttet spiller. Dette vil velges når en hendelse om denne spilleren skjer.">
                  <span className="text-[13px] text-gray-700 font-semibold">ℹ</span>
                </Tooltip>
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={number}
                onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ''))}
                className="input w-full mt-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-3">
                Hendelse
                <Tooltip text="Velg hvilken type hendelse som dette bildet skal brukes til">
                  <span className="text-[13px] text-gray-700 font-semibold">ℹ</span>
                </Tooltip>
              </label>
              <select
                value={eventType}
                onChange={(e) => onEventChange(e.target.value)}
                className="input w-full mt-2 text-sm"
              >
                <option value="Mål">Mål</option>
                <option value="Kort">Kort</option>
                <option value="Bytte">Bytte</option>
                <option value="Alle">Alle</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-nowrap">
          <button
            onClick={onSave}
            disabled={saving}
            className="btn-secondary whitespace-nowrap"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {extraActions}
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-600">Lagret ✓</div>}
      </div>
    </div>
  );
}
