export interface ExcelSheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, string | number>[];
  totalRows: number;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Sans-Serif' | 'Serif' | 'Monospace' | 'Trang trí';
  badge?: string;
  description: string;
}

export interface DocumentSettings {
  fontId: string;
  fontSize: string; // '13pt', '14pt', etc.
  lineHeight: string; // '1.3', '1.5', etc.
  textAlign: 'left' | 'center' | 'right' | 'justify';
  preserveOriginalFormat: boolean;
  pageMargin: 'normal' | 'narrow' | 'wide';
}

export interface TemplateFile {
  name: string;
  size: number;
  arrayBuffer?: ArrayBuffer;
  htmlContent: string;
  detectedTags: string[];
}
