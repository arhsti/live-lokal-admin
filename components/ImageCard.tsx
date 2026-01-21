import { ReactNode } from 'react';
import { Save } from 'lucide-react';
import Tooltip from './Tooltip';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Card, CardContent } from './ui/Card';

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
    <Card className="group overflow-hidden transition-shadow hover:shadow-soft">
      <div className="bg-gray-100 rounded-t-xl overflow-hidden">
        {imageUrl ? (
          <div className="relative aspect-[4/3]">
            <img
              src={imageUrl}
              alt="Image"
              className="h-full w-full object-cover block transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 aspect-[4/3]">
            Ingen bilde
          </div>
        )}
      </div>

      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label>Beskrivelse</Label>
            <Textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="flex items-center gap-3">
                Draktnummer
                <Tooltip text="Bilde tilknyttet spiller. Dette vil velges når en hendelse om denne spilleren skjer.">
                  <span className="text-[13px] text-gray-700 font-semibold">ℹ</span>
                </Tooltip>
              </Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={number}
                onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <Label className="flex items-center gap-3">
                Hendelse
                <Tooltip text="Velg hvilken type hendelse som dette bildet skal brukes til">
                  <span className="text-[13px] text-gray-700 font-semibold">ℹ</span>
                </Tooltip>
              </Label>
              <Select value={eventType} onChange={(e) => onEventChange(e.target.value)}>
                <option value="Mål">Mål</option>
                <option value="Kort">Kort</option>
                <option value="Bytte">Bytte</option>
                <option value="Kampstart">Kampstart</option>
                <option value="Slutt">Slutt</option>
                <option value="Alle">Alle</option>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-nowrap pt-1">
          <Button variant="secondary" onClick={onSave} disabled={saving} className="flex-1">
            <Save className="h-4 w-4" />
            {saving ? 'Lagrer...' : 'Lagre'}
          </Button>
          {extraActions ? (
            <div className="flex flex-1 items-center gap-2">
              {extraActions}
            </div>
          ) : null}
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-600">Lagret ✓</div>}
      </CardContent>
    </Card>
  );
}
