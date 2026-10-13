import React, { useRef } from 'react';
import { FileUp, Table, Sparkles, Trash2, FileCheck, AlertCircle, Download } from 'lucide-react';
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
}

export const FileImportSection: React.FC<FileImportSectionProps> = ({
  onWordUpload,
  onExcelUpload,
  onLoadSample,
  onClearImport,
  wordFileName,
  excelFileName,
  totalRecords,
  totalColumns
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            Nhập tài liệu mẫu Word &amp; Bảng tính Excel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải lên mẫu văn bản chứa các biến {'{{Ten_Cot}}'} và file Excel danh sách cần trộn.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            Xóa danh sách import
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Khối nạp Word */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-4 transition-all flex flex-col justify-between">
          <input
            ref={wordInputRef}
            type="file"
            accept=".docx"
            onChange={handleWordChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">File Word mẫu (.docx)</span>
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
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hỗ trợ định dạng .docx chuẩn Microsoft Word</span>
            <span className="text-blue-600 font-medium">Chọn file...</span>
          </div>
        </div>

        {/* Khối nạp Excel */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-xl p-4 transition-all flex flex-col justify-between">
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">File Bảng tính Excel (.xlsx, .xls)</span>
                {excelFileName && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    <FileCheck className="w-3 h-3 text-emerald-600" /> Đã nạp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {excelFileName ? (
                  <span className="text-emerald-900 font-medium break-all">
                    {excelFileName} · <strong>{totalRecords}</strong> dòng dữ liệu · <strong>{totalColumns}</strong> cột
                  </span>
                ) : (
                  'Kéo thả file Excel hoặc click để chọn danh sách'
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hỗ trợ .xlsx, .xls, .csv tự động tách Sheet</span>
            <span className="text-emerald-600 font-medium">Chọn file...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
