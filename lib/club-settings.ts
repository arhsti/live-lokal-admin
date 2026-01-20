import { r2Get, r2Put, readBodyAsString } from './r2';

export interface ClubSettings {
  fiksid_livelokal: string;
  clubName?: string;
}

const settingsKey = (club: string) => `${club}/settings/club.json`;

export async function getClubSettings(club: string): Promise<ClubSettings> {
  try {
    const obj = await r2Get(settingsKey(club));
    const raw = await readBodyAsString(obj.Body);
    if (!raw) return { fiksid_livelokal: club };
    const parsed = JSON.parse(raw);
    return {
      fiksid_livelokal: club,
      clubName: typeof parsed?.clubName === 'string' ? parsed.clubName : undefined,
    };
  } catch {
    return { fiksid_livelokal: club };
  }
}

export async function saveClubSettings(club: string, settings: ClubSettings) {
  await r2Put(settingsKey(club), JSON.stringify(settings, null, 2));
  return settings;
}
