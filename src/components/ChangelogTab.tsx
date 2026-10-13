import React from 'react';
import { History, Tag, Calendar, CheckCircle2 } from 'lucide-react';
import { APP_META } from '../lib/meta';

export const ChangelogTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Lịch sử phiên bản &amp; Cập nhật
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi nhật ký phát triển theo chuẩn Semantic Versioning &amp; NSN App Standard (GMT+7).
        </p>
      </div>

      <div className="space-y-6">
        {APP_META.changelog.map((log) => (
          <div key={log.version} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  v{log.version}
                </span>
                <span className="text-xs font-semibold text-slate-800">Bản phát hành chính thức</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{log.date} (GMT+7)</span>
              </div>
            </div>

            <ul className="space-y-2">
              {log.changes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
