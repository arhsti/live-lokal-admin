import { ReactNode } from 'react';
import { Save, Instagram } from 'lucide-react';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Card, CardContent } from './ui/Card';
import { cn } from './ui/utils';
import { effects, imageCard } from '@/styles/tokens';

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
    <Card className={cn('overflow-hidden border-[hsl(220_13%_91%/0.6)]', effects.imageCardHover)}>
      <div className={cn(imageCard.imageWrap, 'rounded-t-xl')}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Image"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[hsl(220_10%_55%)]">
            Ingen bilde
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={imageCard.label}>Beskrivelse</Label>
            <Textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              className={imageCard.textarea}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={imageCard.label}>Draktnr</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={number}
                onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ''))}
                className={imageCard.input}
                uiSize="sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={imageCard.label}>Hendelse</Label>
              <Select
                value={eventType}
                onChange={(e) => onEventChange(e.target.value)}
                className={imageCard.select}
                uiSize="sm"
              >
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
        <div className="pt-2 flex gap-2">
          <Button
            variant="secondary"
            uiSize="sm"
            onClick={onSave}
            disabled={saving}
            className={cn('flex-1', imageCard.button)}
          >
            <Save className="h-3 w-3" />
            {saving ? 'Lagrer...' : 'Lagre'}
          </Button>
          {extraActions !== undefined ? (
            extraActions ? (
              <div className="flex flex-1 items-center gap-2">
                {extraActions}
              </div>
            ) : null
          ) : (
            <Button
              variant="outline"
              uiSize="sm"
              className={cn('flex-1', imageCard.button, imageCard.buttonOutline)}
            >
              <Instagram className="h-3 w-3" />
              Story
            </Button>
          )}
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-600">Lagret ✓</div>}
      </CardContent>
    </Card>
  );
}
