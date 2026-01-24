import { useEffect, useState } from 'react';
import { spacing, colors, font } from '@/src/design-system';

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
        <span style={{ color: colors.mutedText }}>Laster bilder ...</span>
      </div>
    );
  }

  return (
    <div
      data-testid="images-page"
      style={{
        maxWidth: spacing.containerMaxWidth,
        margin: '0 auto',
        padding: spacing.pagePaddingDesktop,
        background: colors.background,
        minHeight: '100vh',
      }}
    >
      <h1 style={{
        fontFamily: font.heading,
        fontWeight: 700,
        fontSize: '2rem',
        marginBottom: '0.5rem',
        color: colors.primary,
        textAlign: 'center',
      }}>
        Bildebibliotek
      </h1>
      <p style={{
        color: colors.mutedText,
        textAlign: 'center',
        marginBottom: spacing.sectionSpacing,
      }}>
        Bilder som brukes ved automatiske kamp-hendelser
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.gridGap, marginBottom: spacing.sectionSpacing }}>
        <button style={{
          background: '#0EA5E9',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '0.75rem 2rem',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}>Last opp bilde</button>
        <input
          type="text"
          placeholder="Søk etter draktnummer..."
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            fontSize: font.input.size,
            padding: '0.75rem 1.5rem',
            minWidth: 220,
            outline: 'none',
          }}
        />
        <select style={{
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          fontSize: font.input.size,
          padding: '0.75rem 2rem 0.75rem 1rem',
          outline: 'none',
        }}>
          <option>Nyeste først</option>
          <option>Eldste først</option>
        </select>
      </div>
      <div
        data-testid="image-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: spacing.gridGap,
          justifyContent: 'center',
        }}
      >
        {images.map(image => (
          <div
            key={image.id}
            data-testid="image-card"
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '1rem',
              boxShadow: '0 1px 4px 0 rgba(16,30,54,0.06)',
              padding: spacing.imageCardPadding,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 180,
                height: 320,
                background: '#F1F5F9',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                overflow: 'hidden',
                aspectRatio: '9/16',
              }}
            >
              <img
                src={image.url}
                alt={image.description || 'Story image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#E2E8F0',
                  borderRadius: '0.5rem',
                  display: 'block',
                }}
              />
            </div>
            <div style={{ width: '100%' }}>
              <label style={{
                fontSize: font.label.size,
                fontWeight: font.label.weight,
                textTransform: font.label.transform as any,
                letterSpacing: font.label.tracking,
                color: colors.mutedText,
                marginBottom: 4,
                display: 'block',
              }}>BESKRIVELSE</label>
              <input
                type="text"
                value={image.description}
                readOnly
                style={{
                  width: '100%',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: font.input.size,
                  padding: '0.5rem 1rem',
                  marginBottom: '0.5rem',
                  background: colors.background,
                }}
              />
              <div style={{ display: 'flex', gap: spacing.gridGap, marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: font.label.size,
                    fontWeight: font.label.weight,
                    textTransform: font.label.transform as any,
                    letterSpacing: font.label.tracking,
                    color: colors.mutedText,
                    marginBottom: 4,
                    display: 'block',
                  }}>DRAKTNUMMER</label>
                  <input
                    type="text"
                    value={image.jerseyNumber}
                    readOnly
                    style={{
                      width: '100%',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: font.input.size,
                      padding: '0.5rem 1rem',
                      background: colors.background,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: font.label.size,
                    fontWeight: font.label.weight,
                    textTransform: font.label.transform as any,
                    letterSpacing: font.label.tracking,
                    color: colors.mutedText,
                    marginBottom: 4,
                    display: 'block',
                  }}>HENDELSE</label>
                  <input
                    type="text"
                    value={image.eventType}
                    readOnly
                    style={{
                      width: '100%',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: font.input.size,
                      padding: '0.5rem 1rem',
                      background: colors.background,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: spacing.gridGap }}>
                <button style={{
                  flex: 1,
                  background: '#10B981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '0.5rem 0',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}>Post story</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
