import * as mammoth from 'mammoth';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Trích xuất HTML từ file Word (.docx) để hiển thị trong Editor
 */
export async function extractHtmlFromDocx(arrayBuffer: ArrayBuffer): Promise<{ html: string; tags: string[] }> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const rawHtml = result.value || '';
    const tags = extractTagsFromText(rawHtml);
    return { html: rawHtml, tags };
  } catch (error) {
    console.error('Lỗi đọc file Word bằng mammoth:', error);
    throw new Error('Không thể đọc file Word. Vui lòng đảm bảo file có định dạng .docx hợp lệ.');
  }
}

/**
 * Tìm tất cả các thẻ placeholder dạng {{ten_cot}} hoặc {ten_cot}
 */
export function extractTagsFromText(text: string): string[] {
  const tagsSet = new Set<string>();
  // Tìm dạng {{tag}}
  const doubleBraceMatches = text.match(/\{\{([^{}]+)\}\}/g);
  if (doubleBraceMatches) {
    doubleBraceMatches.forEach(match => {
      const tag = match.replace(/[{}]/g, '').trim();
      if (tag) tagsSet.add(tag);
    });
  }
  // Tìm dạng {tag} (không phải cú pháp css hoặc html)
  const singleBraceMatches = text.match(/\{([a-zA-Z0-9_\u00C0-\u1EF9\s]+)\}/g);
  if (singleBraceMatches) {
    singleBraceMatches.forEach(match => {
      const tag = match.replace(/[{}]/g, '').trim();
      if (tag) tagsSet.add(tag);
    });
  }
  return Array.from(tagsSet);
}

/**
 * Trộn dữ liệu vào HTML để xem trước trong browser
 */
export function renderMergedHtml(
  templateHtml: string,
  rowData: Record<string, string | number> | null
): string {
  if (!rowData) return templateHtml;

  let merged = templateHtml;

  // Duyệt qua tất cả các key trong rowData để thay thế
  Object.keys(rowData).forEach(key => {
    const rawVal = rowData[key];
    const val = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';

    // Thay thế dạng {{Key}}
    const doublePattern = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'gi');
    merged = merged.replace(doublePattern, `<span class="bg-blue-50 text-blue-900 font-semibold px-0.5 rounded border border-blue-200">${val}</span>`);

    // Thay thế dạng {Key}
    const singlePattern = new RegExp(`\\{\\s*${escapeRegExp(key)}\\s*\\}`, 'gi');
    merged = merged.replace(singlePattern, `<span class="bg-blue-50 text-blue-900 font-semibold px-0.5 rounded border border-blue-200">${val}</span>`);
  });

  return merged;
}

/**
 * Trộn dữ liệu vào file .docx gốc và tải về file docx
 */
export function generateMergedDocx(
  templateBuffer: ArrayBuffer,
  rowData: Record<string, string | number>,
  fileName: string = 'merged_document.docx'
): Blob {
  try {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Chuẩn bị data object sạch
    const data: Record<string, any> = {};
    Object.keys(rowData).forEach(k => {
      data[k] = rowData[k] !== undefined && rowData[k] !== null ? String(rowData[k]) : '';
      // Hỗ trợ cả key không dấu hoặc loại bỏ khoảng trắng
      data[k.trim()] = data[k];
    });

    try {
      doc.render(data);
    } catch (renderError) {
      // Thử lại với delimiter đơn {}
      const fallbackDoc = new Docxtemplater(new PizZip(templateBuffer), {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{',
          end: '}'
        }
      });
      fallbackDoc.render(data);
      const outBlob = fallbackDoc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      return outBlob;
    }

    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    return out;
  } catch (error) {
    console.error('Lỗi khi merge docx:', error);
    throw new Error('Lỗi khi xử lý trộn file Word. Vui lòng kiểm tra lại cấu trúc thẻ biến.');
  }
}

/**
 * Trộn hàng loạt và đóng gói tất cả file docx vào 1 file ZIP
 */
export async function generateBulkZip(
  templateBuffer: ArrayBuffer,
  rows: Record<string, string | number>[],
  namingColumn?: string,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('merged_documents');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const indexStr = String(i + 1).padStart(3, '0');
    let customName = '';
    if (namingColumn && row[namingColumn]) {
      customName = `_${sanitizeFileName(String(row[namingColumn]))}`;
    }
    const docName = `VanBan_${indexStr}${customName}.docx`;

    try {
      const docxBlob = generateMergedDocx(templateBuffer, row, docName);
      folder?.file(docName, docxBlob);
    } catch (e) {
      console.warn(`Lỗi tại bản ghi số ${i + 1}:`, e);
    }

    if (onProgress) {
      onProgress(i + 1, rows.length);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeFileName(name: string) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

/**
 * Mẫu văn bản Word mặc định chuẩn thể thức hành chính Việt Nam (Nghị định 30/2020/NĐ-CP)
 */
export const DEFAULT_SAMPLE_TEMPLATE_HTML = `
<div style="text-align: center; margin-bottom: 24px;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin: 0; font-size: 13pt; font-weight: 500; text-transform: uppercase;">{{DonVi}}</p>
      <p style="margin: 0; font-size: 12pt; font-weight: 700; text-transform: uppercase;">BAN TỔ CHỨC HỘI NGHỊ</p>
      <div style="width: 100px; height: 1px; background: #000; margin: 4px auto;"></div>
      <p style="margin: 4px 0 0; font-size: 11pt; font-style: italic;">Số: {{SoThuTu}}/GM-BTC</p>
    </div>
    <div style="text-align: center; width: 50%;">
      <p style="margin: 0; font-size: 13pt; font-weight: 700; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
      <p style="margin: 0; font-size: 13pt; font-weight: 700;">Độc lập - Tự do - Hạnh phúc</p>
      <div style="width: 140px; height: 1.5px; background: #000; margin: 4px auto 8px;"></div>
      <p style="margin: 0; font-size: 12pt; font-style: italic;">Hà Nội, ngày {{Ngay}} tháng {{Thang}} năm {{Nam}}</p>
    </div>
  </div>

  <h1 style="font-size: 18pt; font-weight: 700; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">GIẤY MỜI HỘI NGHỊ</h1>
  <p style="font-size: 13pt; font-style: italic; margin: 0 0 20px;">V/v: Tham dự Hội nghị Khoa học &amp; Chuyển đổi số Y tế 2026</p>
</div>

<div style="font-size: 13pt; line-height: 1.6; text-align: justify;">
  <p style="margin: 0 0 12px; text-indent: 28px;">
    <strong>Ban Tổ chức trân trọng kính mời:</strong>
  </p>
  
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
    <tr>
      <td style="padding: 6px 0; width: 25%;"><strong>Ông / Bà:</strong></td>
      <td style="padding: 6px 0; font-size: 14pt; color: #1e3a8a;"><strong>{{HoVaTen}}</strong></td>
    </tr>
    <tr>
      <td style="padding: 6px 0;"><strong>Chức vụ:</strong></td>
      <td style="padding: 6px 0;">{{ChucVu}}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0;"><strong>Đơn vị công tác:</strong></td>
      <td style="padding: 6px 0;">{{DonVi}}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0;"><strong>Điện thoại:</strong></td>
      <td style="padding: 6px 0;">{{SoDienThoai}} &nbsp;|&nbsp; <strong>Email:</strong> {{Email}}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0;"><strong>Mã định danh đại biểu:</strong></td>
      <td style="padding: 6px 0;"><span style="font-family: monospace; font-weight: 700; color: #b91c1c;">{{MaDaiBieu}}</span></td>
    </tr>
  </table>

  <p style="margin: 0 0 12px; text-indent: 28px;">
    Đến tham dự phiên họp toàn thể và báo cáo chuyên đề tại Hội nghị Chuyển đổi số Y tế năm 2026 với thông tin chi tiết như sau:
  </p>

  <ul style="margin: 0 0 16px 20px; padding: 0;">
    <li style="margin-bottom: 6px;"><strong>Thời gian:</strong> 08 giờ 00 phút, Thứ Ba ngày 28/10/2026.</li>
    <li style="margin-bottom: 6px;"><strong>Địa điểm:</strong> {{DiaDiem}}</li>
    <li style="margin-bottom: 6px;"><strong>Vị trí ghế ngồi danh dự:</strong> {{SoGhe}}</li>
    <li style="margin-bottom: 6px;"><strong>Ghi chú đón tiếp:</strong> {{GhiChu}}</li>
  </ul>

  <p style="margin: 0 0 24px; text-indent: 28px;">
    Sự hiện diện của Ông / Bà là niềm vinh hạnh to lớn và góp phần quan trọng vào thành công của Hội nghị. Ban Tổ chức rất hân hạnh được đón tiếp!
  </p>
</div>

<div style="display: flex; justify-content: space-between; margin-top: 32px;">
  <div style="width: 40%; font-size: 11pt;">
    <p style="margin: 0; font-weight: 700; font-style: italic;">Nơi nhận:</p>
    <p style="margin: 2px 0;">- Như trên;</p>
    <p style="margin: 2px 0;">- Lưu: VT, BTC.</p>
  </div>
  <div style="width: 50%; text-align: center; font-size: 13pt;">
    <p style="margin: 0; font-weight: 700; text-transform: uppercase;">TM. BAN TỔ CHỨC</p>
    <p style="margin: 0; font-size: 11pt; font-style: italic;">(Ký, ghi rõ họ tên và đóng dấu)</p>
    <div style="height: 65px;"></div>
    <p style="margin: 0; font-weight: 700;">NGUYỄN SƠN NAM</p>
  </div>
</div>
`;
