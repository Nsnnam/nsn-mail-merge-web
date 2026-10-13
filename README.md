# Namns Merge Word 📄✨

> **Chỉnh sửa và trộn thư**  
> Ứng dụng trộn thư Word &amp; Excel thông minh trên nền Web: Đa font Unicode tiếng Việt (Be Vietnam Pro, Times New Roman, Roboto...), tùy biến 6 giao diện Gradient cao cấp, xem trước trực quan (Live Preview), in A4 cách ly & xuất file PDF / Word (.docx) hàng loạt.  
> Tuân thủ chuẩn **NSN App Standard** · Offline 100% Client-Side trong bộ nhớ trình duyệt.

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Online-blue?style=flat-square&logo=github)](https://Nsnnam.github.io/nsn-mail-merge-web/)
[![Phiên bản](https://img.shields.io/badge/Phiên_bản-v1.0.3-emerald?style=flat-square)](CHANGELOG.md)
[![Tác giả](https://img.shields.io/badge/Tác_giả-Nguyễn_Sơn_Nam-indigo?style=flat-square)](AUTHORS.md)
[![Ủng hộ](https://img.shields.io/badge/Mời_cà_phê-BIDV_8855989777-amber?style=flat-square)](SUPPORT.md)

---

## 🌟 Tính năng nổi bật

1. **Giao diện hiện đại & Tối ưu không gian làm việc**:
   - **Tự động thu gọn bảng nạp tệp**: Sau khi nạp file Word và Excel thành công, bảng nạp tệp tự động thu gọn thành một thanh tóm tắt siêu mỏng, tối đa hóa diện tích soạn thảo văn bản và thao tác dữ liệu.
   - **6 Chủ đề Gradient cao cấp**: Xanh Biển Hiện Đại (Ocean), Hoàng Hôn Tím Hồng (Sunset), Ngọc Bích Công Nghệ (Emerald), Đêm Huyền Bí (Midnight), Hổ Phách Năng Lượng (Amber), Cực Quang Xanh (Aurora).
   - **Đổi font toàn bộ giao diện Web**: Cho phép chuyển đổi nhanh giữa *Be Vietnam Pro*, *Inter*, *Roboto*, *Montserrat*, *Nunito*, *Open Sans* và tự động lưu bền vững vào `localStorage`.
   - **Bố cục 2 cột thông minh**: Cột trái chứa trang văn bản Word A4 cuộn độc lập mượt mà; cột phải chứa **Cột Excel khả dụng** luôn ghim cố định (`sticky`), hỗ trợ tìm kiếm cột và đối chiếu nhanh.
2. **Nhập mẫu Word (.docx) & Tự động nhận diện biến**:
   - Trích xuất định dạng HTML trực quan từ file Word mẫu.
   - Quét và gợi ý các thẻ placeholder dạng `{{Tên_Cột}}` hoặc `{Tên_Cột}`.
   - Nhúng sẵn file mẫu nhị phân `.docx` OpenXML để đảm bảo định dạng chuẩn mực ngay từ đầu.
3. **Chèn biến chính xác vào con trỏ & Bôi đen**:
   - **Khi bôi đen chữ**: Bấm nút *"+ Chèn vào con trỏ"* sẽ **xóa và thay thế đè đúng đoạn chữ đang bôi đen** bằng thẻ `{{Tên_Cột}}`.
   - **Khi con trỏ đang nhấp nháy**: Biến được chèn chuẩn xác ngay tại vị trí con trỏ (kể cả trong bảng biểu).
4. **Bộ thanh công cụ Soạn thảo chuyên sâu kiểu Microsoft Word**:
   - Undo/Redo, H1/H2/H3/Normal, cỡ chữ (11pt - 24pt), bảng chọn màu chữ & màu highlight, in đậm, in nghiêng, gạch chân, gạch ngang, căn lề 4 hướng, danh sách, thụt lề, chèn bảng biểu 3x3, kẻ ngang, xóa định dạng.
5. **In A4 cách ly sạch sẽ & Xuất PDF**:
   - Áp dụng cơ chế in qua `iframe` cách ly độc lập và CSS `@media print` nghiêm ngặt: **CHỈ in duy nhất trang văn bản A4**, loại bỏ 100% header, footer, thanh sidebar và nút bấm của web.
   - Nội dung biến chèn vào khi in **kế thừa 100% định dạng** (màu sắc, in đậm/nghiêng) của văn bản xung quanh, không còn khung viền hay nền xanh.
6. **Xuất Word linh hoạt**:
   - **Xuất .DOCX (Bản ghi này)**: Giữ nguyên 100% định dạng, bảng biểu, lề trang của Word gốc.
   - **Gộp 1 file .DOCX (Tất cả bản ghi)**: Gộp toàn bộ danh sách dữ liệu vào **1 file Word duy nhất**, mỗi bản ghi được ngắt trang chuẩn OpenXML `<w:br w:type="page"/>`.
   - **Gói .ZIP**: Trộn và đóng gói mỗi bản ghi thành 1 file docx riêng trong file nén ZIP.
7. **Bảo mật tuyệt đối 100% Client-Side**:
   - Toàn bộ dữ liệu xử lý trong RAM trình duyệt, không gửi dữ liệu ra máy chủ ngoài.
   - Phát hành kèm bản **Single-file HTML Offline** chạy độc lập không cần mạng.

---

## 🚀 Trải nghiệm trực tiếp

- **Phiên bản Online (GitHub Pages):**  
  👉 **[https://Nsnnam.github.io/nsn-mail-merge-web/](https://Nsnnam.github.io/nsn-mail-merge-web/)**
- **Phiên bản Offline (Single HTML):**  
  File phát hành: `releases/namns-mergeword-v1.0.3-offline.html` (nhấp đúp chuột là mở chạy ngay).

---

## 🛠️ Hướng dẫn cài đặt & phát triển cục bộ

```bash
# Clone repository
git clone https://github.com/Nsnnam/nsn-mail-merge-web.git
cd nsn-mail-merge-web

# Cài đặt dependencies (yêu cầu Node 18+ và pnpm)
pnpm install

# Chạy môi trường phát triển (Dev)
pnpm run dev

# Build sản phẩm Web (Dist)
pnpm run build

# Build file Single HTML Offline độc lập
pnpm run build:single
```

---

## ☕ Tác giả & Ủng hộ

- **Tác giả:** Nguyễn Sơn Nam (Nsnnam / NamNS / NSN)
- **GitHub:** [https://github.com/Nsnnam](https://github.com/Nsnnam)
- **Ủng hộ tách cà phê:**
  - **Chủ TK:** NGUYEN SON NAM
  - **Số TK:** `8855989777`
  - **Ngân hàng:** BIDV — PGD Nguyễn Tất Thành
  - Quét mã VietQR trong tab **Mời cà phê** hoặc xem chi tiết tại [SUPPORT.md](SUPPORT.md).
