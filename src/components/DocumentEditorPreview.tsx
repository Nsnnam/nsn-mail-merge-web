import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Printer,
  FileDown,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Table as TableIcon,
  Minus,
  RemoveFormatting,
  RotateCcw,
  RotateCw,
  Palette,
  Highlighter,
  Files,
  Sparkles,
  Bookmark,
  Plus,
  Trash2,
  Split,
  Square,
  CheckSquare,
  Columns,
  Rows,
  Ruler,
  Sliders
} from 'lucide-react';
import { DocumentSettings, DocumentMargin, PageMarginType } from '../types';
import { VIETNAMESE_FONTS } from '../lib/fonts';
import { renderMergedHtml, getEffectiveMargin } from '../lib/docxHelper';
import { ThemeGradient } from '../lib/theme';

export interface DocumentEditorHandle {
  insertTag: (tag: string) => void;
}

interface DocumentEditorPreviewProps {
  templateHtml: string;
  onUpdateTemplateHtml: (newHtml: string) => void;
  currentRow: Record<string, string | number> | null;
  currentIndex: number;
  totalRecords: number;
  onPrevRecord: () => void;
  onNextRecord: () => void;
  onFirstRecord: () => void;
  onLastRecord: () => void;
  onJumpToRecord: (index: number) => void;
  settings: DocumentSettings;
  isPreviewMode: boolean;
  setIsPreviewMode: (preview: boolean) => void;
  onPrintCurrent: () => void;
  onPrintAll: () => void;
  onExportDocxCurrent: () => void;
  onExportSingleDocxAll: () => void;
  onExportZipAll: () => void;
  hasTemplate: boolean;
  hasExcel: boolean;
  theme?: ThemeGradient;
  onOpenTemplateManager?: () => void;
  onUpdateSettings?: (newSettings: Partial<DocumentSettings>) => void;
}

const SPECIAL_SYMBOLS = [
  '✓', '✔', '✕', '✖', '☐', '☑', '☒', '★', '☆',
  '•', '●', '○', '→', '←', '↑', '↓', '↔', '±',
  '≤', '≥', '≠', '≈', '°', 'µ', '§', '©', '®', '™'
];

export const DocumentEditorPreview = forwardRef<DocumentEditorHandle, DocumentEditorPreviewProps>(({
  templateHtml,
  onUpdateTemplateHtml,
  currentRow,
  currentIndex,
  totalRecords,
  onPrevRecord,
  onNextRecord,
  onFirstRecord,
  onLastRecord,
  onJumpToRecord,
  settings,
  isPreviewMode,
  setIsPreviewMode,
  onPrintCurrent,
  onPrintAll,
  onExportDocxCurrent,
  onExportSingleDocxAll,
  onExportZipAll,
  hasTemplate,
  hasExcel,
  theme,
  onOpenTemplateManager,
  onUpdateSettings
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const selectedFont = VIETNAMESE_FONTS.find(f => f.id === settings.fontId) || VIETNAMESE_FONTS[0];

  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [cellBgColor, setCellBgColor] = useState('#f1f5f9');
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isSymbolsOpen, setIsSymbolsOpen] = useState(false);
  const [isCustomTableModalOpen, setIsCustomTableModalOpen] = useState(false);
  const [customRows, setCustomRows] = useState(4);
  const [customCols, setCustomCols] = useState(4);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [tempMargins, setTempMargins] = useState<DocumentMargin>(
    settings.customMargins || { top: 20, bottom: 20, left: 30, right: 15 }
  );

  // === HỆ THỐNG CUSTOM HISTORY STACK (UNDO / REDO) ĐỘC LẬP 100% ===
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoActionRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<any>(null);
  const lastKnownHtmlRef = useRef<string>('');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Ref cho Click Outside
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const symbolsMenuRef = useRef<HTMLDivElement>(null);

  // Ref và State cho Menu chuột phải (Context Menu)
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const contextTargetCellRef = useRef<{
    cell: HTMLTableCellElement;
    row: HTMLTableRowElement;
    table: HTMLTableElement;
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    inTable: boolean;
    hasSelection: boolean;
    selectedText: string;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    inTable: false,
    hasSelection: false,
    selectedText: ''
  });

  const updateUndoRedoState = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
  };

  const pushHistorySnapshot = (html: string) => {
    if (isUndoRedoActionRef.current) return;
    const currentStack = historyStackRef.current;
    const currentIndex = historyIndexRef.current;

    if (currentIndex >= 0 && currentStack[currentIndex] === html) {
      return;
    }

    const newStack = currentStack.slice(0, currentIndex + 1);
    newStack.push(html);

    if (newStack.length > 60) {
      newStack.shift();
    }

    historyStackRef.current = newStack;
    historyIndexRef.current = newStack.length - 1;
    updateUndoRedoState();
  };

  const commitHtmlChange = (newHtml: string, immediate: boolean = true) => {
    lastKnownHtmlRef.current = newHtml;
    onUpdateTemplateHtml(newHtml);

    if (immediate) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      pushHistorySnapshot(newHtml);
    } else {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        pushHistorySnapshot(newHtml);
      }, 350);
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0 || !editorRef.current || isPreviewMode) return;
    isUndoRedoActionRef.current = true;
    historyIndexRef.current--;
    const prevHtml = historyStackRef.current[historyIndexRef.current];
    editorRef.current.innerHTML = prevHtml;
    lastKnownHtmlRef.current = prevHtml;
    onUpdateTemplateHtml(prevHtml);
    updateUndoRedoState();

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 50);
  };

  const handleRedo = () => {
    if (historyIndexRef.current >= historyStackRef.current.length - 1 || !editorRef.current || isPreviewMode) return;
    isUndoRedoActionRef.current = true;
    historyIndexRef.current++;
    const nextHtml = historyStackRef.current[historyIndexRef.current];
    editorRef.current.innerHTML = nextHtml;
    lastKnownHtmlRef.current = nextHtml;
    onUpdateTemplateHtml(nextHtml);
    updateUndoRedoState();

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 50);
  };

  // Đóng Table Menu, Symbols Menu và Context Menu khi click chuột ra ngoài hoặc ấn phím Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isTableMenuOpen && tableMenuRef.current && !tableMenuRef.current.contains(target)) {
        setIsTableMenuOpen(false);
      }
      if (isSymbolsOpen && symbolsMenuRef.current && !symbolsMenuRef.current.contains(target)) {
        setIsSymbolsOpen(false);
      }
      if (contextMenu.isOpen && contextMenuRef.current && !contextMenuRef.current.contains(target)) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };
    const handleKeyDownGlobal = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (contextMenu.isOpen) setContextMenu(prev => ({ ...prev, isOpen: false }));
        if (isTableMenuOpen) setIsTableMenuOpen(false);
        if (isSymbolsOpen) setIsSymbolsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDownGlobal);
    };
  }, [isTableMenuOpen, isSymbolsOpen, contextMenu.isOpen]);

  const effectiveMargin = getEffectiveMargin(settings);

  const handleMarginChange = (val: PageMarginType) => {
    if (val === 'custom') {
      setIsMarginModalOpen(true);
    } else {
      onUpdateSettings?.({ pageMargin: val });
    }
  };

  const handleSaveCustomMargin = () => {
    onUpdateSettings?.({
      pageMargin: 'custom',
      customMargins: tempMargins
    });
    setIsMarginModalOpen(false);
  };

  // Lưu lại vị trí con trỏ / vùng bôi đen (selection)
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  useEffect(() => {
    const handleDocSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      }
    };

    document.addEventListener('selectionchange', handleDocSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleDocSelectionChange);
    };
  }, []);

  // Expose hàm insertTag cho component cha gọi khi click vào thẻ bên phải
  useImperativeHandle(ref, () => ({
    insertTag: (tag: string) => {
      const el = editorRef.current;
      if (!el) return;

      if (isPreviewMode) {
        setIsPreviewMode(false);
      }

      el.focus();

      const tagText = `{{${tag}}}`;
      const sel = window.getSelection();
      let range: Range | null = null;

      if (sel && sel.rangeCount > 0) {
        const curRange = sel.getRangeAt(0);
        if (el.contains(curRange.commonAncestorContainer)) {
          range = curRange;
        }
      }

      if (!range && savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
        range = savedRangeRef.current;
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      if (range && el.contains(range.commonAncestorContainer)) {
        range.deleteContents();

        const textNode = document.createTextNode(tagText);
        range.insertNode(textNode);

        const newRange = document.createRange();
        newRange.setStartAfter(textNode);
        newRange.setEndAfter(textNode);

        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedRangeRef.current = newRange;

        commitHtmlChange(el.innerHTML, true);
      } else {
        const textNode = document.createTextNode(` ${tagText} `);
        el.appendChild(textNode);

        const newRange = document.createRange();
        newRange.selectNodeContents(el);
        newRange.collapse(false);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedRangeRef.current = newRange;

        commitHtmlChange(el.innerHTML, true);
      }
    }
  }));

  // Đồng bộ nội dung vào editor khi đổi chế độ hoặc đổi bản ghi
  useEffect(() => {
    if (!editorRef.current) return;
    if (isPreviewMode) {
      editorRef.current.innerHTML = renderMergedHtml(templateHtml, currentRow, false);
    } else {
      if (editorRef.current.innerHTML !== templateHtml) {
        editorRef.current.innerHTML = templateHtml;
        lastKnownHtmlRef.current = templateHtml;
        if (historyStackRef.current.length === 0 || !isUndoRedoActionRef.current) {
          historyStackRef.current = [templateHtml];
          historyIndexRef.current = 0;
          updateUndoRedoState();
        }
      }
    }
  }, [templateHtml, currentRow, isPreviewMode]);

  // Xử lý sự kiện chỉnh sửa nội dung
  const handleInput = () => {
    if (!isPreviewMode && editorRef.current) {
      saveSelection();
      commitHtmlChange(editorRef.current.innerHTML, false);
    }
  };

  // Các lệnh định dạng cơ bản
  const execFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current && !isPreviewMode) {
      saveSelection();
      commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  // Áp dụng định dạng tùy biến (Màu sắc, Cỡ chữ, Kiểu đoạn)
  const applyInlineStyle = (property: string, value: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    if (range.collapsed) {
      if (property === 'color') document.execCommand('foreColor', false, value);
      if (property === 'backgroundColor') document.execCommand('hiliteColor', false, value);
      return;
    }

    const span = document.createElement('span');
    span.style.setProperty(property, value);
    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      savedRangeRef.current = newRange;
      commitHtmlChange(editorRef.current.innerHTML, true);
    } catch (e) {
      console.warn('Lỗi áp dụng style inline:', e);
    }
  };

  // Chèn khoảng cách Tab (Tab spacer)
  const insertTabSpacer = () => {
    const tabHtml = '<span class="word-tab" style="display:inline-block; min-width: 3.5rem;">&emsp;&emsp;</span>';
    document.execCommand('insertHTML', false, tabHtml);
    if (editorRef.current && !isPreviewMode) {
      saveSelection();
      commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  // Bắt phím Tab và phím tắt Undo (Ctrl+Z) / Redo (Ctrl+Y / Ctrl+Shift+Z)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        handleRedo();
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      insertTabSpacer();
    }
  };

  // Chèn ký tự đặc biệt
  const insertSymbol = (sym: string) => {
    document.execCommand('insertText', false, sym);
    if (editorRef.current && !isPreviewMode) {
      saveSelection();
      commitHtmlChange(editorRef.current.innerHTML, true);
    }
    setIsSymbolsOpen(false);
  };

  // === BỘ CÔNG CỤ BẢNG BIỂU CHUYÊN NGHIỆP (TABLE SUITE) ===
  const getClosestCellAndTable = () => {
    // Ưu tiên cell được chọn từ chuột phải nếu còn kết nối trong DOM
    if (contextTargetCellRef.current && contextTargetCellRef.current.table.isConnected) {
      return contextTargetCellRef.current;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return null;
    let node: Node | null = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    const el = node as HTMLElement;
    if (!editorRef.current.contains(el)) return null;
    const cell = el.closest('td, th') as HTMLTableCellElement | null;
    const row = cell?.closest('tr') as HTMLTableRowElement | null;
    const table = row?.closest('table') as HTMLTableElement | null;
    if (!cell || !row || !table) return null;
    return { cell, row, table };
  };

  // === XỬ LÝ MENU NGỮ CẢNH CHUỘT PHẢI (CONTEXT MENU) ===
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();

    saveSelection();

    const target = e.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement | null;
    const row = cell?.closest('tr') as HTMLTableRowElement | null;
    const table = row?.closest('table') as HTMLTableElement | null;

    if (cell && row && table && editorRef.current?.contains(table)) {
      contextTargetCellRef.current = { cell, row, table };
    } else {
      contextTargetCellRef.current = null;
    }

    const sel = window.getSelection();
    const selText = sel ? sel.toString().trim() : '';
    const hasSelection = selText.length > 0;

    const menuWidth = 320;
    const menuHeight = cell ? 540 : 380;
    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuWidth > window.innerWidth - 12) {
      posX = Math.max(12, window.innerWidth - menuWidth - 12);
    }
    if (posY + menuHeight > window.innerHeight - 12) {
      posY = Math.max(12, window.innerHeight - menuHeight - 12);
    }

    setContextMenu({
      isOpen: true,
      x: posX,
      y: posY,
      inTable: Boolean(cell && table),
      hasSelection,
      selectedText: selText
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
  };

  const execContextFormat = (cmd: string, val?: string) => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    execFormat(cmd, val);
    closeContextMenu();
  };

  const applyContextInlineStyle = (property: string, val: string) => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    applyInlineStyle(property, val);
    closeContextMenu();
  };

  const runTableAction = (action: () => void) => {
    action();
    closeContextMenu();
  };

  const runContextTab = () => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    insertTabSpacer();
    closeContextMenu();
  };

  const runContextSymbol = (sym: string) => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    insertSymbol(sym);
    closeContextMenu();
  };

  const insertTable = (rows: number, cols: number) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1.5px solid #000;"><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        const isHeader = r === 0;
        const isSTT = c === 0;
        const align = (isHeader || isSTT) ? 'center' : 'left';
        tableHtml += `<td style="border: 1px solid #000; padding: 5px 8px; vertical-align: middle; text-align: ${align}; font-weight: ${isHeader ? 'bold' : 'normal'}; background: ${isHeader ? '#f8fafc' : '#ffffff'};">${isHeader ? (isSTT ? 'STT' : `Cột ${c + 1}`) : (isSTT ? `${r}` : '&nbsp;')}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current && !isPreviewMode) {
      commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  const handleInsertRowAbove = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần thêm hàng.');
      return;
    }
    const { row, table } = found;
    const colCount = row.cells.length;
    const newRow = table.insertRow(row.rowIndex);
    for (let i = 0; i < colCount; i++) {
      const newCell = newRow.insertCell(i);
      newCell.style.border = '1px solid #000';
      newCell.style.padding = '5px 8px';
      newCell.style.verticalAlign = 'middle';
      newCell.innerHTML = '<p>&nbsp;</p>';
    }
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleInsertRowBelow = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần thêm hàng.');
      return;
    }
    const { row, table } = found;
    const colCount = row.cells.length;
    const newRow = table.insertRow(row.rowIndex + 1);
    for (let i = 0; i < colCount; i++) {
      const newCell = newRow.insertCell(i);
      newCell.style.border = '1px solid #000';
      newCell.style.padding = '5px 8px';
      newCell.style.verticalAlign = 'middle';
      newCell.innerHTML = '<p>&nbsp;</p>';
    }
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleDeleteRow = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần xóa hàng.');
      return;
    }
    const { row, table } = found;
    if (table.rows.length <= 1) {
      table.remove();
    } else {
      table.deleteRow(row.rowIndex);
    }
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleInsertColLeft = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần thêm cột.');
      return;
    }
    const { cell, table } = found;
    const colIdx = cell.cellIndex;
    Array.from(table.rows).forEach(r => {
      const newCell = r.insertCell(colIdx);
      newCell.style.border = '1px solid #000';
      newCell.style.padding = '5px 8px';
      newCell.style.verticalAlign = 'middle';
      newCell.innerHTML = '<p>&nbsp;</p>';
    });
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleInsertColRight = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần thêm cột.');
      return;
    }
    const { cell, table } = found;
    const colIdx = cell.cellIndex;
    Array.from(table.rows).forEach(r => {
      const newCell = r.insertCell(colIdx + 1);
      newCell.style.border = '1px solid #000';
      newCell.style.padding = '5px 8px';
      newCell.style.verticalAlign = 'middle';
      newCell.innerHTML = '<p>&nbsp;</p>';
    });
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleDeleteCol = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần xóa cột.');
      return;
    }
    const { cell, row, table } = found;
    const colIdx = cell.cellIndex;
    if (row.cells.length <= 1) {
      table.remove();
    } else {
      Array.from(table.rows).forEach(r => {
        if (r.cells[colIdx]) {
          r.deleteCell(colIdx);
        }
      });
    }
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleDeleteTable = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần xóa.');
      return;
    }
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ bảng này không?')) {
      found.table.remove();
      if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  const handleAlignCell = (align: 'left' | 'center' | 'right' | 'justify') => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần căn lề.');
      return;
    }
    found.cell.style.textAlign = align;
    found.cell.querySelectorAll('p, div, span').forEach(el => {
      (el as HTMLElement).style.textAlign = align;
    });
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleValignCell = (valign: 'top' | 'middle' | 'bottom') => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần căn lề dọc.');
      return;
    }
    found.cell.style.verticalAlign = valign;
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleCellBgColorChange = (color: string) => {
    setCellBgColor(color);
    const found = getClosestCellAndTable();
    if (found) {
      found.cell.style.backgroundColor = color;
      if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  const handleSetTableBorders = (type: 'solid' | 'dashed' | 'none') => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần định dạng viền.');
      return;
    }
    const borderStyle = type === 'solid' ? '1px solid #000' : type === 'dashed' ? '1px dashed #666' : 'none';
    found.table.style.border = type === 'solid' ? '1.5px solid #000' : type === 'dashed' ? '1.5px dashed #666' : 'none';
    found.table.querySelectorAll('td, th').forEach(c => {
      (c as HTMLElement).style.border = borderStyle;
    });
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const fontFamilyStyle = settings.preserveOriginalFormat ? 'inherit' : selectedFont.family;
  const fontSizeStyle = settings.preserveOriginalFormat ? 'inherit' : settings.fontSize;
  const lineHeightStyle = settings.preserveOriginalFormat ? 'inherit' : settings.lineHeight;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* THANH ĐIỀU KHIỂN CHÍNH TRÊN CÙNG */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2.5">
        {/* Nhóm 1: Chuyển đổi Chế độ & Kho mẫu */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shadow-2xs">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                !isPreviewMode
                  ? theme ? theme.primaryBtn : 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chế độ Soạn thảo</span>
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPreviewMode
                  ? theme ? theme.primaryBtn : 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước Dữ liệu</span>
            </button>
          </div>

          {onOpenTemplateManager && (
            <button
              onClick={onOpenTemplateManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-all"
              title="Mở Kho lưu trữ mẫu văn bản và sao lưu / khôi phục JSON"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Kho mẫu &amp; Sao lưu</span>
            </button>
          )}
        </div>

        {/* Nhóm 2: Điều hướng bản ghi Excel */}
        {totalRecords > 0 && (
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-300 shadow-2xs">
            <button
              onClick={onFirstRecord}
              disabled={currentIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Về bản ghi đầu tiên"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onPrevRecord}
              disabled={currentIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Bản ghi trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs px-1 font-medium text-slate-700">
              <span className="hidden sm:inline">Bản ghi</span>
              <input
                type="number"
                min={1}
                max={totalRecords}
                value={currentIndex + 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalRecords) {
                    onJumpToRecord(val - 1);
                  }
                }}
                className={`w-11 text-center py-0.5 border border-slate-300 rounded font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme ? theme.accentText : 'text-blue-700'}`}
              />
              <span>/ <strong>{totalRecords}</strong></span>
            </div>

            <button
              onClick={onNextRecord}
              disabled={currentIndex >= totalRecords - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Bản ghi kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLastRecord}
              disabled={currentIndex >= totalRecords - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Đến bản ghi cuối cùng"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nhóm 3: Các nút In & Xuất file chuyên nghiệp */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onPrintCurrent}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${
              theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="In hoặc Lưu thành PDF bản ghi hiện tại qua trình duyệt (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In bản ghi này</span>
          </button>

          {totalRecords > 1 && (
            <button
              onClick={onPrintAll}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                theme ? `${theme.accentBg} ${theme.accentText} ${theme.accentBorder} hover:brightness-95` : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
              title="In hàng loạt hoặc xuất toàn bộ tất cả bản ghi ra PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In tất cả ({totalRecords})</span>
            </button>
          )}

          <button
            onClick={onExportDocxCurrent}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Xuất bản ghi hiện tại ra file Word (.docx) giữ nguyên 100% format gốc"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất .DOCX</span>
          </button>

          {totalRecords > 1 && (
            <button
              onClick={onExportSingleDocxAll}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-2xs ${
                theme ? `${theme.accentBg} ${theme.accentText} ${theme.accentBorder} hover:brightness-95` : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
              title="Xuất toàn bộ tất cả bản ghi vào 1 file Word .docx duy nhất (tách từng trang chuẩn)"
            >
              <Files className="w-3.5 h-3.5" />
              <span>Gộp 1 file .DOCX ({totalRecords})</span>
            </button>
          )}

          {totalRecords > 1 && (
            <button
              onClick={onExportZipAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Trộn tất cả các dòng và đóng gói thành file .ZIP chứa từng file docx riêng"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Gói ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* THANH CÔNG CỤ SOẠN THẢO WYSIWYG TOÀN DIỆN KIỂU MICROSOFT WORD */}
      {!isPreviewMode && (
        <div className="bg-white border-b border-slate-200 p-2 sm:px-4 flex flex-wrap items-center gap-1 text-xs text-slate-700 shadow-2xs">
          {/* Lịch sử Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded p-0.5">
            <button
              onClick={handleUndo}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-all ${
                canUndo
                  ? 'hover:bg-slate-200 text-slate-800 cursor-pointer active:scale-95'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title={canUndo ? "Hoàn tác (Ctrl+Z)" : "Không có thao tác để hoàn tác"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-all ${
                canRedo
                  ? 'hover:bg-slate-200 text-slate-800 cursor-pointer active:scale-95'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title={canRedo ? "Làm lại (Ctrl+Y / Ctrl+Shift+Z)" : "Không có thao tác để làm lại"}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Căn lề trang (Margin) trực tiếp trên chế độ soạn thảo */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5" title={`Lề trang: T:${effectiveMargin.top}mm, D:${effectiveMargin.bottom}mm, T:${effectiveMargin.left}mm, P:${effectiveMargin.right}mm`}>
            <Ruler className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={settings.pageMargin}
              onChange={(e) => handleMarginChange(e.target.value as PageMarginType)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="original">
                Lề gốc file Word {settings.originalMargins ? `(${settings.originalMargins.top}/${settings.originalMargins.bottom}/${settings.originalMargins.left}/${settings.originalMargins.right}mm)` : ''}
              </option>
              <option value="nd30">Nghị định 30 (20/20/30/15 mm)</option>
              <option value="normal">Tiêu chuẩn (25.4 mm)</option>
              <option value="narrow">Hẹp (12.7 mm)</option>
              <option value="moderate">Vừa phải (25.4/19.1 mm)</option>
              <option value="custom">Tùy chỉnh...</option>
            </select>
            {settings.pageMargin === 'custom' && (
              <button
                onClick={() => setIsMarginModalOpen(true)}
                className="p-0.5 text-slate-500 hover:text-blue-600 rounded"
                title="Chỉnh sửa thông số lề tùy chọn"
              >
                <Sliders className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Kiểu đoạn văn (Heading / Normal) */}
          <select
            onChange={(e) => execFormat('formatBlock', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            defaultValue="p"
          >
            <option value="p">Đoạn văn (Normal)</option>
            <option value="h1">Tiêu đề 1 (H1)</option>
            <option value="h2">Tiêu đề 2 (H2)</option>
            <option value="h3">Tiêu đề 3 (H3)</option>
          </select>

          {/* Cỡ chữ lựa chọn nhanh (Đầy đủ từ 8pt đến 36pt) */}
          <select
            onChange={(e) => {
              applyInlineStyle('font-size', e.target.value);
              onUpdateSettings?.({ fontSize: e.target.value });
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Cỡ chữ ({settings.fontSize})...</option>
            <option value="8pt">8 pt</option>
            <option value="9pt">9 pt</option>
            <option value="10pt">10 pt</option>
            <option value="11pt">11 pt</option>
            <option value="12pt">12 pt</option>
            <option value="13pt">13 pt (Chuẩn NĐ 30)</option>
            <option value="14pt">14 pt (Chuẩn NĐ 30)</option>
            <option value="15pt">15 pt</option>
            <option value="16pt">16 pt</option>
            <option value="18pt">18 pt (Tiêu đề lớn)</option>
            <option value="20pt">20 pt</option>
            <option value="22pt">22 pt</option>
            <option value="24pt">24 pt</option>
            <option value="28pt">28 pt</option>
            <option value="32pt">32 pt</option>
            <option value="36pt">36 pt</option>
          </select>

          {/* Giãn dòng */}
          <select
            onChange={(e) => applyInlineStyle('line-height', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            defaultValue=""
            title="Độ giãn dòng"
          >
            <option value="" disabled>Giãn dòng...</option>
            <option value="1.0">1.0 (Đơn)</option>
            <option value="1.15">1.15</option>
            <option value="1.25">1.25 (Gọn Word)</option>
            <option value="1.3">1.3 (NĐ 30)</option>
            <option value="1.4">1.4 (Chuẩn NĐ 30)</option>
            <option value="1.5">1.5</option>
            <option value="2.0">2.0 (Gấp đôi)</option>
          </select>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Định dạng phông chữ */}
          <button
            onClick={() => execFormat('bold')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 font-bold"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('italic')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 italic"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('underline')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 underline"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('strikeThrough')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800 line-through"
            title="Gạch ngang chữ"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('subscript')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800"
            title="Chỉ số dưới (X₂)"
          >
            <SubscriptIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('superscript')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-800"
            title="Chỉ số trên (X²)"
          >
            <SuperscriptIcon className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Màu chữ (Color picker) */}
          <div className="flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50" title="Màu chữ">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                applyInlineStyle('color', e.target.value);
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Chọn màu chữ"
            />
          </div>

          {/* Màu nền / Highlight */}
          <div className="flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50" title="Màu đánh dấu nền chữ">
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => {
                setHighlightColor(e.target.value);
                applyInlineStyle('background-color', e.target.value);
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Chọn màu nền chữ"
            />
          </div>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Căn lề */}
          <button
            onClick={() => execFormat('justifyLeft')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Canh trái"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('justifyCenter')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Canh giữa"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('justifyRight')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Canh phải"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('justifyFull')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Căn đều hai bên"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Danh sách & Thụt lề */}
          <button
            onClick={() => execFormat('insertUnorderedList')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('insertOrderedList')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Danh sách số thứ tự"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('outdent')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Giảm lề dòng"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('indent')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            title="Tăng lề dòng"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Khoảng cách Tab */}
          <button
            onClick={insertTabSpacer}
            onMouseDown={(e) => e.preventDefault()}
            className="px-2 py-1 rounded hover:bg-slate-100 text-slate-700 border border-slate-200 bg-slate-50 font-medium flex items-center gap-1"
            title="Chèn khoảng cách Tab giữa các đoạn (phím Tab)"
          >
            <span className="font-mono font-bold text-[11px]">Tab ⇥</span>
          </button>

          {/* Chèn Ký tự đặc biệt / Ô kiểm */}
          <div className="relative" ref={symbolsMenuRef}>
            <button
              onClick={() => setIsSymbolsOpen(!isSymbolsOpen)}
              onMouseDown={(e) => e.preventDefault()}
              className={`px-2 py-1 rounded hover:bg-slate-100 text-slate-700 border border-slate-200 bg-slate-50 font-medium flex items-center gap-1 transition-all ${
                isSymbolsOpen ? 'ring-2 ring-blue-400 bg-blue-50 text-blue-700' : ''
              }`}
              title="Chèn ký tự đặc biệt, dấu tích, ô vuông..."
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">Ký tự</span>
            </button>

            {isSymbolsOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-300 rounded-xl shadow-2xl p-2 w-56 max-w-[calc(100vw-2rem)] grid grid-cols-7 gap-1 animate-in fade-in zoom-in-95 duration-100">
                {SPECIAL_SYMBOLS.map(sym => (
                  <button
                    key={sym}
                    onClick={() => insertSymbol(sym)}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-blue-50 hover:text-blue-600 border border-slate-100 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* BỘ CÔNG CỤ BẢNG BIỂU (TABLE SUITE) */}
          <div className="relative" ref={tableMenuRef}>
            <button
              onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
              onMouseDown={(e) => e.preventDefault()}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                isTableMenuOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
              }`}
              title="Bộ công cụ cấu hình và sắp xếp nội dung bảng biểu đầy đủ"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Công cụ Bảng</span>
            </button>

            {isTableMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 w-84 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-200px)] min-h-[300px] overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-100 overscroll-contain">
                <div className="sticky -top-3.5 -mt-3.5 -mx-3.5 p-3.5 bg-white/95 backdrop-blur-xs border-b border-slate-200 flex items-center justify-between z-10 shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-blue-600" /> Cấu hình &amp; Định dạng Bảng
                  </span>
                  <button
                    onClick={() => setIsTableMenuOpen(false)}
                    className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors"
                    title="Đóng menu bảng"
                  >
                    ✕
                  </button>
                </div>

                {/* 1. Thêm bảng mới */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">Tạo bảng mới:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { insertTable(3, 3); setIsTableMenuOpen(false); }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200"
                    >
                      Bảng 3x3
                    </button>
                    <button
                      onClick={() => { insertTable(4, 5); setIsTableMenuOpen(false); }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200"
                    >
                      Bảng 4x5
                    </button>
                    <button
                      onClick={() => { setIsCustomTableModalOpen(true); setIsTableMenuOpen(false); }}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 ml-auto"
                    >
                      Tùy chọn...
                    </button>
                  </div>
                </div>

                {/* 2. Thao tác dòng (Row) */}
                <div className="border-t border-slate-100 pt-2.5">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                    <Rows className="w-3.5 h-3.5 text-slate-500" /> Thao tác dòng:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={handleInsertRowAbove}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                      title="Thêm 1 dòng nằm ngay phía trên ô đang chọn"
                    >
                      + Dòng trên
                    </button>
                    <button
                      onClick={handleInsertRowBelow}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                      title="Thêm 1 dòng nằm ngay phía dưới ô đang chọn"
                    >
                      + Dòng dưới
                    </button>
                    <button
                      onClick={handleDeleteRow}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200 text-center"
                      title="Xóa dòng đang chọn"
                    >
                      Xóa dòng
                    </button>
                  </div>
                </div>

                {/* 3. Thao tác cột (Column) */}
                <div className="border-t border-slate-100 pt-2.5">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                    <Columns className="w-3.5 h-3.5 text-slate-500" /> Thao tác cột:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={handleInsertColLeft}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                      title="Thêm 1 cột bên trái ô đang chọn"
                    >
                      + Cột trái
                    </button>
                    <button
                      onClick={handleInsertColRight}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                      title="Thêm 1 cột bên phải ô đang chọn"
                    >
                      + Cột phải
                    </button>
                    <button
                      onClick={handleDeleteCol}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200 text-center"
                      title="Xóa cột đang chọn"
                    >
                      Xóa cột
                    </button>
                  </div>
                </div>

                {/* 4. Căn lề ngang nội dung trong ô */}
                <div className="border-t border-slate-100 pt-2.5">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">Căn lề ngang ô hiện tại:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAlignCell('left')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                      title="Canh trái ô"
                    >
                      Trái
                    </button>
                    <button
                      onClick={() => handleAlignCell('center')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center font-bold"
                      title="Canh giữa ô"
                    >
                      Giữa
                    </button>
                    <button
                      onClick={() => handleAlignCell('right')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                      title="Canh phải ô"
                    >
                      Phải
                    </button>
                    <button
                      onClick={() => handleAlignCell('justify')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                      title="Đều 2 bên"
                    >
                      Đều
                    </button>
                  </div>
                </div>

                {/* 5. Căn lề dọc trong ô */}
                <div className="border-t border-slate-100 pt-2.5">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">Căn lề dọc ô:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleValignCell('top')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                      title="Căn đỉnh ô"
                    >
                      Đỉnh (Top)
                    </button>
                    <button
                      onClick={() => handleValignCell('middle')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center font-bold"
                      title="Căn giữa dọc"
                    >
                      Giữa (Middle)
                    </button>
                    <button
                      onClick={() => handleValignCell('bottom')}
                      className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                      title="Căn đáy ô"
                    >
                      Đáy (Bottom)
                    </button>
                  </div>
                </div>

                {/* 6. Màu nền ô & Viền bảng */}
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">Nền ô:</span>
                    <input
                      type="color"
                      value={cellBgColor}
                      onChange={(e) => handleCellBgColorChange(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-200 p-0"
                      title="Chọn màu nền ô đang chọn"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSetTableBorders('solid')}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-semibold border border-slate-200"
                      title="Viền nét liền chuẩn 1px"
                    >
                      Viền nét liền
                    </button>
                    <button
                      onClick={() => handleSetTableBorders('none')}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200"
                      title="Ẩn đường viền bảng"
                    >
                      Bỏ viền
                    </button>
                  </div>
                </div>

                {/* 7. Xóa toàn bộ bảng */}
                <div className="border-t border-slate-100 pt-2.5 flex justify-end">
                  <button
                    onClick={handleDeleteTable}
                    className="w-full justify-center px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200 inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa toàn bộ bảng này</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => execFormat('insertHorizontalRule')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1"
            title="Chèn đường kẻ ngang phân cách"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execFormat('removeFormat')}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-slate-100 text-rose-600"
            title="Xóa định dạng (Trở về mặc định)"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODAL TẠO BẢNG TÙY BIẾN KÍCH THƯỚC */}
      {isCustomTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-blue-600" />
              <span>Chèn bảng tùy biến kích thước</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số hàng (Rows):</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={customRows}
                  onChange={(e) => setCustomRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số cột (Cols):</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customCols}
                  onChange={(e) => setCustomCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCustomTableModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  insertTable(customRows, customCols);
                  setIsCustomTableModalOpen(false);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${
                  theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Tạo bảng ({customRows}x{customCols})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TÙY CHỈNH LỀ TRANG (CUSTOM MARGIN DIALOG) TRỰC TIẾP TRÊN SOẠN THẢO */}
      {isMarginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Tùy chỉnh lề trang (Millimeter - mm)</span>
              </h4>
              <button
                onClick={() => setIsMarginModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Trên (Top):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.top}
                    onChange={(e) => setTempMargins({ ...tempMargins, top: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Dưới (Bottom):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.bottom}
                    onChange={(e) => setTempMargins({ ...tempMargins, bottom: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Trái (Left):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.left}
                    onChange={(e) => setTempMargins({ ...tempMargins, left: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lề Phải (Right):</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tempMargins.right}
                    onChange={(e) => setTempMargins({ ...tempMargins, right: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-2 py-1.5 rounded-r-lg text-slate-500 font-medium">mm</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-[11px] text-blue-900">
              <span className="font-semibold">💡 Chuẩn Nghị định 30/2020/NĐ-CP:</span>
              <div className="text-blue-800 mt-0.5">
                Trên: 20-25mm · Dưới: 20-25mm · Trái: 30-35mm · Phải: 15-20mm
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsMarginModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCustomMargin}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${
                  theme ? theme.primaryBtn : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Lưu lề
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin font, lề & chế độ hiển thị */}
      <div className="bg-slate-100/70 px-4 py-2 text-xs text-slate-600 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Định dạng áp dụng:</span>
          {settings.preserveOriginalFormat ? (
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              Giữ format gốc của file Word
            </span>
          ) : (
            <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {selectedFont.name} · {settings.fontSize} · Dòng {settings.lineHeight}
            </span>
          )}

          {/* Huy hiệu thông số lề trang */}
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
            <Ruler className="w-3 h-3 text-blue-600" />
            <span>Lề trang: T:{effectiveMargin.top} / D:{effectiveMargin.bottom} / T:{effectiveMargin.left} / P:{effectiveMargin.right} mm</span>
          </span>
        </div>

        <div className="text-[11px]">
          {isPreviewMode ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-600" /> Đang xem trước dữ liệu thực tế (Các biến kế thừa đầy đủ định dạng văn bản khi in)
            </span>
          ) : (
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-blue-600" /> Chế độ soạn thảo (Bôi đen/Click văn bản để định dạng hoặc chèn biến, nhấn phím Tab để nhảy thụt dòng)
            </span>
          )}
        </div>
      </div>

      {/* Vùng hiển thị trang giấy A4 mô phỏng chuẩn in (Cuộn độc lập) */}
      <div className="p-4 sm:p-6 bg-slate-200/60 overflow-x-auto flex justify-center min-h-[700px]">
        <div
          id="printable-document"
          className="print-page bg-white shadow-xl rounded-sm transition-all relative"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: `${effectiveMargin.top}mm ${effectiveMargin.right}mm ${effectiveMargin.bottom}mm ${effectiveMargin.left}mm`,
            boxSizing: 'border-box'
          }}
          onContextMenu={handleContextMenu}
        >
          {/* Vùng soạn thảo / Preview có thể chỉnh sửa */}
          <div
            ref={editorRef}
            contentEditable={!isPreviewMode}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            onFocus={saveSelection}
            suppressContentEditableWarning
            className="document-content outline-none focus:ring-0 min-h-[800px]"
            style={{
              fontFamily: fontFamilyStyle,
              fontSize: fontSizeStyle,
              lineHeight: lineHeightStyle,
              color: '#111827'
            }}
          />
        </div>
      </div>

      {/* CONTEXT MENU CHUỘT PHẢI THÔNG MINH (BẢNG BIỂU & ĐỊNH DẠNG VĂN BẢN) */}
      {contextMenu.isOpen && !isPreviewMode && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3 w-80 sm:w-84 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-2rem)] overflow-y-auto space-y-2.5 animate-in fade-in zoom-in-95 duration-100 overscroll-contain select-none"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onMouseDown={(e) => {
            // Ngăn click vào vùng trống của context menu làm mất vùng chọn bôi đen của người dùng
            if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
              e.preventDefault();
            }
          }}
        >
          {/* Header Context Menu */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              {contextMenu.inTable ? (
                <>
                  <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Công cụ Bảng &amp; Soạn thảo</span>
                </>
              ) : contextMenu.hasSelection ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate max-w-[190px]">
                    Đoạn: "{contextMenu.selectedText.slice(0, 16)}..."
                  </span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Menu công cụ soạn thảo</span>
                </>
              )}
            </div>
            <button
              onClick={closeContextMenu}
              onMouseDown={(e) => e.preventDefault()}
              className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors"
              title="Đóng menu"
            >
              ✕
            </button>
          </div>

          {/* Mini Toolbar: Undo, Redo, Bold, Italic, Underline, Strikethrough, Color, Highlight, ClearFormat */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-1 flex-wrap">
            <button
              onClick={() => { handleUndo(); closeContextMenu(); }}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!canUndo}
              className={`p-1 rounded ${canUndo ? 'hover:bg-slate-200 text-slate-700 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
              title="Hoàn tác (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { handleRedo(); closeContextMenu(); }}
              onMouseDown={(e) => e.preventDefault()}
              disabled={!canRedo}
              className={`p-1 rounded ${canRedo ? 'hover:bg-slate-200 text-slate-700 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
              title="Làm lại (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-3.5 bg-slate-200 mx-0.5"></span>

            <button
              onClick={() => execContextFormat('bold')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 rounded hover:bg-slate-200 text-slate-800 font-bold"
              title="In đậm (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execContextFormat('italic')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 rounded hover:bg-slate-200 text-slate-800 italic"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execContextFormat('underline')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 rounded hover:bg-slate-200 text-slate-800 underline"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execContextFormat('strikeThrough')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 rounded hover:bg-slate-200 text-slate-800"
              title="Gạch ngang"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-3.5 bg-slate-200 mx-0.5"></span>

            <label className="flex items-center gap-0.5 p-1 rounded hover:bg-slate-200 cursor-pointer" title="Đổi màu chữ">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  applyContextInlineStyle('color', e.target.value);
                }}
                className="w-3.5 h-3.5 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </label>

            <label className="flex items-center gap-0.5 p-1 rounded hover:bg-slate-200 cursor-pointer" title="Màu nền chữ (Highlight)">
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  applyContextInlineStyle('background-color', e.target.value);
                }}
                className="w-3.5 h-3.5 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </label>

            <button
              onClick={() => execContextFormat('removeFormat')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 rounded hover:bg-rose-100 text-rose-600"
              title="Xóa định dạng"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chọn Font chữ & Cỡ chữ */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Font chữ:</span>
              <select
                onChange={(e) => applyContextInlineStyle('font-family', e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Chọn Font...</option>
                {VIETNAMESE_FONTS.map(f => (
                  <option key={f.id} value={f.family}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Cỡ chữ:</span>
              <select
                onChange={(e) => applyContextInlineStyle('font-size', e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Cỡ chữ...</option>
                <option value="9pt">9 pt</option>
                <option value="10pt">10 pt</option>
                <option value="11pt">11 pt</option>
                <option value="12pt">12 pt</option>
                <option value="13pt">13 pt (Chuẩn NĐ 30)</option>
                <option value="14pt">14 pt (Chuẩn NĐ 30)</option>
                <option value="15pt">15 pt</option>
                <option value="16pt">16 pt</option>
                <option value="18pt">18 pt</option>
                <option value="20pt">20 pt</option>
                <option value="24pt">24 pt</option>
                <option value="28pt">28 pt</option>
              </select>
            </div>
          </div>

          {/* Căn lề đoạn văn & Thụt lề / Tab */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Căn lề đoạn văn &amp; Tab:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => execContextFormat('justifyLeft')}
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-center border border-slate-200 flex items-center justify-center text-slate-700"
                title="Căn trái"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execContextFormat('justifyCenter')}
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-center border border-slate-200 flex items-center justify-center text-slate-700"
                title="Căn giữa"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execContextFormat('justifyRight')}
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-center border border-slate-200 flex items-center justify-center text-slate-700"
                title="Căn phải"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => execContextFormat('justifyFull')}
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-center border border-slate-200 flex items-center justify-center text-slate-700"
                title="Căn đều 2 bên"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={runContextTab}
                onMouseDown={(e) => e.preventDefault()}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-center border border-slate-200 font-mono text-[11px] font-bold text-slate-700"
                title="Chèn khoảng cách Tab thụt dòng"
              >
                Tab ⇥
              </button>
            </div>
          </div>

          {/* DANH SÁCH & THỤT LỀ */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => execContextFormat('insertUnorderedList')}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 py-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-1 text-[11px] text-slate-700"
              title="Danh sách dấu chấm"
            >
              <List className="w-3 h-3 text-slate-600" />
              <span>Dấu chấm</span>
            </button>
            <button
              onClick={() => execContextFormat('insertOrderedList')}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 py-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-1 text-[11px] text-slate-700"
              title="Danh sách số thứ tự"
            >
              <ListOrdered className="w-3 h-3 text-slate-600" />
              <span>Đánh số</span>
            </button>
            <button
              onClick={() => execContextFormat('outdent')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700"
              title="Giảm lề dòng"
            >
              <Outdent className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execContextFormat('indent')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700"
              title="Tăng lề dòng"
            >
              <Indent className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* NẾU CHUỘT PHẢI VÀO BẢNG (IN TABLE): CÔNG CỤ BẢNG TOÀN DIỆN */}
          {contextMenu.inTable && (
            <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                  <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Công cụ Bảng (Table Suite)
                </span>
                <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/80 px-1.5 py-0.2 rounded">
                  Ô đang trỏ
                </span>
              </div>

              {/* Thao tác dòng */}
              <div>
                <span className="text-[10px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                  <Rows className="w-3 h-3 text-slate-500" /> Thao tác dòng (Row):
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => runTableAction(handleInsertRowAbove)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-white hover:bg-slate-100 rounded text-[11px] font-medium border border-slate-200 text-center"
                    title="Thêm 1 dòng phía trên"
                  >
                    + Dòng trên
                  </button>
                  <button
                    onClick={() => runTableAction(handleInsertRowBelow)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-white hover:bg-slate-100 rounded text-[11px] font-medium border border-slate-200 text-center"
                    title="Thêm 1 dòng phía dưới"
                  >
                    + Dòng dưới
                  </button>
                  <button
                    onClick={() => runTableAction(handleDeleteRow)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200 text-center"
                    title="Xóa dòng hiện tại"
                  >
                    Xóa dòng
                  </button>
                </div>
              </div>

              {/* Thao tác cột */}
              <div>
                <span className="text-[10px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                  <Columns className="w-3 h-3 text-slate-500" /> Thao tác cột (Column):
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => runTableAction(handleInsertColLeft)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-white hover:bg-slate-100 rounded text-[11px] font-medium border border-slate-200 text-center"
                    title="Thêm 1 cột bên trái"
                  >
                    + Cột trái
                  </button>
                  <button
                    onClick={() => runTableAction(handleInsertColRight)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-white hover:bg-slate-100 rounded text-[11px] font-medium border border-slate-200 text-center"
                    title="Thêm 1 cột bên phải"
                  >
                    + Cột phải
                  </button>
                  <button
                    onClick={() => runTableAction(handleDeleteCol)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200 text-center"
                    title="Xóa cột hiện tại"
                  >
                    Xóa cột
                  </button>
                </div>
              </div>

              {/* Căn lề ô */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Căn ngang ô:</span>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => runTableAction(() => handleAlignCell('left'))} onMouseDown={(e) => e.preventDefault()} className="flex-1 p-0.5 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200">Trái</button>
                    <button onClick={() => runTableAction(() => handleAlignCell('center'))} onMouseDown={(e) => e.preventDefault()} className="flex-1 p-0.5 bg-white hover:bg-slate-100 rounded text-[10px] font-bold border border-slate-200">Giữa</button>
                    <button onClick={() => runTableAction(() => handleAlignCell('right'))} onMouseDown={(e) => e.preventDefault()} className="flex-1 p-0.5 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200">Phải</button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Căn dọc ô:</span>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => runTableAction(() => handleValignCell('top'))} onMouseDown={(e) => e.preventDefault()} className="flex-1 p-0.5 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200">Đỉnh</button>
                    <button onClick={() => runTableAction(() => handleValignCell('middle'))} onMouseDown={(e) => e.preventDefault()} className="flex-1 p-0.5 bg-white hover:bg-slate-100 rounded text-[10px] font-bold border border-slate-200">Giữa</button>
                    <button onClick={() => runTableAction(() => handleValignCell('bottom'))} onMouseDown={(e) => e.preventDefault()} className="flex-1 p-0.5 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200">Đáy</button>
                  </div>
                </div>
              </div>

              {/* Nền ô & Viền */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-indigo-100">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">Nền ô:</span>
                  <input
                    type="color"
                    value={cellBgColor}
                    onChange={(e) => {
                      setCellBgColor(e.target.value);
                      handleCellBgColorChange(e.target.value);
                    }}
                    className="w-5 h-5 rounded cursor-pointer border border-slate-200 p-0 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => runTableAction(() => handleSetTableBorders('solid'))}
                    onMouseDown={(e) => e.preventDefault()}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 rounded text-[10px] font-semibold border border-slate-200"
                  >
                    Viền liền
                  </button>
                  <button
                    onClick={() => runTableAction(() => handleSetTableBorders('none'))}
                    onMouseDown={(e) => e.preventDefault()}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200"
                  >
                    Bỏ viền
                  </button>
                </div>
              </div>

              {/* Xóa toàn bộ bảng */}
              <button
                onClick={() => runTableAction(handleDeleteTable)}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200 flex items-center justify-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa toàn bộ bảng</span>
              </button>
            </div>
          )}

          {/* Chèn Ký tự đặc biệt & Ô kiểm nhanh */}
          <div className="border-t border-slate-100 pt-1.5">
            <span className="text-[10px] font-semibold text-slate-500 block mb-1">Chèn nhanh ký tự &amp; ô kiểm:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {['✓', '✔', '☐', '☑', '★', '•', '→'].map(sym => (
                <button
                  key={sym}
                  onClick={() => runContextSymbol(sym)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-6 h-6 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 flex items-center justify-center text-xs font-semibold"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DocumentEditorPreview.displayName = 'DocumentEditorPreview';
