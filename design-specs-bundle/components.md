# Komponent-spesifikasjoner

## 1. Bildekontainer (Kort)
- **Størrelse:** Fleksibel i grid, `aspect-[4/3]` for bilde-delen.
- **Marginer:** `gap-6` (24px) mellom kortene i griddet.
- **Padding:** Intern padding i innholdsdel: `20px` (p-5).
- **Fonter:**
  - Labler: `size: 11px`, `weight: 600`, `uppercase`, `tracking-wider`.
  - Input: `size: 14px` (text-sm).
- **Input-felter:**
  - Høyde: `36px` (h-9).
  - Radius: `0.5rem` (rounded-md).
  - Fokus: `focus:bg-white`, `focus:border-primary/20`.

## 2. Match-kort (Events side)
- **Layout:** Vertikal liste (`flex flex-col gap-6`).
- **Border:** `2px solid transparent` som standard.
- **Aktiv State:** `border-primary`, `ring-2 ring-primary/5`, `shadow-md`.
- **Score-boks:** `bg-secondary`, `px-4 py-2`, `rounded-lg`, `font-mono`, `text-2xl`.

## 3. Story Preview Modal
- **Format:** `aspect-[9/16]`, `max-w-[400px]`.
- **Layering:** 
  1. Base: Svart bakgrunn.
  2. Image: `object-cover`, `opacity-90`.
  3. Overlay: `bg-gradient-to-t from-black/80 via-transparent to-black/30`.
  4. Content: Padding `p-8`.
- **Lukke-knapp:** `absolute top-4 right-4`, `rounded-full`, `bg-black/50`.
