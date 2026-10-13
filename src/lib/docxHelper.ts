import * as mammoth from 'mammoth';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import { SAMPLE_DOCX_BASE64 } from './sampleDocxBase64';

/**
 * Lấy ArrayBuffer của file mẫu Word mặc định (được nhúng sẵn 100% offline)
 */
export function getDefaultSampleDocxBuffer(): ArrayBuffer {
  const binaryString = atob(SAMPLE_DOCX_BASE64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

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
  const doubleBraceMatches = text.match(/\{\{([^{}]+)\}\}/g);
  if (doubleBraceMatches) {
    doubleBraceMatches.forEach(match => {
      const tag = match.replace(/[{}]/g, '').trim();
      if (tag) tagsSet.add(tag);
    });
  }
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
 * Trộn dữ liệu vào HTML.
 * @param cleanForPrint: Nếu là true (in hoặc xuất PDF), nội dung chèn vào sẽ kế thừa 100% định dạng gốc của văn bản
 * (màu sắc, in nghiêng, in đậm, cỡ chữ), không có khung hay màu nền xanh.
 */
export function renderMergedHtml(
  templateHtml: string,
  rowData: Record<string, string | number> | null,
  cleanForPrint: boolean = false
): string {
  if (!rowData) return templateHtml;

  let merged = templateHtml;

  Object.keys(rowData).forEach(key => {
    const rawVal = rowData[key];
    const val = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';

    const replaceContent = cleanForPrint
      ? `<span class="merged-val" style="color:inherit; font-weight:inherit; font-style:inherit;">${val}</span>`
      : `<span class="merged-val bg-blue-50 text-blue-900 font-semibold px-1 py-0.5 rounded border border-blue-200" title="Trường: ${key}">${val}</span>`;

    // Thay thế dạng {{Key}}
    const doublePattern = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'gi');
    merged = merged.replace(doublePattern, replaceContent);

    // Thay thế dạng {Key}
    const singlePattern = new RegExp(`\\{\\s*${escapeRegExp(key)}\\s*\\}`, 'gi');
    merged = merged.replace(singlePattern, replaceContent);
  });

  return merged;
}

/**
 * Chuẩn bị đối tượng data sạch cho docxtemplater
 */
function prepareDataRecord(rowData: Record<string, string | number>): Record<string, string> {
  const data: Record<string, string> = {};
  Object.keys(rowData).forEach(k => {
    const val = rowData[k] !== undefined && rowData[k] !== null ? String(rowData[k]) : '';
    data[k] = val;
    data[k.trim()] = val;
  });
  return data;
}

/**
 * Trộn 1 bản ghi vào file Word (.docx) gốc giữ nguyên 100% định dạng
 */
export function generateMergedDocx(
  templateBuffer: ArrayBuffer,
  rowData: Record<string, string | number>
): Blob {
  try {
    const data = prepareDataRecord(rowData);

    // Thử với delimiter {{ }}
    try {
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
      });
      doc.render(data);
      return doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    } catch (e1) {
      // Thử lại với delimiter { }
      const fallbackZip = new PizZip(templateBuffer);
      const fallbackDoc = new Docxtemplater(fallbackZip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{', end: '}' }
      });
      fallbackDoc.render(data);
      return fallbackDoc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    }
  } catch (error) {
    console.error('Lỗi khi merge docx:', error);
    throw new Error('Lỗi khi xử lý trộn file Word. Vui lòng kiểm tra lại cấu trúc thẻ biến.');
  }
}

/**
 * Trích xuất nội dung body trong file document.xml của docx
 */
function extractBodyXml(zip: PizZip): { contentWithoutSectPr: string; sectPr: string; fullXml: string } {
  const xml = zip.files['word/document.xml'].asText();
  const bodyMatch = xml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) return { contentWithoutSectPr: '', sectPr: '', fullXml: xml };
  const bodyContent = bodyMatch[1];
  const sectPrMatch = bodyContent.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  const sectPr = sectPrMatch ? sectPrMatch[0] : '';
  const contentWithoutSectPr = bodyContent.replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/, '');
  return { contentWithoutSectPr, sectPr, fullXml: xml };
}

/**
 * Trộn TOÀN BỘ danh sách bản ghi vào MỘT FILE WORD (.docx) DUY NHẤT.
 * Mỗi bản ghi được phân tách bằng ngắt trang (Page Break) và giữ nguyên 100% định dạng gốc.
 */
export function generateMergedSingleDocx(
  templateBuffer: ArrayBuffer,
  rows: Record<string, string | number>[]
): Blob {
  if (rows.length === 0) {
    throw new Error('Không có dòng dữ liệu nào để xuất.');
  }

  // Nếu chỉ có 1 dòng, xuất trực tiếp
  if (rows.length === 1) {
    return generateMergedDocx(templateBuffer, rows[0]);
  }

  const combinedBodies: string[] = [];
  let finalSectPr = '';
  let baseXml = '';

  for (let i = 0; i < rows.length; i++) {
    const data = prepareDataRecord(rows[i]);
    let docZip: PizZip;

    try {
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
      });
      doc.render(data);
      docZip = doc.getZip();
    } catch {
      const fallbackZip = new PizZip(templateBuffer);
      const fallbackDoc = new Docxtemplater(fallbackZip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{', end: '}' }
      });
      fallbackDoc.render(data);
      docZip = fallbackDoc.getZip();
    }

    const { contentWithoutSectPr, sectPr, fullXml } = extractBodyXml(docZip);
    if (i === 0) baseXml = fullXml;
    finalSectPr = sectPr;
    combinedBodies.push(contentWithoutSectPr);
  }

  // Thẻ ngắt trang chuẩn OpenXML
  const pageBreakXml = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  const combinedBodyXml = combinedBodies.join(pageBreakXml) + finalSectPr;
  const finalDocumentXml = baseXml.replace(/<w:body>[\s\S]*?<\/w:body>/, '<w:body>' + combinedBodyXml + '</w:body>');

  const masterZip = new PizZip(templateBuffer);
  masterZip.file('word/document.xml', finalDocumentXml);

  return masterZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

/**
 * Trộn hàng loạt và đóng gói tất cả file docx vào 1 file ZIP (mỗi bản ghi 1 file)
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
      const docxBlob = generateMergedDocx(templateBuffer, row);
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

/**
 * In tài liệu chuẩn qua iframe cách ly:
 * Đảm bảo CHỈ in phần nội dung văn bản A4, loại bỏ 100% giao diện web, nút bấm, sidebar.
 */
export function printIsolatedDocument(
  htmlPages: string[],
  fontFamily: string,
  fontSize: string,
  lineHeight: string
) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const pagesContent = htmlPages
    .map(html => `<div class="a4-page">${html}</div>`)
    .join('');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>In văn bản</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 20mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #000000;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          line-height: ${lineHeight};
        }
        .a4-page {
          width: 100%;
          min-height: 260mm;
          page-break-after: always;
          break-after: page;
          box-sizing: border-box;
          padding: 5mm;
        }
        .a4-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        p {
          margin-top: 0;
          margin-bottom: 0.5em;
        }
        .merged-val {
          color: inherit;
          font-weight: inherit;
          font-style: inherit;
        }
      </style>
    </head>
    <body>
      ${pagesContent}
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 350);
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
