# Namns Merge Word 📄✨

> **Chỉnh sửa và trộn thư**  
> Ứng dụng trộn thư Word &amp; Excel thông minh trên nền Web: Đa font Unicode tiếng Việt (Times New Roman, Be Vietnam Pro, Roboto...), tùy biến 6 giao diện Gradient cao cấp, căn lề trang linh hoạt (theo file Word gốc hoặc chuẩn Nghị định 30/2020), xem trước trực quan (Live Preview), in A4 cách ly & xuất file PDF / Word (.docx) hàng loạt.  
> Tuân thủ chuẩn **NSN App Standard** · Offline 100% Client-Side trong bộ nhớ trình duyệt.

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Online-blue?style=flat-square&logo=github)](https://Nsnnam.github.io/nsn-mail-merge-web/)
[![Phiên bản](https://img.shields.io/badge/Phiên_bản-v1.0.11-emerald?style=flat-square)](CHANGELOG.md)
[![Tác giả](https://img.shields.io/badge/Tác_giả-Nguyễn_Sơn_Nam-indigo?style=flat-square)](AUTHORS.md)
[![Ủng hộ](https://img.shields.io/badge/Mời_cà_phê-BIDV_8855989777-amber?style=flat-square)](SUPPORT.md)

---

## 🌟 Tính năng nổi bật

1. **Bộ công cụ Chèn đối tượng chuẩn Microsoft Word (Word Insert Suite)**:
   - **Chèn Bảng trực quan với ma trận lưới 8x10 (Interactive Table Matrix)**: Rê chuột chọn nhanh kích thước bảng từ 1x1 đến 8x10 với hiệu ứng đổi màu và hiển thị số hàng x số cột thời gian thực; nút mở modal chèn bảng tùy chọn kích thước (lên tới 50x20) và khối Chèn bảng mẫu nhanh (Bảng thông tin 2 cột, Bảng đối chiếu 3 cột, Bảng ký tên 4 cột, Bảng khám chuyên khoa y tế 5 cột).
   - **Chèn Ảnh từ máy tính hoặc URL (Insert Picture)**: Tải ảnh từ máy tính (PNG, JPG, WebP, SVG, GIF...) tự động chuyển đổi thành Base64 Data URL hoạt động 100% Client-Side Offline, không phụ thuộc server ngoài; tùy biến kích cỡ (150px, 300px, 500px, 100%, hoặc pixel tùy ý), căn lề (Trái, Giữa, Phải), bo góc (0px - 16px) và viền mờ thẩm mỹ.
   - **Bộ sưu tập Biểu tượng & Icon đa năng (Icons & Symbols / Shapes)**: Phân nhóm 5 danh mục trực quan gồm Dấu kiểm & Hộp chọn (✓, ✔, ☐, ☑, ✕...), Văn phòng & Y tế (📞, ✉️, 🏢, 🏥, 🩺...), Mũi tên & Phân cách (➔, ⇄, •, ❖...), Toán học & Tiền tệ (₫, $, €, %, ±, ∞...) cùng Khung ghi chú nổi bật (Callout Boxes: Hộp thông tin, Kết quả/Đạt, Lưu ý quan trọng, Cảnh báo, Trích dẫn và Đường kẻ phân cách hoa văn).
   - **Bảo toàn vùng chọn con trỏ chuột (Selection Preservation)**: Đảm bảo chèn chính xác đối tượng tại vị trí con trỏ hoặc thay thế đoạn bôi đen mà không bị mất dấu hay nhảy trang.
2. **Bộ tùy chỉnh & Định dạng Bảng biểu chuẩn Microsoft Word (Word Table & Border Suite)**:
   - **Menu chọn đường viền chuẩn Word**: Tích hợp trọn bộ 15 tùy chọn viền với biểu tượng trực quan y hệt Word (Viền dưới, Viền trên, Viền trái, Viền phải, Không viền, Tất cả viền, Chỉ viền ngoài, Chỉ viền trong, Viền ngang bên trong, Viền dọc bên trong, Đường chéo ô \ và /, Kẻ ngang phân cách, và Xem đường lưới View Gridlines).
   - **Tùy biến đường viền & Tô bóng (Borders and Shading)**: Lựa chọn kiểu nét (Solid, Dashed, Dotted, Double, Groove), độ dày nét (0.5pt - 3pt), màu viền tùy chọn, áp dụng cho toàn bảng hoặc từng ô đang chọn.
   - **Gộp ô & Tách ô (Merge & Split Cells)**: Gộp ô sang phải (`colspan`), gộp ô xuống dưới (`rowspan`) và tách ô đã gộp (`split cell`).
   - **Phân bố đều cột (Distribute Columns)**: Tự động chia đều 100% độ rộng cho các cột trong bảng.
   - **Căn vị trí bảng & Tự co giãn (AutoFit)**: Căn trái bảng, Căn giữa bảng trên trang A4, Căn phải bảng; điều chỉnh độ rộng bảng 100%, AutoFit, 90%, 80%.
   - **Khoảng đệm ô (Cell Padding)**: Tùy chỉnh đệm Siêu gọn 2px (tối ưu cho phiếu khám đoàn, bệnh viện nhiều cột hẹp), Chuẩn 5px, Thoáng đãng 9px.
   - **Dòng tiêu đề Header (`<th>`) & Sọc xen kẽ (Zebra Striping)**: Bật/tắt nhanh chóng.
   - **Đồng bộ hóa toàn diện**: Nút viền Word trực tiếp trên Toolbar, Menu Công cụ Bảng phân 4 Tab (Đường viền, Dòng & Cột, Gộp & Căn, Định dạng) và Menu ngữ cảnh chuột phải.
2. **Bảng chọn màu chuẩn phong cách Microsoft Word (Word Style Color Palette)**:
   - **Thay thế hộp thoại màu mặc định của trình duyệt**: Chuyển đổi toàn diện sang giao diện bảng chọn màu dạng ô lưới trực quan, chính xác theo chuẩn văn phòng Microsoft Word.
   - **Đầy đủ 3 chế độ màu**: Màu chữ (Font Color), Màu đánh dấu nền chữ (Highlight Color) và Màu nền ô bảng biểu (Cell Background Color).
   - **Tùy chọn chuẩn Word**: Nút "Tự động (Màu đen #000000)", nút "Không màu (Mặc định / Bỏ màu nền)", Khối 15 màu dạ quang highlight, Khối Màu chủ đề Theme Colors (10 cột x 6 hàng sắc độ), Khối Màu tiêu chuẩn Standard Colors (10 màu) và "Màu khác (More Colors)..." nhập mã Hex hoặc chọn quang phổ tự do.
   - **Đồng bộ trên cả Thanh công cụ chính và Menu chuột phải**: Tích hợp cơ chế bảo toàn vùng chọn (Selection Preservation) không làm mất đoạn chữ bôi đen, cùng thuật toán chống tràn màn hình thông minh.
2. **Tùy chỉnh Lề trang (Margin) & Font chữ chuẩn hành chính**:
   - **Mặc định theo file Word tải lên**: Tự động trích xuất thẻ `<w:pgMar>` từ cấu trúc OpenXML của file `.docx`, giữ trọn vẹn thông số lề (kể cả các tài liệu lề hẹp chuyên dụng khám đoàn bệnh viện ~5mm).
   - **Chuẩn Nghị định 30/2020/NĐ-CP**: Cung cấp preset thể thức văn bản hành chính Việt Nam (Trên 20mm, Dưới 20mm, Trái 30mm đóng gáy, Phải 15mm), Tiêu chuẩn (25.4mm), Hẹp (12.7mm), Vừa phải.
   - **Tùy chỉnh Millimeter (mm) linh hoạt**: Cho phép người dùng nhập trực tiếp khoảng cách lề Trên, Dưới, Trái, Phải và lưu áp dụng ngay.
   - **Đồng bộ lề trang toàn diện**: Hiển thị trực quan trên trang A4 của Editor/Preview, chuẩn hóa khung in A4 cách ly và cập nhật lại thẻ `<w:pgMar>` của file Word `.docx` xuất ra.
   - **Font mặc định Times New Roman**: Mặc định áp dụng Times New Roman khi nạp file Word tải lên.
   - **Cỡ chữ theo mẫu & Đa dạng tùy chọn**: Tự động nhận diện cỡ chữ của tài liệu mẫu, hỗ trợ chuyển đổi linh hoạt từ 8pt đến 36pt.
2. **Menu ngữ cảnh chuột phải (Context Menu) thông minh**:
   - **Tự động nhận diện ngữ cảnh**: Khi click chuột phải vào bảng biểu, lập tức mở menu công cụ bảng (thêm/xóa dòng, thêm/xóa cột, căn lề ô ngang/dọc, màu nền ô, viền bảng nét liền/bỏ viền, xóa bảng).
   - **Định dạng văn bản trực tiếp**: Khi bôi đen hoặc click vào chữ, chuột phải cho phép thay đổi font chữ, cỡ chữ, in đậm, nghiêng, gạch chân, đổi màu chữ, màu highlight, xóa định dạng, căn lề 4 hướng, thụt lề, chèn Tab, chèn ký tự đặc biệt, ô kiểm, Hoàn tác / Làm lại.
   - **Bảo toàn vùng bôi đen**: Cơ chế `preventDefault` trên sự kiện chuột giúp không bao giờ bị mất đoạn chữ bôi đen khi chọn các lệnh trên menu.
   - **Thuật toán chống tràn màn hình**: Định vị thông minh không bị che khuất hoặc tràn viền màn hình; tự đóng khi ấn phím Escape hoặc click ra ngoài.
3. **Kho mẫu văn bản & Lưu kèm lề / font (.JSON)**:
   - Lưu trữ các mẫu văn bản đã chỉnh sửa vào `localStorage` trình duyệt và tự động gắn kèm cấu hình lề (mm), font và cỡ chữ.
   - Khi load lại mẫu hoặc khôi phục từ file JSON sao lưu, hệ thống tự động thiết lập lại đúng lề và font của mẫu đó.
   - Xuất/Tải file sao lưu `.JSON` về máy tính cá nhân để lưu trữ lâu dài.
   - Khôi phục nhanh chóng kho mẫu từ file `.JSON` bất kỳ lúc nào.
4. **Giao diện hiện đại & Tối ưu không gian làm việc**:
   - **Giãn tối đa theo kích thước thiết bị**: Container mở rộng tới `max-w-[1750px]`, tận dụng toàn bộ bề ngang màn hình máy tính Full HD/2K/4K, không bị bó hẹp hay để lãng phí khoảng trống 2 bên.
   - **Mặc định Chế độ Soạn thảo (Edit Mode)**: Khi import hoặc nạp tệp, trang web lập tức mở chế độ soạn thảo giúp người dùng thao tác định dạng và chèn biến ngay mà không cần thêm thao tác chuyển đổi.
   - **Mặc định hiển thị bảng nạp tệp**: Khi khởi tạo trang web, bảng nạp tệp hiển thị rõ ràng, thân thiện; sau khi người dùng nạp file Word và Excel, bảng sẽ tự động thu gọn để tối ưu hóa diện tích làm việc.
   - **Nạp nhiều file cùng lúc & Xóa hàng loạt**: Cho phép kéo thả hoặc chọn nhiều file Word (.docx) và nhiều file Excel (.xlsx) cùng lúc, kèm bảng quản lý tệp, chuyển đổi nhanh giữa các mẫu và xóa hàng loạt (Bulk Delete).
   - **6 Chủ đề Gradient cao cấp**: Xanh Biển Hiện Đại (Ocean), Hoàng Hôn Tím Hồng (Sunset), Ngọc Bích Công Nghệ (Emerald), Đêm Huyền Bí (Midnight), Hổ Phách Năng Lượng (Amber), Cực Quang Xanh (Aurora) lan tỏa toàn diện từ thanh tiêu đề, viền phát sáng đến các nút bấm thao tác.
   - **Đổi font toàn bộ giao diện Web**: Cho phép chuyển đổi nhanh giữa *Be Vietnam Pro*, *Inter*, *Roboto*, *Montserrat*, *Nunito*, *Open Sans* và tự động lưu bền vững vào `localStorage`.
   - **Bố cục 2 cột thông minh**: Cột trái chứa trang văn bản Word A4 cuộn độc lập mượt mà; cột phải chứa **Cột Excel khả dụng** luôn ghim cố định (`sticky`), hỗ trợ tìm kiếm cột và đối chiếu nhanh.
3. **Bảo toàn 100% định dạng, màu sắc & Bảng biểu Word gốc**:
   - Tích hợp bộ phân tích OpenXML trực tiếp: Bảo toàn màu sắc văn bản (Heading blue, text color, highlight, shading), đường viền bảng biểu (TableGrid), độ rộng từng cột và căn lề.
   - **Bảo toàn Tab spacer & Dấu cách liên tiếp**: Không bị HTML thu gọn nhiều khoảng trắng (Họ tên, Giới tính, Ngày sinh, SĐT... giữ trọn vẹn khoảng cách phân tách).
   - **Chuẩn hóa bảng biểu**: Tự động căn giữa cột STT và dòng tiêu đề, lọc bỏ các dòng rỗng cuối ô ngăn chặn khoảng trống dọc thừa.
   - Tự động nhận diện và chuyển hóa các trường trộn bản địa của Microsoft Word (`MERGEFIELD`) sang cú pháp thẻ `{{Tên_Cột}}`.
   - Mặc định kích hoạt chế độ **"Giữ nguyên định dạng ban đầu của file Word gốc"**.
4. **Bộ công cụ Soạn thảo WYSIWYG & Table Suite toàn diện**:
   - **Hệ thống Hoàn tác / Làm lại (Undo / Redo) chuyên dụng**: Quản lý lịch sử thay đổi HTML bằng Custom History Stack độc lập, bắt trọn phím tắt `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z` và nút bấm trực quan.
   - **Bộ công cụ Bảng biểu (Table Suite) chống tràn**: Căn lề thông minh vào trong, thanh cuộn độc lập chống cắt đáy, tích hợp thêm/xóa dòng trên/dưới, thêm/xóa cột trái/phải, xóa bảng, căn lề ô (trái/giữa/phải/đều), căn dọc ô (đỉnh/giữa/đáy), đổi màu nền ô, viền nét liền/bỏ viền và tạo bảng tùy biến kích thước hàng x cột.
   - **Hỗ trợ phím Tab trực tiếp**: Nhấn phím Tab trong trình soạn thảo để nhảy thụt dòng chuẩn xác.
   - **Ký tự đặc biệt & Ô kiểm**: Chèn nhanh dấu tích (✓, ✔), ô vuông kiểm tra (☐, ☑), mũi tên, dấu sao, bullet.
   - Cỡ chữ (8pt - 36pt), giãn dòng (1.0 - 2.0), bảng chọn màu chữ & màu highlight, in đậm, in nghiêng, gạch chân, gạch ngang, chỉ số trên/dưới ($X^2$, $X_2$), căn lề 4 hướng, danh sách, thụt lề, kẻ ngang, xóa định dạng.
5. **Kho mẫu văn bản & Sao lưu / Phục hồi (.JSON)**:
   - Lưu trữ các mẫu văn bản đã chỉnh sửa vào `localStorage` trình duyệt.
   - Xuất/Tải file sao lưu `.JSON` về máy tính cá nhân để lưu trữ lâu dài.
   - Khôi phục nhanh chóng kho mẫu từ file `.JSON` bất kỳ lúc nào.
6. **Chèn biến chính xác vào con trỏ & Bôi đen**:
   - **Khi bôi đen chữ**: Bấm nút *"+ Chèn vào con trỏ"* sẽ **xóa và thay thế đè đúng đoạn chữ đang bôi đen** bằng thẻ `{{Tên_Cột}}`.
   - **Khi con trỏ đang nhấp nháy**: Biến được chèn chuẩn xác ngay tại vị trí con trỏ (kể cả trong bảng biểu).
7. **In A4 cách ly sạch sẽ & Xuất PDF**:
   - Áp dụng cơ chế in qua `iframe` cách ly độc lập và CSS `@media print` nghiêm ngặt: **CHỈ in duy nhất trang văn bản A4**, loại bỏ 100% header, footer, thanh sidebar và nút bấm của web.
   - Nội dung biến chèn vào khi in **kế thừa 100% định dạng** (màu sắc, in đậm/nghiêng) của văn bản xung quanh, không còn khung viền hay nền xanh.
8. **Xuất Word linh hoạt**:
   - **Xuất .DOCX (Bản ghi này)**: Giữ nguyên 100% định dạng, bảng biểu, lề trang của Word gốc.
   - **Gộp 1 file .DOCX (Tất cả bản ghi)**: Gộp toàn bộ danh sách dữ liệu vào **1 file Word duy nhất**, mỗi bản ghi được ngắt trang chuẩn OpenXML `<w:br w:type="page"/>`.
   - **Gói .ZIP**: Trộn và đóng gói mỗi bản ghi thành 1 file docx riêng trong file nén ZIP.
9. **Bảo mật tuyệt đối 100% Client-Side**:
   - Toàn bộ dữ liệu xử lý trong RAM trình duyệt, không gửi dữ liệu ra máy chủ ngoài.
   - Phát hành kèm bản **Single-file HTML Offline** chạy độc lập không cần mạng.

---

## 🚀 Trải nghiệm trực tiếp

- **Phiên bản Online (GitHub Pages):**  
  👉 **[https://Nsnnam.github.io/nsn-mail-merge-web/](https://Nsnnam.github.io/nsn-mail-merge-web/)**
- **Phiên bản Offline (Single HTML):**  
  File phát hành: `releases/namns-mergeword-v1.0.6-offline.html` (nhấp đúp chuột là mở chạy ngay).


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
