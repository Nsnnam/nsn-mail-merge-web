# NSN Word Mail Merge Web Pro 📄✨

> **Ứng dụng Mail Merge Word - Excel thông minh trên nền Web**  
> Hỗ trợ đa font Unicode tiếng Việt (Be Vietnam Pro, Times New Roman, Roboto...), xem trước trực quan (Live Preview), in trực tiếp & xuất file PDF / Word hàng loạt.  
> Tuân thủ chuẩn **NSN App Standard** · Offline 100% Client-Side trong bộ nhớ trình duyệt.

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Online-blue?style=flat-square&logo=github)](https://Nsnnam.github.io/nsn-mail-merge-web/)
[![Phiên bản](https://img.shields.io/badge/Phiên_bản-v1.0.2-emerald?style=flat-square)](CHANGELOG.md)
[![Tác giả](https://img.shields.io/badge/Tác_giả-Nguyễn_Sơn_Nam-indigo?style=flat-square)](AUTHORS.md)
[![Ủng hộ](https://img.shields.io/badge/Mời_cà_phê-BIDV_8855989777-amber?style=flat-square)](SUPPORT.md)

---

## 🌟 Tính năng nổi bật

1. **Nhập mẫu Word (.docx) & Tự động nhận diện biến**:
   - Trích xuất định dạng HTML trực quan từ file Word mẫu.
   - Quét và gợi ý các thẻ placeholder dạng `{{Tên_Cột}}` hoặc `{Tên_Cột}`.
2. **Nhập bảng tính Excel (.xlsx, .xls, .csv)**:
   - Tự động phát hiện danh sách Sheet và cho phép chuyển đổi linh hoạt.
   - Hiển thị danh sách các Cột / Thẻ biến: Click để chèn ngay vào vị trí con trỏ văn bản & sao chép vào clipboard.
   - Có sẵn nút **"Dùng thử mẫu có sẵn"** và **"Tải mẫu Excel"** để thử nghiệm ngay lập tức.
3. **Bộ font chữ Unicode tiếng Việt phong phú (15+ fonts)**:
   - **Be Vietnam Pro**: Font hiện đại, tối ưu tuyệt đối cho tiếng Việt.
   - **Times New Roman**: Chuẩn thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP).
   - **Roboto, Open Sans, Inter, Montserrat, Nunito**: Bộ font không chân hiện đại, sắc nét.
   - **Merriweather, Playfair Display, Noto Serif, Lora**: Bộ font có chân cổ điển, trang trọng cho giấy mời/chứng chỉ.
   - Tùy chọn **"Giữ nguyên định dạng Word ban đầu"** nếu muốn giữ nguyên 100% style gốc của file mẫu.
4. **Trình soạn thảo & Xem trước (Live Preview) mô phỏng A4**:
   - Chế độ **Soạn thảo**: Tự do chỉnh sửa nội dung, in đậm, in nghiêng, căn lề.
   - Chế độ **Xem trước**: Thay thế toàn bộ biến bằng dữ liệu thực tế của từng dòng Excel.
   - Thanh điều khiển chuyển bản ghi: Đầu (`|<<`), Trước (`<`), Nhảy tới trang, Kế (`>`), Cuối (`>>|`).
5. **In ấn & Xuất bản linh hoạt**:
   - **In bản ghi này**: In nhanh văn bản hiện tại hoặc Lưu dưới dạng PDF qua trình duyệt.
   - **In tất cả hàng loạt**: Tự động chia trang A4 hoàn hảo (`page-break-after: always`) để in toàn bộ danh sách bản ghi ra máy in hoặc xuất file PDF gộp.
   - **Xuất .DOCX**: Tạo file Word thực tế của bản ghi hiện tại bằng `docxtemplater` giữ nguyên format bảng biểu.
   - **Xuất gói .ZIP**: Trộn và đóng gói toàn bộ danh sách văn bản thành file nén `.zip`.
6. **Bảo mật dữ liệu 100% Client-Side**:
   - Dữ liệu Word và Excel xử lý trực tiếp trên trình duyệt bằng JavaScript, **không gửi bất kỳ thông tin nào lên máy chủ**.
   - Hỗ trợ bản **Single-file HTML offline** có thể lưu vào USB hoặc mở chạy không cần kết nối mạng.
7. **Nút Xóa / Reset danh sách (Clear Import Standard)**:
   - Xóa trắng dữ liệu nạp, trả về trạng thái ban đầu sạch sẽ theo chuẩn NSN.

---

## 🚀 Trải nghiệm trực tiếp

- **Phiên bản Online (GitHub Pages):**  
  👉 **[https://Nsnnam.github.io/nsn-mail-merge-web/](https://Nsnnam.github.io/nsn-mail-merge-web/)**
- **Phiên bản Offline (Single HTML):**  
  File phát hành: `releases/nsn-mail-merge-web-v1.0.0-offline.html` (chỉ cần nhấp đúp chuột là mở chạy trên Chrome, Edge, Cốc Cốc...).

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

## 📋 Cấu trúc thư mục

```text
nsn-mail-merge-web/
├── .github/workflows/deploy.yml   # CI/CD tự động deploy lên GitHub Pages
├── docs/                          # Tài liệu & ảnh VietQR cà phê
│   └── coffee-qr.jpg
├── releases/                      # Bản phát hành Single HTML Offline
│   └── nsn-mail-merge-web-v1.0.0-offline.html
├── src/
│   ├── components/                # Các thành phần giao diện (Header, Editor, Mapping...)
│   ├── lib/                       # Xử lý docx, excel, fonts, metadata
│   ├── types/                     # Định nghĩa TypeScript
│   ├── App.tsx                    # Logic điều phối chính
│   └── main.tsx                   # Entry point
├── index.html                     # HTML gốc tích hợp Google Fonts tiếng Việt
├── package.json
├── tailwind.config.js
└── vite.config.ts
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
