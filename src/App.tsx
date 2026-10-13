import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { FileImportSection } from './components/FileImportSection';
import { TopFormatBar } from './components/TopFormatBar';
import { ExcelColumnsSidebar } from './components/ExcelColumnsSidebar';
import { DocumentEditorPreview, DocumentEditorHandle } from './components/DocumentEditorPreview';
import { GuideTab } from './components/GuideTab';
import { ChangelogTab } from './components/ChangelogTab';
import { AuthorTab } from './components/AuthorTab';
import { CoffeeTab } from './components/CoffeeTab';
import { Footer } from './components/Footer';
import { DocumentSettings, ExcelSheetData } from './types';
import {
  DEFAULT_SAMPLE_TEMPLATE_HTML,
  getDefaultSampleDocxBuffer,
  extractHtmlFromDocx,
  renderMergedHtml,
  generateMergedDocx,
  generateMergedSingleDocx,
  generateBulkZip,
  printIsolatedDocument
} from './lib/docxHelper';
import { readExcelFile, extractSheetData, getSampleExcelData } from './lib/excelHelper';
import { saveAs } from 'file-saver';
import { VIETNAMESE_FONTS } from './lib/fonts';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'merge' | 'guide' | 'changelog' | 'author' | 'coffee'>('merge');

  // Ref kết nối tới DocumentEditorPreview
  const editorRef = useRef<DocumentEditorHandle>(null);

  // Trạng thái Word template - Nạp sẵn binary mẫu .docx để đảm bảo 100% giữ định dạng
  const [wordFileName, setWordFileName] = useState<string | null>('Mau_Giay_Moi_Hoi_Nghi_2026.docx');
  const [wordBuffer, setWordBuffer] = useState<ArrayBuffer | null>(() => getDefaultSampleDocxBuffer());
  const [templateHtml, setTemplateHtml] = useState<string>(DEFAULT_SAMPLE_TEMPLATE_HTML);
  const [detectedWordTags, setDetectedWordTags] = useState<string[]>([]);

  // Trạng thái Excel
  const [excelFileName, setExcelFileName] = useState<string | null>('DanhSach_DaiBieu_2026.xlsx');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>(['DanhSachMoi']);
  const [activeSheet, setActiveSheet] = useState<string>('DanhSachMoi');
  const [excelData, setExcelData] = useState<ExcelSheetData>(getSampleExcelData());

  // Trạng thái Duyệt bản ghi
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true);

  // Cấu hình Định dạng văn bản
  const [settings, setSettings] = useState<DocumentSettings>({
    fontId: 'be-vietnam',
    fontSize: '13pt',
    lineHeight: '1.4',
    textAlign: 'justify',
    preserveOriginalFormat: false,
    pageMargin: 'normal'
  });

  // Trạng thái Xuất file & Thông báo
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  // Bản ghi hiện tại
  const currentRow = excelData.rows.length > 0 ? excelData.rows[currentIndex] || null : null;
  const selectedFont = VIETNAMESE_FONTS.find(f => f.id === settings.fontId) || VIETNAMESE_FONTS[0];

  // Cập nhật cấu hình
  const handleUpdateSettings = (newSettings: Partial<DocumentSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Nạp file Word
  const handleWordUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      setWordBuffer(buffer);
      setWordFileName(file.name);
      const { html, tags } = await extractHtmlFromDocx(buffer);
      setTemplateHtml(html);
      setDetectedWordTags(tags);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đọc file Word.');
    }
  };

  // Nạp file Excel
  const handleExcelUpload = async (file: File) => {
    try {
      const parsed = await readExcelFile(file);
      setWorkbook(parsed.workbook);
      setSheetNames(parsed.sheetNames);
      setActiveSheet(parsed.activeSheet);
      setExcelData(parsed.data);
      setExcelFileName(file.name);
      setCurrentIndex(0);
      setIsPreviewMode(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đọc file Excel.');
    }
  };

  // Chọn Sheet
  const handleSelectSheet = (sheetName: string) => {
    if (!workbook) return;
    const data = extractSheetData(workbook, sheetName);
    setActiveSheet(sheetName);
    setExcelData(data);
    setCurrentIndex(0);
  };

  // Dùng thử mẫu có sẵn (Luôn nạp cả binary .docx mẫu chuẩn)
  const handleLoadSample = () => {
    const sample = getSampleExcelData();
    const sampleBuffer = getDefaultSampleDocxBuffer();
    setWordBuffer(sampleBuffer);
    setTemplateHtml(DEFAULT_SAMPLE_TEMPLATE_HTML);
    setWordFileName('Mau_Giay_Moi_Hoi_Nghi_2026.docx');
    setExcelFileName('DanhSach_DaiBieu_2026.xlsx');
    setSheetNames(['DanhSachMoi']);
    setActiveSheet('DanhSachMoi');
    setExcelData(sample);
    setCurrentIndex(0);
    setIsPreviewMode(true);
  };

  // Xóa danh sách import (Clear Import Standard)
  const handleClearImport = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách import và làm sạch trạng thái?')) {
      setWordFileName(null);
      setWordBuffer(null);
      setExcelFileName(null);
      setWorkbook(null);
      setSheetNames([]);
      setActiveSheet('');
      setExcelData({ sheetName: '', headers: [], rows: [], totalRows: 0 });
      setCurrentIndex(0);
      setTemplateHtml(DEFAULT_SAMPLE_TEMPLATE_HTML);
      setIsPreviewMode(false);
    }
  };

  // Chèn tag vào vị trí con trỏ hoặc thay thế chữ bôi đen
  const handleInsertTag = (tag: string) => {
    editorRef.current?.insertTag(tag);
  };

  // In bản ghi hiện tại qua iframe cách ly (CHỈ in nội dung văn bản, không in giao diện web)
  const handlePrintCurrent = () => {
    const mergedHtml = renderMergedHtml(templateHtml, currentRow, true);
    const font = settings.preserveOriginalFormat ? 'Times New Roman, serif' : selectedFont.family;
    const size = settings.preserveOriginalFormat ? '13pt' : settings.fontSize;
    const lineH = settings.preserveOriginalFormat ? '1.4' : settings.lineHeight;

    printIsolatedDocument([mergedHtml], font, size, lineH);
  };

  // In toàn bộ bản ghi qua iframe cách ly (Mỗi bản ghi 1 trang chuẩn A4)
  const handlePrintAll = () => {
    if (excelData.rows.length === 0) {
      alert('Không có dữ liệu bản ghi để in.');
      return;
    }

    const pagesHtml = excelData.rows.map(row => renderMergedHtml(templateHtml, row, true));
    const font = settings.preserveOriginalFormat ? 'Times New Roman, serif' : selectedFont.family;
    const size = settings.preserveOriginalFormat ? '13pt' : settings.fontSize;
    const lineH = settings.preserveOriginalFormat ? '1.4' : settings.lineHeight;

    printIsolatedDocument(pagesHtml, font, size, lineH);
  };

  // Xuất bản ghi hiện tại ra file Word (.docx) giữ nguyên 100% định dạng gốc
  const handleExportDocxCurrent = () => {
    if (!currentRow) {
      alert('Chưa có dữ liệu bản ghi.');
      return;
    }

    const buffer = wordBuffer || getDefaultSampleDocxBuffer();
    try {
      const outBlob = generateMergedDocx(buffer, currentRow);
      const name = currentRow.HoVaTen
        ? `VanBan_${sanitizeName(String(currentRow.HoVaTen))}.docx`
        : `VanBan_BanGhi_${currentIndex + 1}.docx`;
      saveAs(outBlob, name);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xuất file docx.');
    }
  };

  // Xuất TOÀN BỘ tất cả bản ghi vào 1 FILE WORD (.DOCX) DUY NHẤT
  const handleExportSingleDocxAll = () => {
    if (excelData.rows.length === 0) {
      alert('Không có dữ liệu trong file Excel.');
      return;
    }

    const buffer = wordBuffer || getDefaultSampleDocxBuffer();
    setIsExporting(true);
    setExportMessage(`Đang gộp ${excelData.rows.length} văn bản vào 1 file Word duy nhất...`);

    setTimeout(() => {
      try {
        const outBlob = generateMergedSingleDocx(buffer, excelData.rows);
        const name = `Tron_Thu_Gop_Tat_Ca_${excelData.rows.length}_Trang.docx`;
        saveAs(outBlob, name);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xuất file Word gộp.');
      } finally {
        setIsExporting(false);
        setExportMessage('');
      }
    }, 100);
  };

  // Xuất tất cả bản ghi vào file ZIP (mỗi bản ghi 1 file .docx riêng)
  const handleExportZipAll = async () => {
    if (excelData.rows.length === 0) {
      alert('Không có dữ liệu trong file Excel.');
      return;
    }

    const buffer = wordBuffer || getDefaultSampleDocxBuffer();
    setIsExporting(true);
    setExportMessage(`Đang trộn và đóng gói ${excelData.rows.length} văn bản...`);

    try {
      const zipBlob = await generateBulkZip(
        buffer,
        excelData.rows,
        'HoVaTen',
        (curr, total) => {
          setExportMessage(`Đang xử lý bản ghi ${curr} / ${total}...`);
        }
      );
      saveAs(zipBlob, `Tron_Thu_Hang_Loat_${excelData.rows.length}_VanBan.zip`);
    } catch (err: any) {
      alert(err.message || 'Lỗi xuất file ZIP.');
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  function sanitizeName(name: string) {
    return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-be-vietnam">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wordLoaded={Boolean(wordFileName)}
        excelLoaded={Boolean(excelFileName && excelData.rows.length > 0)}
        totalRecords={excelData.rows.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Loading overlay khi xuất ZIP hoặc gộp DOCX */}
        {isExporting && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Đang xử lý dữ liệu</h3>
                <p className="text-xs text-slate-500 mt-1">{exportMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Nội dung */}
        {activeTab === 'merge' && (
          <div className="space-y-4">
            {/* Bước 1: Nạp file Word & Excel */}
            <FileImportSection
              onWordUpload={handleWordUpload}
              onExcelUpload={handleExcelUpload}
              onLoadSample={handleLoadSample}
              onClearImport={handleClearImport}
              wordFileName={wordFileName}
              excelFileName={excelFileName}
              totalRecords={excelData.rows.length}
              totalColumns={excelData.headers.length}
            />

            {/* Bước 2: Thanh điều khiển Chọn Sheet & Cấu hình Font chữ */}
            <TopFormatBar
              sheetNames={sheetNames}
              activeSheet={activeSheet}
              onSelectSheet={handleSelectSheet}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              totalRecords={excelData.rows.length}
              totalColumns={excelData.headers.length}
            />

            {/* Bố cục 2 cột: Cột trái Word (cuộn độc lập) & Cột phải Cột Excel (cố định sticky) */}
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* Cột trái: Văn bản Word */}
              <div className="flex-1 w-full min-w-0">
                <DocumentEditorPreview
                  ref={editorRef}
                  templateHtml={templateHtml}
                  onUpdateTemplateHtml={setTemplateHtml}
                  currentRow={currentRow}
                  currentIndex={currentIndex}
                  totalRecords={excelData.rows.length}
                  onPrevRecord={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  onNextRecord={() => setCurrentIndex(prev => Math.min(excelData.rows.length - 1, prev + 1))}
                  onFirstRecord={() => setCurrentIndex(0)}
                  onLastRecord={() => setCurrentIndex(excelData.rows.length - 1)}
                  onJumpToRecord={(idx) => setCurrentIndex(idx)}
                  settings={settings}
                  isPreviewMode={isPreviewMode}
                  setIsPreviewMode={setIsPreviewMode}
                  onPrintCurrent={handlePrintCurrent}
                  onPrintAll={handlePrintAll}
                  onExportDocxCurrent={handleExportDocxCurrent}
                  onExportSingleDocxAll={handleExportSingleDocxAll}
                  onExportZipAll={handleExportZipAll}
                  hasTemplate={Boolean(templateHtml)}
                  hasExcel={excelData.rows.length > 0}
                />
              </div>

              {/* Cột phải: Thanh Cột Excel khả dụng (Cố định vị trí sticky) */}
              <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-20">
                <ExcelColumnsSidebar
                  headers={excelData.headers}
                  sampleRow={currentRow}
                  currentIndex={currentIndex}
                  totalRecords={excelData.rows.length}
                  onPrevRecord={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  onNextRecord={() => setCurrentIndex(prev => Math.min(excelData.rows.length - 1, prev + 1))}
                  onInsertTag={handleInsertTag}
                  activeSheet={activeSheet}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && <GuideTab />}
        {activeTab === 'changelog' && <ChangelogTab />}
        {activeTab === 'author' && <AuthorTab />}
        {activeTab === 'coffee' && <CoffeeTab />}
      </main>

      {/* Footer */}
      <Footer onOpenTab={(tab) => setActiveTab(tab)} />
    </div>
  );
};

export default App;
