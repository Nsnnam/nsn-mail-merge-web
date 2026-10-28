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
  version: "1.0.12",
  date: "2026-10-28",
  author: "Nguyễn Sơn Nam (Nsnnam)",
  authorShort: "NSN",
  role: "Tác giả · Tiện ích HIS / Excel / Tự động hóa văn bản",
  github: "https://github.com/Nsnnam/nsn-mail-merge-web",
  timezone: "Asia/Ho_Chi_Minh",
  changelog: [
    {
      version: "1.0.12",
      date: "2026-10-28",
      changes: [
        "Tích hợp bộ công cụ Chỉnh sửa Hình ảnh trực tiếp trong khung soạn thảo chuẩn Microsoft Word (Inline Image Editor & Interactive Overlay): Nhấp chọn bất kỳ ảnh nào để kích hoạt khung bao viền thông minh kèm 8 điểm neo co giãn (NW, N, NE, E, SE, S, SW, W), chốt xoay tròn đỉnh và nút Layout Options.",
        "Kéo thả co giãn ảnh tương tác thời gian thực (Interactive Drag-to-Resize): Hỗ trợ kéo các nút mốc ở góc hoặc cạnh để phóng to, thu nhỏ ảnh mượt mà bằng chuột, tự động tính toán và giữ nguyên tỉ lệ aspect ratio của ảnh.",
        "Bảng Tùy chọn Bố cục Văn bản (Layout Options Popup chuẩn Word): Mở menu vòm cung chuẩn Microsoft Word với đầy đủ 2 nhóm: In Line with Text (cùng dòng) và With Text Wrapping (Square Left/Right bao trái/phải, Tight bao sát mép, Top & Bottom ngắt đoạn trên/dưới, Behind Text chìm dưới chữ watermark mờ, In Front of Text đè lên chữ) kèm tùy chọn Move with text / Fix position.",
        "Thanh công cụ nhanh nổi (Floating Image Action Bar): Thay đổi nhanh kích cỡ (150px, 300px, 500px, 100%, hoặc nhập số pixel chính xác), căn lề ảnh (Trái, Giữa, Phải), bo góc (0px, 4px, 8px, 16px, 50% tròn), đường viền & đổ bóng (Shadow), xoay 90 độ, lật ảnh ngang, làm mờ watermark (Opacity), đổi ảnh khác từ máy tính và xóa ảnh.",
        "Menu ngữ cảnh chuột phải (Context Menu) cho hình ảnh: Nhận diện ảnh thông minh khi click chuột phải, tích hợp trọn bộ thao tác wrapping, kích cỡ, căn lề, xoay và xóa ảnh.",
        "Hỗ trợ phím tắt tiện lợi: Phím Delete / Backspace để xóa ảnh đang chọn tức thì; phím Escape để hủy chọn ảnh; tự động lưu lịch sử thao tác vào Undo/Redo Stack."
      ]
    },
    {
      version: "1.0.11",
      date: "2026-10-27",
      changes: [
        "Bổ sung bộ công cụ Chèn đối tượng chuẩn Microsoft Word (Insert Suite): Tách biệt độc lập Chèn Bảng (Insert Table), Chèn Ảnh (Pictures) và Biểu tượng / Icon (Icons & Symbols / Shapes) trực tiếp trên thanh công cụ chính và menu ngữ cảnh chuột phải.",
        "Ma trận lưới Chèn Bảng trực quan (8 hàng x 10 cột): Hover rê chuột chọn nhanh kích thước bảng (ví dụ 3x3, 4x5, 8x10...) kèm nhãn hiển thị số hàng x số cột theo thời gian thực; nút mở modal chèn bảng tùy biến kích thước và khối Chèn bảng mẫu nhanh (Quick Tables: Bảng thông tin 2 cột, Bảng đối chiếu 3 cột, Bảng ký tên 4 cột, Bảng khám đoàn 5 cột).",
        "Tính năng Chèn Hình ảnh (Insert Picture) chuẩn Word: Hỗ trợ tải ảnh từ máy tính (PNG, JPG, WebP, SVG, GIF) tự động chuyển sang Base64 Data URL hoạt động 100% offline trong RAM trình duyệt hoặc nhập URL web; xem trước ảnh trực quan; tùy biến kích cỡ (150px, 300px, 500px, 100%, hoặc pixel tùy ý), căn lề (Trái, Giữa, Phải), bo góc và viền mờ.",
        "Bộ sưu tập Biểu tượng & Icon (Icons & Symbols) đa dạng: 5 danh mục phân loại tiện lợi gồm Dấu kiểm & Hộp chọn (Check & Box), Văn phòng & Hành chính Y tế, Mũi tên & Phân cách, Toán học & Tiền tệ, cùng Khung ghi chú nổi bật (Callout Boxes: Hộp thông tin, Kết quả/Đạt, Lưu ý quan trọng, Cảnh báo, Trích dẫn và Đường kẻ phân cách hoa văn).",
        "Bảo toàn vị trí con trỏ chuột (Selection Preservation): Đảm bảo chèn chính xác ảnh, bảng biểu hoặc biểu tượng vào vị trí con trỏ hoặc thay thế vùng chọn bôi đen mà không bị lệch hay mất dữ liệu."
      ]
    },
    {
      version: "1.0.10",
      date: "2026-10-27",
      changes: [
        "Tích hợp trọn bộ Menu chọn đường viền bảng chuẩn Microsoft Word (Word Borders Menu & Engine): Hỗ trợ đầy đủ 15 tùy chọn viền với biểu tượng trực quan y hệt Word (Viền dưới, Viền trên, Viền trái, Viền phải, Không viền, Tất cả viền, Chỉ viền ngoài, Chỉ viền trong, Viền ngang bên trong, Viền dọc bên trong, Đường chéo ô \\ và /, Đường kẻ ngang phân cách, và Tùy biến đường viền Borders and Shading).",
        "Tùy biến đường viền nâng cao (Borders and Shading): Cho phép lựa chọn kiểu nét viền (Solid, Dashed, Dotted, Double, Groove), độ dày nét (0.5pt đến 3pt) và màu sắc viền tùy chỉnh, áp dụng linh hoạt cho toàn bộ bảng hoặc từng ô đang chọn.",
        "Chế độ Xem đường lưới mờ khi không viền (View Gridlines chuẩn Word): Hỗ trợ bật/tắt đường lưới nét đứt màu xám nhạt trong chế độ soạn thảo giúp dễ dàng quan sát, căn chỉnh và nhập liệu trong ô khi bảng chọn No Border (tự động ẩn khi in hoặc xuất file).",
        "Mở rộng toàn diện các tính năng thao tác cấu trúc bảng: Tích hợp Gộp ô (Merge Cells - gộp sang phải, gộp xuống dưới) & Tách ô (Split Cell); Phân bố đều độ rộng các cột (Distribute Columns); Căn vị trí toàn bảng trên trang A4 (Trái, Giữa, Phải); Tùy chỉnh khoảng đệm ô (Cell Padding: Hẹp 2px cho biểu mẫu y tế, Chuẩn 5px, Rộng 9px); Tự động co giãn bảng (AutoFit); Bật/tắt dòng tiêu đề Header (<th>) và màu xen kẽ dòng (Zebra Striping).",
        "Đồng bộ hóa trên cả Toolbar chính, Menu Công cụ Bảng phân tab chuyên nghiệp (4 Tab: Đường viền, Dòng & Cột, Gộp & Căn, Định dạng) và Menu ngữ cảnh chuột phải (Context Menu)."
      ]
    },
    {
      version: "1.0.9",
      date: "2026-10-27",
      changes: [
        "Nâng cấp bảng chọn màu chuẩn Microsoft Word cho Màu chữ (Font Color), Màu đánh dấu nền chữ (Text Highlight Color) và Màu nền ô bảng (Cell Background): Thay thế toàn bộ hộp thoại quang phổ mặc định của trình duyệt bằng bảng màu lưới trực quan, chính xác.",
        "Thiết kế chuẩn Office / Word: Tích hợp đầy đủ nút Tự động (Màu đen #000000) / Không màu (Bỏ màu nền transparent), Khối Màu dạ quang 15 màu chuẩn Word, Khối Màu chủ đề Theme Colors (10 cột x 6 hàng sắc độ), Khối Màu tiêu chuẩn Standard Colors (10 màu) và Tùy chọn Màu khác (More Colors)... nhập mã Hex hoặc chọn phổ tự do.",
        "Đồng bộ trên cả Thanh công cụ chính (Toolbar), Menu Công cụ Bảng (Table Suite) và Menu chuột phải (Context Menu): Giữ nguyên vẹn vùng bôi đen (Selection Preservation), chống trượt hoặc mất con trỏ, tự động căn chỉnh tọa độ an toàn không bị tràn mép màn hình."
      ]
    },
    {
      version: "1.0.8",
      date: "2026-10-23",
      changes: [
        "Tích hợp Menu ngữ cảnh chuột phải (Context Menu) thông minh trong chế độ soạn thảo: Click chuột phải vào bảng biểu hiển thị trọn bộ công cụ Table Suite (thêm/xóa dòng trên dưới, thêm/xóa cột trái phải, căn lề ô ngang/dọc, màu nền ô, viền bảng, xóa bảng); bôi đen hoặc click vào văn bản cho phép chỉnh sửa font, cỡ chữ, in đậm, in nghiêng, gạch chân, màu chữ, highlight, căn lề, thụt lề, danh sách, Tab, ký tự đặc biệt và Undo/Redo.",
        "Cơ chế chống mất vùng chọn (Selection Preservation) & chống tràn màn hình: Giữ nguyên vẹn vùng bôi đen của người dùng khi thao tác với các nút trên menu chuột phải, tự tính toán tọa độ x/y an toàn và tự đóng khi bấm Escape hoặc click ra ngoài.",
        "Lưu & Phục hồi lề trang và font chữ theo từng mẫu vào Kho mẫu & Sao lưu (.JSON): Mẫu lưu trữ tự động gắn kèm cấu hình lề (kể cả lề tùy chỉnh mm), font chữ và cỡ chữ; khi nạp lại mẫu hoặc nhập khẩu file JSON sao lưu, hệ thống tự động thiết lập lại chính xác lề và font của mẫu đó."
      ]
    },
    {
      version: "1.0.7",
      date: "2026-10-16",
      changes: [
        "Sửa triệt để chức năng Hoàn tác / Làm lại (Undo / Redo): Xây dựng Custom History Stack độc lập quản lý lịch sử thao tác văn bản, phím tắt Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z và nút bấm trên thanh công cụ hoạt động mượt mà.",
        "Sửa lỗi menu Công cụ Bảng: Căn lề thông minh vào trong (right-0), cố định header, thêm thanh cuộn độc lập (max-h với overscroll-contain) và hỗ trợ click-outside tự đóng, đảm bảo hiển thị 100% các tính năng Nền ô, Bỏ viền, Xóa bảng không bị cắt đáy hoặc che khuất.",
        "Tối ưu giao diện giãn toàn diện theo kích thước thiết bị: Nâng cấp container lên max-w-[1750px], loại bỏ khoảng trống lãng phí trên màn hình Desktop/Full HD/2K/4K, thanh Cột Excel co giãn hài hòa (w-80 xl:w-[340px]) không bị ẩn, chèn, hay đè lên nhau."
      ]
    },
    {
      version: "1.0.6",
      date: "2026-10-13",
      changes: [
        "Tùy chỉnh lề trang (Margin) linh hoạt: Mặc định tự động theo file Word tải lên (trích xuất thẻ <w:pgMar> từ OpenXML, hỗ trợ đầy đủ các file lề hẹp chuyên dụng khám đoàn bệnh viện).",
        "Hỗ trợ các preset lề phổ biến: Nghị định 30/2020/NĐ-CP (Trên 20mm, Dưới 20mm, Trái 30mm, Phải 15mm), Tiêu chuẩn (25.4mm), Hẹp (12.7mm), Vừa phải và Tùy chỉnh (nhập mm trực tiếp).",
        "Đồng bộ lề trang toàn diện: Phản ánh trực quan trên Editor/Preview, chuẩn hóa kích thước in/PDF qua iframe cách ly, và cập nhật OpenXML <w:pgMar> khi xuất file Word .DOCX.",
        "Thiết lập Font mặc định cho file Word tải lên là Times New Roman (id: 'times') chuẩn văn bản hành chính Việt Nam.",
        "Cỡ chữ mặc định tự động theo mẫu tài liệu tải lên (hoặc 13pt chuẩn NĐ 30), mở rộng đầy đủ tùy chọn cỡ chữ từ 8pt đến 36pt trực tiếp trên thanh công cụ."
      ]
    },
    {
      version: "1.0.5",
      date: "2026-10-13",
      changes: [
        "Mặc định chuyển sang Chế độ Soạn thảo (Edit mode) ngay khi import hoặc chuyển đổi văn bản.",
        "Bảo toàn hoàn hảo khoảng cách nhiều dấu cách liên tiếp và khoảng cách Tab giữa các đoạn văn bản (Họ tên, Giới tính, Ngày sinh, SĐT... không bị dính chữ).",
        "Chuẩn hóa hiển thị bảng biểu OpenXML: Tự động căn giữa cột STT (cột 0) và dòng tiêu đề, làm sạch các đoạn văn rỗng cuối ô loại bỏ khoảng cách dọc thừa, căn dọc giữa tự nhiên.",
        "Bộ công cụ WYSIWYG & Table Suite toàn diện: Thêm/xóa dòng trên/dưới, thêm/xóa cột trái/phải, căn lề ô (trái/giữa/phải), căn dọc ô (đỉnh/giữa/đáy), màu nền ô, đường viền bảng (nét liền/bỏ viền), tạo bảng tùy biến kích thước.",
        "Hỗ trợ phím Tab trực tiếp: Nhấn phím Tab trong trình soạn thảo để nhảy thụt dòng thay vì mất tiêu điểm.",
        "Tích hợp chèn ký tự đặc biệt & ô kiểm: Dấu tích (✓, ✔), ô vuông kiểm tra (☐, ☑), dấu sao, mũi tên, bullet.",
        "Kho lưu trữ mẫu văn bản & Sao lưu/Phục hồi (.JSON): Lưu mẫu vào LocalStorage trình duyệt, tải file sao lưu (.JSON) về máy tính cá nhân và khôi phục nhanh chóng cho các lần sau.",
        "Tinh chỉnh CSS in ấn & xuất PDF: Giữ nguyên khoảng cách Tab (.word-tab) và không ép viền lên bảng bố cục không viền."
      ]
    },
    {
      version: "1.0.4",
      date: "2026-10-13",
      changes: [
        "Sửa lỗi triệt để bảng biểu và màu sắc file Word: Tích hợp bộ phân tích OpenXML trực tiếp, bảo toàn 100% màu sắc (Heading blue, text color, highlight), cấu trúc TableGrid, viền bảng và độ rộng cột.",
        "Hỗ trợ nhận diện và chuyển hóa tự động các trường trộn bản địa của Microsoft Word (MERGEFIELD) sang biến trộn {{Ten_Cot}}.",
        "Mặc định kích hoạt chế độ 'Giữ nguyên định dạng ban đầu của file Word gốc' theo đúng yêu cầu.",
        "Mở rộng chủ đề Gradient toàn diện: Áp dụng màu gradient lên thanh tiêu đề, nút bấm chính, viền phát sáng và hiệu ứng nền thay vì chỉ đổi màu icon.",
        "Tối ưu quy trình nạp tệp: Mặc định hiển thị bảng nạp tệp ngay khi mở trang, chỉ tự động thu gọn sau khi nạp tệp.",
        "Bổ sung tính năng nạp nhiều file cùng lúc (Multi-file upload) cho cả Word và Excel, kèm bộ quản lý tệp và xóa hàng loạt (Bulk Delete)."
      ]
    },
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
