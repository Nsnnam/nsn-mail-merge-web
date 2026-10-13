import React, { useRef, useEffect } from 'react';
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Printer,
  FileDown,
  Sparkles
} from 'lucide-react';
import { DocumentSettings } from '../types';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { renderMergedHtml } from '../lib/docxHelper';

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
  onExportZipAll: () => void;
  hasTemplate: boolean;
  hasExcel: boolean;
}

export const DocumentEditorPreview: React.FC<DocumentEditorPreviewProps> = ({
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
  onExportZipAll,
  hasTemplate,
  hasExcel
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectedFont = VIETNAMESE_FONTS.find(f => f.id === settings.fontId) || VIETNAMESE_FONTS[0];

  // Đồng bộ nội dung vào editor khi chuyển chế độ hoặc sửa template
  useEffect(() => {
    if (editorRef.current) {
      if (isPreviewMode) {
        editorRef.current.innerHTML = renderMergedHtml(templateHtml, currentRow);
      } else {
        editorRef.current.innerHTML = templateHtml;
      }
    }
  }, [templateHtml, currentRow, isPreviewMode]);

  // Xử lý sự kiện chỉnh sửa nội dung khi ở chế độ edit
  const handleInput = () => {
    if (!isPreviewMode && editorRef.current) {
      onUpdateTemplateHtml(editorRef.current.innerHTML);
    }
  };

  // Các lệnh định dạng văn bản (Rich text formatting)
  const execFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current && !isPreviewMode) {
      onUpdateTemplateHtml(editorRef.current.innerHTML);
    }
  };

  const fontFamilyStyle = settings.preserveOriginalFormat ? 'inherit' : selectedFont.family;
  const fontSizeStyle = settings.preserveOriginalFormat ? 'inherit' : settings.fontSize;
  const lineHeightStyle = settings.preserveOriginalFormat ? 'inherit' : settings.lineHeight;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Thanh điều khiển trên cùng (Toolbar) */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        {/* Nhóm 1: Chuyển đổi Chế độ Chỉnh sửa / Xem trước */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shadow-2xs">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                !isPreviewMode
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chế độ Soạn thảo</span>
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPreviewMode
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước Dữ liệu</span>
            </button>
          </div>

          {/* Công cụ định dạng Rich text (chỉ hiện khi đang ở chế độ Soạn thảo) */}
          {!isPreviewMode && (
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-200">
              <button
                onClick={() => execFormat('bold')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
                title="In đậm (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execFormat('italic')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic"
                title="In nghiêng (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execFormat('underline')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700 underline"
                title="Gạch chân (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-slate-300 mx-1"></span>
              <button
                onClick={() => execFormat('justifyLeft')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
                title="Canh trái"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execFormat('justifyCenter')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
                title="Canh giữa"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execFormat('justifyRight')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
                title="Canh phải"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execFormat('justifyFull')}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
                title="Căn đều hai bên"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Nhóm 2: Điều hướng bản ghi Excel */}
        {totalRecords > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-300 shadow-2xs">
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

            <div className="flex items-center gap-1 text-xs px-2 font-medium text-slate-700">
              <span>Bản ghi</span>
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
                className="w-12 text-center py-0.5 border border-slate-300 rounded font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        {/* Nhóm 3: Các nút hành động In & Xuất file */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onPrintCurrent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
            title="In hoặc Lưu thành PDF bản ghi hiện tại qua trình duyệt (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In bản ghi này</span>
          </button>

          {totalRecords > 1 && (
            <button
              onClick={onPrintAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              title="In hàng loạt hoặc xuất toàn bộ tất cả bản ghi ra PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>In tất cả ({totalRecords})</span>
            </button>
          )}

          <button
            onClick={onExportDocxCurrent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Xuất bản ghi hiện tại ra file Word (.docx) giữ nguyên format gốc"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất .DOCX</span>
          </button>

          {totalRecords > 1 && (
            <button
              onClick={onExportZipAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Trộn tất cả các dòng và đóng gói toàn bộ vào file nén .ZIP"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Gói ZIP ({totalRecords})</span>
            </button>
          )}
        </div>
      </div>

      {/* Thông tin font đang áp dụng */}
      <div className="bg-slate-100/60 px-4 py-2 text-xs text-slate-600 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>Định dạng áp dụng:</span>
          {settings.preserveOriginalFormat ? (
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              Giữ nguyên font &amp; cỡ chữ ban đầu của file Word
            </span>
          ) : (
            <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Font: {selectedFont.name} · Cỡ: {settings.fontSize} · Giãn dòng: {settings.lineHeight}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          {isPreviewMode ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-600" /> Đang xem trước dữ liệu thực tế (Chế độ đọc)
            </span>
          ) : (
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-blue-600" /> Đang ở chế độ chỉnh sửa (Click vào văn bản để sửa nội dung)
            </span>
          )}
        </div>
      </div>

      {/* Vùng hiển thị trang giấy A4 mô phỏng chuẩn in */}
      <div className="p-4 sm:p-8 bg-slate-200/60 overflow-x-auto flex justify-center min-h-[700px]">
        <div
          className="print-page bg-white shadow-xl rounded-sm transition-all relative"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm 20mm 20mm 25mm', // Chuẩn lề văn bản hành chính Việt Nam (trên 20, dưới 20, phải 20, trái 25mm)
            boxSizing: 'border-box'
          }}
        >
          {/* Vùng soạn thảo / Preview có thể chỉnh sửa */}
          <div
            ref={editorRef}
            contentEditable={!isPreviewMode}
            onInput={handleInput}
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
};
