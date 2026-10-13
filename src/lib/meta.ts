/**
 * NSN App Standard — Metadata cấu hình ứng dụng
 * Tác giả: Nguyễn Sơn Nam (Nsnnam / NamNS / NSN)
 */

export interface ChangelogItem {
  version: string;
  date: string;
  changes: string[];
}

export interface CoffeeConfig {
  title: string;
  blurb: string;
  accountName: string;
  accountNumber: string;
  bank: string;
  method: string;
  thanks: string;
  qrAlt: string;
  qrPath: string;
}

export interface AppMeta {
  name: string;
  shortName: string;
  appCode: string;
  version: string;
  date: string;
  author: string;
  authorShort: string;
  role: string;
  github: string;
  timezone: string;
  changelog: ChangelogItem[];
  coffee: CoffeeConfig;
}

export const APP_META: AppMeta = {
  name: "NSN Word Mail Merge Web Pro",
  shortName: "Mail Merge Web",
  appCode: "MAILMERGE",
  version: "1.0.0",
  date: "2026-10-13",
  author: "Nguyễn Sơn Nam (Nsnnam)",
  authorShort: "NSN",
  role: "Tác giả · Tiện ích HIS / Excel / Tự động hóa văn bản",
  github: "https://github.com/Nsnnam/nsn-mail-merge-web",
  timezone: "Asia/Ho_Chi_Minh",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-10-13",
      changes: [
        "Khởi tạo ứng dụng Mail Merge Word - Excel thông minh trên nền Web.",
        "Hỗ trợ nhập mẫu Word (.docx) và trích xuất nội dung trực tiếp vào Editor.",
        "Hỗ trợ nhập bảng tính Excel (.xlsx, .xls), tự động phát hiện danh sách Sheet và phân tích các cột dữ liệu.",
        "Bảng điều khiển thẻ biến: Click chèn ngay {{Tên_Cột}} vào vị trí con trỏ trong trình soạn thảo Word.",
        "Hỗ trợ bộ font chữ phong phú (Be Vietnam Pro, Roboto, Times New Roman, Montserrat, Open Sans, Merriweather...).",
        "Tùy chọn linh hoạt: Đồng bộ font chữ Unicode hoặc giữ nguyên 100% định dạng Word gốc.",
        "Trình xem trước (Preview) tương tác: Lật trang theo từng bản ghi (First, Prev, Next, Last) với dữ liệu thực tế.",
        "Hỗ trợ in trực tiếp (Window Print) bản ghi hiện tại hoặc in hàng loạt toàn bộ danh sách khổ A4.",
        "Xuất PDF chất lượng cao hoặc xuất gói file Word (.docx / .zip) đã trộn đầy đủ.",
        "Nút Xóa / Reset dữ liệu import (Clear Import Standard) dọn sạch trạng thái theo NSN App Standard.",
        "Tích hợp các tab: Mail Merge, Hướng dẫn sử dụng, Phiên bản & Lịch sử, Tác giả, Mời cà phê ☕ (VietQR BIDV)."
      ]
    }
  ],
  coffee: {
    title: "Mời cà phê ☕",
    blurb: "Nếu ứng dụng giúp bạn tiết kiệm thời gian trộn văn bản và xuất hồ sơ, hãy ủng hộ tác giả một tách cà phê nhé!",
    accountName: "NGUYEN SON NAM",
    accountNumber: "8855989777",
    bank: "BIDV — PGD Nguyễn Tất Thành",
    method: "Quét mã VietQR bên dưới để chuyển khoản nhanh",
    thanks: "Cảm ơn bạn đã đồng hành và ủng hộ!",
    qrAlt: "QR VietQR ủng hộ - BIDV 8855989777",
    qrPath: "docs/coffee-qr.jpg"
  }
};
