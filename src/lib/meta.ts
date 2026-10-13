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
  description: string;
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
  name: "Namns Merge Word",
  shortName: "Merge Word",
  description: "Chỉnh sửa và trộn thư",
  appCode: "NAMNSMERGE",
  version: "1.0.3",
  date: "2026-10-13",
  author: "Nguyễn Sơn Nam (Nsnnam)",
  authorShort: "NSN",
  role: "Tác giả · Tiện ích HIS / Excel / Tự động hóa văn bản",
  github: "https://github.com/Nsnnam/nsn-mail-merge-web",
  timezone: "Asia/Ho_Chi_Minh",
  changelog: [
    {
      version: "1.0.3",
      date: "2026-10-13",
      changes: [
        "Đổi tên ứng dụng ngắn gọn thành 'Namns Merge Word', mô tả 'Chỉnh sửa và trộn thư'.",
        "Thiết kế lại Logo vector & Icon web nhận diện thương hiệu chuyên nghiệp dạng đa lớp văn bản hiện đại.",
        "Tối ưu hiệu suất làm việc: Tự động thu gọn bảng nạp tệp sau khi đã nạp dữ liệu, hiển thị thanh tóm tắt gọn gàng và hỗ trợ mở rộng nhanh.",
        "Thêm cài đặt giao diện phong phú: 6 chủ đề Gradient cao cấp (Ocean, Sunset, Emerald, Midnight, Amber, Aurora) cùng bộ font giao diện tiếng Việt (Be Vietnam Pro, Inter, Roboto, Montserrat, Nunito, Open Sans).",
        "Lưu cấu hình giao diện bền vững vào localStorage (chuẩn NSN App Standard)."
      ]
    },
    {
      version: "1.0.2",
      date: "2026-10-13",
      changes: [
        "Sửa lỗi in toàn trang web: Chuyển sang cơ chế in iframe cách ly và CSS @media print nghiêm ngặt, đảm bảo CHỈ in duy nhất trang văn bản A4.",
        "Định dạng biến kế thừa 100% văn bản khi in: Xóa bỏ khung viền xanh khi in/xuất PDF, biến chèn vào kế thừa trọn vẹn màu sắc, in đậm/nghiêng của văn bản xung quanh.",
        "Nâng cấp bộ công cụ soạn thảo chuyên nghiệp kiểu Microsoft Word: Thêm Undo/Redo, H1/H2/H3, Cỡ chữ, Bảng màu chữ, Màu nền, Gạch ngang, Danh sách, Tăng giảm thụt lề, Chèn bảng biểu 3x3, Chèn kẻ ngang, Xóa định dạng.",
        "Thêm tính năng Xuất 1 file Word .DOCX gộp tất cả bản ghi: Tách từng trang bằng ngắt trang chuẩn OpenXML và giữ nguyên 100% định dạng bảng biểu, lề trang.",
        "Nhúng sẵn file mẫu .docx chuẩn OpenXML vào ứng dụng: Đảm bảo xuất file Word chuẩn xác ngay cả khi không nạp file từ máy."
      ]
    },
    {
      version: "1.0.1",
      date: "2026-10-13",
      changes: [
        "Chuyển bảng Cột Excel khả dụng sang thanh sidebar cố định bên phải (Sticky) để tiện lựa chọn và đối chiếu.",
        "Cho phép cuộn nội dung văn bản Word bên trái độc lập mà không bị khuất danh sách cột.",
        "Sửa lỗi chèn biến: Hỗ trợ chèn chuẩn xác vào vị trí con trỏ hoặc chèn đè thay thế phần văn bản đang bôi đen.",
        "Tích hợp ô tìm kiếm tên cột và bộ đối chiếu dữ liệu mẫu trực tiếp trên sidebar bên phải."
      ]
    },
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
