import React from 'react';
import { Coffee, Github } from 'lucide-react';
import { APP_META } from '../lib/meta';

interface FooterProps {
  onOpenTab: (tab: 'guide' | 'changelog' | 'author' | 'coffee') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTab }) => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <strong className="text-slate-800">{APP_META.name}</strong>
          {' · '}v<span>{APP_META.version}</span>
          {' · '}<span>{APP_META.author}</span>
          <span className="hidden md:inline"> · {APP_META.description} · Múi giờ {APP_META.timezone}</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => onOpenTab('guide')}
            className="hover:text-blue-600 transition-colors"
          >
            Hướng dẫn
          </button>
          <button
            onClick={() => onOpenTab('changelog')}
            className="hover:text-blue-600 transition-colors"
          >
            Lịch sử
          </button>
          <button
            onClick={() => onOpenTab('author')}
            className="hover:text-blue-600 transition-colors"
          >
            Tác giả
          </button>
          <button
            onClick={() => onOpenTab('coffee')}
            className="hover:text-amber-700 text-amber-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Mời cà phê</span>
          </button>
          <a
            href={APP_META.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
