import { saveAs } from 'file-saver';
import { DocumentMargin, PageMarginType } from '../types';

export interface SavedTemplateSettings {
  fontId?: string;
  fontSize?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  preserveOriginalFormat?: boolean;
  pageMargin?: PageMarginType;
  customMargins?: DocumentMargin;
  originalMargins?: DocumentMargin;
}

export interface SavedTemplateItem {
  id: string;
  name: string;
  html: string;
  tags: string[];
  updatedAt: string;
  description?: string;
  previewSnippet?: string;
  settings?: SavedTemplateSettings;
}

const STORAGE_KEY = 'namns_merge_saved_templates_v1';

/**
 * Lấy danh sách mẫu đã lưu từ localStorage
 */
export function getSavedTemplates(): SavedTemplateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Lỗi đọc kho mẫu từ localStorage:', err);
    return [];
  }
}

/**
 * Lưu danh sách mẫu vào localStorage
 */
export function persistTemplates(templates: SavedTemplateItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Lỗi ghi kho mẫu vào localStorage:', err);
  }
}

/**
 * Lưu mẫu mới hoặc cập nhật mẫu đã có (kèm cấu hình lề và font)
 */
export function saveTemplate(
  name: string,
  html: string,
  tags: string[],
  description?: string,
  settings?: SavedTemplateSettings
): SavedTemplateItem {
  const templates = getSavedTemplates();
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // Tạo tóm tắt text ngắn
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const previewSnippet = textContent.length > 120 ? textContent.substring(0, 120) + '...' : textContent;

  const newItem: SavedTemplateItem = {
    id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || `Mẫu văn bản ${dateStr}`,
    html,
    tags,
    updatedAt: dateStr,
    description: description || undefined,
    previewSnippet,
    settings: settings || undefined
  };

  const updated = [newItem, ...templates];
  persistTemplates(updated);
  return newItem;
}

/**
 * Xóa một mẫu theo ID
 */
export function deleteSavedTemplate(id: string): SavedTemplateItem[] {
  const templates = getSavedTemplates();
  const remaining = templates.filter(t => t.id !== id);
  persistTemplates(remaining);
  return remaining;
}

/**
 * Tải file JSON sao lưu toàn bộ kho mẫu về máy tính
 */
export function exportTemplatesBackup(templates: SavedTemplateItem[], fileNamePrefix: string = 'namns-mergeword-templates-backup'): void {
  const exportData = {
    app: 'Namns Merge Word',
    version: '1.0.8',
    exportDate: new Date().toISOString(),
    templatesCount: templates.length,
    templates
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const dateTag = new Date().toISOString().slice(0, 10);
  saveAs(blob, `${fileNamePrefix}-${dateTag}.json`);
}

/**
 * Tải file JSON sao lưu một mẫu đơn lẻ về máy tính
 */
export function exportSingleTemplateBackup(template: SavedTemplateItem): void {
  const exportData = {
    app: 'Namns Merge Word',
    version: '1.0.8',
    exportDate: new Date().toISOString(),
    templatesCount: 1,
    templates: [template]
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const safeName = template.name.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_');
  saveAs(blob, `Mau_${safeName}.json`);
}

/**
 * Phân tích và kiểm tra tính hợp lệ của file JSON sao lưu
 */
export function parseTemplatesBackupJson(jsonString: string): SavedTemplateItem[] {
  try {
    const parsed = JSON.parse(jsonString);
    let items: any[] = [];

    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.templates)) {
      items = parsed.templates;
    } else if (parsed && parsed.html && parsed.name) {
      // Single template object
      items = [parsed];
    } else {
      throw new Error('Định dạng file JSON sao lưu không hợp lệ.');
    }

    const validated: SavedTemplateItem[] = [];
    for (const item of items) {
      if (item && typeof item.html === 'string' && (item.name || item.id)) {
        validated.push({
          id: item.id || `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: String(item.name || 'Mẫu nhập khẩu'),
          html: String(item.html),
          tags: Array.isArray(item.tags) ? item.tags : [],
          updatedAt: item.updatedAt || new Date().toLocaleDateString('vi-VN'),
          description: item.description,
          previewSnippet: item.previewSnippet,
          settings: item.settings ? {
            fontId: item.settings.fontId,
            fontSize: item.settings.fontSize,
            lineHeight: item.settings.lineHeight,
            textAlign: item.settings.textAlign,
            preserveOriginalFormat: item.settings.preserveOriginalFormat,
            pageMargin: item.settings.pageMargin,
            customMargins: item.settings.customMargins,
            originalMargins: item.settings.originalMargins
          } : undefined
        });
      }
    }

    if (validated.length === 0) {
      throw new Error('Không tìm thấy mẫu hợp lệ nào trong file JSON.');
    }

    return validated;
  } catch (err: any) {
    throw new Error(err.message || 'Lỗi khi giải mã file JSON sao lưu.');
  }
}

/**
 * Nhập khẩu mẫu từ danh sách sao lưu (gộp vào danh sách hiện tại)
 */
export function importTemplatesBackup(newItems: SavedTemplateItem[]): SavedTemplateItem[] {
  const existing = getSavedTemplates();
  const existingIds = new Set(existing.map(t => t.id));

  const itemsToAdd: SavedTemplateItem[] = [];
  for (const item of newItems) {
    if (existingIds.has(item.id)) {
      // Sinh ID mới để tránh trùng
      itemsToAdd.push({
        ...item,
        id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      });
    } else {
      itemsToAdd.push(item);
    }
  }

  const combined = [...itemsToAdd, ...existing];
  persistTemplates(combined);
  return combined;
}
