# Changelog — Nhật ký phát triển

Tất cả thay đổi đáng chú ý của dự án **NSN Word Mail Merge Web Pro** được ghi lại tại đây theo chuẩn [Keep a Changelog](https://keepachangelog.com/) và [Semantic Versioning](https://semver.org/).  
Múi giờ áp dụng: **Asia/Ho_Chi_Minh (GMT+7)**.

---

## [1.0.1] - 2026-10-13

### Thay đổi & Cải tiến (Changed & Fixed)
- **Cải tiến bố cục giao diện (UX/Layout):** Chuyển phần **"Các cột Excel khả dụng"** sang thanh sidebar cố định bên phải (`sticky`), giúp người dùng thuận tiện lựa chọn và đối chiếu dữ liệu với văn bản mà không cần cuộn trang lên xuống.
- **Cuộn văn bản độc lập:** Vùng soạn thảo và xem trước văn bản Word bên trái cuộn mượt mà độc lập, trong khi danh sách cột bên phải luôn ghim cố định trên màn hình.
- **Sửa lỗi chèn biến (Precision Tag Insertion):** Sửa lỗi không chèn được biến vào vị trí con trỏ nhấp nháy hoặc chèn đè thay thế phần văn bản đang bôi đen. Hệ thống tự động ghi nhớ vùng chọn `Range`/`Selection` và thay thế chính xác tại vị trí con trỏ chuột.
- **Tìm kiếm cột & Đối chiếu trực quan:** Bổ sung ô tìm kiếm nhanh tên cột và thanh lật nhanh các bản ghi đối chiếu ngay trên sidebar bên phải.

---

## [1.0.0] - 2026-10-13

### Thêm mới (Added)
- **Khởi tạo dự án:** Khởi tạo Web App trộn thư Word - Excel thông minh trên nền Web theo chuẩn **NSN App Standard**.
- **Xử lý Word (.docx):**
  - Trích xuất nội dung văn bản Word sang định dạng HTML để xem và chỉnh sửa trực tiếp.
  - Quét và nhận diện tự động danh sách các thẻ placeholder `{{Ten_Cot}}` và `{Ten_Cot}`.
  - Trộn và xuất file Word `.docx` thực tế giữ nguyên định dạng bảng biểu, hình ảnh, lề trang bằng `docxtemplater` + `pizzip`.
- **Xử lý Excel (.xlsx, .xls, .csv):**
  - Đọc file bằng `xlsx` (SheetJS) 100% trong trình duyệt.
  - Tự động phát hiện danh sách Sheet và cho phép chuyển đổi nhanh.
  - Hiển thị danh sách thẻ cột Excel (Tokens): Click chèn ngay vào văn bản và sao chép vào bộ nhớ đệm.
  - Chức năng **"Dùng thử mẫu có sẵn"** và **"Tải mẫu Excel"** để thử nghiệm ngay mà không cần chuẩn bị file.
- **Bộ Font chữ Unicode tiếng Việt phong phú:**
  - Tích hợp 15+ font chữ Unicode: `Be Vietnam Pro`, `Times New Roman (Chuẩn NĐ 30)`, `Roboto`, `Open Sans`, `Inter`, `Montserrat`, `Nunito`, `Merriweather`, `Playfair Display`, `Noto Serif`, `Lora`, `Comfortaa`, `Arial`, `Calibri`, `Courier New`.
  - Tùy chọn chuyển đổi linh hoạt: Áp dụng font chữ đồng bộ hoặc giữ nguyên 100% định dạng ban đầu của file Word.
- **Trình soạn thảo & Xem trước (Live Preview):**
  - Mô phỏng trang in khổ A4 (210mm x 297mm) với lề văn bản chuẩn hành chính Việt Nam.
  - Thanh duyệt bản ghi tương tác: Nhảy tới trang đầu, trước, kế tiếp, cuối cùng và nhập số bản ghi bất kỳ.
  - Chuyển đổi giữa Chế độ Soạn thảo (sửa nội dung, định dạng đậm, nghiêng, căn lề) và Chế độ Xem trước dữ liệu thật.
- **In ấn & Xuất bản:**
  - In trực tiếp văn bản hiện tại hoặc Lưu dưới dạng PDF qua trình duyệt.
  - In hàng loạt tất cả các bản ghi với cơ chế ngắt trang tự động chuẩn A4.
  - Xuất file `.docx` riêng lẻ hoặc đóng gói toàn bộ danh sách bản ghi thành file `.zip`.
- **Chuẩn hóa NSN App Standard:**
  - Nút **"Xóa danh sách import" (Clear Import Standard)** làm sạch toàn bộ state và form input.
  - Tích hợp đầy đủ các Tab: Hướng dẫn sử dụng, Phiên bản & Lịch sử, Tác giả, Mời cà phê ☕ (VietQR BIDV 8855989777 - Nguyễn Sơn Nam).
  - Tự động build bản Single-file HTML Offline: `releases/nsn-mail-merge-web-v1.0.0-offline.html`.
  - Tự động triển khai lên **GitHub Pages** qua GitHub Actions.
