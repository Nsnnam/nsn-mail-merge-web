import React from 'react';
import { User, Github, Award, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { APP_META } from '../lib/meta';

export const AuthorTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Thông tin Tác giả &amp; Dự án
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Hệ sinh thái tiện ích số hóa dữ liệu y tế, chuẩn hóa Excel và tự động hóa tác nghiệp.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 flex-shrink-0">
          NSN
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{APP_META.author}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
                {APP_META.authorShort}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{APP_META.role}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-slate-400 font-medium">Hồ sơ GitHub chính thức:</span>
              <a
                href="https://github.com/Nsnnam"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Github className="w-4 h-4" />
                <span>github.com/Nsnnam</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-slate-400 font-medium">Kho mã nguồn dự án:</span>
              <a
                href={APP_META.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 truncate"
              >
                <Github className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Nsnnam/nsn-mail-merge-web</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
          <Award className="w-4 h-4 text-amber-600" />
          Tiêu chuẩn phát triển phần mềm NSN App Standard:
        </h4>
        <p className="leading-relaxed">
          Ứng dụng tuân thủ nghiêm ngặt <strong>NSN App Standard v1.2.0</strong>: Toàn bộ thao tác xử lý nghiệp vụ, đọc file Word/Excel và tạo bản in diễn ra cục bộ trong bộ nhớ trình duyệt; giao diện thân thiện với ngôn ngữ Tiếng Việt, tương thích chuẩn thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP); không rò rỉ dữ liệu ra bên ngoài.
        </p>
      </div>
    </div>
  );
};
