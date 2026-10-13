import React, { useRef } from 'react';
import { FileUp, Table, Sparkles, Trash2, FileCheck, ChevronDown, ChevronUp, Download, FolderOpen } from 'lucide-react';
import { exportSampleExcelFile } from '../lib/excelHelper';

interface FileImportSectionProps {
  onWordUpload: (file: File) => void;
  onExcelUpload: (file: File) => void;
  onLoadSample: () => void;
  onClearImport: () => void;
  wordFileName: string | null;
  excelFileName: string | null;
  totalRecords: number;
  totalColumns: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const FileImportSection: React.FC<FileImportSectionProps> = ({
  onWordUpload,
  onExcelUpload,
  onLoadSample,
  onClearImport,
  wordFileName,
  excelFileName,
  totalRecords,
  totalColumns,
  isCollapsed,
  onToggleCollapse
}) => {
  const wordInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onWordUpload(e.target.files[0]);
    }
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onExcelUpload(e.target.files[0]);
    }
  };

  const handleClear = () => {
    if (wordInputRef.current) wordInputRef.current.value = '';
    if (excelInputRef.current) excelInputRef.current.value = '';
    onClearImport();
  };

  const hasFiles = Boolean(wordFileName || excelFileName);

  // KHI ĐƯỢC THU GỌN: Hiển thị thanh tóm tắt siêu gọn để tiết kiệm tối đa chiều cao màn hình
  if (isCollapsed && hasFiles) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5 transition-all">
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Tệp đã nạp:</span>
          </span>

          {wordFileName && (
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-medium truncate max-w-[240px]" title={wordFileName}>
              📄 Word: <strong className="font-semibold">{wordFileName}</strong>
            </span>
          )}

          {excelFileName && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium truncate max-w-[280px]" title={excelFileName}>
              📊 Excel: <strong className="font-semibold">{excelFileName}</strong> ({totalRecords} dòng, {totalColumns} cột)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleCollapse}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
            title="Mở lại bảng kéo thả nạp file Word và Excel"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Đổi file tệp</span>
          </button>

          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Nạp lại mẫu thử nghiệm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mẫu thử</span>
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Dọn dẹp sạch danh sách import và đặt lại trạng thái ban đầu"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Xóa danh sách</span>
          </button>
        </div>
      </div>
    );
  }

  // KHI MỞ RỘNG: Hiển thị đầy đủ khu vực kéo thả nạp file
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            Nhập tài liệu mẫu Word &amp; Bảng tính Excel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải lên mẫu văn bản chứa các biến {'{{Ten_Cot}}'} và file Excel danh sách cần trộn.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasFiles && (
            <button
              onClick={onToggleCollapse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
              title="Thu gọn bảng nạp file để tập trung làm việc trên văn bản"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Thu gọn bảng nạp</span>
            </button>
          )}

          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
            title="Nạp ngay mẫu Word Giấy mời và dữ liệu Excel 5 đại biểu để thử nghiệm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Dùng thử mẫu có sẵn
          </button>

          <button
            onClick={exportSampleExcelFile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Tải file Excel mẫu (.xlsx) về máy tính"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Tải mẫu Excel
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Dọn dẹp sạch danh sách import và đặt lại trạng thái ban đầu"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Xóa danh sách
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {/* Khối nạp Word */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-3.5 transition-all flex flex-col justify-between">
          <input
            ref={wordInputRef}
            type="file"
            accept=".docx"
            onChange={handleWordChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-xs sm:text-sm">File Word mẫu (.docx)</span>
                {wordFileName && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                    <FileCheck className="w-3 h-3 text-blue-600" /> Đã nạp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {wordFileName ? (
                  <span className="text-blue-900 font-medium break-all">{wordFileName}</span>
                ) : (
                  'Kéo thả file .docx hoặc click để chọn từ máy tính'
                )}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hỗ trợ định dạng .docx chuẩn Word</span>
            <span className="text-blue-600 font-semibold">Chọn file...</span>
          </div>
        </div>

        {/* Khối nạp Excel */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-xl p-3.5 transition-all flex flex-col justify-between">
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-xs sm:text-sm">File Bảng tính Excel (.xlsx, .xls)</span>
                {excelFileName && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    <FileCheck className="w-3 h-3 text-emerald-600" /> Đã nạp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {excelFileName ? (
                  <span className="text-emerald-900 font-medium break-all">
                    {excelFileName} · <strong>{totalRecords}</strong> dòng dữ liệu
                  </span>
                ) : (
                  'Kéo thả file Excel hoặc click để chọn danh sách'
                )}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hỗ trợ .xlsx, .xls, .csv</span>
            <span className="text-emerald-600 font-semibold">Chọn file...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
