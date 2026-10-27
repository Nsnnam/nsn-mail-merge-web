import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Pipette, Paintbrush, Highlighter } from 'lucide-react';

export type WordColorType = 'text' | 'highlight' | 'cell';

export interface WordColorPickerProps {
  type: WordColorType;
  currentColor: string;
  onSelectColor: (color: string) => void;
  title?: string;
  dropdownAlign?: 'left' | 'right';
  className?: string;
}

// 10 cột Màu chủ đề chuẩn Microsoft Office / Word (Theme Colors)
export const WORD_THEME_PALETTE: string[][] = [
  // Hàng 1: Màu chủ đề cơ sở (Top row)
  ['#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646'],
  // Hàng 2: Lighter 80%
  ['#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5dfec', '#daeef3', '#fdeada'],
  // Hàng 3: Lighter 60%
  ['#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5'],
  // Hàng 4: Lighter 40%
  ['#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#92cddc', '#fac08f'],
  // Hàng 5: Darker 25%
  ['#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76933c', '#5f497a', '#31859b', '#e36c09'],
  // Hàng 6: Darker 50%
  ['#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244062', '#632423', '#4f6128', '#3f3151', '#205867', '#974806']
];

// 10 Màu tiêu chuẩn chuẩn Microsoft Office / Word (Standard Colors)
export const WORD_STANDARD_PALETTE: string[] = [
  '#c00000', // Đỏ sẫm (Dark Red)
  '#ff0000', // Đỏ (Red)
  '#ffc000', // Cam đậm (Orange)
  '#ffff00', // Vàng (Yellow)
  '#92d050', // Xanh nõn chuối (Light Green)
  '#00b050', // Xanh lục (Green)
  '#00b0f0', // Xanh da trời (Light Blue)
  '#0070c0', // Xanh lam (Blue)
  '#002060', // Xanh navy đậm (Dark Blue)
  '#7030a0'  // Tím (Purple)
];

// 15 Màu đánh dấu dạ quang chuẩn Word (Highlight Colors)
export const WORD_HIGHLIGHT_PALETTE: string[] = [
  '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff',
  '#ff0000', '#000080', '#008080', '#008000', '#800080',
  '#800000', '#808000', '#808080', '#c0c0c0', '#000000'
];

export const WordColorPicker: React.FC<WordColorPickerProps> = ({
  type,
  currentColor,
  onSelectColor,
  title,
  dropdownAlign = 'left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customHex, setCustomHex] = useState(currentColor || '#000000');
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 264;
      const popoverHeight = type === 'highlight' ? 380 : 330;

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
      setCustomHex(currentColor && currentColor !== 'transparent' ? currentColor : '#000000');
    }
    setIsOpen(!isOpen);
    setShowCustomInput(false);
  };

  // Đóng khi click chuột ra ngoài
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
        setShowCustomInput(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleChoose = (color: string) => {
    onSelectColor(color);
    setIsOpen(false);
    setShowCustomInput(false);
  };

  const handleApplyCustomHex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHex.trim()) return;
    let hex = customHex.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    handleChoose(hex);
  };

  const isColorLight = (hex: string) => {
    if (!hex || hex === 'transparent') return true;
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return true;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const effectiveColor = currentColor && currentColor !== 'transparent' ? currentColor : (type === 'text' ? '#000000' : 'transparent');

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Nút kích hoạt mở bảng màu kiểu Word */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onMouseDown={(e) => e.preventDefault()}
        className={`flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-slate-100 p-1 text-slate-700 transition-colors shadow-2xs ${
          isOpen ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
        }`}
        title={title || (type === 'text' ? 'Màu chữ' : type === 'highlight' ? 'Màu đánh dấu chữ' : 'Màu nền ô')}
      >
        {type === 'text' && (
          <div className="flex flex-col items-center justify-center w-4 h-4.5 leading-none">
            <span className="font-extrabold text-[13px] leading-tight text-slate-900">A</span>
            <span
              className="w-3.5 h-[3px] rounded-full mt-0.5 block shadow-sm"
              style={{ backgroundColor: effectiveColor }}
            />
          </div>
        )}

        {type === 'highlight' && (
          <div className="flex flex-col items-center justify-center w-4 h-4.5 leading-none">
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <span
              className="w-3.5 h-[3px] rounded-full mt-0.5 block shadow-sm"
              style={{ backgroundColor: effectiveColor === 'transparent' ? '#fbbf24' : effectiveColor }}
            />
          </div>
        )}

        {type === 'cell' && (
          <div className="flex items-center gap-1">
            <Paintbrush className="w-3.5 h-3.5 text-indigo-600" />
            <span
              className="w-3.5 h-3.5 rounded-sm border border-slate-300 inline-block shadow-sm"
              style={{ backgroundColor: effectiveColor === 'transparent' ? '#ffffff' : effectiveColor }}
            />
          </div>
        )}

        <ChevronDown className="w-3 h-3 text-slate-400 -ml-0.5" />
      </button>

      {/* Bảng chọn màu kiểu Microsoft Word Popover (Fixed positioning chống tràn/cắt bởi container) */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] bg-white border border-slate-300 rounded-xl shadow-2xl p-2.5 w-64 max-h-[85vh] overflow-y-auto space-y-2.5 text-xs animate-in fade-in zoom-in-95 duration-100 select-none overscroll-contain"
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
          {/* Nút tuỳ chọn trên cùng: Tự động (đen) hoặc Không màu */}
          <div className="border-b border-slate-100 pb-2">
            {type === 'text' ? (
              <button
                type="button"
                onClick={() => handleChoose('#000000')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-800 transition-colors group"
              >
                <span className="w-4 h-4 rounded-sm border border-slate-400 bg-black inline-block shadow-sm group-hover:scale-105" />
                <span className="font-semibold text-xs text-slate-800">Tự động (Màu đen)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleChoose('transparent')}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-800 transition-colors group"
              >
                <span className="w-4 h-4 rounded-sm border border-slate-300 bg-white relative overflow-hidden inline-flex items-center justify-center shadow-sm group-hover:scale-105">
                  <span className="w-full h-0.5 bg-rose-500 rotate-45 block" />
                </span>
                <span className="font-semibold text-xs text-slate-800">Không màu (Mặc định)</span>
              </button>
            )}
          </div>

          {/* Dành riêng cho Highlight: 15 Màu dạ quang quen thuộc của Word */}
          {type === 'highlight' && (
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Màu dạ quang đánh dấu (Highlight):
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {WORD_HIGHLIGHT_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChoose(color)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full h-6 rounded-sm border transition-transform hover:scale-110 shadow-sm flex items-center justify-center ${
                      isColorLight(color) ? 'border-slate-300' : 'border-black/20'
                    } ${currentColor === color ? 'ring-2 ring-blue-500 font-bold' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Khối 1: Màu chủ đề (Theme Colors - 10 cột x 6 hàng) */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              Màu chủ đề (Theme Colors):
            </span>
            <div className="space-y-1">
              {WORD_THEME_PALETTE.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-10 gap-1">
                  {row.map((color, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleChoose(color)}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`w-full ${rIdx === 0 ? 'h-5 mb-0.5 rounded-sm' : 'h-4 rounded-[2px]'} border transition-transform hover:scale-115 hover:z-10 shadow-sm ${
                        isColorLight(color) ? 'border-slate-300' : 'border-transparent'
                      } ${(currentColor || '').toLowerCase() === color.toLowerCase() ? 'ring-2 ring-blue-600 scale-110 z-10' : ''}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Khối 2: Màu tiêu chuẩn (Standard Colors - 10 màu) */}
          <div className="border-t border-slate-100 pt-1.5">
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              Màu tiêu chuẩn (Standard Colors):
            </span>
            <div className="grid grid-cols-10 gap-1">
              {WORD_STANDARD_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChoose(color)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full h-5 rounded-sm border transition-transform hover:scale-115 hover:z-10 shadow-sm ${
                    isColorLight(color) ? 'border-slate-300' : 'border-transparent'
                  } ${(currentColor || '').toLowerCase() === color.toLowerCase() ? 'ring-2 ring-blue-600 scale-110 z-10' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Khối 3: Màu khác... (More Colors...) */}
          <div className="border-t border-slate-100 pt-1.5">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors text-xs font-medium"
              >
                <Pipette className="w-3.5 h-3.5 text-blue-600" />
                <span>Màu khác (More Colors)...</span>
              </button>
            ) : (
              <form onSubmit={handleApplyCustomHex} className="space-y-2 pt-1 animate-in fade-in duration-100">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={customHex.startsWith('#') ? customHex : '#000000'}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-slate-300 p-0 bg-transparent flex-shrink-0"
                    title="Bảng màu quang phổ tự do"
                  />
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    placeholder="#1e40af"
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    Chọn
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
