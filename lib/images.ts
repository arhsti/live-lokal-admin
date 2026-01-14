import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Image {
  id: string;
  image_url: string;
  created_at: string;
}

const IMAGES_FILE = path.join(process.cwd(), 'data', 'images.json');

// TODO: Replace with database persistence
export class ImageStore {
  private static async ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  static async getAll(): Promise<Image[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(IMAGES_FILE, 'utf-8');
      const images: Image[] = JSON.parse(data);
      return images.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      // File doesn't exist or is empty
      return [];
    }
  }

  static async add(image: Omit<Image, 'id' | 'created_at'>): Promise<Image> {
    await this.ensureDataDir();
    const images = await this.getAll();
    const newImage: Image = {
      id: uuidv4(),
      image_url: image.image_url,
      created_at: new Date().toISOString(),
    };
    images.push(newImage);
    await fs.writeFile(IMAGES_FILE, JSON.stringify(images, null, 2));
    return newImage;
  }
}