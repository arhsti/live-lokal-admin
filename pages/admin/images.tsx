import { useEffect, useState } from 'react';

// --- Strict design tokens for pixel-perfect match ---
const GRID_GAP = 24;
const CARD_WIDTH = 292;
const CARD_HEIGHT = 420;
const IMAGE_HEIGHT = 164;
const IMAGE_RADIUS = 16;
const CARD_RADIUS = 16;
const CARD_SHADOW = '0 2px 12px 0 rgba(16,30,54,0.08)';
const CARD_BORDER = '1px solid #E5E7EB';
const CONTAINER_MAX_WIDTH = 1280;
const PAGE_PADDING = 32;
const HEADER_FONT = '700 2rem Inter, sans-serif';
const SUB_FONT = '400 1rem Inter, sans-serif';
const LABEL_FONT = '600 0.75rem Inter, sans-serif';
const INPUT_FONT = '400 1rem Inter, sans-serif';
const BUTTON_RADIUS = 10;
const BUTTON_HEIGHT = 40;
const BUTTON_FONT = '600 1rem Inter, sans-serif';
const PRIMARY = '#0EA5E9';
const GREEN = '#10B981';
const BG = '#F8FAFC';
const CARD_BG = '#FFF';
const BORDER = '#E5E7EB';
const MUTED = '#64748B';

interface ImageData {
  id: string;
  url: string;
  description: string;
  jerseyNumber: string;
  eventType: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        setImages(Array.isArray(data) ? data.map((img: any) => ({
          id: img.id,
          url: img.imageUrl || img.url || '',
          description: img.tags?.description || '',
          jerseyNumber: img.tags?.number || '',
          eventType: img.tags?.eventType || '',
        })) : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: MUTED }}>Laster bilder ...</span>
      </div>
    );
  }

  return (
    <div
      data-testid="images-page"
      style={{
        maxWidth: CONTAINER_MAX_WIDTH,
        margin: '0 auto',
        padding: `${PAGE_PADDING}px`,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ font: HEADER_FONT, color: '#222', marginBottom: 4 }}>Bildebibliotek</h1>
        <div style={{ font: SUB_FONT, color: MUTED, marginBottom: 32 }}>Bilder som brukes ved automatiske kamp-hendelser</div>
        <div style={{ display: 'flex', width: '100%', gap: 16, marginBottom: 32 }}>
          <button style={{
            background: PRIMARY,
            color: '#fff',
            border: 'none',
            borderRadius: BUTTON_RADIUS,
            font: BUTTON_FONT,
            height: BUTTON_HEIGHT,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 20, marginRight: 8 }}>⬆️</span> Last opp bilde
          </button>
          <input
            type="text"
            placeholder="Søk etter draktnummer..."
            style={{
              flex: 1,
              border: `1px solid ${BORDER}`,
              borderRadius: BUTTON_RADIUS,
              font: INPUT_FONT,
              height: BUTTON_HEIGHT,
              padding: '0 20px',
              minWidth: 220,
              outline: 'none',
            }}
          />
          <select style={{
            border: `1px solid ${BORDER}`,
            borderRadius: BUTTON_RADIUS,
            font: INPUT_FONT,
            height: BUTTON_HEIGHT,
            padding: '0 36px 0 16px',
            outline: 'none',
            minWidth: 140,
          }}>
            <option>Nyeste først</option>
            <option>Eldste først</option>
          </select>
        </div>
      </div>
      <div
        data-testid="image-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(4, ${CARD_WIDTH}px)`,
          gap: GRID_GAP,
          justifyContent: 'center',
        }}
      >
        {images.map(image => (
          <div
            key={image.id}
            data-testid="image-card"
            style={{
              width: CARD_WIDTH,
              minWidth: CARD_WIDTH,
              maxWidth: CARD_WIDTH,
              height: CARD_HEIGHT,
              background: CARD_BG,
              border: CARD_BORDER,
              borderRadius: CARD_RADIUS,
              boxShadow: CARD_SHADOW,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              padding: 0,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              data-testid="image-card-image"
              style={{
                width: '100%',
                height: IMAGE_HEIGHT,
                background: '#F1F5F9',
                borderTopLeftRadius: IMAGE_RADIUS,
                borderTopRightRadius: IMAGE_RADIUS,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <img
                src={image.url}
                alt={image.description || 'Story image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderTopLeftRadius: IMAGE_RADIUS,
                  borderTopRightRadius: IMAGE_RADIUS,
                  display: 'block',
                }}
              />
              <span style={{
                position: 'absolute',
                right: 12,
                top: 12,
                background: 'rgba(255,255,255,0.85)',
                borderRadius: 999,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                boxShadow: '0 1px 4px 0 rgba(16,30,54,0.10)',
                cursor: 'pointer',
              }}>🔍</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 20px 16px 20px' }}>
              <label style={{ font: LABEL_FONT, color: MUTED, marginBottom: 4 }}>BESKRIVELSE</label>
              <input
                type="text"
                value={image.description}
                readOnly
                style={{
                  width: '100%',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  font: INPUT_FONT,
                  padding: '7px 12px',
                  marginBottom: 12,
                  background: BG,
                }}
              />
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ font: LABEL_FONT, color: MUTED, marginBottom: 4 }}>DRAKTNUMMER</label>
                  <input
                    type="text"
                    value={image.jerseyNumber}
                    readOnly
                    style={{
                      width: '100%',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      font: INPUT_FONT,
                      padding: '7px 12px',
                      background: BG,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ font: LABEL_FONT, color: MUTED, marginBottom: 4 }}>HENDELSE</label>
                  <input
                    type="text"
                    value={image.eventType}
                    readOnly
                    style={{
                      width: '100%',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      font: INPUT_FONT,
                      padding: '7px 12px',
                      background: BG,
                    }}
                  />
                </div>
              </div>
              <div data-testid="image-card-actions" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button style={{
                  flex: 1,
                  background: '#fff',
                  color: PRIMARY,
                  border: `1.5px solid ${PRIMARY}`,
                  borderRadius: BUTTON_RADIUS,
                  font: BUTTON_FONT,
                  height: BUTTON_HEIGHT,
                  cursor: 'pointer',
                  marginRight: 0,
                }}>Lagre</button>
                <button style={{
                  flex: 1,
                  background: PRIMARY,
                  color: '#fff',
                  border: 'none',
                  borderRadius: BUTTON_RADIUS,
                  font: BUTTON_FONT,
                  height: BUTTON_HEIGHT,
                  cursor: 'pointer',
                }}>Bruk i story</button>
              </div>
              <button style={{
                width: '100%',
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: BUTTON_RADIUS,
                font: BUTTON_FONT,
                height: BUTTON_HEIGHT,
                cursor: 'pointer',
                marginTop: 4,
              }}>Post story</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
