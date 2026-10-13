import React from 'react';
import { FileText, Github, Coffee, BookOpen, History, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { APP_META } from '../lib/meta';

interface HeaderProps {
  activeTab: 'merge' | 'guide' | 'changelog' | 'author' | 'coffee';
  setActiveTab: (tab: 'merge' | 'guide' | 'changelog' | 'author' | 'coffee') => void;
  excelLoaded: boolean;
  wordLoaded: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  excelLoaded,
  wordLoaded,
  totalRecords
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('merge')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  {APP_META.name}
                </h1>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  v{APP_META.version}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" /> Offline 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Trộn thư Word &amp; Excel tự động · Đa font Unicode tiếng Việt · In &amp; Xuất PDF/Word
              </p>
            </div>
          </div>

          {/* Quick status badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            {wordLoaded && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Mẫu Word
              </span>
            )}
            {excelLoaded && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Excel: {totalRecords} dòng
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>

            <button
              onClick={() => setActiveTab('changelog')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'changelog'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>

            <button
              onClick={() => setActiveTab('author')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'author'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Tác giả</span>
            </button>

            <button
              onClick={() => setActiveTab('coffee')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'coffee'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">Mời cà phê</span>
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
