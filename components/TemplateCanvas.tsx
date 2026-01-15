import { useEffect, useRef } from 'react';

export interface TemplateTextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  placeholderKey: string;
}

interface TemplateCanvasProps {
  imageUrl: string;
  boxes: TemplateTextBox[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (boxes: TemplateTextBox[]) => void;
}

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

export default function TemplateCanvas({ imageUrl, boxes, selectedId, onSelect, onChange }: TemplateCanvasProps) {
  const dragRef = useRef<null | {
    id: string;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    origin: { x: number; y: number; width: number; height: number };
  }>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, type, startX, startY, origin } = dragRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const next = boxes.map((box) => {
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

      onChange(next);
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
  }, [boxes, onChange]);

  return (
    <div
      className="mx-auto bg-gray-100 rounded-lg overflow-hidden relative"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      onMouseDown={() => onSelect(null)}
    >
      {imageUrl ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
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

      {boxes.map((box) => (
        <div
          key={box.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            onSelect(box.id);
            dragRef.current = {
              id: box.id,
              type: 'move',
              startX: e.clientX,
              startY: e.clientY,
              origin: { x: box.x, y: box.y, width: box.width, height: box.height },
            };
          }}
          className={`absolute cursor-move border ${selectedId === box.id ? 'border-blue-500' : 'border-white/70'} bg-white/70`}
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
              onSelect(box.id);
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
  );
}
