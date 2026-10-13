import React, { useState } from 'react';
import { Tag, Search, Plus, Copy, Check, Info, Layers, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

import { ThemeGradient } from '../lib/theme';

interface ExcelColumnsSidebarProps {
  headers: string[];
  sampleRow: Record<string, string | number> | null;
  currentIndex: number;
  totalRecords: number;
  onPrevRecord: () => void;
  onNextRecord: () => void;
  onInsertTag: (tag: string) => void;
  activeSheet: string;
  theme?: ThemeGradient;
}

export const ExcelColumnsSidebar: React.FC<ExcelColumnsSidebarProps> = ({
  headers,
  sampleRow,
  currentIndex,
  totalRecords,
  onPrevRecord,
  onNextRecord,
  onInsertTag,
  activeSheet,
  theme
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [recentlyInserted, setRecentlyInserted] = useState<string | null>(null);

  const filteredHeaders = headers.filter(h =>
    h.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInsert = (tag: string) => {
    onInsertTag(tag);
    setRecentlyInserted(tag);
    setTimeout(() => setRecentlyInserted(null), 1200);
  };

  const handleCopy = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`{{${tag}}}`);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-6rem)] overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${theme ? `${theme.accentBg} ${theme.accentText}` : 'bg-blue-100 text-blue-700'}`}>
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                Cột Excel khả dụng
              </h3>
              <span className="text-[11px] text-slate-500">
                Sheet: <strong className={theme ? theme.accentText : 'text-blue-700'}>{activeSheet || 'Chưa chọn'}</strong>
              </span>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-2xs ${theme ? theme.primaryBtn : 'bg-blue-600 text-white'}`}>
            {headers.length} cột
          </span>
        </div>

        {/* Thanh tìm kiếm cột */}
        <div className="relative mt-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm tên cột..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 px-1 rounded"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Đối chiếu Dữ liệu mẫu hiện tại */}
        {totalRecords > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-500">
              Đối chiếu dòng: <strong className="text-slate-800">{currentIndex + 1}</strong>/{totalRecords}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onPrevRecord}
                disabled={currentIndex === 0}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Dòng trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNextRecord}
                disabled={currentIndex >= totalRecords - 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Dòng tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thông báo hướng dẫn nhanh */}
      <div className="bg-amber-50/80 px-3 py-2 border-b border-amber-100 flex items-start gap-1.5 text-[11px] text-amber-800">
        <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Mẹo:</strong> Đặt con trỏ hoặc <strong>bôi đen</strong> chữ trong Word, sau đó click nút <strong>+ Chèn</strong> để thay thế bằng biến.
        </span>
      </div>

      {/* Danh sách các Cột (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {headers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Chưa có dữ liệu cột Excel.</p>
            <p className="text-[11px] text-slate-400">Vui lòng nạp file Excel hoặc bấm "Dùng thử mẫu có sẵn".</p>
          </div>
        ) : filteredHeaders.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Không tìm thấy cột nào khớp với "{searchTerm}".
          </div>
        ) : (
          filteredHeaders.map((col) => {
            const rawVal = sampleRow ? sampleRow[col] : '';
            const sampleVal = rawVal !== undefined && rawVal !== null && rawVal !== '' ? String(rawVal) : '(trống)';
            const isInserted = recentlyInserted === col;
            const isCopied = copiedTag === col;

            return (
              <div
                key={col}
                className={`p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                  isInserted
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Tên cột & Nút Copy */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900 truncate">
                    <span className="text-blue-500 font-bold">{'{'}{'{'}</span>
                    <span className="truncate">{col}</span>
                    <span className="text-blue-500 font-bold">{'}'}{'}'}</span>
                  </div>

                  <button
                    onClick={(e) => handleCopy(col, e)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 flex-shrink-0 transition-colors"
                    title="Sao chép biến vào bộ nhớ tạm"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Giá trị mẫu đối chiếu */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  <span className="text-slate-400 text-[10px]">Giá trị mẫu:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[160px]" title={sampleVal}>
                    {sampleVal}
                  </span>
                </div>

                {/* Nút Chèn vào vị trí con trỏ / bôi đen */}
                <button
                  onClick={() => handleInsert(col)}
                  onMouseDown={(e) => e.preventDefault()} // Quan trọng: Ngăn chặn mất focus/selection trong editor!
                  className={`w-full py-1.5 px-2.5 rounded-md font-semibold text-xs flex items-center justify-center gap-1 transition-all shadow-2xs ${
                    isInserted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                  }`}
                  title="Chèn biến vào vị trí con trỏ hoặc thay thế chữ đang bôi đen trong Word"
                >
                  {isInserted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chèn!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chèn vào con trỏ</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
        Hiển thị {filteredHeaders.length}/{headers.length} cột khả dụng
      </div>
    </div>
  );
};
