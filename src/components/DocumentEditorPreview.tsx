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
import { WordColorPicker } from './WordColorPicker';
import { WordBorderPicker, BorderPresetType, BorderCustomOptions } from './WordBorderPicker';
import { WordTableInsertPicker } from './WordTableInsertPicker';
import { WordImageModal } from './WordImageModal';
import { WordIconSymbolPicker } from './WordIconSymbolPicker';
import { Image as ImageIcon } from 'lucide-react';

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCustomTableModalOpen, setIsCustomTableModalOpen] = useState(false);
  const [customRows, setCustomRows] = useState(4);
  const [customCols, setCustomCols] = useState(4);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [tempMargins, setTempMargins] = useState<DocumentMargin>(
    settings.customMargins || { top: 20, bottom: 20, left: 30, right: 15 }
  );

  // Trạng thái Bảng biểu chuẩn Microsoft Word
  const [showGridlines, setShowGridlines] = useState(true);
  const [activeTableTab, setActiveTableTab] = useState<'borders' | 'rowsCols' | 'mergeAlign' | 'style'>('borders');

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
      if (property === 'backgroundColor' || property === 'background-color') {
        document.execCommand('hiliteColor', false, value === 'transparent' ? 'transparent' : value);
      }
      return;
    }

    const span = document.createElement('span');
    if ((property === 'backgroundColor' || property === 'background-color') && value === 'transparent') {
      span.style.backgroundColor = 'transparent';
    } else {
      span.style.setProperty(property, value);
    }
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
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
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

  const handleInsertImage = (imageHtml: string) => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    document.execCommand('insertHTML', false, imageHtml);
    if (editorRef.current && !isPreviewMode) {
      commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  const handleInsertHtml = (html: string) => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    document.execCommand('insertHTML', false, html);
    if (editorRef.current && !isPreviewMode) {
      commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  const handleInsertQuickTable = (type: 'info2' | 'list3' | 'sign4' | 'health5') => {
    let html = '';
    if (type === 'info2') {
      html = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1.5px solid #000;"><tbody><tr><td style="width: 30%; border: 1px solid #000; padding: 5px 8px; font-weight: bold; background: #f8fafc;">Tiêu chí</td><td style="width: 70%; border: 1px solid #000; padding: 5px 8px; font-weight: bold; background: #f8fafc;">Thông tin chi tiết</td></tr><tr><td style="border: 1px solid #000; padding: 5px 8px;">Họ và tên:</td><td style="border: 1px solid #000; padding: 5px 8px;">{{HoVaTen}}</td></tr><tr><td style="border: 1px solid #000; padding: 5px 8px;">Số điện thoại:</td><td style="border: 1px solid #000; padding: 5px 8px;">{{SoDienThoai}}</td></tr></tbody></table><p><br></p>';
    } else if (type === 'list3') {
      html = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1.5px solid #000;"><thead><tr><th style="width: 10%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">STT</th><th style="width: 60%; border: 1px solid #000; padding: 6px; text-align: left; background: #f8fafc;">Nội dung</th><th style="width: 30%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">Kết quả</th></tr></thead><tbody><tr><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">1</td><td style="border: 1px solid #000; padding: 5px 8px;">Nội dung 1</td><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">Đạt</td></tr></tbody></table><p><br></p>';
    } else if (type === 'sign4') {
      html = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1.5px solid #000;"><thead><tr><th style="width: 10%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">STT</th><th style="width: 40%; border: 1px solid #000; padding: 6px; text-align: left; background: #f8fafc;">Họ và tên</th><th style="width: 30%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">Chức vụ</th><th style="width: 20%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">Chữ ký</th></tr></thead><tbody><tr><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">1</td><td style="border: 1px solid #000; padding: 5px 8px;">{{HoVaTen}}</td><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">Nhân viên</td><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">&nbsp;</td></tr></tbody></table><p><br></p>';
    } else if (type === 'health5') {
      html = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1.5px solid #000;"><thead><tr><th style="width: 8%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">STT</th><th style="width: 25%; border: 1px solid #000; padding: 6px; text-align: left; background: #f8fafc;">Chuyên khoa</th><th style="width: 35%; border: 1px solid #000; padding: 6px; text-align: left; background: #f8fafc;">Nội dung khám</th><th style="width: 17%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">Kết luận</th><th style="width: 15%; border: 1px solid #000; padding: 6px; text-align: center; background: #f8fafc;">Bác sĩ</th></tr></thead><tbody><tr><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">1</td><td style="border: 1px solid #000; padding: 5px 8px;">Khám Thể lực</td><td style="border: 1px solid #000; padding: 5px 8px;">Chiều cao, cân nặng, BMI</td><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">Bình thường</td><td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">&nbsp;</td></tr></tbody></table><p><br></p>';
    }
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    document.execCommand('insertHTML', false, html);
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
      if (color === 'transparent') {
        found.cell.style.removeProperty('background-color');
        found.cell.style.backgroundColor = 'transparent';
      } else {
        found.cell.style.backgroundColor = color;
      }
      if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
    }
  };

  // === XỬ LÝ VIỀN BẢNG CHUẨN MICROSOFT WORD (BORDERS ENGINE) ===
  const handleApplyBorder = (type: BorderPresetType, options?: BorderCustomOptions) => {
    if (type === 'hr') {
      execFormat('insertHorizontalRule');
      return;
    }
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần thao tác viền.');
      return;
    }
    const { table, cell } = found;
    const borderStyle = options?.style || 'solid';
    const borderWidth = options?.width || '1px';
    const borderColor = options?.color || '#000000';
    const borderCss = `${borderWidth} ${borderStyle} ${borderColor}`;
    const applyTo = options?.applyTo || 'table';

    if (type === 'all') {
      table.style.border = borderCss;
      table.style.borderCollapse = 'collapse';
      table.querySelectorAll('td, th').forEach(c => {
        const el = c as HTMLElement;
        el.style.border = borderCss;
        el.style.borderTop = borderCss;
        el.style.borderBottom = borderCss;
        el.style.borderLeft = borderCss;
        el.style.borderRight = borderCss;
      });
    } else if (type === 'none') {
      table.style.border = 'none';
      table.style.borderCollapse = 'collapse';
      table.querySelectorAll('td, th').forEach(c => {
        const el = c as HTMLElement;
        el.style.border = 'none';
        el.style.borderTop = 'none';
        el.style.borderBottom = 'none';
        el.style.borderLeft = 'none';
        el.style.borderRight = 'none';
        el.style.backgroundImage = 'none';
      });
    } else if (type === 'outside') {
      table.style.border = borderCss;
      table.style.borderCollapse = 'collapse';
      const rows = Array.from(table.rows);
      const rowCount = rows.length;
      rows.forEach((r, rIdx) => {
        const cells = Array.from(r.cells);
        const cellCount = cells.length;
        cells.forEach((c, cIdx) => {
          const el = c as HTMLElement;
          el.style.border = 'none';
          el.style.borderTop = rIdx === 0 ? borderCss : 'none';
          el.style.borderBottom = rIdx === rowCount - 1 ? borderCss : 'none';
          el.style.borderLeft = cIdx === 0 ? borderCss : 'none';
          el.style.borderRight = cIdx === cellCount - 1 ? borderCss : 'none';
        });
      });
    } else if (type === 'inside') {
      table.style.border = 'none';
      table.style.borderCollapse = 'collapse';
      const rows = Array.from(table.rows);
      rows.forEach((r, rIdx) => {
        const cells = Array.from(r.cells);
        cells.forEach((c, cIdx) => {
          const el = c as HTMLElement;
          el.style.border = 'none';
          el.style.borderTop = rIdx > 0 ? borderCss : 'none';
          el.style.borderLeft = cIdx > 0 ? borderCss : 'none';
          el.style.borderBottom = 'none';
          el.style.borderRight = 'none';
        });
      });
    } else if (type === 'inside_h') {
      table.style.border = 'none';
      table.style.borderCollapse = 'collapse';
      const rows = Array.from(table.rows);
      rows.forEach((r, rIdx) => {
        const cells = Array.from(r.cells);
        cells.forEach(c => {
          const el = c as HTMLElement;
          el.style.border = 'none';
          el.style.borderTop = rIdx > 0 ? borderCss : 'none';
          el.style.borderBottom = 'none';
          el.style.borderLeft = 'none';
          el.style.borderRight = 'none';
        });
      });
    } else if (type === 'inside_v') {
      table.style.border = 'none';
      table.style.borderCollapse = 'collapse';
      const rows = Array.from(table.rows);
      rows.forEach(r => {
        const cells = Array.from(r.cells);
        cells.forEach((c, cIdx) => {
          const el = c as HTMLElement;
          el.style.border = 'none';
          el.style.borderLeft = cIdx > 0 ? borderCss : 'none';
          el.style.borderRight = 'none';
          el.style.borderTop = 'none';
          el.style.borderBottom = 'none';
        });
      });
    } else if (type === 'bottom') {
      if (cell && applyTo === 'cell') {
        const current = cell.style.borderBottom;
        cell.style.borderBottom = current && current !== 'none' ? 'none' : borderCss;
      } else {
        const lastRow = table.rows[table.rows.length - 1];
        if (lastRow) {
          Array.from(lastRow.cells).forEach(c => {
            (c as HTMLElement).style.borderBottom = borderCss;
          });
        }
      }
    } else if (type === 'top') {
      if (cell && applyTo === 'cell') {
        const current = cell.style.borderTop;
        cell.style.borderTop = current && current !== 'none' ? 'none' : borderCss;
      } else {
        const firstRow = table.rows[0];
        if (firstRow) {
          Array.from(firstRow.cells).forEach(c => {
            (c as HTMLElement).style.borderTop = borderCss;
          });
        }
      }
    } else if (type === 'left') {
      if (cell && applyTo === 'cell') {
        const current = cell.style.borderLeft;
        cell.style.borderLeft = current && current !== 'none' ? 'none' : borderCss;
      } else {
        Array.from(table.rows).forEach(r => {
          if (r.cells[0]) (r.cells[0] as HTMLElement).style.borderLeft = borderCss;
        });
      }
    } else if (type === 'right') {
      if (cell && applyTo === 'cell') {
        const current = cell.style.borderRight;
        cell.style.borderRight = current && current !== 'none' ? 'none' : borderCss;
      } else {
        Array.from(table.rows).forEach(r => {
          const lastCell = r.cells[r.cells.length - 1];
          if (lastCell) (lastCell as HTMLElement).style.borderRight = borderCss;
        });
      }
    } else if (type === 'diagonal_down') {
      if (cell) {
        if (cell.style.backgroundImage && cell.style.backgroundImage.includes('linear-gradient')) {
          cell.style.backgroundImage = 'none';
        } else {
          cell.style.backgroundImage = `linear-gradient(to bottom right, transparent calc(50% - 0.75px), ${borderColor}, transparent calc(50% + 0.75px))`;
        }
      }
    } else if (type === 'diagonal_up') {
      if (cell) {
        if (cell.style.backgroundImage && cell.style.backgroundImage.includes('linear-gradient')) {
          cell.style.backgroundImage = 'none';
        } else {
          cell.style.backgroundImage = `linear-gradient(to top right, transparent calc(50% - 0.75px), ${borderColor}, transparent calc(50% + 0.75px))`;
        }
      }
    }

    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleSetTableBorders = (type: 'solid' | 'dashed' | 'none') => {
    handleApplyBorder(type === 'none' ? 'none' : 'all', {
      style: type === 'dashed' ? 'dashed' : 'solid',
      width: '1px',
      color: '#000000',
      applyTo: 'table'
    });
  };

  // === CÁC THAO TÁC CẤU TRÚC VÀ BỐ CỤC BẢNG NÂNG CAO ===
  const handleMergeCellRight = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần gộp.');
      return;
    }
    const { cell, row } = found;
    const cellIdx = cell.cellIndex;
    if (cellIdx >= row.cells.length - 1) {
      alert('Không có ô liền kề bên phải để gộp.');
      return;
    }
    const nextCell = row.cells[cellIdx + 1];
    const currentColSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
    const nextColSpan = parseInt(nextCell.getAttribute('colspan') || '1', 10);
    const nextContent = nextCell.innerHTML.trim();
    if (nextContent && nextContent !== '<p>&nbsp;</p>' && nextContent !== '<p><br></p>' && nextContent !== '&nbsp;') {
      cell.innerHTML = cell.innerHTML.trim() + ' ' + nextContent;
    }
    cell.setAttribute('colspan', (currentColSpan + nextColSpan).toString());
    row.deleteCell(cellIdx + 1);
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleMergeCellDown = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần gộp.');
      return;
    }
    const { cell, row, table } = found;
    const rIdx = row.rowIndex;
    if (rIdx >= table.rows.length - 1) {
      alert('Không có ô nằm ở dòng phía dưới để gộp.');
      return;
    }
    const nextRow = table.rows[rIdx + 1];
    const cellIdx = cell.cellIndex;
    if (cellIdx >= nextRow.cells.length) {
      alert('Không tìm thấy ô tương ứng ở dòng dưới.');
      return;
    }
    const belowCell = nextRow.cells[cellIdx];
    const currentRowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
    const belowRowSpan = parseInt(belowCell.getAttribute('rowspan') || '1', 10);
    const belowContent = belowCell.innerHTML.trim();
    if (belowContent && belowContent !== '<p>&nbsp;</p>' && belowContent !== '<p><br></p>' && belowContent !== '&nbsp;') {
      cell.innerHTML = cell.innerHTML.trim() + '<br>' + belowContent;
    }
    cell.setAttribute('rowspan', (currentRowSpan + belowRowSpan).toString());
    nextRow.deleteCell(cellIdx);
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleSplitCell = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần tách.');
      return;
    }
    const { cell, row, table } = found;
    const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
    const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);

    if (colSpan > 1) {
      cell.setAttribute('colspan', (colSpan - 1).toString());
      if (colSpan - 1 === 1) cell.removeAttribute('colspan');
      const newCell = row.insertCell(cell.cellIndex + 1);
      newCell.style.border = cell.style.border || '1px solid #000';
      newCell.style.padding = cell.style.padding || '5px 8px';
      newCell.style.verticalAlign = cell.style.verticalAlign || 'middle';
      newCell.innerHTML = '<p>&nbsp;</p>';
    } else if (rowSpan > 1) {
      cell.setAttribute('rowspan', (rowSpan - 1).toString());
      if (rowSpan - 1 === 1) cell.removeAttribute('rowspan');
      const targetRow = table.rows[row.rowIndex + 1];
      if (targetRow) {
        const newCell = targetRow.insertCell(Math.min(cell.cellIndex, targetRow.cells.length));
        newCell.style.border = cell.style.border || '1px solid #000';
        newCell.style.padding = cell.style.padding || '5px 8px';
        newCell.style.verticalAlign = cell.style.verticalAlign || 'middle';
        newCell.innerHTML = '<p>&nbsp;</p>';
      }
    } else {
      const newCell = row.insertCell(cell.cellIndex + 1);
      newCell.style.border = cell.style.border || '1px solid #000';
      newCell.style.padding = cell.style.padding || '5px 8px';
      newCell.style.verticalAlign = cell.style.verticalAlign || 'middle';
      newCell.innerHTML = '<p>&nbsp;</p>';
    }
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleDistributeColumns = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần chia đều cột.');
      return;
    }
    const { table } = found;
    let maxCols = 0;
    Array.from(table.rows).forEach(r => {
      let count = 0;
      Array.from(r.cells).forEach(c => {
        count += parseInt(c.getAttribute('colspan') || '1', 10);
      });
      if (count > maxCols) maxCols = count;
    });
    if (maxCols === 0) return;
    const colPct = (100 / maxCols).toFixed(2) + '%';
    table.style.width = '100%';
    Array.from(table.rows).forEach(r => {
      Array.from(r.cells).forEach(c => {
        const span = parseInt(c.getAttribute('colspan') || '1', 10);
        (c as HTMLElement).style.width = (parseFloat(colPct) * span).toFixed(2) + '%';
      });
    });
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleAlignTable = (align: 'left' | 'center' | 'right') => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng cần căn lề.');
      return;
    }
    const { table } = found;
    if (align === 'left') {
      table.style.marginLeft = '0px';
      table.style.marginRight = 'auto';
    } else if (align === 'center') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = 'auto';
    } else if (align === 'right') {
      table.style.marginLeft = 'auto';
      table.style.marginRight = '0px';
    }
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleSetTableWidth = (width: '100%' | 'auto' | '90%' | '80%') => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng.');
      return;
    }
    found.table.style.width = width;
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleSetCellPadding = (padding: 'compact' | 'normal' | 'relaxed') => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng.');
      return;
    }
    const padVal = padding === 'compact' ? '2px 5px' : padding === 'relaxed' ? '9px 12px' : '5px 8px';
    found.table.querySelectorAll('td, th').forEach(c => {
      (c as HTMLElement).style.padding = padVal;
    });
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleToggleHeaderRow = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng.');
      return;
    }
    const firstRow = found.table.rows[0];
    if (!firstRow) return;
    const isHeader = firstRow.cells[0]?.tagName.toLowerCase() === 'th';
    const newRow = found.table.insertRow(0);
    Array.from(firstRow.cells).forEach(oldCell => {
      const tagName = isHeader ? 'td' : 'th';
      const newCell = document.createElement(tagName);
      newCell.innerHTML = oldCell.innerHTML;
      newCell.setAttribute('style', oldCell.getAttribute('style') || '');
      if (!isHeader) {
        newCell.style.backgroundColor = '#f1f5f9';
        newCell.style.fontWeight = 'bold';
        newCell.style.textAlign = 'center';
      } else {
        newCell.style.removeProperty('background-color');
        newCell.style.fontWeight = 'normal';
      }
      const colSpan = oldCell.getAttribute('colspan');
      if (colSpan) newCell.setAttribute('colspan', colSpan);
      const rowSpan = oldCell.getAttribute('rowspan');
      if (rowSpan) newCell.setAttribute('rowspan', rowSpan);
      newRow.appendChild(newCell);
    });
    firstRow.remove();
    if (editorRef.current) commitHtmlChange(editorRef.current.innerHTML, true);
  };

  const handleToggleZebraStriping = () => {
    const found = getClosestCellAndTable();
    if (!found) {
      alert('Vui lòng nhấp con trỏ chuột vào trong một ô của bảng.');
      return;
    }
    Array.from(found.table.rows).forEach((r, idx) => {
      if (idx === 0 && r.cells[0]?.tagName.toLowerCase() === 'th') return;
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      Array.from(r.cells).forEach(c => {
        (c as HTMLElement).style.backgroundColor = bg;
      });
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

          {/* Màu chữ (Font Color) phong cách Microsoft Word */}
          <WordColorPicker
            type="text"
            currentColor={textColor}
            onSelectColor={(c) => {
              setTextColor(c);
              applyInlineStyle('color', c);
            }}
            title="Màu chữ (Font Color)"
          />

          {/* Màu đánh dấu nền chữ (Highlight Color) phong cách Microsoft Word */}
          <WordColorPicker
            type="highlight"
            currentColor={highlightColor}
            onSelectColor={(c) => {
              setHighlightColor(c);
              applyInlineStyle('background-color', c);
            }}
            title="Màu đánh dấu nền chữ (Highlight Color)"
          />

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

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* === CỤM CÔNG CỤ CHÈN (INSERT SUITE - CHUẨN MICROSOFT WORD) === */}
          {/* 1. Chèn Bảng với Ma trận lưới ô vuông 8x10 & Bảng mẫu nhanh */}
          <WordTableInsertPicker
            onInsertTable={insertTable}
            onOpenCustomModal={() => setIsCustomTableModalOpen(true)}
            onInsertQuickTable={handleInsertQuickTable}
            dropdownAlign="left"
            title="Chèn Bảng (Insert Table) · Lưới ma trận trực quan & Mẫu nhanh"
          />

          {/* 2. Chèn Ảnh từ máy tính hoặc URL */}
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setIsImageModalOpen(true);
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="px-2 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            title="Chèn hình ảnh từ máy tính hoặc link URL (Insert Picture)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Chèn Ảnh</span>
          </button>

          {/* 3. Chèn Biểu tượng, Icon, Khung ghi chú */}
          <WordIconSymbolPicker
            onInsertSymbol={insertSymbol}
            onInsertHtml={handleInsertHtml}
            dropdownAlign="left"
            title="Chèn Biểu tượng, Icon, Ô kiểm & Khung ghi chú (Insert Icons & Symbols)"
          />

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Nút Viền bảng kiểu Microsoft Word trực tiếp trên Toolbar */}
          <WordBorderPicker
            onApplyBorder={handleApplyBorder}
            onToggleGridlines={() => setShowGridlines(prev => !prev)}
            showGridlines={showGridlines}
            title="Đường viền bảng (Borders - Microsoft Word)"
            dropdownAlign="left"
          />

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
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 w-88 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-200px)] min-h-[340px] overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-100 overscroll-contain">
                <div className="sticky -top-3.5 -mt-3.5 -mx-3.5 p-3 bg-white/95 backdrop-blur-xs border-b border-slate-200 flex items-center justify-between z-10 shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-blue-600" /> Cấu hình &amp; Tùy chỉnh Bảng biểu
                  </span>
                  <button
                    onClick={() => setIsTableMenuOpen(false)}
                    className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors"
                    title="Đóng menu bảng"
                  >
                    ✕
                  </button>
                </div>

                {/* Thanh điều hướng 4 Tab chuyên nghiệp */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTableTab('borders')}
                    className={`py-1 rounded-lg transition-all text-center ${
                      activeTableTab === 'borders' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đường viền
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTableTab('rowsCols')}
                    className={`py-1 rounded-lg transition-all text-center ${
                      activeTableTab === 'rowsCols' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dòng &amp; Cột
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTableTab('mergeAlign')}
                    className={`py-1 rounded-lg transition-all text-center ${
                      activeTableTab === 'mergeAlign' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Gộp &amp; Căn
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTableTab('style')}
                    className={`py-1 rounded-lg transition-all text-center ${
                      activeTableTab === 'style' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Định dạng
                  </button>
                </div>

                {/* NỘI DUNG TAB 1: ĐƯỜNG VIỀN CHUẨN WORD (BORDERS) */}
                {activeTableTab === 'borders' && (
                  <div className="space-y-2.5 animate-in fade-in duration-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Menu chọn viền Word:</span>
                      <WordBorderPicker
                        onApplyBorder={handleApplyBorder}
                        onToggleGridlines={() => setShowGridlines(prev => !prev)}
                        showGridlines={showGridlines}
                        title="Bảng chọn viền đầy đủ kiểu Word"
                        dropdownAlign="right"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">Gán viền nhanh:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('all')}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 text-slate-800 text-left flex items-center justify-between"
                        >
                          <span>Tất cả viền (All)</span>
                          <span className="text-[10px] text-slate-400">田</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('none')}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 text-left flex items-center justify-between"
                        >
                          <span>Bỏ viền (None)</span>
                          <span className="text-[10px] text-rose-400">✕</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('outside')}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 text-slate-800 text-left"
                        >
                          Chỉ viền ngoài
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('inside')}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 text-slate-800 text-left"
                        >
                          Chỉ viền trong
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('top')}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-slate-700"
                        >
                          Viền trên
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('bottom')}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-slate-700"
                        >
                          Viền dưới
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('inside_h')}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-slate-700"
                        >
                          Viền ngang trong (APA)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyBorder('inside_v')}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-slate-700"
                        >
                          Viền dọc trong
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">Đường lưới hỗ trợ (Gridlines):</span>
                      <button
                        type="button"
                        onClick={() => setShowGridlines(!showGridlines)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          showGridlines
                            ? 'bg-sky-50 text-sky-700 border-sky-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {showGridlines ? 'Đang bật lưới' : 'Đang tắt'}
                      </button>
                    </div>
                  </div>
                )}

                {/* NỘI DUNG TAB 2: DÒNG & CỘT (ROWS & COLS) */}
                {activeTableTab === 'rowsCols' && (
                  <div className="space-y-2.5 animate-in fade-in duration-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                        <Rows className="w-3.5 h-3.5 text-slate-500" /> Thao tác dòng:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={handleInsertRowAbove}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                        >
                          + Dòng trên
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertRowBelow}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                        >
                          + Dòng dưới
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteRow}
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200 text-center"
                        >
                          Xóa dòng
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                        <Columns className="w-3.5 h-3.5 text-slate-500" /> Thao tác cột:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={handleInsertColLeft}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                        >
                          + Cột trái
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertColRight}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                        >
                          + Cột phải
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteCol}
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200 text-center"
                        >
                          Xóa cột
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={handleDistributeColumns}
                        className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
                        title="Chia đều độ rộng tất cả các cột trong bảng"
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>Phân bố đều độ rộng các cột</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Tạo bảng mới:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => { insertTable(3, 3); setIsTableMenuOpen(false); }}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200"
                        >
                          3x3
                        </button>
                        <button
                          type="button"
                          onClick={() => { insertTable(4, 5); setIsTableMenuOpen(false); }}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200"
                        >
                          4x5
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsCustomTableModalOpen(true); setIsTableMenuOpen(false); }}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 ml-auto"
                        >
                          Tùy chọn...
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NỘI DUNG TAB 3: GỘP Ô & CĂN LỀ (MERGE & ALIGN) */}
                {activeTableTab === 'mergeAlign' && (
                  <div className="space-y-2.5 animate-in fade-in duration-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Gộp ô &amp; Tách ô:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={handleMergeCellRight}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                          title="Gộp ô hiện tại với ô liền kề bên phải"
                        >
                          Gộp sang phải
                        </button>
                        <button
                          type="button"
                          onClick={handleMergeCellDown}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                          title="Gộp ô hiện tại với ô ở dòng dưới"
                        >
                          Gộp xuống dưới
                        </button>
                        <button
                          type="button"
                          onClick={handleSplitCell}
                          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-semibold border border-blue-200 text-center"
                          title="Tách ô đã gộp trở lại hoặc chia đôi cột"
                        >
                          Tách ô
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Căn ngang nội dung ô:</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleAlignCell('left')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Trái</button>
                        <button type="button" onClick={() => handleAlignCell('center')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center font-bold">Giữa</button>
                        <button type="button" onClick={() => handleAlignCell('right')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Phải</button>
                        <button type="button" onClick={() => handleAlignCell('justify')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Đều</button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Căn dọc ô:</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleValignCell('top')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Đỉnh (Top)</button>
                        <button type="button" onClick={() => handleValignCell('middle')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center font-bold">Giữa (Middle)</button>
                        <button type="button" onClick={() => handleValignCell('bottom')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Đáy (Bottom)</button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Căn vị trí bảng trên trang A4:</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleAlignTable('left')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Bảng Trái</button>
                        <button type="button" onClick={() => handleAlignTable('center')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center font-bold">Bảng Giữa</button>
                        <button type="button" onClick={() => handleAlignTable('right')} className="flex-1 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center">Bảng Phải</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NỘI DUNG TAB 4: ĐỊNH DẠNG & PHONG CÁCH (STYLE) */}
                {activeTableTab === 'style' && (
                  <div className="space-y-2.5 animate-in fade-in duration-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">Màu nền ô (Cell Shading):</span>
                      <WordColorPicker
                        type="cell"
                        currentColor={cellBgColor}
                        onSelectColor={(c) => handleCellBgColorChange(c)}
                        title="Chọn màu nền ô bảng"
                        dropdownAlign="right"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Khoảng đệm ô (Cell Padding):</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetCellPadding('compact')}
                          className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                          title="Hẹp (2px 5px) - Tiết kiệm diện tích cho phiếu khám, biểu mẫu"
                        >
                          Hẹp (2px)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCellPadding('normal')}
                          className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-bold border border-slate-200 text-center"
                          title="Tiêu chuẩn (5px 8px)"
                        >
                          Chuẩn (5px)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCellPadding('relaxed')}
                          className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] border border-slate-200 text-center"
                          title="Rộng rãi (9px 12px)"
                        >
                          Rộng (9px)
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">Chiều rộng bảng:</span>
                      <div className="grid grid-cols-4 gap-1">
                        <button type="button" onClick={() => handleSetTableWidth('100%')} className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] font-bold border border-slate-200 text-center">100%</button>
                        <button type="button" onClick={() => handleSetTableWidth('auto')} className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] border border-slate-200 text-center">AutoFit</button>
                        <button type="button" onClick={() => handleSetTableWidth('90%')} className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] border border-slate-200 text-center">90%</button>
                        <button type="button" onClick={() => handleSetTableWidth('80%')} className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] border border-slate-200 text-center">80%</button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleToggleHeaderRow}
                        className="flex-1 py-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                        title="Chuyển dòng 1 thành dòng tiêu đề bảng (th)"
                      >
                        Dòng Tiêu đề (Header)
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleZebraStriping}
                        className="flex-1 py-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200 text-center"
                        title="Tô màu xen kẽ các hàng chẵn/lẻ"
                      >
                        Sọc xen kẽ (Zebra)
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                        type="button"
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

      {/* MODAL CHÈN ẢNH CHUẨN MICROSOFT WORD */}
      <WordImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />

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
            className={`document-content outline-none focus:ring-0 min-h-[800px] ${showGridlines ? 'show-table-gridlines' : ''}`}
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

            {/* Màu chữ kiểu Word */}
            <WordColorPicker
              type="text"
              currentColor={textColor}
              onSelectColor={(c) => {
                setTextColor(c);
                applyContextInlineStyle('color', c);
              }}
              title="Đổi màu chữ"
            />

            {/* Màu đánh dấu nền chữ kiểu Word */}
            <WordColorPicker
              type="highlight"
              currentColor={highlightColor}
              onSelectColor={(c) => {
                setHighlightColor(c);
                applyContextInlineStyle('background-color', c);
              }}
              title="Màu đánh dấu nền chữ"
            />

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

              {/* Gộp ô & Tách ô */}
              <div>
                <span className="text-[10px] font-semibold text-slate-600 block mb-1">Gộp &amp; Tách ô:</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => runTableAction(handleMergeCellRight)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-white hover:bg-slate-100 rounded text-[10px] font-medium border border-slate-200 text-center"
                    title="Gộp với ô liền kề bên phải"
                  >
                    Gộp phải
                  </button>
                  <button
                    onClick={() => runTableAction(handleMergeCellDown)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-white hover:bg-slate-100 rounded text-[10px] font-medium border border-slate-200 text-center"
                    title="Gộp với ô ở dòng dưới"
                  >
                    Gộp dưới
                  </button>
                  <button
                    onClick={() => runTableAction(handleSplitCell)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold border border-blue-200 text-center"
                    title="Tách ô đã gộp hoặc chia đôi cột"
                  >
                    Tách ô
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

              {/* Đường viền chuẩn Word & Màu nền ô */}
              <div className="pt-1 border-t border-indigo-100 flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">Nền:</span>
                  <WordColorPicker
                    type="cell"
                    currentColor={cellBgColor}
                    onSelectColor={(c) => {
                      setCellBgColor(c);
                      runTableAction(() => handleCellBgColorChange(c));
                    }}
                    title="Màu nền ô bảng"
                    dropdownAlign="left"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-600">Viền:</span>
                  <WordBorderPicker
                    onApplyBorder={(type, opts) => runTableAction(() => handleApplyBorder(type, opts))}
                    onToggleGridlines={() => setShowGridlines(!showGridlines)}
                    showGridlines={showGridlines}
                    title="Chọn đường viền bảng"
                    dropdownAlign="right"
                  />
                  <button
                    onClick={() => runTableAction(() => handleApplyBorder('all'))}
                    onMouseDown={(e) => e.preventDefault()}
                    className="px-1.5 py-0.5 bg-white hover:bg-slate-100 rounded text-[10px] font-semibold border border-slate-200"
                    title="Viền nét liền tất cả ô"
                  >
                    Viền tất cả
                  </button>
                  <button
                    onClick={() => runTableAction(() => handleApplyBorder('none'))}
                    onMouseDown={(e) => e.preventDefault()}
                    className="px-1.5 py-0.5 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200 text-rose-600"
                    title="Bỏ toàn bộ viền bảng"
                  >
                    Bỏ viền
                  </button>
                </div>
              </div>

              {/* Phân bố đều cột & Khoảng đệm ô */}
              <div className="flex items-center gap-1 pt-1 border-t border-indigo-100">
                <button
                  onClick={() => runTableAction(handleDistributeColumns)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex-1 py-0.5 px-1 bg-white hover:bg-slate-100 rounded text-[10px] font-medium border border-slate-200 text-center"
                  title="Chia đều chiều rộng tất cả cột"
                >
                  Chia đều cột
                </button>
                <button
                  onClick={() => runTableAction(() => handleSetCellPadding('compact'))}
                  onMouseDown={(e) => e.preventDefault()}
                  className="py-0.5 px-1 bg-white hover:bg-slate-100 rounded text-[10px] border border-slate-200 text-center"
                  title="Khoảng đệm ô siêu hẹp 2px"
                >
                  Đệm hẹp 2px
                </button>
                <button
                  onClick={() => runTableAction(() => handleSetCellPadding('normal'))}
                  onMouseDown={(e) => e.preventDefault()}
                  className="py-0.5 px-1 bg-white hover:bg-slate-100 rounded text-[10px] font-bold border border-slate-200 text-center"
                  title="Khoảng đệm ô tiêu chuẩn 5px"
                >
                  Đệm chuẩn 5px
                </button>
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

          {/* CHÈN ĐỐI TƯỢNG NHANH TỪ MENU CHUỘT PHẢI (INSERT SUITE) */}
          <div className="border-t border-slate-100 pt-1.5 space-y-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  setIsImageModalOpen(true);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 py-1 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 flex items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                title="Chèn ảnh từ máy tính hoặc liên kết URL"
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Chèn Ảnh...</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertTable(3, 3);
                  closeContextMenu();
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 flex items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                title="Tạo nhanh bảng 3 hàng x 3 cột"
              >
                <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Bảng (3x3)</span>
              </button>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-500 block mb-1">Chèn nhanh ký tự &amp; ô kiểm:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {['✓', '✔', '☐', '☑', '➔', '📞', '✉️', '₫', '⭐', '•', '📌', '💡'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => runContextSymbol(sym)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-6 h-6 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 flex items-center justify-center text-xs font-semibold"
                    title={`Chèn "${sym}"`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DocumentEditorPreview.displayName = 'DocumentEditorPreview';
