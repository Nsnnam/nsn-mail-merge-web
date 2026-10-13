# Changelog — Nhật ký phát triển

Tất cả thay đổi đáng chú ý của dự án **Namns Merge Word** được ghi lại tại đây theo chuẩn [Keep a Changelog](https://keepachangelog.com/) và [Semantic Versioning](https://semver.org/).  
Múi giờ áp dụng: **Asia/Ho_Chi_Minh (GMT+7)**.

---

## [1.0.6] - 2026-10-13

### Thêm mới & Nâng cấp (Added & Enhanced)
- **Tùy chỉnh lề trang (Margin) linh hoạt:**
  - Mặc định tự động theo file Word tải lên: Trích xuất `<w:pgMar>` từ cấu trúc OpenXML của file `.docx`, giữ nguyên vẹn lề trang ban đầu (kể cả lề hẹp chuyên dụng 5.1mm của phiếu khám đoàn bệnh viện).
  - Tích hợp các preset lề: Nghị định 30/2020/NĐ-CP (Trên 20mm, Dưới 20mm, Trái 30mm đóng gáy, Phải 15mm), Tiêu chuẩn (25.4mm), Hẹp (12.7mm), Vừa phải (25.4/19.1mm).
  - Hộp thoại Tùy chỉnh (Custom): Nhập trực tiếp thông số mm Trên, Dưới, Trái, Phải và lưu áp dụng ngay.
  - Đồng bộ lề trang toàn diện: Phản ánh trực quan trên Editor/Preview (`padding`), chuẩn hóa khổ in A4 qua iframe cách ly, và tự động cập nhật thẻ `<w:pgMar>` của file Word `.docx` xuất ra nếu người dùng đổi lề.
- **Phông chữ mặc định Times New Roman:**
  - Thiết lập font mặc định cho file Word tải lên là **Times New Roman** (`id: 'times'`) chuẩn văn bản hành chính Việt Nam.
- **Cỡ chữ mặc định & Đa dạng tùy chọn:**
  - Tự động nhận diện cỡ chữ phổ biến của tài liệu Word tải lên (hoặc 13pt chuẩn NĐ 30).
  - Mở rộng đầy đủ tùy chọn cỡ chữ từ 8pt đến 36pt (8pt, 9pt, 10pt, 11pt, 12pt, 13pt, 14pt, 15pt, 16pt, 18pt, 20pt, 22pt, 24pt, 28pt, 32pt, 36pt) trực tiếp trên thanh công cụ soạn thảo và thanh định dạng.

---

## [1.0.5] - 2026-10-13

### Thêm mới & Nâng cấp (Added & Enhanced)
- **Mặc định Chế độ Soạn thảo (Edit mode):** Tự động mở chế độ soạn thảo ngay khi nạp file hoặc đổi mẫu văn bản.
- **Bảo toàn khoảng trắng & Tab spacer:** Giữ trọn vẹn nhiều dấu cách liên tiếp và khoảng cách Tab giữa các đoạn văn bản (Họ tên, Giới tính, Ngày sinh, SĐT... không bị dính chữ).
- **Chuẩn hóa hiển thị bảng biểu:** Tự động căn giữa cột STT và dòng tiêu đề, lọc sạch các đoạn văn rỗng cuối ô.
- **Bộ công cụ Table Suite toàn diện:** Thao tác thêm/xóa hàng trên/dưới, thêm/xóa cột trái/phải, căn lề ô (trái/giữa/phải/đều), căn dọc (đỉnh/giữa/đáy), đổi màu nền ô, viền nét liền/bỏ viền, tạo bảng tùy biến kích thước.
- **Hỗ trợ phím Tab trực tiếp:** Nhấn phím Tab trong trình soạn thảo để nhảy thụt dòng thay vì mất focus.
- **Ký tự đặc biệt & Ô kiểm:** Chèn nhanh dấu tích (✓, ✔), ô kiểm (☐, ☑), mũi tên, bullet, dấu sao.
- **Kho lưu trữ mẫu & Sao lưu / Phục hồi (.JSON):** Quản lý mẫu trong LocalStorage và xuất/nhập file sao lưu .JSON.

---

## [1.0.4] - 2026-10-13

### Sửa lỗi & Nâng cấp (Fixed & Enhanced)
- Phân tích OpenXML trực tiếp: Bảo toàn 100% màu sắc (Heading blue, text color, highlight, shading), đường viền bảng và độ rộng cột.
- Nhận diện và chuyển hóa MERGEFIELD sang {{Ten_Cot}}.
- Nạp nhiều file cùng lúc (Multi-file upload) và xóa hàng loạt (Bulk Delete).
- Mở rộng chủ đề Gradient toàn diện lên header, button, viền phát sáng.

---

## [1.0.3] - 2026-10-13

### Thay đổi & Giao diện (Changed & UI)
- Đổi tên ứng dụng ngắn gọn thành **"Namns Merge Word"**, mô tả **"Chỉnh sửa và trộn thư"**.
- Thiết kế lại Logo vector & Icon web nhận diện thương hiệu chuyên nghiệp dạng đa lớp văn bản hiện đại.
- Tự động thu gọn bảng nạp tệp sau khi đã nạp dữ liệu.
- 6 chủ đề Gradient cao cấp và bộ font giao diện tiếng Việt bền vững.

---

## [1.0.2] - 2026-10-13

### Sửa lỗi & Nâng cấp (Fixed & Enhanced)
- **Sửa triệt để lỗi in toàn trang web:** Áp dụng cơ chế in qua `iframe` cách ly và CSS `@media print` nghiêm ngặt, đảm bảo khi bấm "In bản ghi này" hoặc "In tất cả" máy in chỉ nhận duy nhất nội dung văn bản A4, loại bỏ 100% header, footer, nút bấm và nền xám của web.
- **Kế thừa định dạng văn bản cho biến khi in:** Xóa bỏ hoàn toàn khung viền xanh và màu nền khi in ra giấy hoặc xuất PDF. Biến chèn vào kế thừa trọn vẹn màu sắc (đỏ, xanh, đen...), in đậm, in nghiêng, cỡ chữ tương ứng của vị trí văn bản.
- **Nâng cấp thanh công cụ soạn thảo chuyên sâu:** Bổ sung đầy đủ tính năng soạn thảo văn bản kiểu Microsoft Word:
  - Hoàn tác / Làm lại (Undo / Redo)
  - Chọn kiểu đoạn: Đoạn văn (Normal), Tiêu đề 1 (H1), Tiêu đề 2 (H2), Tiêu đề 3 (H3)
  - Cỡ chữ nhanh (11pt, 12pt, 13pt, 14pt chuẩn NĐ 30, 16pt, 18pt...)
  - Bảng chọn màu chữ (Text Color) và màu nền đánh dấu (Highlight)
  - Gạch ngang chữ (Strikethrough)
  - Danh sách đầu dòng, Danh sách số, Tăng / Giảm lề dòng (Indent / Outdent)
  - Chèn bảng biểu (Table 3x3) và đường kẻ phân cách ngang (`<hr>`)
  - Nút Xóa định dạng (Clear formatting)
- **Tính năng mới - Xuất 1 file Word .DOCX gộp toàn bộ:** Cho phép gộp tất cả các dòng dữ liệu thành một file Word `.docx` duy nhất, mỗi bản ghi được ngắt trang chuẩn xác bằng mã ngắt trang OpenXML (`<w:br w:type="page"/>`), giữ nguyên 100% định dạng bảng biểu và lề trang.
- **Nhúng sẵn bản nhị phân mẫu .docx:** Tích hợp file mẫu OpenXML trực tiếp vào ứng dụng để luôn đảm bảo xuất Word chuẩn định dạng kể cả khi dùng mẫu mặc định.

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
