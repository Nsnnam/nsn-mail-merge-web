export interface ThemeGradient {
  id: string;
  name: string;
  tagline: string;
  gradientClass: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  previewColors: string[];
}

export interface UiFont {
  id: string;
  name: string;
  cssFamily: string;
  badge?: string;
}

export const THEME_GRADIENTS: ThemeGradient[] = [
  {
    id: 'ocean',
    name: 'Xanh Biển Hiện Đại',
    tagline: 'Thanh lịch & Hiện đại',
    gradientClass: 'from-blue-600 via-indigo-600 to-sky-600',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-700',
    accentBorder: 'border-blue-200',
    previewColors: ['#2563eb', '#4f46e5', '#0284c7']
  },
  {
    id: 'sunset',
    name: 'Hoàng Hôn Tím Hồng',
    tagline: 'Ấm áp & Sang trọng',
    gradientClass: 'from-purple-600 via-pink-600 to-rose-500',
    accentBg: 'bg-purple-50',
    accentText: 'text-purple-700',
    accentBorder: 'border-purple-200',
    previewColors: ['#9333ea', '#db2777', '#f43f5e']
  },
  {
    id: 'emerald',
    name: 'Ngọc Bích Công Nghệ',
    tagline: 'Tươi mới & Chuyên nghiệp',
    gradientClass: 'from-emerald-600 via-teal-600 to-cyan-600',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-200',
    previewColors: ['#059669', '#0d9488', '#0891b2']
  },
  {
    id: 'midnight',
    name: 'Đêm Huyền Bí',
    tagline: 'Huyền bí & Đẳng cấp',
    gradientClass: 'from-slate-900 via-indigo-950 to-slate-800',
    accentBg: 'bg-slate-100',
    accentText: 'text-slate-800',
    accentBorder: 'border-slate-300',
    previewColors: ['#0f172a', '#1e1b4b', '#1e293b']
  },
  {
    id: 'amber',
    name: 'Hổ Phách Năng Lượng',
    tagline: 'Rực rỡ & Đầy cảm hứng',
    gradientClass: 'from-amber-600 via-orange-600 to-red-500',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-200',
    previewColors: ['#d97706', '#ea580c', '#ef4444']
  },
  {
    id: 'aurora',
    name: 'Cực Quang Xanh',
    tagline: 'Sáng tạo & Phá cách',
    gradientClass: 'from-cyan-600 via-blue-700 to-indigo-800',
    accentBg: 'bg-cyan-50',
    accentText: 'text-cyan-800',
    accentBorder: 'border-cyan-200',
    previewColors: ['#0891b2', '#1d4ed8', '#3730a3']
  }
];

export const UI_FONTS: UiFont[] = [
  {
    id: 'be-vietnam',
    name: 'Be Vietnam Pro',
    cssFamily: '"Be Vietnam Pro", sans-serif',
    badge: 'Khuyên dùng'
  },
  {
    id: 'inter',
    name: 'Inter',
    cssFamily: 'Inter, sans-serif',
    badge: 'Hiện đại'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    cssFamily: 'Roboto, sans-serif'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    cssFamily: 'Montserrat, sans-serif'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    cssFamily: 'Nunito, sans-serif'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    cssFamily: '"Open Sans", sans-serif'
  }
];

const THEME_STORAGE_KEY = 'namns-mergeword-theme';
const FONT_STORAGE_KEY = 'namns-mergeword-font';

export function getSavedTheme(): string {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'ocean';
  } catch {
    return 'ocean';
  }
}

export function saveTheme(themeId: string) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {}
}

export function getSavedUiFont(): string {
  try {
    return localStorage.getItem(FONT_STORAGE_KEY) || 'be-vietnam';
  } catch {
    return 'be-vietnam';
  }
}

export function saveUiFont(fontId: string) {
  try {
    localStorage.setItem(FONT_STORAGE_KEY, fontId);
  } catch {}
}
