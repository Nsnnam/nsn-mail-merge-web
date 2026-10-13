import React from 'react';
import { X, Palette, Type, Check, Sparkles, RefreshCw } from 'lucide-react';
import { THEME_GRADIENTS, UI_FONTS, ThemeGradient, UiFont } from '../lib/theme';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
  activeFontId: string;
  onSelectFont: (fontId: string) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  activeFontId,
  onSelectFont
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cài đặt Giao diện &amp; Font chữ</h3>
              <p className="text-[11px] text-slate-500">Tùy biến phong cách Gradient và kiểu chữ giao diện theo sở thích</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Mục 1: Chọn màu Gradient giao diện */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Chủ đề Gradient giao diện (6 phong cách):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_GRADIENTS.map((theme) => {
                const isSelected = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-300 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Gradient color bar preview */}
                      <div className="w-6 h-6 rounded-lg shadow-2xs flex-shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-tr"
                           style={{
                             backgroundImage: `linear-gradient(135deg, ${theme.previewColors.join(', ')})`
                           }}
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{theme.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{theme.tagline}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mục 2: Chọn Font chữ giao diện web */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              Font chữ toàn bộ giao diện Web (Unicode Việt Nam):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {UI_FONTS.map((font) => {
                const isSelected = font.id === activeFontId;
                return (
                  <button
                    key={font.id}
                    onClick={() => onSelectFont(font.id)}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 font-bold text-indigo-900 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                    style={{ fontFamily: font.cssFamily }}
                  >
                    <div className="text-xs">{font.name}</div>
                    {font.badge && (
                      <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500 mt-1 inline-block">
                        {font.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onSelectTheme('ocean');
              onSelectFont('be-vietnam');
            }}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
