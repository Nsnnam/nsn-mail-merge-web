import React, { useState } from 'react';
import { Layers, Tag, Type, Check, Copy, Sliders, AlignLeft, AlignCenter, AlignRight, AlignJustify, HelpCircle } from 'lucide-react';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { DocumentSettings } from '../types';

interface DataMappingToolbarProps {
  sheetNames: string[];
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
  headers: string[];
  sampleRow: Record<string, string | number> | null;
  onInsertTag: (tag: string) => void;
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
}

export const DataMappingToolbar: React.FC<DataMappingToolbarProps> = ({
  sheetNames,
  activeSheet,
  onSelectSheet,
  headers,
  sampleRow,
  onInsertTag,
  settings,
  onUpdateSettings
}) => {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    onInsertTag(tag);
    // Copy to clipboard as fallback/convenience
    navigator.clipboard.writeText(`{{${tag}}}`);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const selectedFont = VIETNAMESE_FONTS.find(f => f.id === settings.fontId) || VIETNAMESE_FONTS[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Hàng 1: Chọn Sheet & Tùy chọn Font chữ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Chọn Sheet */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Chọn Sheet Excel:</span>
          </div>
          {sheetNames.length > 0 ? (
            <select
              value={activeSheet}
              onChange={(e) => onSelectSheet(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {sheetNames.map((sheet) => (
                <option key={sheet} value={sheet}>
                  📊 Sheet: {sheet}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa có file Excel</span>
          )}
        </div>

        {/* Cấu hình Định dạng Font & Typography */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Checkbox: Giữ nguyên định dạng ban đầu */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 select-none">
            <input
              type="checkbox"
              checked={settings.preserveOriginalFormat}
              onChange={(e) => onUpdateSettings({ preserveOriginalFormat: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Giữ nguyên định dạng Word ban đầu</span>
          </label>

          {/* Chọn Font chữ Unicode */}
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
                <option value="13pt">13 pt (NĐ 30)</option>
                <option value="14pt">14 pt (NĐ 30)</option>
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

      {/* Hàng 2: Danh sách các cột Excel (Tags/Tokens để click chèn vào Word) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Các cột Excel khả dụng ({headers.length}):</span>
            <span className="text-slate-400 font-normal">Click vào thẻ để chèn biến vào vị trí con trỏ &amp; sao chép</span>
          </div>
          {copiedTag && (
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
              Đã chèn &amp; copy: {'{{'}{copiedTag}{'}}'}
            </span>
          )}
        </div>

        {headers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50/80 rounded-lg border border-slate-100">
            {headers.map((col) => {
              const sampleVal = sampleRow ? sampleRow[col] : '';
              return (
                <button
                  key={col}
                  onClick={() => handleTagClick(col)}
                  className="group inline-flex items-center gap-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-900 px-2.5 py-1 rounded-md text-xs font-medium transition-all shadow-2xs hover:shadow-xs"
                  title={`Click để chèn {{${col}}} vào văn bản. Giá trị mẫu: ${sampleVal !== undefined ? sampleVal : '(trống)'}`}
                >
                  <span className="text-blue-500 font-bold group-hover:scale-110 transition-transform">
                    {'{'}{'{'}
                  </span>
                  <span className="font-semibold text-slate-900">{col}</span>
                  <span className="text-blue-500 font-bold group-hover:scale-110 transition-transform">
                    {'}'}{'}'}
                  </span>
                  {sampleVal !== undefined && sampleVal !== '' && (
                    <span className="max-w-[120px] truncate text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                      {String(sampleVal)}
                    </span>
                  )}
                  {copiedTag === col ? (
                    <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-300 group-hover:text-blue-500 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
            Chưa có cột nào. Vui lòng nạp file Excel hoặc bấm "Dùng thử mẫu có sẵn" ở trên.
          </div>
        )}
      </div>
    </div>
  );
};
