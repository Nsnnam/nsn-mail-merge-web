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
 * Trích xuất HTML từ OpenXML của file .docx trực tiếp để bảo toàn 100% định dạng gốc:
 * - Màu chữ, màu nền (shading/highlight), cỡ chữ, kiểu chữ (đậm, nghiêng, gạch chân).
 * - Cấu trúc bảng biểu (TableGrid), đường viền bảng, độ rộng từng cột, căn lề.
 * - Các trường trộn gốc của Word (MERGEFIELD) được chuyển hóa thành {{Ten_Truong}}.
 */
export function parseDocxToHtml(arrayBuffer: ArrayBuffer): string | null {
  try {
    const zip = new PizZip(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) return null;
    const docXml = docXmlFile.asText();

    // 1. Phân tích styles.xml để lấy màu sắc và thuộc tính định dạng của các kiểu Heading, v.v.
    const stylesMap: Record<string, { color?: string; bold?: boolean; italic?: boolean; size?: number; align?: string }> = {};
    if (zip.file('word/styles.xml')) {
      const stylesXml = zip.file('word/styles.xml')!.asText();
      const styleMatches = stylesXml.match(/<w:style\b[\s\S]*?<\/w:style>/g) || [];
      for (const s of styleMatches) {
        const idMatch = s.match(/w:styleId="([^"]+)"/);
        if (!idMatch) continue;
        const id = idMatch[1];
        const colorMatch = s.match(/<w:color\b[^>]*w:val="([0-9a-fA-F]{6})"/);
        const bMatch = s.includes('<w:b/>') || s.includes('<w:b ');
        const iMatch = s.includes('<w:i/>') || s.includes('<w:i ');
        const szMatch = s.match(/<w:sz\b[^>]*w:val="(\d+)"/);
        const jcMatch = s.match(/<w:jc\b[^>]*w:val="([^"]+)"/);
        stylesMap[id] = {
          color: colorMatch ? '#' + colorMatch[1] : undefined,
          bold: bMatch,
          italic: iMatch,
          size: szMatch ? parseInt(szMatch[1]) / 2 : undefined,
          align: jcMatch ? (jcMatch[1] === 'both' ? 'justify' : jcMatch[1]) : undefined
        };
      }
    }

    // 2. Chuyển hóa trường MERGEFIELD gốc của Word sang cú pháp {{Ten_Truong}}
    let cleanDocXml = docXml.replace(
      /<w:r\b[^>]*>(?:(?!<\/w:r>).)*?<w:fldChar\s+w:fldCharType="begin"\/>[\s\S]*?<w:instrText\b[^>]*>\s*MERGEFIELD\s+"?([^"\s\\>]+)"?[^<]*<\/w:instrText>[\s\S]*?<w:fldChar\s+w:fldCharType="end"\/>(?:(?!<\/w:r>).)*?<\/w:r>/g,
      '<w:r><w:t>{{$1}}</w:t></w:r>'
    );
    cleanDocXml = cleanDocXml.replace(
      /<w:fldSimple\b[^>]*w:instr="MERGEFIELD\s+&quot;([^&]+)&quot;[^"]*"[^>]*>[\s\S]*?<\/w:fldSimple>/g,
      '<w:r><w:t>{{$1}}</w:t></w:r>'
    );

    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function parseRuns(pXml: string): string {
      let html = '';
      const runMatches = pXml.match(/<w:r\b[\s\S]*?<\/w:r>|<w:hyperlink\b[\s\S]*?<\/w:hyperlink>/g) || [];
      for (const r of runMatches) {
        const rPrMatch = r.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
        const rPrContent = rPrMatch ? rPrMatch[1] : '';

        const isBold = rPrContent.includes('<w:b/>') || rPrContent.includes('<w:b ');
        const isItalic = rPrContent.includes('<w:i/>') || rPrContent.includes('<w:i ');
        const isUnderline = rPrContent.includes('<w:u ') || rPrContent.includes('<w:u/>');
        const isStrike = rPrContent.includes('<w:strike/>') || rPrContent.includes('<w:strike ');

        const colorMatch = rPrContent.match(/<w:color\b[^>]*w:val="([0-9a-fA-F]{6})"/);
        const shdMatch = rPrContent.match(/<w:shd\b[^>]*w:fill="([0-9a-fA-F]{6})"/);
        const highlightMatch = rPrContent.match(/<w:highlight\b[^>]*w:val="([^"]+)"/);
        const szMatch = rPrContent.match(/<w:sz\b[^>]*w:val="(\d+)"/);
        const fontMatch = rPrContent.match(/<w:rFonts\b[^>]*w:ascii="([^"]+)"/);

        const textParts: string[] = [];
        const tokenRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g;
        let token;
        while ((token = tokenRegex.exec(r)) !== null) {
          if (token[0].startsWith('<w:tab')) {
            textParts.push('&emsp;&emsp;');
          } else if (token[0].startsWith('<w:br')) {
            textParts.push('<br>');
          } else if (token[1] !== undefined) {
            textParts.push(escapeHtml(token[1]));
          }
        }

        if (textParts.length === 0) continue;
        let text = textParts.join('');

        const styles: string[] = [];
        if (colorMatch && colorMatch[1].toLowerCase() !== 'auto') {
          styles.push(`color: #${colorMatch[1]};`);
        }
        if (shdMatch && shdMatch[1].toLowerCase() !== 'auto') {
          styles.push(`background-color: #${shdMatch[1]};`);
        } else if (highlightMatch && highlightMatch[1] !== 'none') {
          styles.push(`background-color: ${highlightMatch[1]};`);
        }
        if (szMatch) {
          styles.push(`font-size: ${parseInt(szMatch[1]) / 2}pt;`);
        }
        if (fontMatch) {
          styles.push(`font-family: '${fontMatch[1]}', sans-serif;`);
        }

        let styledRun = text;
        if (isBold) styledRun = `<strong>${styledRun}</strong>`;
        if (isItalic) styledRun = `<em>${styledRun}</em>`;
        if (isUnderline) styledRun = `<u>${styledRun}</u>`;
        if (isStrike) styledRun = `<s>${styledRun}</s>`;

        if (styles.length > 0) {
          styledRun = `<span style="${styles.join(' ')}">${styledRun}</span>`;
        }
        html += styledRun;
      }
      return html;
    }

    function parseParagraph(pXml: string): string {
      const pPrMatch = pXml.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/);
      const pPrContent = pPrMatch ? pPrMatch[1] : '';

      const pStyleMatch = pPrContent.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/);
      const pStyleId = pStyleMatch ? pStyleMatch[1] : '';
      const styleDef = stylesMap[pStyleId] || {};

      const jcMatch = pPrContent.match(/<w:jc\b[^>]*w:val="([^"]+)"/);
      const align = jcMatch ? (jcMatch[1] === 'both' ? 'justify' : jcMatch[1]) : (styleDef.align || '');

      const pStyles: string[] = [];
      if (align) pStyles.push(`text-align: ${align};`);
      if (styleDef.color) pStyles.push(`color: ${styleDef.color};`);

      const innerHtml = parseRuns(pXml);
      const styleAttr = pStyles.length > 0 ? ` style="${pStyles.join(' ')}"` : '';

      if (pStyleId === 'Heading1' || pStyleId === 'heading1' || pStyleId === '1') {
        return `<h1${styleAttr}>${innerHtml || '&nbsp;'}</h1>`;
      }
      if (pStyleId === 'Heading2' || pStyleId === 'heading2' || pStyleId === '2') {
        return `<h2${styleAttr}>${innerHtml || '&nbsp;'}</h2>`;
      }
      if (pStyleId === 'Heading3' || pStyleId === 'heading3' || pStyleId === '3') {
        return `<h3${styleAttr}>${innerHtml || '&nbsp;'}</h3>`;
      }

      return `<p${styleAttr}>${innerHtml || '&nbsp;'}</p>`;
    }

    function parseTable(tblXml: string): string {
      const gridCols: number[] = [];
      const colMatches = tblXml.match(/<w:gridCol\b[^>]*w:w="(\d+)"/g) || [];
      for (const c of colMatches) {
        const wMatch = c.match(/w:w="(\d+)"/);
        if (wMatch) gridCols.push(parseInt(wMatch[1]));
      }
      const totalGridWidth = gridCols.reduce((a, b) => a + b, 0);

      const trMatches = tblXml.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || [];
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #000;"><tbody>';

      for (let rIdx = 0; rIdx < trMatches.length; rIdx++) {
        const tr = trMatches[rIdx];
        tableHtml += '<tr>';
        const tcMatches = tr.match(/<w:tc\b[\s\S]*?<\/w:tc>/g) || [];

        for (let cIdx = 0; cIdx < tcMatches.length; cIdx++) {
          const tc = tcMatches[cIdx];
          const tcPrMatch = tc.match(/<w:tcPr>([\s\S]*?)<\/w:tcPr>/);
          const tcPrContent = tcPrMatch ? tcPrMatch[1] : '';

          const tcStyles: string[] = [
            'border: 1px solid #000;',
            'padding: 6px 10px;',
            'vertical-align: top;',
            'min-height: 24px;'
          ];

          if (totalGridWidth > 0 && gridCols[cIdx]) {
            const widthPct = ((gridCols[cIdx] / totalGridWidth) * 100).toFixed(1);
            tcStyles.push(`width: ${widthPct}%;`);
          }

          const shdMatch = tcPrContent.match(/<w:shd\b[^>]*w:fill="([0-9a-fA-F]{6})"/);
          if (shdMatch && shdMatch[1].toLowerCase() !== 'auto') {
            tcStyles.push(`background-color: #${shdMatch[1]};`);
          }

          const gridSpanMatch = tcPrContent.match(/<w:gridSpan\b[^>]*w:val="(\d+)"/);
          const colSpanAttr = gridSpanMatch ? ` colspan="${gridSpanMatch[1]}"` : '';

          const pInside = tc.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];
          let cellBody = '';
          if (pInside.length > 0) {
            cellBody = pInside.map(p => parseParagraph(p)).join('');
          }
          if (!cellBody.trim() || cellBody === '<p>&nbsp;</p>') {
            cellBody = '<p>&nbsp;</p>';
          }

          tableHtml += `<td${colSpanAttr} style="${tcStyles.join(' ')}">${cellBody}</td>`;
        }
        tableHtml += '</tr>';
      }

      tableHtml += '</tbody></table>';
      return tableHtml;
    }

    const bodyMatch = cleanDocXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
    if (!bodyMatch) return null;
    const bodyXml = bodyMatch[1];

    let finalHtml = '';
    const elementRegex = /<w:p\b[\s\S]*?<\/w:p>|<w:tbl\b[\s\S]*?<\/w:tbl>/g;
    let element;
    while ((element = elementRegex.exec(bodyXml)) !== null) {
      if (element[0].startsWith('<w:tbl')) {
        finalHtml += parseTable(element[0]);
      } else {
        finalHtml += parseParagraph(element[0]);
      }
    }

    return finalHtml.trim() ? finalHtml : null;
  } catch (err) {
    console.warn('Lỗi khi phân tích OpenXML trực tiếp:', err);
    return null;
  }
}

/**
 * Chuẩn hóa binary docx buffer để thay thế Word MERGEFIELD sang {{tag}} cho docxtemplater
 */
export function normalizeDocxBuffer(arrayBuffer: ArrayBuffer): ArrayBuffer {
  try {
    const zip = new PizZip(arrayBuffer);
    const docFile = zip.file('word/document.xml');
    if (!docFile) return arrayBuffer;
    let docXml = docFile.asText();

    let modified = false;
    const complexRegex = /<w:r\b[^>]*>(?:(?!<\/w:r>).)*?<w:fldChar\s+w:fldCharType="begin"\/>[\s\S]*?<w:instrText\b[^>]*>\s*MERGEFIELD\s+"?([^"\s\\>]+)"?[^<]*<\/w:instrText>[\s\S]*?<w:fldChar\s+w:fldCharType="end"\/>(?:(?!<\/w:r>).)*?<\/w:r>/g;
    if (complexRegex.test(docXml)) {
      docXml = docXml.replace(complexRegex, '<w:r><w:t>{{$1}}</w:t></w:r>');
      modified = true;
    }
    const simpleRegex = /<w:fldSimple\b[^>]*w:instr="MERGEFIELD\s+&quot;([^&]+)&quot;[^"]*"[^>]*>[\s\S]*?<\/w:fldSimple>/g;
    if (simpleRegex.test(docXml)) {
      docXml = docXml.replace(simpleRegex, '<w:r><w:t>{{$1}}</w:t></w:r>');
      modified = true;
    }

    if (modified) {
      zip.file('word/document.xml', docXml);
      return zip.generate({ type: 'arraybuffer' });
    }
    return arrayBuffer;
  } catch {
    return arrayBuffer;
  }
}

/**
 * Trích xuất HTML từ file Word (.docx) để hiển thị trong Editor.
 * Ưu tiên trình phân tích OpenXML bảo toàn màu sắc và bảng, dự phòng bằng mammoth.
 */
export async function extractHtmlFromDocx(arrayBuffer: ArrayBuffer): Promise<{ html: string; tags: string[] }> {
  try {
    // 1. Phân tích OpenXML trực tiếp bảo toàn 100% màu sắc và bảng biểu
    const openXmlHtml = parseDocxToHtml(arrayBuffer);
    if (openXmlHtml && openXmlHtml.length > 50) {
      const tags = extractTagsFromText(openXmlHtml);
      return { html: openXmlHtml, tags };
    }

    // 2. Dự phòng bằng Mammoth nếu file có cấu trúc đặc biệt
    const result = await (mammoth as any).convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "table => table:fresh"
        ]
      }
    );
    const rawHtml = result.value || '';
    const tags = extractTagsFromText(rawHtml);
    return { html: rawHtml, tags };
  } catch (error) {
    console.error('Lỗi đọc file Word:', error);
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
    const cleanBuffer = normalizeDocxBuffer(templateBuffer);

    // Thử với delimiter {{ }}
    try {
      const zip = new PizZip(cleanBuffer);
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
      const fallbackZip = new PizZip(cleanBuffer);
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

  const cleanBuffer = normalizeDocxBuffer(templateBuffer);
  const combinedBodies: string[] = [];
  let finalSectPr = '';
  let baseXml = '';

  for (let i = 0; i < rows.length; i++) {
    const data = prepareDataRecord(rows[i]);
    let docZip: PizZip;

    try {
      const zip = new PizZip(cleanBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
      });
      doc.render(data);
      docZip = doc.getZip();
    } catch {
      const fallbackZip = new PizZip(cleanBuffer);
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

  const masterZip = new PizZip(cleanBuffer);
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
  const cleanBuffer = normalizeDocxBuffer(templateBuffer);
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
      const docxBlob = generateMergedDocx(cleanBuffer, row);
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
          margin: 12px 0;
          border: 1px solid #000000;
        }
        table td, table th {
          border: 1px solid #000000;
          padding: 6px 10px;
          vertical-align: top;
          min-height: 24px;
        }
        table th {
          background-color: #f8fafc;
          font-weight: bold;
        }
        p {
          margin-top: 0;
          margin-bottom: 0.4em;
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
