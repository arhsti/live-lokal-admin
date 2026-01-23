# Live Lokal - Implementasjonsguide

Denne guiden forklarer hvordan du integrerer Live Lokal admin-dashboardet i ditt eksisterende prosjekt.

## 📁 Prosjektstruktur

```
/
├── styles/
│   └── globals.css          # Global styling, CSS-variabler og Tailwind
├── components/
│   ├── Header.tsx           # Global header med navigasjon og meny
│   ├── Login.tsx            # Innloggingsskjerm
│   ├── Dashboard.tsx        # Hovedoversikt med navigasjonskort
│   ├── ImageLibrary.tsx     # Bildebibliotek for spillere
│   ├── Events.tsx           # Kamphendelsesoversikt
│   ├── StoryPreviewModal.tsx # Modal for forhåndsvisning av stories
│   └── Settings.tsx         # Innstillinger
└── App.tsx                  # Hovedapp med routing og state management
```

---

## 🔧 Avhengigheter

Prosjektet bruker følgende pakker:

```json
{
  "dependencies": {
    "react": "^18.x",
    "lucide-react": "latest",
    "tailwindcss": "^4.0"
  }
}
```

### Fonter
Prosjektet bruker Google Fonts:
- **Outfit** (SemiBold) for overskrifter
- **Inter** (Regular, Medium) for brødtekst

Disse importeres automatisk i `globals.css`.

---

## 🚀 Integrasjon i eksisterende prosjekt

### Steg 1: Kopier filer

**Metode A: Standalone integration**
1. Kopier hele `/components` mappen til ditt prosjekt
2. Kopier `/styles/globals.css` til ditt prosjekt
3. Kopier `/App.tsx` eller integrer logikken i din eksisterende router

**Metode B: Modularisering**
1. Opprett en ny mappe: `/features/admin/` eller `/modules/livelokal/`
2. Flytt alle komponenter dit
3. Eksporter en hovedkomponent: `export { LiveLokalAdmin } from './App'`

### Steg 2: Tilpass routing

#### Med React Router
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ImageLibrary } from './components/ImageLibrary';
import { Events } from './components/Events';
import { Settings } from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/images" element={<ImageLibrary />} />
        <Route path="/admin/events" element={<Events />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### Med Next.js (App Router)
```
/app
├── admin/
│   ├── page.tsx              → Dashboard
│   ├── images/
│   │   └── page.tsx          → ImageLibrary
│   ├── events/
│   │   └── page.tsx          → Events
│   └── settings/
│       └── page.tsx          → Settings
```

### Steg 3: Tilpass Tailwind CSS

Hvis du bruker Tailwind v4, er `globals.css` klar til bruk.

Hvis du bruker Tailwind v3, oppdater `tailwind.config.js`:

```js
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#F8FAFC',
        'border-light': '#E2E8F0',
        'text-muted': '#64748B',
        'text-label': '#94A3B8',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

---

## 🔌 API-integrasjon

For øyeblikket bruker prosjektet **mock data** i `App.tsx`. Her er hvordan du kobler til ekte data:

### 1. Autentisering (Login)

Erstatt mock-logikk i `Login.tsx`:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      onLogin(data.clubId, data.token);
    } else {
      alert('Innlogging feilet');
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Hente bilder

Erstatt mock `images` i `App.tsx`:

```tsx
useEffect(() => {
  const fetchImages = async () => {
    const response = await fetch('/api/images');
    const data = await response.json();
    setImages(data);
  };
  
  fetchImages();
}, []);
```

**API-endepunkt forventet format:**
```json
{
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "description": "Beskrivelse",
      "jerseyNumber": "10",
      "eventType": "goal"
    }
  ]
}
```

### 3. Hente kampdata

Erstatt mock `matches` i `App.tsx`:

```tsx
useEffect(() => {
  const fetchMatches = async () => {
    const response = await fetch('/api/matches');
    const data = await response.json();
    setMatches(data);
  };
  
  fetchMatches();
  
  // Sett opp polling for live-data
  const interval = setInterval(fetchMatches, 10000); // Hver 10. sekund
  return () => clearInterval(interval);
}, []);
```

**API-endepunkt forventet format:**
```json
{
  "matches": [
    {
      "id": "match-uuid",
      "name": "Eliteserien - Runde 15",
      "homeTeam": "Fotballklubben Viking",
      "awayTeam": "Strømsgodset IF",
      "homeScore": 2,
      "awayScore": 1,
      "status": "live",
      "events": [
        {
          "id": "event-uuid",
          "eventType": "goal",
          "time": "23",
          "jerseyNumber": "10",
          "status": "draft",
          "playerName": "Ole Hansen",
          "imageUrl": "https://..."
        }
      ]
    }
  ]
}
```

### 4. Publisere story

Oppdater `handlePostStory` i `App.tsx`:

```tsx
const handlePostStory = async (eventId: string) => {
  try {
    const response = await fetch('/api/stories/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    
    if (response.ok) {
      // Oppdater status lokalt
      setMatches((prev) =>
        prev.map((match) => ({
          ...match,
          events: match.events.map((evt) =>
            evt.id === eventId ? { ...evt, status: 'published' } : evt
          ),
        }))
      );
      alert('Story publisert!');
    }
  } catch (error) {
    console.error('Publisering feilet:', error);
  }
};
```

---

## 🎨 Design-system

### Farger
```css
--bg-off-white: #F8FAFC;
--card-white: #FFFFFF;
--border-light: #E2E8F0;
--text-primary: #0F172A;
--text-muted: #64748B;
--text-label: #94A3B8;
--primary: #0EA5E9;
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
```

### Spacing tokens
- 8px, 12px, 16px, 20px, 24px, 32px

### Komponenter
Alle kort har:
- `border-radius: 12px`
- `border: 1px solid #E2E8F0`
- `background: #FFFFFF`
- Soft shadow ved hover

---

## 📦 State Management

Hvis prosjektet ditt bruker Redux, Zustand, eller Context API, kan du refaktorere state:

### Eksempel med Context API

```tsx
// context/LiveLokalContext.tsx
import { createContext, useContext, useState } from 'react';

const LiveLokalContext = createContext(null);

export function LiveLokalProvider({ children }) {
  const [clubId, setClubId] = useState('');
  const [images, setImages] = useState([]);
  const [matches, setMatches] = useState([]);
  
  return (
    <LiveLokalContext.Provider value={{ 
      clubId, 
      setClubId, 
      images, 
      setImages,
      matches,
      setMatches 
    }}>
      {children}
    </LiveLokalContext.Provider>
  );
}

export const useLiveLokal = () => useContext(LiveLokalContext);
```

Bruk i komponenter:
```tsx
import { useLiveLokal } from '../context/LiveLokalContext';

function ImageLibrary() {
  const { images, setImages } = useLiveLokal();
  // ...
}
```

---

## 🔐 Sikkerhet og autentisering

### Token-basert autentisering

Lagre JWT-token etter innlogging:

```tsx
// utils/auth.ts
export const setAuthToken = (token: string) => {
  localStorage.setItem('livelokal_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('livelokal_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('livelokal_token');
};
```

Legg til token i alle API-kall:

```tsx
const response = await fetch('/api/images', {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
  },
});
```

### Protected routes

```tsx
function ProtectedRoute({ children }) {
  const token = getAuthToken();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Bruk:
<Route path="/admin" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🌐 Sanntidsdata (WebSocket)

For live kampdata, implementer WebSocket:

```tsx
useEffect(() => {
  const ws = new WebSocket('wss://api.livelokal.no/matches');
  
  ws.onmessage = (event) => {
    const updatedMatch = JSON.parse(event.data);
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };
  
  return () => ws.close();
}, []);
```

---

## 📱 Responsivitet

Alle komponenter er bygget med mobile-first design:
- Dashboard: 2 kolonner på desktop, 1 på mobil
- ImageLibrary: 4 kolonner på desktop, 1 på mobil
- Events: Horisontal scroll på mobil for tabellen

Test på forskjellige skjermstørrelser med:
```bash
npm run dev
# Åpne i Chrome DevTools → Responsive mode
```

---

## 🧪 Testing

### Enhetstesting (Jest + React Testing Library)

```tsx
// __tests__/Login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../components/Login';

test('should call onLogin with correct credentials', () => {
  const mockOnLogin = jest.fn();
  render(<Login onLogin={mockOnLogin} />);
  
  fireEvent.change(screen.getByLabelText(/klubb-id/i), {
    target: { value: '12345' }
  });
  fireEvent.change(screen.getByLabelText(/passord/i), {
    target: { value: 'password' }
  });
  fireEvent.click(screen.getByText(/logg inn/i));
  
  expect(mockOnLogin).toHaveBeenCalledWith('12345', 'password');
});
```

---

## 🚢 Deployment

### Vercel / Netlify
```bash
npm run build
# Push til GitHub
# Koble repository til Vercel/Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Support og videre utvikling

### Neste steg
- [ ] Koble til ekte API-endepunkter
- [ ] Implementer WebSocket for sanntidsdata
- [ ] Legg til bildeopplasting med Cloudinary/AWS S3
- [ ] Implementer brukerhåndtering (flere klubber)
- [ ] Legg til analytics dashboard

### Kontakt
For spørsmål eller tilpasninger, kontakt utviklingsteamet.

---

**Laget med ❤️ for norsk fotball**
