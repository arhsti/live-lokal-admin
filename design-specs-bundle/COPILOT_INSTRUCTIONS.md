# Utvidet Teknisk Spesifikasjon: Live Lokal Admin Dashboard

Dette dokumentet gir en detaljert beskrivelse av funksjonalitet, logikk og design for implementering i en produksjonsklar applikasjon.

## 1. Global Art Direction & UI-System
- **Estetikk:** Skandinavisk minimalisme. "Less is more".
- **Bakgrunn:** `#f8fafc` (off-white) for å skape kontrast mot hvite kort.
- **Kort-system:** 
  - Bakgrunn: `#ffffff`.
  - Border: `1px solid #e2e8f0`.
  - Border-radius: `12px` (xl).
  - Skygge: Myk, vid skygge for dybdefølelse uten harde kanter.
- **Typografi:** 
  - Overskrifter: `Outfit`, Bold, tracking-tight.
  - Brødtekst/Input: `Inter`, Regular/Medium.
- **Interaksjon:** Alle knapper skal ha `hover:opacity-90` og `active:scale-[0.98]` for taktil respons.

---

## 2. Autentisering (`/`)
### Funksjonalitet
- **Validering:** FIKS-ID skal være nøyaktig 5 siffer. Passordfelt med "show/hide"-funksjon.
- **State:** Vis en spinner/loading-tekst på knappen ved innsending.
- **Design:** Sentrert login-boks med en subtil gradient-blur bak (`primary/5`).

---

## 3. Hovedoversikt (`/dashboard`)
### Funksjonalitet
- **Navigasjon:** To hovedkort som fungerer som innganger til dypere funksjonalitet.
- **Metrikker:** Dynamiske tellere som viser antall objekter i biblioteket og aktive kamper.
### Design
- Ikon-containere (Lucide `Image`, `Calendar`) med fylt bakgrunn i `secondary` farge.
- Ved hover skal kortet løfte seg (`-translate-y-1`) og borderen bli mørkere.

---

## 4. Bildebibliotek (`/images`) - Detaljert Logikk & Design
### A. Bildekontainer (Kort) Spesifikasjoner
- **Dimensjoner:** 
  - Bredde: Fleksibel via grid (ca 300-350px på desktop).
  - Indre Padding: `20px` (p-5) på innholdsdelen.
- **Bilde-boks:**
  - Ratio: `aspect-[4/3]`.
  - Stil: `rounded-t-xl` (12px), `object-cover`.
  - Hover-effekt: `scale-105` på selve bildet (duration-500), med et subtilt mørkt overlay (`bg-black/10`).
- **Typografi i kortet:**
  - Labler (Beskrivelse, Draktnr, Hendelse): `size: 11px`, `font-weight: 600`, `text-transform: uppercase`, `tracking-wider`, farge: `text-muted-foreground`.
  - Input-tekst: `size: 14px` (text-sm), `Inter`.
- **Inndata-felter (Inputs/Select):**
  - Bakgrunnsfarge: `hsl(210 20% 94% / 0.5)` (svært lys grå).
  - Border: `transparent` som standard, skifter til `primary/20` ved fokus.
  - Høyde: `36px` (h-9) for input/select, `60px` for beskrivelse (textarea).
- **Knapper (Kort-nivå):**
  - Høyde: `36px` (h-9).
  - Lagre-knapp: `secondary` stil (lys grå bakgrunn).
  - Story-knapp: `outline` stil med primærfarge-border (`primary/20`).

### Funksjonalitet
- **Sanntids-søk:** Inputfeltet skal filtrere bilde-grid-en umiddelbart (debounce på 200ms) basert på draktnummer.
- **Sorteringslogikk:**
  - `Nyeste`: Sorterer på ID eller opplastingsdato (synkende).
  - `Draktnummer`: Numerisk sortering (01, 02, 10, etc.).
  - `Hendelse`: Alfabetisk sortering basert på valgt hendelsestype.
- **Bildekort-handling:**
  - `Beskrivelse`: Textarea som auto-expander eller har fast minimumshøyde.
  - `Hendelse Dropdown`: Skal inneholde "Mål", "Kort", "Bytte", "Kampstart", "Slutt".
  - `Story-knapp`: Skal trigge en modal-forhåndsvisning med det valgte bildet.
### Design
- 4-kolonners grid på desktop, 1 på mobil.
- Bilder skal ha `aspect-ratio: 4/3` og `object-cover`.

---

## 5. Hendelsessenter (`/events`) - Avansert Logikk
### A. Match Summary (Topp)
- **Funksjonalitet:** Accordion-logikk. Kun én kamp kan være ekspandert av gangen (optional).
- **Layout:** Kampene skal listes vertikalt (én per rad) for å gi maksimal oversikt og plass til detaljer.
- **Live-status:** Hvis kampen ikke er "FT" (Ferdig), vis en pulserende rød indikator ved siden av klokkeslettet.
- **Score:** Tallene skal vises i en monospaced font for perfekt justering.

### B. Hendelsestabell (Bunn)
- **Funksjonalitet:**
  - **Type-indikator:** Hver hendelsestype har en fargekode: Mål (Grønn), Kort (Gul/Rød), Bytte (Blå).
  - **Status-Badge:** "Publisert" (fylt badge), "Utkast" (outline badge).
  - **Preview (Øye-ikon):** Åpner Story-modalen.
  - **Post-knapp:** Skal endre state fra "Post" til "Posted" (disabled) med en sjekk-ikon etter vellykket "publisering".

### C. Story Preview Modal (Kritisk)
- **Format:** Fast 9:16 format (f.eks. 400x711px).
- **Lag-struktur:**
  1. Bakgrunn: Valgt bilde eller generert sports-texture.
  2. Overlegg: Gradient fra bunn (svart til transparent) for å sikre tekst-lesbarhet.
  3. Tekst-elementer: Klokkeslett (øverst), Hendelsestype (badge), Spillernavn (Display font), Draktnummer.
  4. Branding: "Live Lokal" logo i bunnen.
- **Lukking:** Kryss i hjørnet eller klikk utenfor modalen.

---

## Datastruktur for Copilot
```typescript
interface ImageAsset {
  id: string;
  url: string;
  metadata: {
    jerseyNumber: string;
    description: string;
    linkedEventId?: string;
  };
}

interface MatchEvent {
  id: string;
  matchId: string;
  timestamp: string; // f.eks "88'"
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
  player: { name: string; number: number };
  isPublished: boolean;
}
```
