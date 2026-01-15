import Tooltip from './Tooltip';

interface ImageCardProps {
  imageUrl: string;
  number: string;
  eventType: string;
  onNumberChange: (value: string) => void;
  onEventChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  error?: string | null;
  success?: boolean;
}

export default function ImageCard({
  imageUrl,
  number,
  eventType,
  onNumberChange,
  onEventChange,
  onSave,
  saving,
  error,
  success,
}: ImageCardProps) {
  return (
    <div className="card overflow-hidden">
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

      <div className="p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-2">
              Draktnummer
              <Tooltip text="Bilde tilknyttet spiller. Dette vil velges når en hendelse om denne spilleren skjer.">
                <span className="text-[11px] text-gray-500">ℹ</span>
              </Tooltip>
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={number}
              onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ''))}
              className="input w-full mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-2">
              Hendelse
              <Tooltip text="Velg hvilken type hendelse som dette bildet skal brukes til">
                <span className="text-[11px] text-gray-500">ℹ</span>
              </Tooltip>
            </label>
            <select
              value={eventType}
              onChange={(e) => onEventChange(e.target.value)}
              className="input w-full mt-1 text-sm"
            >
              <option value="Alle">Alle</option>
              <option value="Mål">Mål</option>
              <option value="Kort">Kort</option>
              <option value="Bytte">Bytte</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onSave}
              disabled={saving}
              className="btn-secondary w-full md:w-auto"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-600">Lagret ✓</div>}
      </div>
    </div>
  );
}
