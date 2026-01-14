// TODO: Replace with database implementation when scaling
import { promises as fs } from 'fs';
import path from 'path';

export interface ImageData {
  id: string;
  image_url: string;
  created_at: string;
}

const STORAGE_FILE = path.join(process.cwd(), 'data', 'images.json');

class ImageStore {
  private images: ImageData[] = [];
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
      this.images = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is corrupted, start with empty array
      this.images = [];
    }

    this.loaded = true;
  }

  private async save() {
    await this.ensureDataDir();
    await fs.writeFile(STORAGE_FILE, JSON.stringify(this.images, null, 2));
  }

  async add(image: Omit<ImageData, 'created_at'>): Promise<ImageData> {
    await this.load();

    const imageData: ImageData = {
      ...image,
      created_at: new Date().toISOString(),
    };

    this.images.push(imageData);
    await this.save();

    return imageData;
  }

  async getAll(): Promise<ImageData[]> {
    await this.load();
    // Sort by created_at descending (newest first)
    return [...this.images].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getById(id: string): Promise<ImageData | null> {
    await this.load();
    return this.images.find(img => img.id === id) || null;
  }

  async delete(id: string): Promise<boolean> {
    await this.load();
    const initialLength = this.images.length;
    this.images = this.images.filter(img => img.id !== id);

    if (this.images.length < initialLength) {
      await this.save();
      return true;
    }

    return false;
  }
}

// Singleton instance
export const imageStore = new ImageStore();