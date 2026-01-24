// src/design-system.ts
// Centralized design tokens for Live Lokal Admin (from Figma specs)

export const spacing = {
  containerMaxWidth: '1024px', // max-w-5xl
  pagePaddingMobile: '1rem 0.5rem 2rem 0.5rem', // px-4 py-8
  pagePaddingDesktop: '3rem 1rem 3rem 1rem', // px-4 py-12
  sectionSpacing: '2rem', // space-y-8 (32px)
  gridGap: '1.5rem', // gap-6 (24px)
  cardPadding: '1.5rem', // p-6 (24px)
  dashboardCardPadding: '2rem', // p-8 (32px)
  imageCardPadding: '1.25rem', // p-5 (20px)
};

export const colors = {
  background: 'hsl(210, 20%, 98%)',
  card: 'hsl(0, 0%, 100%)',
  primary: 'hsl(220, 25%, 15%)',
  secondary: 'hsl(210, 20%, 94%)',
  border: 'hsl(220, 13%, 91%)',
  mutedText: 'hsl(220, 10%, 55%)',
};

export const radii = {
  input: '0.5rem', // rounded-md
  scoreBox: '0.5rem', // rounded-lg
  modalClose: '9999px', // rounded-full
};

export const font = {
  heading: 'Outfit, sans-serif',
  body: 'Inter, sans-serif',
  mono: 'Menlo, monospace',
  label: {
    size: '11px',
    weight: 600,
    transform: 'uppercase',
    tracking: '0.08em',
  },
  input: {
    size: '14px',
  },
};

export const sizes = {
  inputHeight: '36px', // h-9
  storyPreviewMaxWidth: '400px',
};

export const aspect = {
  imageCard: '4 / 3',
  storyPreview: '9 / 16',
};

export const shadow = {
  card: '0 1px 4px 0 rgba(16,30,54,0.06)',
  cardHover: '0 4px 24px 0 rgba(16,30,54,0.12)',
  imageCardHover: '0 2px 8px 0 rgba(16,30,54,0.10)',
  dashboardCardHover: '0 8px 32px 0 rgba(16,30,54,0.16)',
};

export const transition = {
  card: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  image: 'box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)',
};

export const zIndex = {
  modal: 1000,
  overlay: 900,
};
