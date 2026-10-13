import * as XLSX from 'xlsx';
import { ExcelSheetData } from '../types';

export interface ParsedWorkbook {
  sheetNames: string[];
  activeSheet: string;
  data: ExcelSheetData;
  workbook: XLSX.WorkBook;
}

/**
 * Đọc file Excel từ File/ArrayBuffer
 */
export async function readExcelFile(file: File): Promise<ParsedWorkbook> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('File Excel không có sheet nào.');
  }

  const firstSheetName = sheetNames[0];
  const data = extractSheetData(workbook, firstSheetName);

  return {
    sheetNames,
    activeSheet: firstSheetName,
    data,
    workbook
  };
}

/**
 * Trích xuất dữ liệu từ một Sheet cụ thể trong Workbook
 */
export function extractSheetData(workbook: XLSX.WorkBook, sheetName: string): ExcelSheetData {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return { sheetName, headers: [], rows: [], totalRows: 0 };
  }

  // Chuyển sheet sang dạng mảng 2 chiều
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length === 0) {
    return { sheetName, headers: [], rows: [], totalRows: 0 };
  }

  // Hàng 0 là tiêu đề cột
  const rawHeaders = rawRows[0];
  const headers: string[] = [];

  rawHeaders.forEach((h, index) => {
    const headerStr = h !== undefined && h !== null ? String(h).trim() : '';
    if (headerStr) {
      headers.push(headerStr);
    } else if (index < rawHeaders.length) {
      // Đặt tên mặc định nếu cột không có tên
      headers.push(`Cột_${index + 1}`);
    }
  });

  // Đọc các hàng dữ liệu từ hàng 1 trở đi
  const rows: Record<string, string | number>[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    // Kiểm tra xem hàng có dữ liệu hay rỗng hoàn toàn
    const hasData = row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');
    if (!hasData) continue;

    const rowObj: Record<string, string | number> = {};
    headers.forEach((header, colIndex) => {
      let val = row[colIndex];
      if (val instanceof Date) {
        // Format ngày kiểu DD/MM/YYYY
        val = formatDate(val);
      }
      rowObj[header] = val !== undefined && val !== null ? val : '';
    });
    rows.push(rowObj);
  }

  return {
    sheetName,
    headers,
    rows,
    totalRows: rows.length
  };
}

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Tạo dữ liệu mẫu Excel sẵn có để người dùng test ngay
 */
export function getSampleExcelData(): ExcelSheetData {
  const headers = [
    'SoThuTu',
    'HoVaTen',
    'ChucVu',
    'DonVi',
    'SoDienThoai',
    'Email',
    'MaDaiBieu',
    'DiaDiem',
    'SoGhe',
    'GhiChu',
    'Ngay',
    'Thang',
    'Nam'
  ];

  const rows = [
    {
      SoThuTu: '01',
      HoVaTen: 'Nguyễn Văn An',
      ChucVu: 'Giám đốc Trung tâm CNTT',
      DonVi: 'Bệnh viện Đa khoa Tỉnh',
      SoDienThoai: '0912.345.678',
      Email: 'an.nguyen@benhvien.vn',
      MaDaiBieu: 'VIP-2026-001',
      DiaDiem: 'Hội trường Lớn A1, Trung tâm Hội nghị Quốc gia',
      SoGhe: 'Hàng 1 - Ghế 05',
      GhiChu: 'Báo cáo viên chuyên đề Chuyển đổi số HIS',
      Ngay: '13',
      Thang: '10',
      Nam: '2026'
    },
    {
      SoThuTu: '02',
      HoVaTen: 'Trần Thị Bích Ngọc',
      ChucVu: 'Trưởng phòng Kế hoạch Tổng hợp',
      DonVi: 'Bệnh viện Sản Nhi',
      SoDienThoai: '0988.765.432',
      Email: 'ngoc.tran@sannhi.org.vn',
      MaDaiBieu: 'VIP-2026-002',
      DiaDiem: 'Hội trường Lớn A1, Trung tâm Hội nghị Quốc gia',
      SoGhe: 'Hàng 1 - Ghế 06',
      GhiChu: 'Đại biểu khách mời danh dự',
      Ngay: '13',
      Thang: '10',
      Nam: '2026'
    },
    {
      SoThuTu: '03',
      HoVaTen: 'Lê Hoàng Minh',
      ChucVu: 'Phó Trưởng khoa Khám bệnh',
      DonVi: 'Bệnh viện Đa khoa Khu vực',
      SoDienThoai: '0903.112.233',
      Email: 'minh.le@bvkhuvuc.vn',
      MaDaiBieu: 'DB-2026-088',
      DiaDiem: 'Hội trường Lớn A1, Trung tâm Hội nghị Quốc gia',
      SoGhe: 'Hàng 2 - Ghế 12',
      GhiChu: 'Tham luận chuyên đề Bệnh án điện tử EMR',
      Ngay: '13',
      Thang: '10',
      Nam: '2026'
    },
    {
      SoThuTu: '04',
      HoVaTen: 'Phạm Quỳnh Chi',
      ChucVu: 'Phụ trách Tổ BHYT & Kế toán viện phí',
      DonVi: 'Trung tâm Y tế Huyện',
      SoDienThoai: '0977.889.900',
      Email: 'chi.pham@ttythuyen.gov.vn',
      MaDaiBieu: 'DB-2026-105',
      DiaDiem: 'Hội trường Lớn A1, Trung tâm Hội nghị Quốc gia',
      SoGhe: 'Hàng 3 - Ghế 08',
      GhiChu: 'Hỗ trợ đón tiếp đại biểu',
      Ngay: '13',
      Thang: '10',
      Nam: '2026'
    },
    {
      SoThuTu: '05',
      HoVaTen: 'Hoàng Anh Tuấn',
      ChucVu: 'Kỹ sư Trưởng phần mềm y tế',
      DonVi: 'Tập đoàn Giải pháp Y tế Số',
      SoDienThoai: '0966.554.433',
      Email: 'tuan.ha@medtech.com.vn',
      MaDaiBieu: 'DN-2026-019',
      DiaDiem: 'Hội trường Lớn A1, Trung tâm Hội nghị Quốc gia',
      SoGhe: 'Hàng 3 - Ghế 15',
      GhiChu: 'Gian hàng giới thiệu công nghệ Telehealth',
      Ngay: '13',
      Thang: '10',
      Nam: '2026'
    }
  ];

  return {
    sheetName: 'DanhSachMoi',
    headers,
    rows,
    totalRows: rows.length
  };
}

/**
 * Tải file Excel mẫu về máy tính
 */
export function exportSampleExcelFile() {
  const sample = getSampleExcelData();
  const ws = XLSX.utils.json_to_sheet(sample.rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sample.sheetName);
  XLSX.writeFile(wb, 'Mau_Excel_Tron_Thu_NSN.xlsx');
}
