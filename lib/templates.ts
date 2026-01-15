import { r2Delete, r2Get, r2List, r2Put, readBodyAsString } from './r2';

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
}

const TEMPLATE_PREFIX = 'templates/';

export async function listTemplates(): Promise<TemplateItem[]> {
  const list = await r2List(TEMPLATE_PREFIX);
  const items = (list.Contents || [])
    .filter(obj => obj.Key)
    .sort((a, b) => {
      const at = a.LastModified ? a.LastModified.getTime() : 0;
      const bt = b.LastModified ? b.LastModified.getTime() : 0;
      return bt - at;
    });

  const templates: TemplateItem[] = [];
  for (const item of items) {
    const key = item.Key as string;
    if (!key.startsWith(TEMPLATE_PREFIX)) continue;
    try {
      const obj = await r2Get(key);
      const raw = await readBodyAsString(obj.Body);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      templates.push({
        ...parsed,
        text_boxes: Array.isArray(parsed?.text_boxes) ? parsed.text_boxes : [],
      });
    } catch (e) {
      console.error('Failed to parse template', key, e);
    }
  }

  return templates;
}

export async function saveTemplate(template: TemplateItem) {
  await r2Put(`${TEMPLATE_PREFIX}${template.id}.json`, JSON.stringify(template, null, 2));
  return template;
}

export async function getTemplate(id: string) {
  try {
    const obj = await r2Get(`${TEMPLATE_PREFIX}${id}.json`);
    const raw = await readBodyAsString(obj.Body);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      text_boxes: Array.isArray(parsed?.text_boxes) ? parsed.text_boxes : [],
    } as TemplateItem;
  } catch {
    return null;
  }
}

export async function deleteTemplate(id: string) {
  await r2Delete(`${TEMPLATE_PREFIX}${id}.json`);
}
