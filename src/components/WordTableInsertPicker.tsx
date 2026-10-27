import React, { useState, useRef, useEffect } from 'react';
import { Table as TableIcon, ChevronDown, Sliders, Sparkles } from 'lucide-react';

export interface WordTableInsertPickerProps {
  onInsertTable: (rows: number, cols: number) => void;
  onOpenCustomModal: () => void;
  onInsertQuickTable?: (type: 'info2' | 'list3' | 'sign4' | 'health5') => void;
  className?: string;
  dropdownAlign?: 'left' | 'right';
  title?: string;
}

export const WordTableInsertPicker: React.FC<WordTableInsertPickerProps> = ({
  onInsertTable,
  onOpenCustomModal,
  onInsertQuickTable,
  className = '',
  dropdownAlign = 'left',
  title = 'Chèn Bảng (Insert Table - Microsoft Word)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredCols, setHoveredCols] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const TOTAL_ROWS = 8;
  const TOTAL_COLS = 10;

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 246;
      const popoverHeight = 350;

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
      setHoveredRows(0);
      setHoveredCols(0);
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

  const handleCellClick = (r: number, c: number) => {
    onInsertTable(r, c);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Nút bấm Chèn Bảng chuẩn Microsoft Word */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onMouseDown={(e) => e.preventDefault()}
        className={`px-2 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
        }`}
        title={title}
      >
        <TableIcon className="w-3.5 h-3.5 text-blue-600" />
        <span className="font-semibold text-xs">Chèn Bảng</span>
        <ChevronDown className="w-3 h-3 text-slate-400 -ml-0.5" />
      </button>

      {/* Menu xổ xuống với ma trận ô vuông trực quan chuẩn Word */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] bg-white border border-slate-300 rounded-xl shadow-2xl p-2.5 w-[246px] max-h-[88vh] overflow-y-auto space-y-2.5 text-xs animate-in fade-in zoom-in-95 duration-100 select-none overscroll-contain"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Header hiển thị số hàng x số cột theo thời gian thực */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-[11px] text-slate-800">
              {hoveredRows > 0 && hoveredCols > 0 ? (
                <span className="text-blue-600 font-extrabold">
                  Bảng {hoveredRows} x {hoveredCols} ({hoveredRows} hàng, {hoveredCols} cột)
                </span>
              ) : (
                'Chèn Bảng (Insert Table)'
              )}
            </span>
          </div>

          {/* Ma trận lưới ô vuông 8 hàng x 10 cột chuẩn Word */}
          <div
            className="p-1 bg-slate-50/70 border border-slate-200 rounded-lg inline-block mx-auto"
            onMouseLeave={() => {
              setHoveredRows(0);
              setHoveredCols(0);
            }}
          >
            <div className="grid grid-cols-10 gap-[3px]">
              {Array.from({ length: TOTAL_ROWS }).map((_, rIdx) =>
                Array.from({ length: TOTAL_COLS }).map((_, cIdx) => {
                  const rNum = rIdx + 1;
                  const cNum = cIdx + 1;
                  const isHighlighted = rNum <= hoveredRows && cNum <= hoveredCols;
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      onMouseEnter={() => {
                        setHoveredRows(rNum);
                        setHoveredCols(cNum);
                      }}
                      onClick={() => handleCellClick(rNum, cNum)}
                      className={`w-[18px] h-[18px] rounded-[2px] transition-colors ${
                        isHighlighted
                          ? 'bg-blue-500 border border-blue-600 shadow-2xs'
                          : 'bg-white hover:bg-slate-200 border border-slate-300'
                      }`}
                      title={`Bảng ${rNum}x${cNum}`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Nút Chèn Bảng Tùy biến (Insert Table...) */}
          <div className="border-t border-slate-100 pt-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCustomModal();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-50 text-blue-700 font-semibold transition-colors text-left text-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Chèn bảng tùy chọn (Insert Table)...</span>
            </button>

            {onInsertQuickTable && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-500 block mb-1 px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Bảng mẫu nhanh (Quick Tables):
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onInsertQuickTable('info2');
                    }}
                    className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-left truncate"
                    title="Bảng thông tin 2 cột: Tiêu chí | Nội dung"
                  >
                    2 cột (Thông tin)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onInsertQuickTable('list3');
                    }}
                    className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-left truncate"
                    title="Bảng 3 cột: STT | Nội dung | Kết quả"
                  >
                    3 cột (Đối chiếu)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onInsertQuickTable('sign4');
                    }}
                    className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-left truncate"
                    title="Bảng 4 cột: STT | Họ tên | Chức vụ | Chữ ký"
                  >
                    4 cột (Ký tên)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onInsertQuickTable('health5');
                    }}
                    className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-left truncate"
                    title="Bảng khám đoàn: STT | Chuyên khoa | Nội dung | Kết luận | Bác sĩ"
                  >
                    5 cột (Khám đoàn)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
