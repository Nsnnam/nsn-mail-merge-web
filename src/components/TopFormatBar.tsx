import React from 'react';
import { Layers, Type } from 'lucide-react';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { DocumentSettings } from '../types';
import { ThemeGradient } from '../lib/theme';

interface TopFormatBarProps {
  sheetNames: string[];
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  totalRecords: number;
  totalColumns: number;
  theme?: ThemeGradient;
}

export const TopFormatBar: React.FC<TopFormatBarProps> = ({
  sheetNames,
  activeSheet,
  onSelectSheet,
  settings,
  onUpdateSettings,
  totalRecords,
  totalColumns,
  theme
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:px-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Chọn Sheet Excel */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${theme ? theme.primaryBtn : 'bg-blue-600 text-white'}`}>
              2
            </span>
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Chọn Sheet:</span>
          </div>

          {sheetNames.length > 0 ? (
            <select
              value={activeSheet}
              onChange={(e) => onSelectSheet(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {sheetNames.map((sheet) => (
                <option key={sheet} value={sheet}>
                  📊 Sheet: {sheet}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa nạp file Excel</span>
          )}

          {totalRecords > 0 && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              · <strong>{totalRecords}</strong> bản ghi · <strong>{totalColumns}</strong> cột
            </span>
          )}
        </div>

        {/* Thiết lập Định dạng & Font chữ */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Checkbox: Giữ nguyên định dạng Word ban đầu */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 select-none">
            <input
              type="checkbox"
              checked={settings.preserveOriginalFormat}
              onChange={(e) => onUpdateSettings({ preserveOriginalFormat: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Giữ nguyên định dạng ban đầu của Word</span>
          </label>

          {/* Chọn Font Unicode */}
          {!settings.preserveOriginalFormat && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>Font:</span>
              </div>
              <select
                value={settings.fontId}
                onChange={(e) => onUpdateSettings({ fontId: e.target.value })}
                className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {VIETNAMESE_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name} {font.badge ? `(${font.badge})` : ''}
                  </option>
                ))}
              </select>

              {/* Cỡ chữ */}
              <select
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: e.target.value })}
                className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Cỡ chữ văn bản"
              >
                <option value="12pt">12 pt</option>
                <option value="13pt">13 pt (Chuẩn NĐ 30)</option>
                <option value="14pt">14 pt (Chuẩn NĐ 30)</option>
                <option value="15pt">15 pt</option>
                <option value="16pt">16 pt</option>
                <option value="18pt">18 pt</option>
              </select>

              {/* Giãn dòng */}
              <select
                value={settings.lineHeight}
                onChange={(e) => onUpdateSettings({ lineHeight: e.target.value })}
                className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Khoảng cách dòng (Line height)"
              >
                <option value="1.2">Dòng 1.2</option>
                <option value="1.3">Dòng 1.3 (NĐ 30)</option>
                <option value="1.4">Dòng 1.4 (NĐ 30)</option>
                <option value="1.5">Dòng 1.5</option>
                <option value="1.75">Dòng 1.75</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
