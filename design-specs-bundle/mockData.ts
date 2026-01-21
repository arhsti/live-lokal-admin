export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  time: string; // e.g., "45+2'"
  eventCount: number;
}

export interface GameEvent {
  id: string;
  type: "Goal" | "Card" | "Sub" | "Whistle";
  time: string;
  player: string;
  playerNumber: number;
  description: string;
  status: "Published" | "Draft";
  matchId: string;
  imageUrl?: string;
}

export interface LibraryImage {
  id: string;
  src: string;
  description: string;
  playerNumber?: number;
  matchId?: string;
  tags: string[];
}

export const matches: Match[] = [
  {
    id: "m1",
    homeTeam: "Live Lokal IL",
    awayTeam: "Viking FK",
    score: "2 - 1",
    time: "78'",
    eventCount: 5,
  },
  {
    id: "m2",
    homeTeam: "Brann",
    awayTeam: "Live Lokal IL",
    score: "0 - 0",
    time: "FT",
    eventCount: 12,
  },
];

export const events: GameEvent[] = [
  {
    id: "e1",
    type: "Goal",
    time: "12'",
    player: "Ola Nordmann",
    playerNumber: 10,
    description: "Fantastic header from corner kick!",
    status: "Published",
    matchId: "m1",
  },
  {
    id: "e2",
    type: "Card",
    time: "34'",
    player: "Kari Olsen",
    playerNumber: 4,
    description: "Yellow card for tactical foul.",
    status: "Draft",
    matchId: "m1",
  },
  {
    id: "e3",
    type: "Sub",
    time: "60'",
    player: "Per Hansen",
    playerNumber: 14,
    description: "Substitution: Per Hansen IN, Ola Nordmann OUT",
    status: "Draft",
    matchId: "m1",
  },
];
