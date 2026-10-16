import React from 'react';
import { Github, Coffee, BookOpen, History, User, CheckCircle2, ShieldCheck, Palette } from 'lucide-react';
import { APP_META } from '../lib/meta';
import { ThemeGradient } from '../lib/theme';

interface HeaderProps {
  activeTab: 'merge' | 'guide' | 'changelog' | 'author' | 'coffee';
  setActiveTab: (tab: 'merge' | 'guide' | 'changelog' | 'author' | 'coffee') => void;
  excelLoaded: boolean;
  wordLoaded: boolean;
  totalRecords: number;
  theme: ThemeGradient;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  excelLoaded,
  wordLoaded,
  totalRecords,
  theme,
  onOpenThemeModal
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Thanh viền Gradient đa sắc tương ứng chủ đề đã chọn */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradientClass} transition-all`} />
      <div className="max-w-[1750px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('merge')}>
            {/* Custom Modern Vector Logo Namns Merge Word */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.gradientClass} p-2 flex items-center justify-center text-white shadow-md ${theme.glowShadow} flex-shrink-0 transition-all hover:scale-105`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
                <rect x="2" y="2" width="13" height="17" rx="2" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5" />
                <rect x="7" y="6" width="14" height="17" rx="2" fill="white" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 11h8M10 15h8M10 19h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="3.5" fill="#10b981" />
                <path d="M16.5 18h3M18 16.5v3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  {APP_META.name}
                </h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${theme.activeBadge}`}>
                  v{APP_META.version}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" /> Offline 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                {APP_META.description} · Chuẩn thể thức văn bản &amp; In ấn PDF
              </p>
            </div>
          </div>

          {/* Quick status badge */}
          <div className="hidden xl:flex items-center gap-2 text-xs">
            {wordLoaded && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium ${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Mẫu Word
              </span>
            )}
            {excelLoaded && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Excel: {totalRecords} dòng
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Nút Cài đặt Giao diện Gradient */}
            <button
              onClick={onOpenThemeModal}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border shadow-2xs ${theme.accentBg} ${theme.accentText} ${theme.accentBorder} hover:brightness-95`}
              title="Cài đặt giao diện Gradient & Font chữ website"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Giao diện</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? theme.navActive
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>

            <button
              onClick={() => setActiveTab('changelog')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'changelog'
                  ? theme.navActive
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>

            <button
              onClick={() => setActiveTab('author')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'author'
                  ? theme.navActive
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tác giả</span>
            </button>

            <button
              onClick={() => setActiveTab('coffee')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'coffee'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold">Mời cà phê</span>
            </button>

            <a
              href={APP_META.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mã nguồn GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
