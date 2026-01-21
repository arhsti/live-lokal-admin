# Design System: Live Lokal Admin

## 1. Global Layout & Spacing
- **Container Max-Width:** 1024px (`max-w-5xl`) sentrert med `mx-auto`.
- **Page Padding:** 
  - Mobil: `px-4 py-8`.
  - Desktop: `px-4 py-12`.
- **Spacing mellom elementer:**
  - Overskrift til innhold: `space-y-8` (32px).
  - Mellom kort i grid: `gap-6` (24px).
  - Inni kort: `p-6` eller `p-8` for dashboard-kort, `p-5` for bildekort.

## 2. Farger (HSL)
- **Bakgrunn:** `210 20% 98%` (Off-white).
- **Kort:** `0 0% 100%` (Hvit).
- **Primær:** `220 25% 15%` (Deep Navy).
- **Sekundær:** `210 20% 94%` (Soft Grey).
- **Border:** `220 13% 91%`.
- **Muted Text:** `220 10% 55%`.

## 3. Interaksjon & States (Hover/Active)
- **Kort-Hover:**
  - Dashboard: `hover:shadow-lg`, `transition-all duration-300`, `hover:border-primary/20`.
  - Bildekort: `hover:shadow-md`, `transition-shadow`.
- **Knapp-Hover:** `hover:opacity-90`.
- **Taktil respons:** `active:scale-[0.98]` (legges på alle klikkbare elementer).
- **Bilde-Hover:** `group-hover:scale-105` med `duration-500` og et `bg-black/10` overlay.

## 4. Typografi
- **Headings:** `font-heading` (Outfit), `tracking-tight`, `font-bold`.
- **Body:** `font-sans` (Inter), `antialiased`.
- **Monospace:** For tall/score/draktnr, bruk `font-mono`.
