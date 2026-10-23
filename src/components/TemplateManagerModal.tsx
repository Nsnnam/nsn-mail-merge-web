import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bookmark,
  Download,
  Upload,
  Trash2,
  FileCheck,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  Ruler,
  Type
} from 'lucide-react';
import {
  SavedTemplateItem,
  getSavedTemplates,
  saveTemplate,
  deleteSavedTemplate,
  exportTemplatesBackup,
  exportSingleTemplateBackup,
  parseTemplatesBackupJson,
  importTemplatesBackup
} from '../lib/templateStorage';
import { ThemeGradient } from '../lib/theme';
import { DocumentSettings } from '../types';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { getEffectiveMargin } from '../lib/docxHelper';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateHtml: string;
  currentTags: string[];
  currentDocName: string | null;
  currentSettings: DocumentSettings;
  onSelectTemplate: (template: SavedTemplateItem) => void;
  theme?: ThemeGradient;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  currentTemplateHtml,
  currentTags,
  currentDocName,
  currentSettings,
  onSelectTemplate,
  theme
}) => {
  const [templates, setTemplates] = useState<SavedTemplateItem[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTemplates(getSavedTemplates());
      setNewTemplateName(currentDocName ? currentDocName.replace(/\.docx$/i, '') : 'Mẫu văn bản mới');
      setNewTemplateDesc('');
      setStatusMessage(null);
    }
  }, [isOpen, currentDocName]);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplateHtml.trim()) {
      showToast('error', 'Chưa có nội dung văn bản để lưu mẫu.');
      return;
    }

    try {
      const saved = saveTemplate(
        newTemplateName,
        currentTemplateHtml,
        currentTags,
        newTemplateDesc,
        {
          fontId: currentSettings.fontId,
          fontSize: currentSettings.fontSize,
          lineHeight: currentSettings.lineHeight,
          textAlign: currentSettings.textAlign,
          preserveOriginalFormat: currentSettings.preserveOriginalFormat,
          pageMargin: currentSettings.pageMargin,
          customMargins: currentSettings.customMargins,
          originalMargins: currentSettings.originalMargins
        }
      );
      setTemplates(getSavedTemplates());
      showToast('success', `Đã lưu thành công mẫu "${saved.name}" (kèm thông số lề & font) vào kho lưu trữ.`);
      setNewTemplateDesc('');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu mẫu.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa mẫu "${name}" không?`)) {
      const updated = deleteSavedTemplate(id);
      setTemplates(updated);
      showToast('success', `Đã xóa mẫu "${name}".`);
    }
  };

  const handleApply = (tpl: SavedTemplateItem) => {
    onSelectTemplate(tpl);
    showToast('success', `Đã tải mẫu "${tpl.name}" vào trình soạn thảo.`);
    onClose();
  };

  const handleExportAll = () => {
    if (templates.length === 0) {
      showToast('error', 'Chưa có mẫu nào trong kho để tải về sao lưu.');
      return;
    }
    exportTemplatesBackup(templates);
    showToast('success', `Đã tải file sao lưu gồm ${templates.length} mẫu về máy.`);
  };

  const handleExportSingle = (tpl: SavedTemplateItem) => {
    exportSingleTemplateBackup(tpl);
    showToast('success', `Đã tải file sao lưu mẫu "${tpl.name}" về máy.`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseTemplatesBackupJson(text);
      const updated = importTemplatesBackup(imported);
      setTemplates(updated);
      showToast('success', `Khôi phục thành công ${imported.length} mẫu từ file sao lưu.`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi đọc file sao lưu JSON.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className={`p-4 sm:px-6 flex items-center justify-between border-b border-slate-200 ${theme ? theme.accentBg : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white shadow-2xs ${theme ? `bg-gradient-to-r ${theme.gradientClass}` : 'bg-blue-600'}`}>
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Kho mẫu & Sao lưu / Phục hồi văn bản</h3>
              <p className="text-xs text-slate-500">Lưu trữ mẫu văn bản đã chỉnh sửa và xuất file .JSON để sử dụng cho các lần sau</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Lưu mẫu hiện tại */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Lưu nội dung đang soạn thảo thành mẫu mới</span>
            </h4>
            <form onSubmit={handleSaveCurrent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên mẫu văn bản</label>
                  <input
                    type="text"
                    required
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="VD: Giấy mời hội nghị 2026, Giấy hẹn KSK..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú (Tùy chọn)</label>
                  <input
                    type="text"
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    placeholder="VD: Dùng cho đoàn KSK..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Thông tin cấu hình lề & font được lưu tự động kèm mẫu */}
              <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px] text-indigo-950">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Định dạng lề &amp; font lưu kèm mẫu:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-semibold text-indigo-900 flex items-center gap-1">
                    <Type className="w-3 h-3 text-indigo-600" />
                    {VIETNAMESE_FONTS.find(f => f.id === currentSettings.fontId)?.name || currentSettings.fontId} · {currentSettings.fontSize}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-semibold text-indigo-900 flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-indigo-600" />
                    Lề: T:{getEffectiveMargin(currentSettings).top} / D:{getEffectiveMargin(currentSettings).bottom} / T:{getEffectiveMargin(currentSettings).left} / P:{getEffectiveMargin(currentSettings).right} mm
                    <span className="text-[10px] text-indigo-600 font-normal">
                      ({currentSettings.pageMargin === 'custom' ? 'Tùy chỉnh' : currentSettings.pageMargin === 'nd30' ? 'NĐ 30' : currentSettings.pageMargin === 'original' ? 'File gốc' : currentSettings.pageMargin})
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Số biến phát hiện: <strong>{currentTags.length}</strong> biến
                </span>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 ${
                    theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Lưu vào kho mẫu</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Danh sách mẫu đã lưu */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span>Danh sách mẫu đã lưu ({templates.length})</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAll}
                  disabled={templates.length === 0}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Tải toàn bộ danh sách mẫu về máy dưới dạng 1 file JSON"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao lưu tất cả (.JSON)</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Nạp lại các mẫu từ file JSON đã sao lưu trước đó"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Khôi phục từ file JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            </div>

            {templates.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Chưa có mẫu nào được lưu trong bộ nhớ máy này.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Nhập tên ở khung phía trên và nhấn "Lưu vào kho mẫu", hoặc nhấn "Khôi phục từ file JSON" để nạp mẫu đã sao lưu.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {templates.map(tpl => (
                  <div
                    key={tpl.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">{tpl.name}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {tpl.updatedAt}
                        </span>
                      </div>
                      {tpl.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.description}</p>
                      )}
                      {tpl.previewSnippet && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                          "{tpl.previewSnippet}"
                        </p>
                      )}
                      {tpl.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-1.5">
                          {tpl.tags.slice(0, 5).map(t => (
                            <span key={t} className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-mono rounded border border-blue-100">
                              {`{{${t}}}`}
                            </span>
                          ))}
                          {tpl.tags.length > 5 && (
                            <span className="text-[10px] text-slate-400 font-medium">+{tpl.tags.length - 5} biến</span>
                          )}
                        </div>
                      )}

                      {/* Hiển thị thông số lề & font đã lưu kèm mẫu */}
                      {tpl.settings && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {tpl.settings.fontId && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded border border-indigo-100 flex items-center gap-1">
                              <Type className="w-2.5 h-2.5 text-indigo-600" />
                              <span>{VIETNAMESE_FONTS.find(f => f.id === tpl.settings?.fontId)?.name || tpl.settings.fontId} · {tpl.settings.fontSize || '13pt'}</span>
                            </span>
                          )}
                          {tpl.settings.pageMargin && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded border border-emerald-100 flex items-center gap-1">
                              <Ruler className="w-2.5 h-2.5 text-emerald-600" />
                              <span>
                                Lề: {
                                  tpl.settings.pageMargin === 'custom' && tpl.settings.customMargins
                                    ? `T:${tpl.settings.customMargins.top} D:${tpl.settings.customMargins.bottom} T:${tpl.settings.customMargins.left} P:${tpl.settings.customMargins.right}mm`
                                    : tpl.settings.pageMargin === 'nd30'
                                    ? 'NĐ 30 (20/20/30/15mm)'
                                    : tpl.settings.pageMargin === 'narrow'
                                    ? 'Hẹp (12.7mm)'
                                    : tpl.settings.pageMargin === 'normal'
                                    ? 'Tiêu chuẩn (25.4mm)'
                                    : tpl.settings.originalMargins
                                    ? `T:${tpl.settings.originalMargins.top} D:${tpl.settings.originalMargins.bottom} T:${tpl.settings.originalMargins.left} P:${tpl.settings.originalMargins.right}mm`
                                    : tpl.settings.pageMargin
                                }
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleApply(tpl)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1 ${
                          theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title="Sử dụng mẫu này trong trình soạn thảo"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Dùng mẫu</span>
                      </button>
                      <button
                        onClick={() => handleExportSingle(tpl)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title="Tải mẫu này thành file .json sao lưu về máy"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                        title="Xóa mẫu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Dữ liệu được lưu trữ an toàn trong LocalStorage trình duyệt & file sao lưu máy tính cá nhân.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
