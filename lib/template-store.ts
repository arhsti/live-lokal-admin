import { promises as fs } from 'fs';
import path from 'path';

export interface TemplateTextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  placeholderKey: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  image_id: string;
  image_url: string;
  text_boxes: TemplateTextBox[];
  created_at?: string;
  updated_at?: string;
}

const STORAGE_FILE = path.join(process.cwd(), 'data', 'templates.json');

class TemplateStore {
  private templates: TemplateItem[] = [];
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
      this.templates = JSON.parse(data);
    } catch {
      this.templates = [];
    }

    this.loaded = true;
  }

  private async save() {
    await this.ensureDataDir();
    await fs.writeFile(STORAGE_FILE, JSON.stringify(this.templates, null, 2));
  }

  async getAll(): Promise<TemplateItem[]> {
    await this.load();
    return [...this.templates].sort((a, b) => {
      const at = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bt = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bt - at;
    });
  }

  async getById(id: string): Promise<TemplateItem | null> {
    await this.load();
    return this.templates.find(t => t.id === id) || null;
  }

  async create(template: Omit<TemplateItem, 'id' | 'created_at' | 'updated_at'>): Promise<TemplateItem> {
    await this.load();
    const id = `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const next: TemplateItem = { ...template, id, created_at: now, updated_at: now };
    this.templates.push(next);
    await this.save();
    return next;
  }

  async update(id: string, template: Omit<TemplateItem, 'id' | 'created_at' | 'updated_at'>): Promise<TemplateItem | null> {
    await this.load();
    const existing = this.templates.find(t => t.id === id);
    if (!existing) return null;

    const now = new Date().toISOString();
    existing.name = template.name;
    existing.image_id = template.image_id;
    existing.image_url = template.image_url;
    existing.text_boxes = template.text_boxes;
    existing.updated_at = now;
    await this.save();
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    await this.load();
    const before = this.templates.length;
    this.templates = this.templates.filter(t => t.id !== id);
    if (this.templates.length === before) return false;
    await this.save();
    return true;
  }
}

export const templateStore = new TemplateStore();
