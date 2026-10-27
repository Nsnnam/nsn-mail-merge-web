# Changelog — Nhật ký phát triển

Tất cả thay đổi đáng chú ý của dự án **Namns Merge Word** được ghi lại tại đây theo chuẩn [Keep a Changelog](https://keepachangelog.com/) và [Semantic Versioning](https://semver.org/).  
Múi giờ áp dụng: **Asia/Ho_Chi_Minh (GMT+7)**.

## [1.0.11] - 2026-10-27

### Thêm mới & Nâng cấp (Added & Enhanced)
- **Tích hợp trọn bộ công cụ Chèn đối tượng chuẩn Microsoft Word (Word Insert Suite):**
  - Tách biệt độc lập các luồng tác vụ: **Chèn Bảng (Insert Table)**, **Chèn Ảnh (Pictures)**, và **Biểu tượng & Icon (Icons & Symbols / Shapes)** trực tiếp trên Thanh công cụ chính và Menu ngữ cảnh chuột phải.
- **Ma trận lưới Chèn Bảng trực quan (Interactive Table Matrix 8x10):**
  - Giao diện chọn kích thước bảng dạng lưới ô vuông 8 hàng x 10 cột y hệt Microsoft Word.
  - Rê chuột (hover) để xem trước số hàng x số cột theo thời gian thực (như 3x3, 4x5, 6x8...) và nhấp chuột để chèn ngay lập tức vào văn bản.
  - Tích hợp nút *"Chèn bảng tùy chọn (Insert Table)..."* mở modal nhập số dòng, số cột tùy ý (lên tới 50 hàng x 20 cột).
  - Tích hợp khối *"Bảng mẫu nhanh (Quick Tables)"*: Chèn 1-click Bảng thông tin 2 cột, Bảng đối chiếu 3 cột, Bảng ký tên 4 cột, Bảng khám chuyên khoa y tế 5 cột.
- **Tính năng Chèn Hình ảnh (Insert Picture) chuẩn Word:**
  - Hỗ trợ 2 phương thức: Tải ảnh từ máy tính (PNG, JPG, WebP, SVG, GIF, BMP...) hoặc Chèn từ liên kết ảnh trực tuyến (Image URL).
  - Tự động chuyển đổi ảnh tải lên thành Base64 Data URL, lưu trữ trực tiếp trong tài liệu HTML, hoạt động 100% Client-Side Offline trong RAM trình duyệt, không phụ thuộc server ngoài, in ấn và xuất file Word .DOCX giữ nguyên ảnh hoàn hảo.
  - Tùy chỉnh kích thước ảnh linh hoạt: Nhỏ (150px), Vừa (300px), Lớn (500px), 100% chiều rộng trang, hoặc nhập kích thước pixel tùy ý.
  - Căn lề ảnh chuẩn Word: Căn Trái, Căn Giữa trang, Căn Phải.
  - Tùy chọn bo góc ảnh (0px, 4px, 8px, 16px) và viền mờ thẩm mỹ.
- **Bộ sưu tập Biểu tượng & Icon đa năng (Unicode & Shapes & Callout Boxes):**
  - Phân nhóm 5 danh mục trực quan:
    1. *✓ Kiểm & Hộp chọn*: Dấu tick, dấu x, checkbox ô vuông, cờ, ghim, sao...
    2. *🏢 Hành chính & Y tế*: Điện thoại, email, địa chỉ, bệnh viện, ống nghe, bác sĩ, lịch, đồng hồ...
    3. *➔ Mũi tên & Phân cách*: Mũi tên đa hướng, bullet point, hoa thị, hình thoi...
    4. *₫ Toán học & Tiền tệ*: Ký hiệu VNĐ (₫), Dollar, Euro, phần trăm, cộng trừ, nhân chia, vô cùng, căn bậc hai...
    5. *📦 Khung ghi chú nổi bật (Callout Boxes)*: Khung Thông tin (xanh dương), Khung Đạt chuẩn (xanh lá), Khung Lưu ý quan trọng (vàng cam), Khung Cảnh báo nguy hiểm (đỏ), Khung Trích dẫn điều lệ, và Đường kẻ hoa văn phân cách.
- **Cơ chế bảo toàn vị trí con trỏ chuột (Selection & Range Preservation):**
  - Tự động lưu và khôi phục vùng chọn trước khi chèn bảng, chèn ảnh hoặc chèn icon, đảm bảo đối tượng xuất hiện chính xác tại vị trí con trỏ hoặc thay thế đoạn bôi đen mà không bị nhảy dòng hay mất focus.

---

## [1.0.10] - 2026-10-27

### Thêm mới & Nâng cấp (Added & Enhanced)
- **Menu chọn đường viền bảng chuẩn Microsoft Word (Word Borders Menu & Engine):**
  - Tích hợp trọn bộ 15 tùy chọn đường viền chuẩn Word với icon SVG trực quan sắc nét:
    1. **Bottom Border**: Viền cạnh dưới ô hoặc dòng cuối bảng.
    2. **Top Border**: Viền cạnh trên ô hoặc dòng đầu bảng.
    3. **Left Border**: Viền cạnh trái ô hoặc cột đầu bảng.
    4. **Right Border**: Viền cạnh phải ô hoặc cột cuối bảng.
    5. **No Border**: Xóa toàn bộ viền của bảng và các ô (`border: none`).
    6. **All Borders**: Đặt viền cho tất cả các ô trong bảng bằng nét chuẩn.
    7. **Outside Borders**: Chỉ viền khung bao quanh ngoài của bảng.
    8. **Inside Borders**: Chỉ viền ngăn cách giữa các ô bên trong.
    9. **Inside Horizontal Border**: Chỉ viền ngăn cách ngang giữa các dòng (chuẩn bảng APA / Báo cáo tài chính).
    10. **Inside Vertical Border**: Chỉ viền ngăn cách dọc giữa các cột.
    11. **Diagonal Down Border / Diagonal Up Border**: Kẻ đường chéo ô (\ và /) bằng `linear-gradient` cho tiêu đề phân tách.
    12. **Horizontal Line**: Chèn đường kẻ ngang `<hr>` phân cách.
    13. **View Gridlines**: Chế độ Xem đường lưới mờ khi không viền (chỉ hiển thị trong Editor hỗ trợ nhập liệu, tự ẩn khi in và xuất file).
    14. **Borders and Shading (Tùy biến đường viền & tô bóng)**: Lựa chọn kiểu nét (Solid, Dashed, Dotted, Double, Groove), độ dày nét (0.5pt - 3pt), màu viền tự do, và phạm vi áp dụng (Toàn bảng hoặc Ô đang chọn).
- **Mở rộng các tính năng thao tác cấu trúc và bố cục bảng nâng cao:**
  - **Gộp ô & Tách ô (Merge & Split Cells)**: Gộp ô sang phải (`colspan`), gộp ô xuống dưới (`rowspan`) và tách ô đã gộp trở lại (`split cell`).
  - **Phân bố đều độ rộng các cột (Distribute Columns Evenly)**: Tự động tính toán và chia đều 100% độ rộng cho tất cả các cột trong bảng.
  - **Căn lề vị trí toàn bảng trên trang A4**: Căn bảng sang trái, Căn giữa bảng trên trang A4, Căn bảng sang phải.
  - **Tùy chỉnh độ rộng bảng**: 100% toàn trang, Tự co giãn theo nội dung (AutoFit), 90%, 80%.
  - **Khoảng đệm ô (Cell Padding)**: Tùy chọn đệm Siêu gọn 2px (tối ưu cho phiếu khám đoàn, bệnh viện nhiều cột hẹp), Chuẩn 5px, Thoáng đãng 9px.
  - **Dòng tiêu đề Header (`<th>`) & Tô màu dòng xen kẽ (Zebra Striping)**: Bật/tắt nhanh chóng.
- **Tái cấu trúc Công cụ Bảng phân tab chuyên nghiệp (Table Studio Tabs):**
  - Phân thành 4 tab rõ ràng: *Đường viền*, *Dòng & Cột*, *Gộp & Căn*, *Định dạng*.
  - Đặt nút *Word Border Picker* trực tiếp trên Toolbar chính và tích hợp đồng bộ vào Context Menu chuột phải.

---

## [1.0.9] - 2026-10-27

### Thêm mới & Nâng cấp (Added & Enhanced)
- **Bảng chọn màu chuẩn phong cách Microsoft Word (Word Style Color Palette):**
  - Thay thế hoàn toàn bảng chọn màu mặc định của trình duyệt (`<input type="color">` dạng quang phổ/gradient khó căn chỉnh) bằng bảng chọn màu dạng ô lưới chuẩn Office / Word.
  - Hỗ trợ đầy đủ cho cả 3 chế độ màu:
    1. **Màu chữ (Font / Text Color):** Biểu tượng chữ `A` với thanh màu dưới chân chuẩn Word, nút "Tự động (Màu đen #000000)", lưới Màu chủ đề (Theme Colors 10 cột x 6 hàng sắc độ), lưới Màu tiêu chuẩn (Standard Colors 10 màu), và tùy chọn "Màu khác (More Colors)...".
    2. **Màu đánh dấu nền chữ (Text Highlight Color):** Biểu tượng bút dạ quang, nút "Không màu (Mặc định / Bỏ màu nền)", 15 màu dạ quang chuẩn Word (vàng chanh, lục, xanh lơ, hồng tím...), lưới Theme Colors + Standard Colors và "Màu khác...".
    3. **Màu nền ô bảng (Cell Background Color):** Biểu tượng cọ sơn và ô màu trực quan, nút "Không màu", lưới Theme Colors + Standard Colors và "Màu khác...".
  - **Màu khác (More Colors):** Mở nhanh ô nhập mã màu Hex trực tiếp hoặc chọn tự do từ bảng quang phổ khi người dùng cần màu sắc thương hiệu riêng biệt.
- **Đồng bộ hóa trên cả Toolbar chính và Menu chuột phải (Context Menu):**
  - Cập nhật trên thanh công cụ soạn thảo chính (Main Toolbar).
  - Cập nhật trong menu Thao tác Bảng biểu (Table Suite Dropdown).
  - Cập nhật trong thanh công cụ mini của Menu chuột phải (Context Menu).
  - Cập nhật trong khối Bảng biểu của Menu chuột phải (Context Menu).
- **Cơ chế chọn màu thông minh:**
  - Bảo toàn vùng chọn (Selection Preservation): Sử dụng `onMouseDown={(e) => e.preventDefault()}` trên mọi ô màu và nút chọn màu, đảm bảo văn bản bôi đen không bị mất tiêu điểm khi nhấp chuột.
  - Tự động căn lề và chống tràn màn hình (Viewport Collision Prevention): Popover màu được định vị `fixed z-[9999]`, tự động tính toán vị trí theo nút bấm kích hoạt, lật lên phía trên nếu gần đáy màn hình và lùi vào trong nếu gần mép phải.

---

## [1.0.8] - 2026-10-23

### Thêm mới & Nâng cấp (Added & Enhanced)
- **Tích hợp Menu ngữ cảnh chuột phải (Context Menu) thông minh:**
  - Kích hoạt khi chuột phải trong trình soạn thảo: Tự động phân tích ngữ cảnh của phần tử được trỏ.
  - Chuột phải vào Bảng biểu: Hiển thị ngay bộ công cụ Bảng biểu (Table Suite) bao gồm thêm/xóa dòng trên dưới, thêm/xóa cột trái phải, căn lề ô (ngang & dọc), màu nền ô, đường viền nét liền/bỏ viền, và xóa toàn bộ bảng.
  - Bôi đen hoặc click vào văn bản: Hiển thị thanh công cụ định dạng trực tiếp (In đậm, In nghiêng, Gạch chân, Gạch ngang, đổi Font chữ tiếng Việt, đổi Cỡ chữ 9pt-28pt, đổi màu chữ, màu highlight nền, xóa định dạng, căn lề 4 hướng, danh sách, phím Tab, ký tự đặc biệt, và Hoàn tác / Làm lại).
  - Cơ chế bảo toàn vùng chọn (Selection Preservation): Sử dụng `e.preventDefault()` trên sự kiện `mouseDown` giúp bảo vệ vùng bôi đen của người dùng không bị mất tiêu điểm khi thao tác với các nút trên menu.
  - Thuật toán chống tràn màn hình (Collision Prevention): Tự động tính toán vị trí hiển thị an toàn theo biên màn hình, hỗ trợ đóng nhanh bằng phím `Escape` hoặc khi click ra ngoài.
- **Lưu và Phục hồi định dạng lề trang & font chữ theo từng mẫu vào Kho mẫu & Sao lưu (.JSON):**
  - Mở rộng cấu trúc `SavedTemplateItem` để lưu kèm `settings` (fontId, fontSize, lineHeight, preserveOriginalFormat, pageMargin, customMargins, originalMargins).
  - Tự động gắn kèm cấu hình lề và font khi lưu mẫu từ trình soạn thảo.
  - Hiển thị trực quan thông số lề (mm) và font/cỡ chữ dưới dạng huy hiệu (Badges) trong danh sách mẫu của hộp thoại Kho mẫu.
  - Khi người dùng nạp lại mẫu đã lưu hoặc nhập khẩu file JSON sao lưu, hệ thống sẽ tự động khôi phục chính xác thông số lề (kể cả lề tùy chỉnh mm 5/5/20/5) và font chữ của mẫu đó, đồng bộ tức thì lên trang A4 và file Word xuất ra.

---

## [1.0.7] - 2026-10-16

### Sửa lỗi & Nâng cấp (Fixed & Enhanced)
- **Sửa triệt để chức năng Hoàn tác / Làm lại (Undo / Redo):**
  - Xây dựng **Custom History Stack Manager** độc lập quản lý lịch sử trạng thái HTML trong bộ nhớ RAM, khắc phục lỗi `document.execCommand('undo')` bị trình duyệt vô hiệu hóa khi thao tác trực tiếp trên DOM.
  - Hỗ trợ lưu trữ đến 50 snapshot lịch sử với cơ chế tự động ghi nhớ (Debounce 350ms khi gõ phím và tức thì với các thao tác định dạng, bảng biểu, chèn biến, đổi lề, căn chỉnh).
  - Phím tắt `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z` và hai nút bấm trên thanh công cụ phản hồi mượt mà, tự động cập nhật trạng thái khả dụng (disabled khi không có thao tác).
- **Sửa lỗi menu Công cụ Bảng (Table Suite Dropdown Overflow):**
  - Định vị menu thông minh theo hướng vào trong (`right-0`), loại bỏ tình trạng tràn sang phải đè lên sidebar "Cột Excel khả dụng".
  - Giới hạn chiều cao với thanh cuộn độc lập (`max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain`), ghim cố định tiêu đề (`sticky header`), giúp người dùng tiếp cận 100% các tính năng phía dưới (Nền ô, Viền nét liền, Bỏ viền, Xóa toàn bộ bảng) trên mọi kích thước màn hình mà không bao giờ bị cắt đáy.
  - Tích hợp sự kiện tự động đóng khi nhấp chuột ra ngoài (`click-outside`).
- **Tối ưu giao diện giãn toàn diện theo kích thước thiết bị:**
  - Nâng cấp giới hạn container từ `max-w-7xl` (1280px) lên `max-w-[1750px]`, tận dụng tối đa chiều rộng màn hình Desktop, Full HD (1920x1080), 2K, 4K, loại bỏ hai dải khoảng trắng lãng phí bên lề.
  - Mở rộng độ rộng thanh "Cột Excel khả dụng" linh hoạt (`w-full lg:w-80 xl:w-[340px]`), giúp các nút bấm và nhãn cột hiển thị rõ ràng, không bị co ép, chèn đè hoặc ẩn mất tính năng.
  - Bổ sung `max-w-[calc(100vw-2rem)]` cho các menu con, bảo vệ trải nghiệm trên màn hình di động và tablet hẹp.

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
