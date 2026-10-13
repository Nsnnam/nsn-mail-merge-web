import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { FileImportSection } from './components/FileImportSection';
import { TopFormatBar } from './components/TopFormatBar';
import { ExcelColumnsSidebar } from './components/ExcelColumnsSidebar';
import { DocumentEditorPreview, DocumentEditorHandle } from './components/DocumentEditorPreview';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { GuideTab } from './components/GuideTab';
import { ChangelogTab } from './components/ChangelogTab';
import { AuthorTab } from './components/AuthorTab';
import { CoffeeTab } from './components/CoffeeTab';
import { Footer } from './components/Footer';
import { DocumentSettings, ExcelSheetData, UploadedWordItem, UploadedExcelItem } from './types';
import { SavedTemplateItem } from './lib/templateStorage';
import {
  DEFAULT_SAMPLE_TEMPLATE_HTML,
  getDefaultSampleDocxBuffer,
  extractHtmlFromDocx,
  renderMergedHtml,
  generateMergedDocx,
  generateMergedSingleDocx,
  generateBulkZip,
  printIsolatedDocument,
  getEffectiveMargin
} from './lib/docxHelper';
import { readExcelFile, extractSheetData, getSampleExcelData } from './lib/excelHelper';
import {
  THEME_GRADIENTS,
  UI_FONTS,
  getSavedTheme,
  saveTheme,
  getSavedUiFont,
  saveUiFont
} from './lib/theme';
import { saveAs } from 'file-saver';
import { VIETNAMESE_FONTS } from './lib/fonts';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const sanitizeName = (str: string) => str.replace(/[/\\?%*:|"<>]/g, '_').trim();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'merge' | 'guide' | 'changelog' | 'author' | 'coffee'>('merge');

  // Cài đặt Giao diện Gradient & Font chữ Web
  const [activeThemeId, setActiveThemeId] = useState<string>(() => getSavedTheme());
  const [activeFontId, setActiveFontId] = useState<string>(() => getSavedUiFont());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);

  const currentTheme = THEME_GRADIENTS.find(t => t.id === activeThemeId) || THEME_GRADIENTS[0];
  const currentUiFont = UI_FONTS.find(f => f.id === activeFontId) || UI_FONTS[0];

  const handleSelectTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    saveTheme(themeId);
  };

  const handleSelectUiFont = (fontId: string) => {
    setActiveFontId(fontId);
    saveUiFont(fontId);
  };

  // Ref kết nối tới DocumentEditorPreview
  const editorRef = useRef<DocumentEditorHandle>(null);

  // Trạng thái thu gọn bảng nạp tệp: Ban đầu KHÔNG thu gọn (hiển thị luôn phần import, nạp tệp vào mới ẩn đi)
  const [isImportCollapsed, setIsImportCollapsed] = useState<boolean>(false);

  // Danh sách tệp Word mẫu (Hỗ trợ nạp nhiều file cùng lúc & xóa hàng loạt)
  const [wordFiles, setWordFiles] = useState<UploadedWordItem[]>([]);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [wordFileName, setWordFileName] = useState<string | null>(null);
  const [wordBuffer, setWordBuffer] = useState<ArrayBuffer | null>(null);
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [detectedWordTags, setDetectedWordTags] = useState<string[]>([]);

  // Danh sách tệp Excel (Hỗ trợ nạp nhiều file cùng lúc & xóa hàng loạt)
  const [excelFiles, setExcelFiles] = useState<UploadedExcelItem[]>([]);
  const [activeExcelId, setActiveExcelId] = useState<string | null>(null);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [excelData, setExcelData] = useState<ExcelSheetData>({ sheetName: '', headers: [], rows: [], totalRows: 0 });

  // Trạng thái Duyệt bản ghi: Mặc định luôn là Chế độ Soạn thảo (Edit mode) khi import hoặc khởi tạo
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Cấu hình Định dạng: Font Times New Roman mặc định, lề theo file Word gốc, cỡ chữ 13pt chuẩn NĐ 30
  const [settings, setSettings] = useState<DocumentSettings>({
    fontId: 'times', // Font mặc định cho file Word tải lên là Times New Roman
    fontSize: '13pt', // Cỡ chữ chuẩn NĐ 30 hoặc tự nhận diện theo file gốc
    lineHeight: '1.4',
    textAlign: 'justify',
    preserveOriginalFormat: true, // Mặc định giữ đúng dữ liệu định dạng gốc của file
    pageMargin: 'original', // Mặc định lề theo file Word tải lên
    customMargins: { top: 20, bottom: 20, left: 30, right: 15 },
    originalMargins: { top: 20, bottom: 20, left: 25, right: 20 }
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

  // Nạp nhiều file Word (.docx) cùng lúc
  const handleWordUploadMultiple = async (files: File[]) => {
    try {
      const newItems: UploadedWordItem[] = [];
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const { html, tags, margins, defaultFontSize } = await extractHtmlFromDocx(buffer);
        newItems.push({
          id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          buffer,
          html,
          tags,
          margins,
          defaultFontSize
        });
      }

      setWordFiles(prev => {
        const combined = [...prev, ...newItems];
        return combined;
      });

      // Kích hoạt ngay file đầu tiên được chọn
      if (newItems.length > 0) {
        const first = newItems[0];
        setActiveWordId(first.id);
        setWordBuffer(first.buffer);
        setWordFileName(first.name);
        setTemplateHtml(first.html);
        setDetectedWordTags(first.tags);
        setIsPreviewMode(false); // Mặc định chế độ soạn thảo khi import

        // Cập nhật cấu hình: font Times New Roman, lề theo file gốc, cỡ chữ theo mẫu
        setSettings(prev => ({
          ...prev,
          fontId: 'times',
          fontSize: first.defaultFontSize || prev.fontSize || '13pt',
          pageMargin: 'original',
          originalMargins: first.margins || prev.originalMargins
        }));
      }

      // Tự động thu gọn bảng nạp nếu đã có cả Excel và Word
      if (excelFiles.length > 0 || excelFileName) {
        setIsImportCollapsed(true);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đọc file Word.');
    }
  };

  // Nạp nhiều file Excel (.xlsx, .xls) cùng lúc
  const handleExcelUploadMultiple = async (files: File[]) => {
    try {
      const newItems: UploadedExcelItem[] = [];
      for (const file of files) {
        const parsed = await readExcelFile(file);
        newItems.push({
          id: `excel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          workbook: parsed.workbook,
          sheetNames: parsed.sheetNames,
          activeSheet: parsed.activeSheet,
          data: parsed.data
        });
      }

      setExcelFiles(prev => [...prev, ...newItems]);

      // Kích hoạt ngay file Excel đầu tiên
      if (newItems.length > 0) {
        const first = newItems[0];
        setActiveExcelId(first.id);
        setExcelFileName(first.name);
        setWorkbook(first.workbook);
        setSheetNames(first.sheetNames);
        setActiveSheet(first.activeSheet);
        setExcelData(first.data);
        setCurrentIndex(0);
        setIsPreviewMode(false); // Mặc định chế độ soạn thảo khi import
      }

      // Tự động thu gọn bảng nạp nếu đã có cả Word và Excel
      if (wordFiles.length > 0 || wordFileName) {
        setIsImportCollapsed(true);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đọc file Excel.');
    }
  };

  // Chọn file Word làm mẫu đang hiển thị
  const handleSelectActiveWord = (id: string) => {
    const item = wordFiles.find(f => f.id === id);
    if (!item) return;
    setActiveWordId(id);
    setWordBuffer(item.buffer);
    setWordFileName(item.name);
    setTemplateHtml(item.html);
    setDetectedWordTags(item.tags);
    setIsPreviewMode(false);

    setSettings(prev => ({
      ...prev,
      fontId: 'times',
      fontSize: item.defaultFontSize || prev.fontSize || '13pt',
      pageMargin: 'original',
      originalMargins: item.margins || prev.originalMargins
    }));
  };

  // Chọn mẫu từ Kho lưu trữ mẫu văn bản
  const handleSelectTemplateFromStorage = (tpl: SavedTemplateItem) => {
    setTemplateHtml(tpl.html);
    setDetectedWordTags(tpl.tags);
    setWordFileName(tpl.name + '.docx');
    setIsPreviewMode(false);
    if (excelFiles.length > 0 || excelFileName) {
      setIsImportCollapsed(true);
    }
  };

  // Xóa file Word (hỗ trợ xóa hàng loạt)
  const handleDeleteWordFiles = (ids: string[]) => {
    setWordFiles(prev => {
      const remaining = prev.filter(f => !ids.includes(f.id));
      if (ids.includes(activeWordId || '')) {
        if (remaining.length > 0) {
          const next = remaining[0];
          setActiveWordId(next.id);
          setWordBuffer(next.buffer);
          setWordFileName(next.name);
          setTemplateHtml(next.html);
          setDetectedWordTags(next.tags);
        } else {
          setActiveWordId(null);
          setWordBuffer(null);
          setWordFileName(null);
          setTemplateHtml('');
          setDetectedWordTags([]);
          setIsImportCollapsed(false);
        }
      }
      return remaining;
    });
  };

  // Chọn file Excel đang làm việc
  const handleSelectActiveExcel = (id: string) => {
    const item = excelFiles.find(f => f.id === id);
    if (!item) return;
    setActiveExcelId(id);
    setExcelFileName(item.name);
    setWorkbook(item.workbook);
    setSheetNames(item.sheetNames);
    setActiveSheet(item.activeSheet);
    setExcelData(item.data);
    setCurrentIndex(0);
  };

  // Xóa file Excel (hỗ trợ xóa hàng loạt)
  const handleDeleteExcelFiles = (ids: string[]) => {
    setExcelFiles(prev => {
      const remaining = prev.filter(f => !ids.includes(f.id));
      if (ids.includes(activeExcelId || '')) {
        if (remaining.length > 0) {
          const next = remaining[0];
          setActiveExcelId(next.id);
          setExcelFileName(next.name);
          setWorkbook(next.workbook);
          setSheetNames(next.sheetNames);
          setActiveSheet(next.activeSheet);
          setExcelData(next.data);
          setCurrentIndex(0);
        } else {
          setActiveExcelId(null);
          setExcelFileName(null);
          setWorkbook(null);
          setSheetNames([]);
          setActiveSheet('');
          setExcelData({ sheetName: '', headers: [], rows: [], totalRows: 0 });
          setCurrentIndex(0);
          setIsImportCollapsed(false);
        }
      }
      return remaining;
    });
  };

  // Chọn Sheet
  const handleSelectSheet = (sheetName: string) => {
    if (!workbook) return;
    const data = extractSheetData(workbook, sheetName);
    setActiveSheet(sheetName);
    setExcelData(data);
    setCurrentIndex(0);
  };

  // Dùng thử mẫu có sẵn (Nạp mẫu hoàn chỉnh và thu gọn bảng nạp)
  const handleLoadSample = () => {
    const sampleWordBuf = getDefaultSampleDocxBuffer();
    const sampleMargins = { top: 20, bottom: 20, left: 30, right: 15 };
    const wordItem: UploadedWordItem = {
      id: 'sample-word-1',
      name: 'Mau_Giay_Moi_Hoi_Nghi_2026.docx',
      size: sampleWordBuf.byteLength,
      buffer: sampleWordBuf,
      html: DEFAULT_SAMPLE_TEMPLATE_HTML,
      tags: ['DonVi', 'SoThuTu', 'Ngay', 'Thang', 'Nam', 'HoVaTen', 'ChucVu', 'SoDienThoai', 'Email', 'MaDaiBieu', 'DiaDiem', 'SoGhe', 'GhiChu'],
      margins: sampleMargins,
      defaultFontSize: '13pt'
    };

    const sampleExcel = getSampleExcelData();
    const excelItem: UploadedExcelItem = {
      id: 'sample-excel-1',
      name: 'DanhSach_DaiBieu_2026.xlsx',
      size: 15420,
      workbook: null,
      sheetNames: ['DanhSachMoi'],
      activeSheet: 'DanhSachMoi',
      data: sampleExcel
    };

    setWordFiles([wordItem]);
    setActiveWordId(wordItem.id);
    setWordBuffer(sampleWordBuf);
    setWordFileName(wordItem.name);
    setTemplateHtml(wordItem.html);
    setDetectedWordTags(wordItem.tags);

    setExcelFiles([excelItem]);
    setActiveExcelId(excelItem.id);
    setExcelFileName(excelItem.name);
    setWorkbook(null);
    setSheetNames(['DanhSachMoi']);
    setActiveSheet('DanhSachMoi');
    setExcelData(sampleExcel);
    setCurrentIndex(0);
    setIsPreviewMode(false);
    setIsImportCollapsed(true);

    // Cập nhật cấu hình cho mẫu: Font Times New Roman, cỡ 13pt, lề chuẩn Nghị định 30
    setSettings(prev => ({
      ...prev,
      fontId: 'times',
      fontSize: '13pt',
      pageMargin: 'nd30',
      originalMargins: sampleMargins
    }));
  };

  // Xóa danh sách import (Clear Import Standard)
  const handleClearImport = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách import và làm sạch trạng thái?')) {
      setWordFiles([]);
      setActiveWordId(null);
      setWordFileName(null);
      setWordBuffer(null);
      setTemplateHtml('');
      setDetectedWordTags([]);

      setExcelFiles([]);
      setActiveExcelId(null);
      setExcelFileName(null);
      setWorkbook(null);
      setSheetNames([]);
      setActiveSheet('');
      setExcelData({ sheetName: '', headers: [], rows: [], totalRows: 0 });
      setCurrentIndex(0);

      setIsPreviewMode(false);
      setIsImportCollapsed(false);
    }
  };

  // Chèn tag vào vị trí con trỏ hoặc thay thế chữ bôi đen
  const handleInsertTag = (tag: string) => {
    editorRef.current?.insertTag(tag);
  };

  // In bản ghi hiện tại qua iframe cách ly
  const handlePrintCurrent = () => {
    const mergedHtml = renderMergedHtml(templateHtml, currentRow, true);
    const font = settings.preserveOriginalFormat ? 'inherit' : selectedFont.family;
    const size = settings.preserveOriginalFormat ? 'inherit' : settings.fontSize;
    const lineH = settings.preserveOriginalFormat ? 'inherit' : settings.lineHeight;

    printIsolatedDocument([mergedHtml], font, size, lineH, getEffectiveMargin(settings));
  };

  // In toàn bộ bản ghi qua iframe cách ly
  const handlePrintAll = () => {
    if (excelData.rows.length === 0) {
      alert('Không có dữ liệu bản ghi để in.');
      return;
    }

    const pagesHtml = excelData.rows.map(row => renderMergedHtml(templateHtml, row, true));
    const font = settings.preserveOriginalFormat ? 'inherit' : selectedFont.family;
    const size = settings.preserveOriginalFormat ? 'inherit' : settings.fontSize;
    const lineH = settings.preserveOriginalFormat ? 'inherit' : settings.lineHeight;

    printIsolatedDocument(pagesHtml, font, size, lineH, getEffectiveMargin(settings));
  };

  // Xuất bản ghi hiện tại ra file Word (.docx) giữ nguyên 100% định dạng gốc
  const handleExportDocxCurrent = () => {
    if (!currentRow) {
      alert('Chưa có dữ liệu bản ghi.');
      return;
    }

    const buffer = wordBuffer || getDefaultSampleDocxBuffer();
    try {
      const outBlob = generateMergedDocx(buffer, currentRow, settings);
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
        const outBlob = generateMergedSingleDocx(buffer, excelData.rows, settings);
        const name = `Namns_Merge_Word_Gop_${excelData.rows.length}_Trang.docx`;
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
        },
        settings
      );
      saveAs(zipBlob, `Namns_Merge_Word_${excelData.rows.length}_VanBan.zip`);
    } catch (err: any) {
      alert(err.message || 'Lỗi xuất file ZIP.');
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors relative"
      style={{ fontFamily: currentUiFont.cssFamily }}
    >
      {/* Hiệu ứng nền Gradient trang nhã lan tỏa theo chủ đề */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] -z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${currentTheme.previewColors[0]}, ${currentTheme.previewColors[1]}, transparent 70%)`
        }}
      />

      {/* Header với Theme Gradient động */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wordLoaded={Boolean(wordFileName)}
        excelLoaded={Boolean(excelFileName && excelData.rows.length > 0)}
        totalRecords={excelData.rows.length}
        theme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-3.5">
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

        {/* Modal Cài đặt Giao diện Gradient & Font chữ */}
        <ThemeSettingsModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          activeThemeId={activeThemeId}
          onSelectTheme={handleSelectTheme}
          activeFontId={activeFontId}
          onSelectFont={handleSelectUiFont}
        />

        {/* Modal Kho mẫu & Sao lưu / Phục hồi JSON */}
        <TemplateManagerModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          currentTemplateHtml={templateHtml}
          currentTags={detectedWordTags}
          currentDocName={wordFileName}
          onSelectTemplate={handleSelectTemplateFromStorage}
          theme={currentTheme}
        />

        {/* Tab Nội dung */}
        {activeTab === 'merge' && (
          <div className="space-y-3.5">
            {/* Bước 1: Nạp file Word & Excel (Hiển thị ngay khi mở trang, hỗ trợ nhiều file & xóa hàng loạt) */}
            <FileImportSection
              onWordUploadMultiple={handleWordUploadMultiple}
              onExcelUploadMultiple={handleExcelUploadMultiple}
              onLoadSample={handleLoadSample}
              onClearImport={handleClearImport}
              wordFiles={wordFiles}
              activeWordId={activeWordId}
              onSelectActiveWord={handleSelectActiveWord}
              onDeleteWordFiles={handleDeleteWordFiles}
              excelFiles={excelFiles}
              activeExcelId={activeExcelId}
              onSelectActiveExcel={handleSelectActiveExcel}
              onDeleteExcelFiles={handleDeleteExcelFiles}
              totalRecords={excelData.rows.length}
              totalColumns={excelData.headers.length}
              isCollapsed={isImportCollapsed}
              onToggleCollapse={() => setIsImportCollapsed(!isImportCollapsed)}
              theme={currentTheme}
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
              theme={currentTheme}
            />

            {/* Bố cục 2 cột: Cột trái Word (cuộn độc lập) & Cột phải Cột Excel (cố định sticky) */}
            <div className="flex flex-col lg:flex-row gap-4.5 items-start">
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
                  theme={currentTheme}
                  onOpenTemplateManager={() => setIsTemplateModalOpen(true)}
                  onUpdateSettings={handleUpdateSettings}
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
                  theme={currentTheme}
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
