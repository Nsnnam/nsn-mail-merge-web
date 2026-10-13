import React, { useRef, useState } from 'react';
import {
  FileUp,
  Table,
  Sparkles,
  Trash2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Download,
  CheckSquare,
  Square,
  FileText,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { exportSampleExcelFile } from '../lib/excelHelper';
import { UploadedWordItem, UploadedExcelItem } from '../types';
import { ThemeGradient } from '../lib/theme';

interface FileImportSectionProps {
  onWordUploadMultiple: (files: File[]) => void;
  onExcelUploadMultiple: (files: File[]) => void;
  onLoadSample: () => void;
  onClearImport: () => void;
  wordFiles: UploadedWordItem[];
  activeWordId: string | null;
  onSelectActiveWord: (id: string) => void;
  onDeleteWordFiles: (ids: string[]) => void;
  excelFiles: UploadedExcelItem[];
  activeExcelId: string | null;
  onSelectActiveExcel: (id: string) => void;
  onDeleteExcelFiles: (ids: string[]) => void;
  totalRecords: number;
  totalColumns: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: ThemeGradient;
}

export const FileImportSection: React.FC<FileImportSectionProps> = ({
  onWordUploadMultiple,
  onExcelUploadMultiple,
  onLoadSample,
  onClearImport,
  wordFiles,
  activeWordId,
  onSelectActiveWord,
  onDeleteWordFiles,
  excelFiles,
  activeExcelId,
  onSelectActiveExcel,
  onDeleteExcelFiles,
  totalRecords,
  totalColumns,
  isCollapsed,
  onToggleCollapse,
  theme
}) => {
  const wordInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Danh sách checkbox được chọn để xóa hàng loạt
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [selectedExcelIds, setSelectedExcelIds] = useState<string[]>([]);

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onWordUploadMultiple(filesArray);
      e.target.value = '';
    }
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onExcelUploadMultiple(filesArray);
      e.target.value = '';
    }
  };

  // Chọn / bỏ chọn Word
  const toggleSelectWord = (id: string) => {
    setSelectedWordIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllWord = () => {
    if (selectedWordIds.length === wordFiles.length) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds(wordFiles.map(f => f.id));
    }
  };

  const handleBulkDeleteWord = () => {
    if (selectedWordIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedWordIds.length} file Word đã chọn?`)) {
      onDeleteWordFiles(selectedWordIds);
      setSelectedWordIds([]);
    }
  };

  // Chọn / bỏ chọn Excel
  const toggleSelectExcel = (id: string) => {
    setSelectedExcelIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllExcel = () => {
    if (selectedExcelIds.length === excelFiles.length) {
      setSelectedExcelIds([]);
    } else {
      setSelectedExcelIds(excelFiles.map(f => f.id));
    }
  };

  const handleBulkDeleteExcel = () => {
    if (selectedExcelIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedExcelIds.length} file Excel đã chọn?`)) {
      onDeleteExcelFiles(selectedExcelIds);
      setSelectedExcelIds([]);
    }
  };

  const activeWordFile = wordFiles.find(f => f.id === activeWordId) || wordFiles[0] || null;
  const activeExcelFile = excelFiles.find(f => f.id === activeExcelId) || excelFiles[0] || null;
  const hasFiles = wordFiles.length > 0 || excelFiles.length > 0;

  // Format dung lượng tệp
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // KHI ĐƯỢC THU GỌN: Hiển thị thanh tóm tắt siêu gọn để tối ưu không gian làm việc
  if (isCollapsed && hasFiles) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5 transition-all">
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Tệp đang làm việc:</span>
          </span>

          {activeWordFile && (
            <span
              className={`px-2 py-0.5 rounded-md font-medium truncate max-w-[260px] border ${theme.activeBadge}`}
              title={`${activeWordFile.name} (${wordFiles.length} tệp Word đã nạp)`}
            >
              📄 Word: <strong className="font-semibold">{activeWordFile.name}</strong>
              {wordFiles.length > 1 && <span className="opacity-75 text-[10px] ml-1">+{wordFiles.length - 1}</span>}
            </span>
          )}

          {activeExcelFile && (
            <span
              className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium truncate max-w-[300px]"
              title={`${activeExcelFile.name} (${excelFiles.length} tệp Excel đã nạp)`}
            >
              📊 Excel: <strong className="font-semibold">{activeExcelFile.name}</strong> ({totalRecords} dòng, {totalColumns} cột)
              {excelFiles.length > 1 && <span className="opacity-75 text-[10px] ml-1">+{excelFiles.length - 1}</span>}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleCollapse}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
            title="Mở rộng danh sách quản lý tệp, thêm file hoặc xóa hàng loạt"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Quản lý tệp ({wordFiles.length + excelFiles.length})</span>
          </button>

          <button
            onClick={onLoadSample}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`}
            title="Nạp lại dữ liệu mẫu thử nghiệm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mẫu thử</span>
          </button>

          <button
            onClick={onClearImport}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Xóa toàn bộ các tệp đã nạp"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Xóa tất cả</span>
          </button>
        </div>
      </div>
    );
  }

  // KHI MỞ RỘNG (Khởi tạo ban đầu hoặc khi người dùng mở): Hiển thị đầy đủ khu vực kéo thả nạp nhiều file và quản lý xóa hàng loạt
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${theme.primaryBtn}`}>
              1
            </span>
            Nhập tài liệu mẫu Word &amp; Bảng tính Excel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cho phép chọn hoặc kéo thả <strong>nhiều file cùng lúc</strong>. Tự động bảo toàn 100% định dạng bảng, màu sắc và kiểu chữ gốc.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasFiles && (
            <button
              onClick={onToggleCollapse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
              title="Thu gọn bảng nạp file để tập trung chỉnh sửa văn bản"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Thu gọn bảng nạp</span>
            </button>
          )}

          <button
            onClick={onLoadSample}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${theme.primaryBtn}`}
            title="Nạp ngay mẫu Word Giấy mời và dữ liệu Excel đại biểu để thử nghiệm"
          >
            <Sparkles className="w-3.5 h-3.5" />
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

          {hasFiles && (
            <button
              onClick={onClearImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Dọn dẹp sạch danh sách import và đặt lại trạng thái ban đầu"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {/* 2 Khung kéo thả tệp (Hỗ trợ nạp nhiều file cùng lúc) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3.5">
        {/* Khối nạp Word */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-4 transition-all flex flex-col justify-between group">
          <input
            ref={wordInputRef}
            type="file"
            multiple
            accept=".docx"
            onChange={handleWordChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Kéo thả hoặc click chọn nhiều file Word .docx"
          />
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">File Word mẫu (.docx)</span>
                {wordFiles.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    <FileCheck className="w-3 h-3 text-blue-600" /> Đã nạp {wordFiles.length} tệp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kéo thả một hoặc <strong>nhiều file Word (.docx)</strong> vào đây hoặc click để chọn từ máy tính.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Bảo toàn màu sắc, bảng biểu &amp; MERGEFIELD</span>
            <span className="text-blue-600 font-semibold group-hover:underline">Chọn nhiều file...</span>
          </div>
        </div>

        {/* Khối nạp Excel */}
        <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-xl p-4 transition-all flex flex-col justify-between group">
          <input
            ref={excelInputRef}
            type="file"
            multiple
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Kéo thả hoặc click chọn nhiều file Excel .xlsx"
          />
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">File Bảng tính Excel (.xlsx, .xls)</span>
                {excelFiles.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    <FileCheck className="w-3 h-3 text-emerald-600" /> Đã nạp {excelFiles.length} tệp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kéo thả một hoặc <strong>nhiều file Excel/CSV</strong> chứa danh sách dữ liệu cần trộn.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hỗ trợ .xlsx, .xls, .csv</span>
            <span className="text-emerald-600 font-semibold group-hover:underline">Chọn nhiều file...</span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH TỆP & CHỨC NĂNG XÓA HÀNG LOẠT */}
      {hasFiles && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
          {/* Quản lý danh sách file Word */}
          {wordFiles.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAllWord}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold"
                    title={selectedWordIds.length === wordFiles.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  >
                    {selectedWordIds.length === wordFiles.length && wordFiles.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Tệp Word ({wordFiles.length})</span>
                  </button>
                </div>

                {selectedWordIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteWord}
                    className="text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    Xóa ({selectedWordIds.length}) tệp đã chọn
                  </button>
                )}
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {wordFiles.map(file => {
                  const isActive = file.id === activeWordId;
                  const isChecked = selectedWordIds.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between gap-2 p-1.5 rounded-md text-xs border transition-all ${
                        isActive
                          ? 'bg-blue-50/80 border-blue-300 font-semibold text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => toggleSelectWord(file.id)}
                          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onSelectActiveWord(file.id)}
                          className="flex items-center gap-1.5 text-left truncate"
                          title="Bấm để kích hoạt file mẫu này vào editor"
                        >
                          <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">({formatSize(file.size)})</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isActive ? (
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                            Đang dùng
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelectActiveWord(file.id)}
                            className="text-[10px] text-slate-500 hover:text-blue-700 font-medium"
                          >
                            Chọn
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteWordFiles([file.id])}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Xóa tệp này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quản lý danh sách file Excel */}
          {excelFiles.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAllExcel}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold"
                    title={selectedExcelIds.length === excelFiles.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  >
                    {selectedExcelIds.length === excelFiles.length && excelFiles.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Tệp Excel ({excelFiles.length})</span>
                  </button>
                </div>

                {selectedExcelIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteExcel}
                    className="text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    Xóa ({selectedExcelIds.length}) tệp đã chọn
                  </button>
                )}
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {excelFiles.map(file => {
                  const isActive = file.id === activeExcelId;
                  const isChecked = selectedExcelIds.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between gap-2 p-1.5 rounded-md text-xs border transition-all ${
                        isActive
                          ? 'bg-emerald-50/80 border-emerald-300 font-semibold text-emerald-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => toggleSelectExcel(file.id)}
                          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onSelectActiveExcel(file.id)}
                          className="flex items-center gap-1.5 text-left truncate"
                          title="Bấm để kích hoạt bảng tính này"
                        >
                          <Table className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            ({file.data.totalRows} dòng)
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isActive ? (
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                            Đang dùng
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelectActiveExcel(file.id)}
                            className="text-[10px] text-slate-500 hover:text-emerald-700 font-medium"
                          >
                            Chọn
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteExcelFiles([file.id])}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Xóa tệp này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
