import React from 'react';
import { BookOpen, FileCheck, Layers, Type, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { APP_META } from '../lib/meta';

export const GuideTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Hướng dẫn sử dụng {APP_META.name}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Quy trình 4 bước trộn thư (Mail Merge) nhanh chóng, chính xác và bảo mật trực tiếp trên trình duyệt.
        </p>
      </div>

      {/* 4 Bước thực hiện */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
            Chuẩn bị Mẫu Word (.docx)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Trong file Word gốc, bạn đặt các thẻ biến đại diện cho các trường cần điền dạng{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono font-bold">
              {'{{HoVaTen}}'}
            </code>{' '}
            hoặc{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono font-bold">
              {'{HoVaTen}'}
            </code>
            . Tên biến nên trùng khớp với tiêu đề cột trong file Excel.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
            Chuẩn bị Bảng tính Excel (.xlsx)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hàng đầu tiên của file Excel chứa tên cột (ví dụ: <code className="bg-white px-1 py-0.5 rounded font-mono">HoVaTen</code>, <code className="bg-white px-1 py-0.5 rounded font-mono">ChucVu</code>, <code className="bg-white px-1 py-0.5 rounded font-mono">DonVi</code>...). Các hàng tiếp theo chứa danh sách dữ liệu tương ứng.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs">3</span>
            Chọn Sheet &amp; Tùy chỉnh Font chữ
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chọn Sheet chứa dữ liệu cần trộn. Click vào các thẻ cột để chèn nhanh vào văn bản. Bạn có thể chọn các bộ Font Unicode tiếng Việt (<strong>Be Vietnam Pro</strong>, <strong>Times New Roman</strong>, <strong>Roboto</strong>...) hoặc tích chọn <em>Giữ nguyên định dạng gốc của Word</em>.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
          <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
            <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">4</span>
            Xem trước, In &amp; Xuất PDF / DOCX
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bật chế độ <strong>Xem trước Dữ liệu</strong> để duyệt từng bản ghi. Bấm <strong>In bản ghi này</strong> hoặc <strong>In tất cả</strong> để xuất PDF bằng hộp thoại máy in trình duyệt. Bấm <strong>Xuất .DOCX</strong> để tải file Word trộn chuẩn xác.
          </p>
        </div>
      </div>

      {/* Quy chuẩn Thể thức Văn bản Hành chính NĐ 30/2020/NĐ-CP */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-600" />
          Tiêu chuẩn Thể thức Văn bản Hành chính (Nghị định 30/2020/NĐ-CP)
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
          <li><strong>Khổ giấy:</strong> Khổ A4 (210 mm x 297 mm) được mô phỏng tỷ lệ 1:1 trong ứng dụng.</li>
          <li><strong>Font chữ chuẩn:</strong> Times New Roman (bộ mã Unicode tiếng Việt TCVN 6909:2001). Ứng dụng tích hợp sẵn chế độ chọn <strong>Times New Roman (Chuẩn NĐ 30)</strong>.</li>
          <li><strong>Cỡ chữ &amp; Giãn dòng:</strong> Cỡ chữ văn bản từ 13pt - 14pt, độ giãn dòng 1.3 - 1.4 lines.</li>
          <li><strong>Định lề trang:</strong> Lề trên 20-25mm, lề dưới 20-25mm, lề trái 30-35mm, lề phải 15-20mm.</li>
        </ul>
      </div>

      {/* An toàn & Bảo mật */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 space-y-1">
          <p className="font-bold">Bảo mật tuyệt đối — Dữ liệu không rời khỏi máy tính của bạn:</p>
          <p className="text-emerald-800 leading-relaxed">
            Toàn bộ quá trình đọc file Word, phân tích Excel, trộn văn bản và in/xuất file diễn ra <strong>100% Client-Side trong trình duyệt</strong>. Không có bất kỳ dữ liệu cá nhân hay hồ sơ bệnh án nào bị tải lên máy chủ ngoài mạng. Bạn thậm chí có thể ngắt mạng Internet sau khi tải trang mà app vẫn hoạt động bình thường!
          </p>
        </div>
      </div>
    </div>
  );
};
