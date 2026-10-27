import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, Check } from 'lucide-react';

export type BorderPresetType =
  | 'bottom'
  | 'top'
  | 'left'
  | 'right'
  | 'none'
  | 'all'
  | 'outside'
  | 'inside'
  | 'inside_h'
  | 'inside_v'
  | 'diagonal_down'
  | 'diagonal_up'
  | 'hr'
  | 'gridlines'
  | 'custom';

export interface BorderCustomOptions {
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove';
  width: string;
  color: string;
  applyTo: 'table' | 'cell';
}

export interface WordBorderPickerProps {
  onApplyBorder: (type: BorderPresetType, options?: BorderCustomOptions) => void;
  onToggleGridlines?: () => void;
  showGridlines?: boolean;
  className?: string;
  dropdownAlign?: 'left' | 'right';
  title?: string;
}

// === ICON SVG CHUẨN MICROSOFT WORD CHO TỪNG LOẠI VIỀN ===
export const BorderIcons = {
  bottom: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="13.5" x2="13.5" y2="13.5" strokeWidth="2.2" stroke="#1e293b" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
    </svg>
  ),
  top: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="2.5" x2="13.5" y2="2.5" strokeWidth="2.2" stroke="#1e293b" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
    </svg>
  ),
  left: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="2.5" x2="2.5" y2="13.5" strokeWidth="2.2" stroke="#1e293b" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
    </svg>
  ),
  right: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="13.5" y1="2.5" x2="13.5" y2="13.5" strokeWidth="2.2" stroke="#1e293b" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
    </svg>
  ),
  none: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
    </svg>
  ),
  all: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="#1e293b">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1.5" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1.5" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1.5" />
    </svg>
  ),
  outside: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1.6" stroke="#1e293b" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
    </svg>
  ),
  inside: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1.6" stroke="#1e293b" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1.6" stroke="#1e293b" />
    </svg>
  ),
  inside_h: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeWidth="1.6" stroke="#1e293b" />
    </svg>
  ),
  inside_v: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeWidth="1.6" stroke="#1e293b" />
    </svg>
  ),
  diagonal_down: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="2.5" x2="13.5" y2="13.5" strokeWidth="1.5" stroke="#1e293b" />
    </svg>
  ),
  diagonal_up: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" strokeWidth="1" strokeDasharray="2 2" stroke="#94a3b8" />
      <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" strokeWidth="1.5" stroke="#1e293b" />
    </svg>
  ),
  hr: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <text x="2" y="6" fontSize="5.5" fontWeight="bold" fill="#64748b">A</text>
      <line x1="1" y1="8.5" x2="15" y2="8.5" strokeWidth="1.8" stroke="#1e293b" />
      <text x="2" y="14.5" fontSize="5.5" fontWeight="bold" fill="#64748b">A</text>
    </svg>
  ),
  gridlines: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" strokeWidth="1.2" stroke="#0284c7" />
      <line x1="6" y1="2" x2="6" y2="14" strokeWidth="1" strokeDasharray="1.5 1.5" stroke="#0284c7" />
      <line x1="10" y1="2" x2="10" y2="14" strokeWidth="1" strokeDasharray="1.5 1.5" stroke="#0284c7" />
      <line x1="2" y1="6" x2="14" y2="6" strokeWidth="1" strokeDasharray="1.5 1.5" stroke="#0284c7" />
      <line x1="2" y1="10" x2="14" y2="10" strokeWidth="1" strokeDasharray="1.5 1.5" stroke="#0284c7" />
    </svg>
  ),
  custom: () => (
    <SlidersHorizontal className="w-4 h-4 text-amber-600 flex-shrink-0" />
  )
};

export const WordBorderPicker: React.FC<WordBorderPickerProps> = ({
  onApplyBorder,
  onToggleGridlines,
  showGridlines = false,
  className = '',
  dropdownAlign = 'left',
  title = 'Đường viền bảng (Borders)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStyle, setCustomStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double' | 'groove'>('solid');
  const [customWidth, setCustomWidth] = useState('1px');
  const [customColor, setCustomColor] = useState('#000000');
  const [applyScope, setApplyScope] = useState<'table' | 'cell'>('table');
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 240;
      const popoverHeight = 440;

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
    setShowCustomModal(false);
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
        setShowCustomModal(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectPreset = (type: BorderPresetType) => {
    if (type === 'custom') {
      setShowCustomModal(true);
      return;
    }
    if (type === 'gridlines') {
      if (onToggleGridlines) onToggleGridlines();
      setIsOpen(false);
      return;
    }
    onApplyBorder(type, {
      style: customStyle,
      width: customWidth,
      color: customColor,
      applyTo: applyScope
    });
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    onApplyBorder('all', {
      style: customStyle,
      width: customWidth,
      color: customColor,
      applyTo: applyScope
    });
    setIsOpen(false);
    setShowCustomModal(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Nút biểu tượng Viền kiểu Microsoft Word */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onMouseDown={(e) => e.preventDefault()}
        className={`flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-slate-100 p-1 text-slate-700 transition-colors shadow-2xs ${
          isOpen ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
        }`}
        title={title}
      >
        <div className="flex items-center justify-center w-4 h-4 text-slate-800">
          <BorderIcons.all />
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 -ml-0.5" />
      </button>

      {/* Menu xổ xuống chuẩn Microsoft Word (Borders Menu) */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] bg-white border border-slate-300 rounded-xl shadow-2xl p-1.5 w-60 max-h-[88vh] overflow-y-auto space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100 select-none overscroll-contain"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`
          }}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).tagName !== 'INPUT') {
              e.preventDefault();
            }
          }}
        >
          {!showCustomModal ? (
            <>
              {/* Nhóm 1: 4 cạnh viền ngoài */}
              <button
                type="button"
                onClick={() => handleSelectPreset('bottom')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.bottom />
                <span className="font-medium">Bottom Border (Viền dưới)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('top')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.top />
                <span className="font-medium">Top Border (Viền trên)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('left')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.left />
                <span className="font-medium">Left Border (Viền trái)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('right')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.right />
                <span className="font-medium">Right Border (Viền phải)</span>
              </button>

              <div className="h-px bg-slate-200 my-1" />

              {/* Nhóm 2: Không viền, Tất cả viền, Viền ngoài, Viền trong */}
              <button
                type="button"
                onClick={() => handleSelectPreset('none')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-rose-50 text-rose-700 hover:text-rose-800 transition-colors text-left font-semibold"
              >
                <BorderIcons.none />
                <span>No Border (Không viền)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('all')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-blue-50 text-blue-800 transition-colors text-left font-semibold"
              >
                <BorderIcons.all />
                <span>All Borders (Tất cả viền)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('outside')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.outside />
                <span className="font-medium">Outside Borders (Chỉ viền ngoài)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('inside')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.inside />
                <span className="font-medium">Inside Borders (Chỉ viền trong)</span>
              </button>

              <div className="h-px bg-slate-200 my-1" />

              {/* Nhóm 3: Viền ngang trong, Viền dọc trong */}
              <button
                type="button"
                onClick={() => handleSelectPreset('inside_h')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.inside_h />
                <span className="font-medium">Inside Horizontal Border</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('inside_v')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.inside_v />
                <span className="font-medium">Inside Vertical Border</span>
              </button>

              <div className="h-px bg-slate-200 my-1" />

              {/* Nhóm 4: Đường chéo ô */}
              <button
                type="button"
                onClick={() => handleSelectPreset('diagonal_down')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.diagonal_down />
                <span className="font-medium">Diagonal Down Border (Gạch chéo \)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('diagonal_up')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.diagonal_up />
                <span className="font-medium">Diagonal Up Border (Gạch chéo /)</span>
              </button>

              <div className="h-px bg-slate-200 my-1" />

              {/* Nhóm 5: Đường kẻ ngang */}
              <button
                type="button"
                onClick={() => handleSelectPreset('hr')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-colors text-left"
              >
                <BorderIcons.hr />
                <span className="font-medium">Horizontal Line (Kẻ ngang phân cách)</span>
              </button>

              {/* Nhóm 6: Xem đường lưới hỗ trợ */}
              <button
                type="button"
                onClick={() => handleSelectPreset('gridlines')}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left ${
                  showGridlines ? 'bg-sky-50 text-sky-800 font-semibold' : 'hover:bg-slate-100 text-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BorderIcons.gridlines />
                  <span>View Gridlines (Hiện đường lưới)</span>
                </div>
                {showGridlines && <Check className="w-4 h-4 text-sky-600" />}
              </button>

              <div className="h-px bg-slate-200 my-1" />

              {/* Nhóm 7: Tùy chỉnh nâng cao */}
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-amber-50 text-amber-900 transition-colors text-left font-semibold"
              >
                <BorderIcons.custom />
                <span>Borders and Shading (Tùy biến viền)...</span>
              </button>
            </>
          ) : (
            /* BẢNG CẤU HÌNH TÙY BIẾN CHI TIẾT (BORDERS AND SHADING SETTINGS) */
            <div className="p-1 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Tùy biến đường viền
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs px-1"
                >
                  Quay lại
                </button>
              </div>

              {/* 1. Kiểu nét viền */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Kiểu nét viền:</label>
                <select
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value as any)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="solid">Nét liền (Solid)</option>
                  <option value="dashed">Nét đứt (Dashed)</option>
                  <option value="dotted">Nét chấm (Dotted)</option>
                  <option value="double">Nét đôi (Double)</option>
                  <option value="groove">Nét rãnh (Groove)</option>
                </select>
              </div>

              {/* 2. Độ dày nét viền */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Độ dày nét viền:</label>
                <select
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="0.75px">0.5 pt (~0.75px)</option>
                  <option value="1px">0.75 pt (~1px - Chuẩn Word)</option>
                  <option value="1.5px">1.0 pt (~1.5px)</option>
                  <option value="2px">1.5 pt (~2px Đậm)</option>
                  <option value="3px">2.25 pt (~3px Rất đậm)</option>
                  <option value="4px">3.0 pt (~4px)</option>
                </select>
              </div>

              {/* 3. Màu sắc đường viền */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Màu sắc đường viền:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-slate-300 p-0 bg-transparent flex-shrink-0"
                    title="Chọn màu sắc viền"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {['#000000', '#475569', '#1e40af', '#dc2626', '#16a34a', '#d97706'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCustomColor(c)}
                        className={`w-4 h-4 rounded-xs border ${customColor === c ? 'ring-1 ring-blue-600 scale-110' : 'border-slate-300'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Phạm vi áp dụng */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Áp dụng cho:</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="borderApplyScope"
                      checked={applyScope === 'table'}
                      onChange={() => setApplyScope('table')}
                      className="text-blue-600"
                    />
                    <span className="text-xs text-slate-700">Toàn bảng</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="borderApplyScope"
                      checked={applyScope === 'cell'}
                      onChange={() => setApplyScope('cell')}
                      className="text-blue-600"
                    />
                    <span className="text-xs text-slate-700">Ô đang chọn</span>
                  </label>
                </div>
              </div>

              {/* Xem trước trực quan (Preview Box) */}
              <div className="border border-slate-200 rounded p-2 bg-slate-50 flex items-center justify-center">
                <div
                  className="w-24 h-12 bg-white flex items-center justify-center text-[10px] font-medium text-slate-500 shadow-2xs"
                  style={{
                    borderStyle: customStyle,
                    borderWidth: customWidth,
                    borderColor: customColor
                  }}
                >
                  Mẫu xem trước
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors shadow-2xs"
                >
                  Áp dụng viền này
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
