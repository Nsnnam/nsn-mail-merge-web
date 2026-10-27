import React, { useState, useRef, useEffect } from 'react';
import { Smile, CheckSquare, Sparkles, ChevronDown, Layers, Box, Info, CheckCircle2, AlertTriangle, AlertOctagon, Quote, Minus } from 'lucide-react';

export interface WordIconSymbolPickerProps {
  onInsertSymbol: (symbol: string) => void;
  onInsertHtml: (html: string) => void;
  className?: string;
  dropdownAlign?: 'left' | 'right';
  title?: string;
}

export const WordIconSymbolPicker: React.FC<WordIconSymbolPickerProps> = ({
  onInsertSymbol,
  onInsertHtml,
  className = '',
  dropdownAlign = 'left',
  title = 'Chèn Biểu tượng, Icon & Ký hiệu (Insert Icons & Symbols)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ticks' | 'office' | 'arrows' | 'math' | 'callouts'>('ticks');
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 320;
      const popoverHeight = 380;

      let left = dropdownAlign === 'right' ? rect.right - popoverWidth : rect.left;
      if (left + popoverWidth > window.innerWidth - 10) {
        left = Math.max(10, window.innerWidth - popoverWidth - 10);
      }
      if (left < 10) left = 10;

      let top = rect.bottom + 4;
      if (top + popoverHeight > window.innerHeight - 10) {
        if (rect.top - popoverHeight - 4 >= 10) {
          top = rect.top - popoverHeight - 4;
        } else {
          top = Math.max(10, window.innerHeight - popoverHeight - 10);
        }
      }

      setCoords({ top, left });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePickSymbol = (sym: string) => {
    onInsertSymbol(sym);
    setIsOpen(false);
  };

  const handlePickCallout = (type: 'info' | 'success' | 'warning' | 'danger' | 'quote' | 'divider') => {
    let html = '';
    if (type === 'info') {
      html = `<div style="margin: 12px 0; padding: 10px 14px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; font-size: 13pt; line-height: 1.5; color: #1e3a8a;"><strong style="color: #1d4ed8;">ℹ️ THÔNG TIN:</strong> Nhập nội dung hướng dẫn hoặc ghi chú tại đây...</div><p><br></p>`;
    } else if (type === 'success') {
      html = `<div style="margin: 12px 0; padding: 10px 14px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; font-size: 13pt; line-height: 1.5; color: #14532d;"><strong style="color: #15803d;">✅ KẾT QUẢ / ĐẠT:</strong> Nhập kết luận đánh giá hoặc điều kiện đạt tiêu chuẩn...</div><p><br></p>`;
    } else if (type === 'warning') {
      html = `<div style="margin: 12px 0; padding: 10px 14px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 13pt; line-height: 1.5; color: #78350f;"><strong style="color: #b45309;">⚠️ LƯU Ý QUAN TRỌNG:</strong> Nhập nội dung cần lưu tâm hoặc cảnh báo tại đây...</div><p><br></p>`;
    } else if (type === 'danger') {
      html = `<div style="margin: 12px 0; padding: 10px 14px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; font-size: 13pt; line-height: 1.5; color: #7f1d1d;"><strong style="color: #b91c1c;">⛔ NGUY HIỂM / CHỐNG CHỈ ĐỊNH:</strong> Nhập nội dung nghiêm cấm hoặc chống chỉ định...</div><p><br></p>`;
    } else if (type === 'quote') {
      html = `<blockquote style="margin: 12px 0 12px 16px; padding: 8px 14px; border-left: 3px solid #94a3b8; font-style: italic; color: #334155; background: #f8fafc;">“Nhập câu trích dẫn hoặc nguyên văn quyết định, điều lệ tại đây...”</blockquote><p><br></p>`;
    } else if (type === 'divider') {
      html = `<div style="margin: 16px 0; text-align: center; border-bottom: 2px dashed #94a3b8; position: relative;"><span style="position: absolute; top: -10px; background: #fff; padding: 0 10px; font-size: 10pt; color: #64748b;">✦ ✦ ✦</span></div><p><br></p>`;
    }

    onInsertHtml(html);
    setIsOpen(false);
  };

  const ticksSymbols = [
    '✓', '✔', '☑', '☐', '☒', '✕', '✖', '✗',
    '◯', '🔘', '⭕', '❌', '🚩', '📌', '🏷️', '🔍',
    '⭐', '🌟', '✨', '🎖️', '🏆', '🔔', '📢', '💡',
    '👉', '👉🏻', '👍', '👌', '👏', '🤝', '🔒', '🔑'
  ];

  const officeSymbols = [
    '📞', '📱', '✉️', '📧', '📍', '🏢', '🏥', '🩺',
    '💊', '👤', '👥', '📅', '⏰', '⏳', '📝', '📋',
    '📁', '📂', '🖨️', '💻', '🖥️', '📊', '📈', '📉',
    '⚖️', '📜', '🏷️', '📦', '🚚', '💳', '💰', '💵'
  ];

  const arrowsSymbols = [
    '➔', '➜', '➝', '➞', '➡', '⬅', '⬆', '⬇',
    '↗', '↘', '↙', '↖', '⇄', '⇅', '⇆', '⇵',
    '⇒', '⇔', '⇐', '⇑', '⇓', '▲', '▼', '◄',
    '►', '◆', '◇', '❖', '✦', '•', '‣', '⁃'
  ];

  const mathSymbols = [
    '₫', '$', '€', '¥', '£', '₽', '₩', '฿',
    '%', '‰', '±', '×', '÷', '=', '≠', '≈',
    '≤', '≥', '<', '>', '∞', '∑', '√', 'π',
    '°', '°C', '°F', '§', '¶', '©', '®', '™'
  ];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Nút bấm trên thanh công cụ */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onMouseDown={(e) => e.preventDefault()}
        className={`px-2 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
          isOpen
            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
        }`}
        title={title}
      >
        <Smile className="w-3.5 h-3.5 text-amber-500" />
        <span>Biểu tượng &amp; Icon</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Popover Bảng chọn Biểu tượng chuẩn Word */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-2.5 w-[320px] select-none text-slate-800 animate-in fade-in-50 zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Biểu tượng &amp; Icon Word</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Unicode &amp; HTML</span>
          </div>

          {/* Tab chọn danh mục */}
          <div className="grid grid-cols-5 gap-1 mb-2.5 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('ticks')}
              className={`py-1 text-center rounded transition-colors ${
                activeTab === 'ticks' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dấu kiểm & Checkbox"
            >
              ✓ Kiểm
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('office')}
              className={`py-1 text-center rounded transition-colors ${
                activeTab === 'office' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Văn phòng & Y tế"
            >
              🏢 Hành chính
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arrows')}
              className={`py-1 text-center rounded transition-colors ${
                activeTab === 'arrows' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mũi tên & Phân cách"
            >
              ➔ Mũi tên
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('math')}
              className={`py-1 text-center rounded transition-colors ${
                activeTab === 'math' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toán học & Tiền tệ"
            >
              ₫ Toán
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('callouts')}
              className={`py-1 text-center rounded transition-colors ${
                activeTab === 'callouts' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hộp ghi chú nổi bật"
            >
              📦 Khung
            </button>
          </div>

          {/* Vùng nội dung biểu tượng dạng lưới */}
          {activeTab !== 'callouts' ? (
            <div className="grid grid-cols-8 gap-1.5 p-1 max-h-[220px] overflow-y-auto">
              {(activeTab === 'ticks'
                ? ticksSymbols
                : activeTab === 'office'
                ? officeSymbols
                : activeTab === 'arrows'
                ? arrowsSymbols
                : mathSymbols
              ).map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickSymbol(sym)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-base hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all active:scale-95 cursor-pointer"
                  title={`Chèn "${sym}"`}
                >
                  {sym}
                </button>
              ))}
            </div>
          ) : (
            /* Tab Khung ghi chú nổi bật (Callout Boxes & Shapes) */
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handlePickCallout('info')}
                className="w-full text-left p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 transition-colors flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold text-blue-900 block truncate">Khung Thông tin (Info)</span>
                  <span className="text-[10px] text-blue-700">Khung màu xanh dương kèm icon hướng dẫn</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickCallout('success')}
                className="w-full text-left p-1.5 rounded-lg border border-green-200 bg-green-50/60 hover:bg-green-100/70 transition-colors flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded bg-green-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold text-green-900 block truncate">Khung Kết quả / Đạt (Success)</span>
                  <span className="text-[10px] text-green-700">Khung xanh lá cho kết luận kiểm tra</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickCallout('warning')}
                className="w-full text-left p-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition-colors flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold text-amber-900 block truncate">Khung Lưu ý (Warning)</span>
                  <span className="text-[10px] text-amber-700">Khung viền vàng cam nổi bật</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickCallout('danger')}
                className="w-full text-left p-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100/70 transition-colors flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold text-red-900 block truncate">Khung Cảnh báo (Danger)</span>
                  <span className="text-[10px] text-red-700">Khung màu đỏ cho chống chỉ định, chú ý</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickCallout('quote')}
                className="w-full text-left p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded bg-slate-600 text-white flex items-center justify-center shrink-0">
                  <Quote className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold text-slate-800 block truncate">Khung Trích dẫn / Điều luật</span>
                  <span className="text-[10px] text-slate-500">Đoạn thụt lề có viền bên trái phong cách báo chí</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickCallout('divider')}
                className="w-full text-left p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded bg-slate-400 text-white flex items-center justify-center shrink-0">
                  <Minus className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-bold text-slate-800 block truncate">Đường kẻ phân cách hoa văn</span>
                  <span className="text-[10px] text-slate-500">Đường gạch đứt có ký hiệu sao ở giữa</span>
                </div>
              </button>
            </div>
          )}

          {/* Footer ghi chú */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Nhấp để chèn tại con trỏ</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
