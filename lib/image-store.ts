// TODO: Replace with database implementation when scaling
import { promises as fs } from 'fs';
import path from 'path';

// TODO: Replace this JSON-backed metadata store with a real database.
// This store only holds metadata (tags, created_at) and does NOT contain
// binary image data. Cloudflare R2 remains the source of truth for files.

export interface ImageTags {
  player: string;
  number: string;
  eventType: 'Mål' | 'Kort' | 'Bytte' | 'Alle';
}

export interface ImageMeta {
  id: string;
  tags: ImageTags;
  created_at?: string;
}

const STORAGE_FILE = path.join(process.cwd(), 'data', 'images.json');

class ImageStore {
  private metas: ImageMeta[] = [];
  private loaded = false;

  private async ensureDataDir() {
    const dataDir = path.dirname(STORAGE_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  private async load() {
    if (this.loaded) return;

    try {
      await this.ensureDataDir();
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      this.metas = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is corrupted, start with empty array
      this.metas = [];
    }

    this.loaded = true;
  }

  private async save() {
    await this.ensureDataDir();
    await fs.writeFile(STORAGE_FILE, JSON.stringify(this.metas, null, 2));
  }

  async getById(id: string): Promise<ImageMeta | null> {
    await this.load();
    return this.metas.find(m => m.id === id) || null;
  }

  async upsertTags(id: string, tags: ImageTags): Promise<ImageMeta> {
    await this.load();
    // Validate required eventType
    const allowed = ['Mål', 'Kort', 'Bytte', 'Alle'];
    if (!tags || typeof tags.eventType !== 'string' || !allowed.includes(tags.eventType)) {
      throw new Error('Invalid eventType');
    }

    const existing = this.metas.find(m => m.id === id);
    if (existing) {
      existing.tags = tags;
      await this.save();
      return existing;
    }

    const meta: ImageMeta = { id, tags, created_at: new Date().toISOString() };
    this.metas.push(meta);
    await this.save();
    return meta;
  }

  async getAll(): Promise<ImageMeta[]> {
    await this.load();
    return [...this.metas].sort((a, b) => {
      const at = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bt - at;
    });
  }
}

export const imageStore = new ImageStore();