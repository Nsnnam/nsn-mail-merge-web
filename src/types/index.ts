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

export interface DocumentMargin {
  top: number; // đơn vị mm
  bottom: number; // đơn vị mm
  left: number; // đơn vị mm
  right: number; // đơn vị mm
}

export type PageMarginType = 'original' | 'nd30' | 'normal' | 'narrow' | 'moderate' | 'custom';

export interface DocumentSettings {
  fontId: string;
  fontSize: string; // '12pt', '13pt', '14pt', etc.
  lineHeight: string; // '1.3', '1.4', '1.5', etc.
  textAlign: 'left' | 'center' | 'right' | 'justify';
  preserveOriginalFormat: boolean;
  pageMargin: PageMarginType;
  customMargins: DocumentMargin;
  originalMargins?: DocumentMargin;
}

export interface TemplateFile {
  name: string;
  size: number;
  arrayBuffer?: ArrayBuffer;
  htmlContent: string;
  detectedTags: string[];
}

export interface UploadedWordItem {
  id: string;
  name: string;
  size: number;
  buffer: ArrayBuffer;
  html: string;
  tags: string[];
  margins?: DocumentMargin;
  defaultFontSize?: string;
}

export interface UploadedExcelItem {
  id: string;
  name: string;
  size: number;
  workbook: any;
  sheetNames: string[];
  activeSheet: string;
  data: ExcelSheetData;
}

