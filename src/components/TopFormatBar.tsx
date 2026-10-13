import React, { useState } from 'react';
import { Layers, Type, Ruler, Settings2, Sliders } from 'lucide-react';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { DocumentSettings, DocumentMargin, PageMarginType } from '../types';
import { ThemeGradient } from '../lib/theme';
import { getEffectiveMargin } from '../lib/docxHelper';

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
  const [isCustomMarginOpen, setIsCustomMarginOpen] = useState(false);
  const [tempMargins, setTempMargins] = useState<DocumentMargin>(
    settings.customMargins || { top: 20, bottom: 20, left: 30, right: 15 }
  );

  const effectiveMargin = getEffectiveMargin(settings);

  const handleMarginChange = (val: PageMarginType) => {
    if (val === 'custom') {
      setIsCustomMarginOpen(true);
    } else {
      onUpdateSettings({ pageMargin: val });
    }
  };

  const handleSaveCustomMargin = () => {
    onUpdateSettings({
      pageMargin: 'custom',
      customMargins: tempMargins
    });
    setIsCustomMarginOpen(false);
  };

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

        {/* Thiết lập Định dạng, Lề trang & Font chữ */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tùy chỉnh Căn Lề Trang (Margin) */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <Ruler className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Lề trang:</span>
            <select
              value={settings.pageMargin}
              onChange={(e) => handleMarginChange(e.target.value as PageMarginType)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              title={`Lề hiện tại: T:${effectiveMargin.top}mm, D:${effectiveMargin.bottom}mm, T:${effectiveMargin.left}mm, P:${effectiveMargin.right}mm`}
            >
              <option value="original">
                Theo file gốc {settings.originalMargins ? `(${settings.originalMargins.top}/${settings.originalMargins.bottom}/${settings.originalMargins.left}/${settings.originalMargins.right}mm)` : ''}
              </option>
              <option value="nd30">Nghị định 30 (20/20/30/15 mm)</option>
              <option value="normal">Tiêu chuẩn (25.4 mm)</option>
              <option value="narrow">Hẹp (12.7 mm)</option>
              <option value="moderate">Vừa phải (25.4 / 19.1 mm)</option>
              <option value="custom">Tùy chỉnh...</option>
            </select>

            {settings.pageMargin === 'custom' && (
              <button
                onClick={() => setIsCustomMarginOpen(true)}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded"
                title="Chỉnh sửa thông số lề tùy chọn"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Checkbox: Giữ nguyên định dạng Word ban đầu */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 select-none">
            <input
              type="checkbox"
              checked={settings.preserveOriginalFormat}
              onChange={(e) => onUpdateSettings({ preserveOriginalFormat: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Giữ format gốc</span>
          </label>

          {/* Chọn Font Unicode */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Font:</span>
            </div>
            <select
              value={settings.fontId}
              onChange={(e) => onUpdateSettings({ fontId: e.target.value })}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-[130px] sm:max-w-none truncate"
              title="Phông chữ hiển thị và in"
            >
              {VIETNAMESE_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name} {font.badge ? `(${font.badge})` : ''}
                </option>
              ))}
            </select>

            {/* Cỡ chữ mở rộng */}
            <select
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: e.target.value })}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              title="Cỡ chữ văn bản (Mặc định tự động theo file Word hoặc 13pt NĐ 30)"
            >
              <option value="8pt">8 pt</option>
              <option value="9pt">9 pt</option>
              <option value="10pt">10 pt</option>
              <option value="11pt">11 pt</option>
              <option value="12pt">12 pt</option>
              <option value="13pt">13 pt (Chuẩn NĐ 30)</option>
              <option value="14pt">14 pt (Chuẩn NĐ 30)</option>
              <option value="15pt">15 pt</option>
              <option value="16pt">16 pt</option>
              <option value="18pt">18 pt</option>
              <option value="20pt">20 pt</option>
              <option value="22pt">22 pt</option>
              <option value="24pt">24 pt</option>
              <option value="28pt">28 pt</option>
              <option value="32pt">32 pt</option>
              <option value="36pt">36 pt</option>
            </select>

            {/* Giãn dòng */}
            <select
              value={settings.lineHeight}
              onChange={(e) => onUpdateSettings({ lineHeight: e.target.value })}
              className="px-1.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hidden md:inline-block"
              title="Khoảng cách dòng (Line height)"
            >
              <option value="1.15">Dòng 1.15</option>
              <option value="1.2">Dòng 1.2</option>
              <option value="1.3">Dòng 1.3 (NĐ 30)</option>
              <option value="1.4">Dòng 1.4 (NĐ 30)</option>
              <option value="1.5">Dòng 1.5</option>
              <option value="1.75">Dòng 1.75</option>
              <option value="2.0">Dòng 2.0</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODAL TÙY CHỈNH LỀ TRANG (CUSTOM MARGIN DIALOG) */}
      {isCustomMarginOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Tùy chỉnh lề trang (Millimeter - mm)</span>
              </h3>
              <button
                onClick={() => setIsCustomMarginOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Trên (Top):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.top}
                    onChange={(e) => setTempMargins({ ...tempMargins, top: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Dưới (Bottom):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.bottom}
                    onChange={(e) => setTempMargins({ ...tempMargins, bottom: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Trái (Left):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.left}
                    onChange={(e) => setTempMargins({ ...tempMargins, left: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Phải (Right):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.right}
                    onChange={(e) => setTempMargins({ ...tempMargins, right: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-[11px] text-blue-900 mb-4">
              <span className="font-semibold">💡 Gợi ý Nghị định 30/2020/NĐ-CP:</span>
              <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-blue-800">
                <li>Lề trên: 20 - 25 mm</li>
                <li>Lề dưới: 20 - 25 mm</li>
                <li>Lề trái (đóng gáy): 30 - 35 mm</li>
                <li>Lề phải: 15 - 20 mm</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCustomMarginOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveCustomMargin}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${
                  theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Áp dụng lề
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

