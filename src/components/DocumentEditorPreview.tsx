import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Printer,
  FileDown,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Table as TableIcon,
  Minus,
  RemoveFormatting,
  RotateCcw,
  RotateCw,
  Palette,
  Highlighter,
  Files,
  Sparkles
} from 'lucide-react';
import { DocumentSettings } from '../types';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { renderMergedHtml } from '../lib/docxHelper';
import { ThemeGradient } from '../lib/theme';

export interface DocumentEditorHandle {
  insertTag: (tag: string) => void;
}

interface DocumentEditorPreviewProps {
  templateHtml: string;
  onUpdateTemplateHtml: (newHtml: string) => void;
  currentRow: Record<string, string | number> | null;
  currentIndex: number;
  totalRecords: number;
  onPrevRecord: () => void;
  onNextRecord: () => void;
  onFirstRecord: () => void;
  onLastRecord: () => void;
  onJumpToRecord: (index: number) => void;
  settings: DocumentSettings;
  isPreviewMode: boolean;
  setIsPreviewMode: (preview: boolean) => void;
  onPrintCurrent: () => void;
  onPrintAll: () => void;
  onExportDocxCurrent: () => void;
  onExportSingleDocxAll: () => void;
  onExportZipAll: () => void;
  hasTemplate: boolean;
  hasExcel: boolean;
  theme?: ThemeGradient;
}

export const DocumentEditorPreview = forwardRef<DocumentEditorHandle, DocumentEditorPreviewProps>(({
  templateHtml,
  onUpdateTemplateHtml,
  currentRow,
  currentIndex,
  totalRecords,
  onPrevRecord,
  onNextRecord,
  onFirstRecord,
  onLastRecord,
  onJumpToRecord,
  settings,
  isPreviewMode,
  setIsPreviewMode,
  onPrintCurrent,
  onPrintAll,
  onExportDocxCurrent,
  onExportSingleDocxAll,
  onExportZipAll,
  hasTemplate,
  hasExcel,
  theme
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const selectedFont = VIETNAMESE_FONTS.find(f => f.id === settings.fontId) || VIETNAMESE_FONTS[0];

  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

  // Lưu lại vị trí con trỏ / vùng bôi đen (selection)
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  useEffect(() => {
    const handleDocSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      }
    };

    document.addEventListener('selectionchange', handleDocSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleDocSelectionChange);
    };
  }, []);

  // Expose hàm insertTag cho component cha gọi khi click vào thẻ bên phải
  useImperativeHandle(ref, () => ({
    insertTag: (tag: string) => {
      const el = editorRef.current;
      if (!el) return;

      if (isPreviewMode) {
        setIsPreviewMode(false);
      }

      el.focus();

      const tagText = `{{${tag}}}`;
      const sel = window.getSelection();
      let range: Range | null = null;

      if (sel && sel.rangeCount > 0) {
        const curRange = sel.getRangeAt(0);
        if (el.contains(curRange.commonAncestorContainer)) {
          range = curRange;
        }
      }

      if (!range && savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
        range = savedRangeRef.current;
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      if (range && el.contains(range.commonAncestorContainer)) {
        range.deleteContents();

        const textNode = document.createTextNode(tagText);
        range.insertNode(textNode);

        const newRange = document.createRange();
        newRange.setStartAfter(textNode);
        newRange.setEndAfter(textNode);

        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedRangeRef.current = newRange;

        onUpdateTemplateHtml(el.innerHTML);
      } else {
        const textNode = document.createTextNode(` ${tagText} `);
        el.appendChild(textNode);

        const newRange = document.createRange();
        newRange.selectNodeContents(el);
        newRange.collapse(false);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedRangeRef.current = newRange;

        onUpdateTemplateHtml(el.innerHTML);
      }
    }
  }));

  // Đồng bộ nội dung vào editor khi đổi chế độ hoặc đổi bản ghi
  useEffect(() => {
    if (!editorRef.current) return;
    if (isPreviewMode) {
      editorRef.current.innerHTML = renderMergedHtml(templateHtml, currentRow, false);
    } else {
      if (editorRef.current.innerHTML !== templateHtml) {
        editorRef.current.innerHTML = templateHtml;
      }
    }
  }, [templateHtml, currentRow, isPreviewMode]);

  // Xử lý sự kiện chỉnh sửa nội dung
  const handleInput = () => {
    if (!isPreviewMode && editorRef.current) {
      saveSelection();
      onUpdateTemplateHtml(editorRef.current.innerHTML);
    }
  };

  // Các lệnh định dạng cơ bản
  const execFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current && !isPreviewMode) {
      saveSelection();
      onUpdateTemplateHtml(editorRef.current.innerHTML);
    }
  };

  // Áp dụng định dạng tùy biến (Màu sắc, Cỡ chữ, Kiểu đoạn)
  const applyInlineStyle = (property: string, value: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    if (range.collapsed) {
      // Nếu không bôi đen, dùng execCommand tương thích
      if (property === 'color') document.execCommand('foreColor', false, value);
      if (property === 'backgroundColor') document.execCommand('hiliteColor', false, value);
      return;
    }

    const span = document.createElement('span');
    span.style.setProperty(property, value);
    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      savedRangeRef.current = newRange;
      onUpdateTemplateHtml(editorRef.current.innerHTML);
    } catch (e) {
      console.warn('Lỗi áp dụng style inline:', e);
    }
  };

  // Chèn bảng biểu
  const insertTable = (rows: number, cols: number) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 14px 0; border: 1px solid #94a3b8;"><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        const isHeader = r === 0;
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px 10px; min-width: 60px; font-weight: ${isHeader ? 'bold' : 'normal'}; background: ${isHeader ? '#f8fafc' : '#ffffff'};">${isHeader ? `Cột ${c + 1}` : 'Nội dung'}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current && !isPreviewMode) {
      onUpdateTemplateHtml(editorRef.current.innerHTML);
    }
  };

  const fontFamilyStyle = settings.preserveOriginalFormat ? 'inherit' : selectedFont.family;
  const fontSizeStyle = settings.preserveOriginalFormat ? 'inherit' : settings.fontSize;
  const lineHeightStyle = settings.preserveOriginalFormat ? 'inherit' : settings.lineHeight;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Thanh điều khiển chính trên cùng */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2.5">
        {/* Nhóm 1: Chuyển đổi Chế độ */}
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shadow-2xs">
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !isPreviewMode
                ? theme ? theme.primaryBtn : 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chế độ Soạn thảo</span>
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPreviewMode
                ? theme ? theme.primaryBtn : 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước Dữ liệu</span>
          </button>
        </div>

        {/* Nhóm 2: Điều hướng bản ghi Excel */}
        {totalRecords > 0 && (
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              onClick={onFirstRecord}
              disabled={currentIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Về bản ghi đầu tiên"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onPrevRecord}
              disabled={currentIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Bản ghi trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs px-1 font-medium text-slate-700">
              <span className="hidden sm:inline">Bản ghi</span>
              <input
                type="number"
                min={1}
                max={totalRecords}
                value={currentIndex + 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalRecords) {
                    onJumpToRecord(val - 1);
                  }
                }}
                className={`w-11 text-center py-0.5 border border-slate-300 rounded font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme ? theme.accentText : 'text-blue-700'}`}
              />
              <span>/ <strong>{totalRecords}</strong></span>
            </div>

            <button
              onClick={onNextRecord}
              disabled={currentIndex >= totalRecords - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Bản ghi kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLastRecord}
              disabled={currentIndex >= totalRecords - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Đến bản ghi cuối cùng"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nhóm 3: Các nút In & Xuất file chuyên nghiệp */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onPrintCurrent}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${
              theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="In hoặc Lưu thành PDF bản ghi hiện tại qua trình duyệt (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In bản ghi này</span>
          </button>

          {totalRecords > 1 && (
            <button
              onClick={onPrintAll}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                theme ? `${theme.accentBg} ${theme.accentText} ${theme.accentBorder} hover:brightness-95` : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
              title="In hàng loạt hoặc xuất toàn bộ tất cả bản ghi ra PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In tất cả ({totalRecords})</span>
            </button>
          )}

          <button
            onClick={onExportDocxCurrent}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Xuất bản ghi hiện tại ra file Word (.docx) giữ nguyên 100% format gốc"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất .DOCX</span>
          </button>

          {totalRecords > 1 && (
            <button
              onClick={onExportSingleDocxAll}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-2xs ${
                theme ? `${theme.accentBg} ${theme.accentText} ${theme.accentBorder} hover:brightness-95` : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
              title="Xuất toàn bộ tất cả bản ghi vào 1 file Word .docx duy nhất (tách từng trang chuẩn)"
            >
              <Files className="w-3.5 h-3.5" />
              <span>Gộp 1 file .DOCX ({totalRecords})</span>
            </button>
          )}

          {totalRecords > 1 && (
            <button
              onClick={onExportZipAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Trộn tất cả các dòng và đóng gói thành file .ZIP chứa từng file docx riêng"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Gói ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* THANH CÔNG CỤ SOẠN THẢO MỞ RỘNG (CHUYÊN NGHIỆP KIỂU MICROSOFT WORD) */}
      {!isPreviewMode && (
        <div className="bg-white border-b border-slate-200 p-2 sm:px-4 flex flex-wrap items-center gap-1 text-xs text-slate-700 shadow-2xs">
          {/* Lịch sử */}
          <button
            onClick={() => execFormat('undo')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title="Hoàn tác (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('redo')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title="Làm lại (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Kiểu đoạn văn (Heading / Normal) */}
          <select
            onChange={(e) => execFormat('formatBlock', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            defaultValue="p"
          >
            <option value="p">Đoạn văn (Normal)</option>
            <option value="h1">Tiêu đề 1 (H1)</option>
            <option value="h2">Tiêu đề 2 (H2)</option>
            <option value="h3">Tiêu đề 3 (H3)</option>
          </select>

          {/* Cỡ chữ lựa chọn nhanh */}
          <select
            onChange={(e) => applyInlineStyle('font-size', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Cỡ chữ...</option>
            <option value="11pt">11 pt</option>
            <option value="12pt">12 pt</option>
            <option value="13pt">13 pt (Chuẩn NĐ 30)</option>
            <option value="14pt">14 pt (Chuẩn NĐ 30)</option>
            <option value="16pt">16 pt</option>
            <option value="18pt">18 pt (Tiêu đề lớn)</option>
            <option value="20pt">20 pt</option>
            <option value="24pt">24 pt</option>
          </select>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Định dạng phông chữ */}
          <button
            onClick={() => execFormat('bold')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 font-bold"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('italic')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 italic"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('underline')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 underline"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('strikeThrough')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 line-through"
            title="Gạch ngang chữ"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Màu chữ (Color picker) */}
          <div className="flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50" title="Màu chữ">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                applyInlineStyle('color', e.target.value);
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Chọn màu chữ"
            />
          </div>

          {/* Màu nền / Highlight */}
          <div className="flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50" title="Màu đánh dấu nền chữ">
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => {
                setHighlightColor(e.target.value);
                applyInlineStyle('background-color', e.target.value);
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Chọn màu nền chữ"
            />
          </div>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Căn lề */}
          <button
            onClick={() => execFormat('justifyLeft')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Canh trái"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('justifyCenter')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Canh giữa"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('justifyRight')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Canh phải"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('justifyFull')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Căn đều hai bên"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Danh sách & Thụt lề */}
          <button
            onClick={() => execFormat('insertUnorderedList')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('insertOrderedList')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Danh sách số thứ tự"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('outdent')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Giảm lề dòng"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('indent')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Tăng lề dòng"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Chèn bảng & Đường kẻ */}
          <button
            onClick={() => insertTable(3, 3)}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1"
            title="Chèn bảng biểu 3x3"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden md:inline">Bảng</span>
          </button>
          <button
            onClick={() => execFormat('insertHorizontalRule')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1"
            title="Chèn đường kẻ ngang phân cách"
          >
            <Minus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden md:inline">Kẻ ngang</span>
          </button>
          <button
            onClick={() => execFormat('removeFormat')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-rose-600"
            title="Xóa định dạng (Trở về mặc định)"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Thông tin font & chế độ hiển thị */}
      <div className="bg-slate-100/70 px-4 py-2 text-xs text-slate-600 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>Định dạng áp dụng:</span>
          {settings.preserveOriginalFormat ? (
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              Giữ nguyên font chữ và định dạng ban đầu của file Word gốc
            </span>
          ) : (
            <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {selectedFont.name} · {settings.fontSize} · Giãn dòng {settings.lineHeight}
            </span>
          )}
        </div>

        <div className="text-[11px]">
          {isPreviewMode ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-600" /> Đang xem trước dữ liệu thực tế (Các biến kế thừa đầy đủ định dạng văn bản khi in)
            </span>
          ) : (
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-blue-600" /> Chế độ soạn thảo (Bôi đen/Click văn bản để định dạng hoặc chèn biến)
            </span>
          )}
        </div>
      </div>

      {/* Vùng hiển thị trang giấy A4 mô phỏng chuẩn in (Cuộn độc lập) */}
      <div className="p-4 sm:p-6 bg-slate-200/60 overflow-x-auto flex justify-center min-h-[700px]">
        <div
          id="printable-document"
          className="print-page bg-white shadow-xl rounded-sm transition-all relative"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm 20mm 20mm 25mm', // Chuẩn lề văn bản hành chính Việt Nam (Nghị định 30)
            boxSizing: 'border-box'
          }}
        >
          {/* Vùng soạn thảo / Preview có thể chỉnh sửa */}
          <div
            ref={editorRef}
            contentEditable={!isPreviewMode}
            onInput={handleInput}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            onFocus={saveSelection}
            suppressContentEditableWarning
            className="document-content outline-none focus:ring-0 min-h-[800px]"
            style={{
              fontFamily: fontFamilyStyle,
              fontSize: fontSizeStyle,
              lineHeight: lineHeightStyle,
              color: '#111827'
            }}
          />
        </div>
      </div>
    </div>
  );
});

DocumentEditorPreview.displayName = 'DocumentEditorPreview';
