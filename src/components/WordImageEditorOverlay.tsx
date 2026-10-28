import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  RotateCw,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  X,
  Check,
  Sparkles,
  Sliders,
  Crop,
  Layers,
  Square,
  Circle,
  Eye,
  EyeOff
} from 'lucide-react';
import { ThemeGradient } from '../lib/theme';

export type TextWrappingType =
  | 'inline'
  | 'square-left'
  | 'square-right'
  | 'tight'
  | 'through'
  | 'top-bottom'
  | 'behind'
  | 'in-front';

export interface WordImageEditorOverlayProps {
  image: HTMLImageElement | null;
  editorElement: HTMLDivElement | null;
  onUpdate: () => void;
  onDelete: () => void;
  onDeselect: () => void;
  onReplaceImage: (newSrc: string) => void;
  theme?: ThemeGradient;
}

export const WordImageEditorOverlay: React.FC<WordImageEditorOverlayProps> = ({
  image,
  editorElement,
  onUpdate,
  onDelete,
  onDeselect,
  onReplaceImage,
  theme
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isLayoutOptionsOpen, setIsLayoutOptionsOpen] = useState(false);
  const [currentWrapping, setCurrentWrapping] = useState<TextWrappingType>('inline');
  const [currentAlign, setCurrentAlign] = useState<'left' | 'center' | 'right'>('center');
  const [currentBorder, setCurrentBorder] = useState<'none' | 'thin' | 'medium' | 'shadow'>('none');
  const [currentRadius, setCurrentRadius] = useState<'0px' | '4px' | '8px' | '16px' | '50%'>('0px');
  const [currentOpacity, setCurrentOpacity] = useState<number>(1);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const [customPxInput, setCustomPxInput] = useState<string>('');
  const [showCustomPxModal, setShowCustomPxModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeHandleRef = useRef<string | null>(null);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
  } | null>(null);

  // Nhận diện style hiện tại của ảnh khi được chọn
  useEffect(() => {
    if (!image) {
      setRect(null);
      setIsLayoutOptionsOpen(false);
      return;
    }

    const updateRect = () => {
      if (image && image.isConnected) {
        setRect(image.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updateRect();

    // Phân tích wrapping hiện tại từ style của ảnh
    const style = image.style;
    const parent = image.parentElement;
    const floatVal = style.float || '';
    const displayVal = style.display || '';
    const zIndexVal = style.zIndex || '';
    const opacityVal = parseFloat(style.opacity || '1');
    const parentAlign = parent?.style.textAlign || '';

    if (zIndexVal === '-1' || (zIndexVal === '0' && opacityVal < 0.8)) {
      setCurrentWrapping('behind');
    } else if (parseInt(zIndexVal, 10) >= 10) {
      setCurrentWrapping('in-front');
    } else if (displayVal === 'block' || style.clear === 'both') {
      setCurrentWrapping('top-bottom');
    } else if (floatVal === 'left') {
      setCurrentWrapping('square-left');
    } else if (floatVal === 'right') {
      setCurrentWrapping('square-right');
    } else {
      setCurrentWrapping('inline');
    }

    if (floatVal === 'left' || parentAlign === 'left') {
      setCurrentAlign('left');
    } else if (floatVal === 'right' || parentAlign === 'right') {
      setCurrentAlign('right');
    } else {
      setCurrentAlign('center');
    }

    // Border
    if (style.boxShadow && style.boxShadow.includes('rgba')) {
      setCurrentBorder('shadow');
    } else if (style.border && style.border.includes('2px')) {
      setCurrentBorder('medium');
    } else if (style.border && (style.border.includes('1px') || style.border.includes('1.5px'))) {
      setCurrentBorder('thin');
    } else {
      setCurrentBorder('none');
    }

    // Radius
    const rad = style.borderRadius || '0px';
    if (rad === '50%') setCurrentRadius('50%');
    else if (rad === '16px') setCurrentRadius('16px');
    else if (rad === '8px') setCurrentRadius('8px');
    else if (rad === '4px') setCurrentRadius('4px');
    else setCurrentRadius('0px');

    setCurrentOpacity(opacityVal);

    // Rotation
    const transform = style.transform || '';
    const matchRot = transform.match(/rotate\((-?\d+)deg\)/);
    if (matchRot) {
      setCurrentRotation(parseInt(matchRot[1], 10));
    } else {
      setCurrentRotation(0);
    }

    // Lắng nghe scroll và resize để bám sát ảnh
    const handleScrollOrResize = () => {
      updateRect();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [image]);

  if (!image || !rect) return null;

  // === XỬ LÝ KÉO CO GIÃN ẢNH (DRAG TO RESIZE) ===
  const startResize = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!image) return;

    resizeHandleRef.current = handle;
    const startWidth = image.offsetWidth;
    const startHeight = image.offsetHeight;
    const aspectRatio = startWidth / (startHeight || 1);

    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth,
      startHeight,
      aspectRatio
    };

    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current || !image) return;

      const { startX, startY, startWidth, aspectRatio } = resizeStartRef.current;
      const h = resizeHandleRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;

      if (h === 'se') {
        newWidth = Math.max(40, startWidth + deltaX);
      } else if (h === 'sw') {
        newWidth = Math.max(40, startWidth - deltaX);
      } else if (h === 'ne') {
        newWidth = Math.max(40, startWidth + deltaX);
      } else if (h === 'nw') {
        newWidth = Math.max(40, startWidth - deltaX);
      } else if (h === 'e') {
        newWidth = Math.max(40, startWidth + deltaX);
      } else if (h === 'w') {
        newWidth = Math.max(40, startWidth - deltaX);
      } else if (h === 's') {
        newWidth = Math.max(40, (image.offsetHeight + deltaY) * aspectRatio);
      } else if (h === 'n') {
        newWidth = Math.max(40, (image.offsetHeight - deltaY) * aspectRatio);
      }

      // Giới hạn không vượt quá chiều rộng container (tối đa ~800px)
      newWidth = Math.min(newWidth, 1200);

      image.style.width = `${Math.round(newWidth)}px`;
      image.style.height = 'auto';

      setRect(image.getBoundingClientRect());
    };

    const onMouseUp = () => {
      setIsResizing(false);
      resizeHandleRef.current = null;
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onUpdate();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // === ÁP DỤNG BỐ CỤC VĂN BẢN (LAYOUT OPTIONS) CHUẨN MICROSOFT WORD ===
  const applyWrapping = (type: TextWrappingType) => {
    if (!image) return;

    setCurrentWrapping(type);

    // Reset các style can thiệp
    image.style.float = 'none';
    image.style.display = 'inline-block';
    image.style.clear = 'none';
    image.style.position = 'static';
    image.style.zIndex = 'auto';
    image.style.margin = '4px';

    if (type === 'inline') {
      image.style.display = 'inline-block';
      image.style.verticalAlign = 'middle';
      image.style.margin = '4px 8px';
    } else if (type === 'square-left') {
      image.style.float = 'left';
      image.style.margin = '6px 16px 8px 0';
      image.style.display = 'inline-block';
    } else if (type === 'square-right') {
      image.style.float = 'right';
      image.style.margin = '6px 0 8px 16px';
      image.style.display = 'inline-block';
    } else if (type === 'tight') {
      image.style.float = 'left';
      image.style.margin = '4px 10px 4px 0';
      image.style.display = 'inline-block';
    } else if (type === 'through') {
      image.style.float = 'left';
      image.style.margin = '2px 8px 2px 0';
      image.style.display = 'inline-block';
    } else if (type === 'top-bottom') {
      image.style.display = 'block';
      image.style.margin = '14px auto';
      image.style.clear = 'both';
      image.style.float = 'none';
    } else if (type === 'behind') {
      image.style.position = 'relative';
      image.style.zIndex = '0';
      image.style.opacity = '0.35';
      image.style.display = 'inline-block';
      image.style.margin = '6px';
      setCurrentOpacity(0.35);
    } else if (type === 'in-front') {
      image.style.position = 'relative';
      image.style.zIndex = '20';
      image.style.opacity = '1';
      image.style.display = 'inline-block';
      image.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)';
      image.style.margin = '6px';
      setCurrentOpacity(1);
    }

    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === ĐỔI KÍCH CỠ NHANH ===
  const applyWidthPreset = (widthVal: string) => {
    if (!image) return;
    image.style.width = widthVal;
    image.style.height = 'auto';
    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === CĂN LỀ ẢNH ===
  const applyAlign = (align: 'left' | 'center' | 'right') => {
    if (!image) return;
    setCurrentAlign(align);

    const parent = image.parentElement;
    if (parent && parent !== editorElement && (parent.tagName === 'DIV' || parent.tagName === 'P')) {
      parent.style.textAlign = align;
    }

    if (align === 'left') {
      image.style.marginLeft = '0';
      image.style.marginRight = 'auto';
    } else if (align === 'right') {
      image.style.marginLeft = 'auto';
      image.style.marginRight = '0';
    } else {
      image.style.marginLeft = 'auto';
      image.style.marginRight = 'auto';
    }

    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === BO GÓC ===
  const applyRadius = (radiusVal: '0px' | '4px' | '8px' | '16px' | '50%') => {
    if (!image) return;
    setCurrentRadius(radiusVal);
    image.style.borderRadius = radiusVal;
    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === ĐƯỜNG VIỀN & ĐỔ BÓNG ===
  const applyBorder = (borderVal: 'none' | 'thin' | 'medium' | 'shadow') => {
    if (!image) return;
    setCurrentBorder(borderVal);

    if (borderVal === 'none') {
      image.style.border = 'none';
      image.style.boxShadow = 'none';
    } else if (borderVal === 'thin') {
      image.style.border = '1px solid #94a3b8';
      image.style.boxShadow = 'none';
    } else if (borderVal === 'medium') {
      image.style.border = '2px solid #334155';
      image.style.boxShadow = 'none';
    } else if (borderVal === 'shadow') {
      image.style.border = '1px solid #cbd5e1';
      image.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)';
    }

    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === XOAY 90 ĐỘ ===
  const rotateImage = () => {
    if (!image) return;
    const newRot = (currentRotation + 90) % 360;
    setCurrentRotation(newRot);
    image.style.transform = newRot === 0 ? '' : `rotate(${newRot}deg)`;
    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === LẬT ẢNH NGANG ===
  const flipImageHorizontal = () => {
    if (!image) return;
    const isFlipped = image.style.transform.includes('scaleX(-1)');
    if (isFlipped) {
      image.style.transform = image.style.transform.replace('scaleX(-1)', '').trim();
    } else {
      image.style.transform = `${image.style.transform} scaleX(-1)`.trim();
    }
    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === ĐỘ TRONG SUỐT (OPACITY) ===
  const toggleOpacity = () => {
    if (!image) return;
    const nextOpacity = currentOpacity === 1 ? 0.4 : currentOpacity === 0.4 ? 0.7 : 1;
    setCurrentOpacity(nextOpacity);
    image.style.opacity = `${nextOpacity}`;
    setRect(image.getBoundingClientRect());
    onUpdate();
  };

  // === THAY ĐỔI ẢNH (REPLACE) ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onReplaceImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Tọa độ định vị
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    zIndex: 9990
  };

  return (
    <>
      {/* 1. KHUNG CHỌN ẢNH VÀ 8 NÚT RESIZE HANDLES CHUẨN WORD */}
      <div style={overlayStyle} className="select-none">
        {/* Viền bao quanh ảnh (Selection Border) */}
        <div className="absolute inset-0 border-2 border-blue-600/90 rounded-xs shadow-sm ring-1 ring-blue-300/60 pointer-events-none" />

        {/* Chốt xoay trên đỉnh (Rotate Handle) */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing group"
          onClick={rotateImage}
          title="Nhấp để xoay ảnh 90° (chuẩn Microsoft Word)"
        >
          <div className="w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition-transform active:rotate-45">
            <RotateCw className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <div className="w-0.5 h-2 bg-blue-600" />
        </div>

        {/* Nút icon Layout Options chuẩn Microsoft Word ở góc trên bên phải */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLayoutOptionsOpen(!isLayoutOptionsOpen);
          }}
          className={`absolute -top-3 -right-8 w-6.5 h-6.5 rounded-sm bg-white border border-slate-300 shadow-md flex items-center justify-center pointer-events-auto transition-all ${
            isLayoutOptionsOpen
              ? 'ring-2 ring-blue-500 bg-blue-50 text-blue-600 border-blue-400'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
          title="Tùy chọn bố cục văn bản (Layout Options - Microsoft Word)"
        >
          {/* Biểu tượng Layout Options chuẩn Word (vòm cung văn bản) */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="#94a3b8" strokeDasharray="2 2" />
            <path d="M7 8h10M7 16h10" stroke="#334155" strokeLinecap="round" />
            <path d="M8 12a4 4 0 0 1 8 0" stroke="#2563eb" strokeWidth="2.5" fill="#dbeafe" />
          </svg>
        </button>

        {/* 8 Nút mốc co giãn (Resize Handles) */}
        {/* Góc Tây Bắc (NW) */}
        <div
          onMouseDown={(e) => startResize(e, 'nw')}
          className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-700 hover:border-blue-600 shadow-xs cursor-nwse-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn góc trên trái"
        />
        {/* Cạnh Bắc (N) */}
        <div
          onMouseDown={(e) => startResize(e, 'n')}
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-xs bg-white border border-slate-700 hover:border-blue-600 shadow-xs cursor-ns-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn cạnh trên"
        />
        {/* Góc Đông Bắc (NE) */}
        <div
          onMouseDown={(e) => startResize(e, 'ne')}
          className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-700 hover:border-blue-600 shadow-xs cursor-nesw-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn góc trên phải"
        />
        {/* Cạnh Đông (E) */}
        <div
          onMouseDown={(e) => startResize(e, 'e')}
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-xs bg-white border border-slate-700 hover:border-blue-600 shadow-xs cursor-ew-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn cạnh phải"
        />
        {/* Góc Đông Nam (SE) */}
        <div
          onMouseDown={(e) => startResize(e, 'se')}
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-700 hover:border-blue-600 shadow-xs cursor-nwse-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn góc dưới phải"
        />
        {/* Cạnh Nam (S) */}
        <div
          onMouseDown={(e) => startResize(e, 's')}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-xs bg-white border border-slate-700 hover:border-blue-600 shadow-xs cursor-ns-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn cạnh dưới"
        />
        {/* Góc Tây Nam (SW) */}
        <div
          onMouseDown={(e) => startResize(e, 'sw')}
          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-700 hover:border-blue-600 shadow-xs cursor-nesw-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn góc dưới trái"
        />
        {/* Cạnh Tây (W) */}
        <div
          onMouseDown={(e) => startResize(e, 'w')}
          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-xs bg-white border border-slate-700 hover:border-blue-600 shadow-xs cursor-ew-resize pointer-events-auto transition-transform hover:scale-125"
          title="Co giãn cạnh trái"
        />
      </div>

      {/* 2. THANH CÔNG CỤ NHANH NỔI (FLOATING TOOLBAR) */}
      <div
        style={{
          position: 'fixed',
          top: `${Math.max(10, rect.top - 46)}px`,
          left: `${Math.max(10, Math.min(window.innerWidth - 380, rect.left))}px`,
          zIndex: 9992
        }}
        className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl shadow-2xl p-1 flex items-center gap-1 select-none animate-in fade-in zoom-in-95 duration-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Kích thước cài sẵn */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1">
          <button
            type="button"
            onClick={() => applyWidthPreset('150px')}
            className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            title="Cỡ nhỏ (150px)"
          >
            150px
          </button>
          <button
            type="button"
            onClick={() => applyWidthPreset('300px')}
            className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            title="Cỡ vừa (300px)"
          >
            300px
          </button>
          <button
            type="button"
            onClick={() => applyWidthPreset('500px')}
            className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            title="Cỡ lớn (500px)"
          >
            500px
          </button>
          <button
            type="button"
            onClick={() => applyWidthPreset('100%')}
            className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            title="100% chiều ngang trang"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomPxInput(`${Math.round(image.offsetWidth)}`);
              setShowCustomPxModal(true);
            }}
            className="px-1 py-0.5 rounded text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200"
            title="Nhập kích thước pixel tùy ý"
          >
            {Math.round(image.offsetWidth)}px ✎
          </button>
        </div>

        {/* Căn lề ảnh */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1">
          <button
            type="button"
            onClick={() => applyAlign('left')}
            className={`p-1 rounded ${currentAlign === 'left' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Căn trái ảnh"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyAlign('center')}
            className={`p-1 rounded ${currentAlign === 'center' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Căn giữa ảnh"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyAlign('right')}
            className={`p-1 rounded ${currentAlign === 'right' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Căn phải ảnh"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bo góc & Viền */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1">
          <button
            type="button"
            onClick={() => {
              const nextRad =
                currentRadius === '0px'
                  ? '4px'
                  : currentRadius === '4px'
                  ? '8px'
                  : currentRadius === '8px'
                  ? '16px'
                  : currentRadius === '16px'
                  ? '50%'
                  : '0px';
              applyRadius(nextRad);
            }}
            className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1"
            title={`Bo góc hiện tại: ${currentRadius} (Nhấp để chuyển đổi)`}
          >
            <Circle className="w-3 h-3 text-slate-500" />
            <span>{currentRadius}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextBorder =
                currentBorder === 'none'
                  ? 'thin'
                  : currentBorder === 'thin'
                  ? 'medium'
                  : currentBorder === 'medium'
                  ? 'shadow'
                  : 'none';
              applyBorder(nextBorder);
            }}
            className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1"
            title={`Viền: ${currentBorder} (Nhấp để đổi)`}
          >
            <Square className="w-3 h-3 text-slate-500" />
            <span>{currentBorder === 'none' ? 'K.viền' : currentBorder === 'shadow' ? 'Bóng' : 'Viền'}</span>
          </button>
        </div>

        {/* Xoay / Lật / Mờ */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1">
          <button
            type="button"
            onClick={rotateImage}
            className="p-1 rounded text-slate-600 hover:bg-slate-100"
            title="Xoay 90 độ"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleOpacity}
            className="p-1 rounded text-slate-600 hover:bg-slate-100"
            title={`Độ mờ / Watermark (Hiện tại: ${Math.round(currentOpacity * 100)}%)`}
          >
            {currentOpacity < 1 ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Thay ảnh & Xóa */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded text-blue-600 hover:bg-blue-50"
            title="Đổi hình ảnh khác từ máy tính"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded text-rose-600 hover:bg-rose-50"
            title="Xóa hình ảnh này (phím Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onDeselect}
            className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Bỏ chọn ảnh (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. MENU LAYOUT OPTIONS CHUẨN MICROSOFT WORD (GIỐNG ẢNH USER GỬI) */}
      {isLayoutOptionsOpen && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.min(window.innerHeight - 380, Math.max(10, rect.top))}px`,
            left: `${Math.min(window.innerWidth - 250, rect.right + 12)}px`,
            zIndex: 9995
          }}
          className="bg-white border border-slate-300 rounded-lg shadow-2xl p-3 w-56 select-none animate-in fade-in zoom-in-95 duration-100 text-slate-800"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header Layout Options */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">Layout Options</span>
            <button
              type="button"
              onClick={() => setIsLayoutOptionsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold w-5 h-5 rounded flex items-center justify-center hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nhóm 1: In Line with Text */}
          <div className="space-y-1 mb-3">
            <span className="text-[11px] font-semibold text-slate-700 block">In Line with Text</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyWrapping('inline')}
                className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'inline'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="In Line with Text · Nằm cùng dòng với văn bản"
              >
                {/* SVG Biểu tượng In Line chuẩn Word */}
                <svg className="w-9 h-7" viewBox="0 0 36 28" fill="none">
                  <line x1="2" y1="4" x2="34" y2="4" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                  <rect x="2" y="9" width="16" height="10" rx="1" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                  <path d="M5 16a3 3 0 0 1 6 0" stroke="#0369a1" strokeWidth="1.5" fill="#bae6fd" />
                  <line x1="22" y1="14" x2="34" y2="14" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                  <line x1="2" y1="24" x2="34" y2="24" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[9px] text-slate-500 font-medium mt-0.5">Cùng dòng</span>
              </button>
            </div>
          </div>

          {/* Nhóm 2: With Text Wrapping */}
          <div className="space-y-1.5 mb-3">
            <span className="text-[11px] font-semibold text-slate-700 block">With Text Wrapping</span>
            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. Square Left (Vuông bên trái) */}
              <button
                type="button"
                onClick={() => applyWrapping('square-left')}
                className={`p-1.5 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'square-left'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="Square · Bao quanh vuông (Ảnh bên trái)"
              >
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="1" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  <path d="M4 11a2.5 2.5 0 0 1 5 0" stroke="#0369a1" strokeWidth="1.2" fill="#bae6fd" />
                  <line x1="17" y1="5" x2="30" y2="5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="17" y1="9" x2="30" y2="9" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="17" y1="13" x2="30" y2="13" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="18" x2="30" y2="18" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="22" x2="30" y2="22" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8.5px] text-slate-600 font-medium">Bao trái</span>
              </button>

              {/* 2. Square Right (Vuông bên phải) */}
              <button
                type="button"
                onClick={() => applyWrapping('square-right')}
                className={`p-1.5 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'square-right'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="Square · Bao quanh vuông (Ảnh bên phải)"
              >
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                  <rect x="18" y="3" width="12" height="11" rx="1" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  <path d="M20 11a2.5 2.5 0 0 1 5 0" stroke="#0369a1" strokeWidth="1.2" fill="#bae6fd" />
                  <line x1="2" y1="5" x2="15" y2="5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="9" x2="15" y2="9" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="13" x2="15" y2="13" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="18" x2="30" y2="18" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="22" x2="30" y2="22" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8.5px] text-slate-600 font-medium">Bao phải</span>
              </button>

              {/* 3. Top and Bottom (Trên và Dưới) */}
              <button
                type="button"
                onClick={() => applyWrapping('top-bottom')}
                className={`p-1.5 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'top-bottom'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="Top and Bottom · Ngắt dòng, văn bản trên và dưới"
              >
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                  <line x1="2" y1="3" x2="30" y2="3" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="9" y="7" width="14" height="10" rx="1" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  <path d="M12 14a2.5 2.5 0 0 1 5 0" stroke="#0369a1" strokeWidth="1.2" fill="#bae6fd" />
                  <line x1="2" y1="21" x2="30" y2="21" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8.5px] text-slate-600 font-medium">Trên-Dưới</span>
              </button>

              {/* 4. Behind Text (Chìm dưới văn bản / Watermark) */}
              <button
                type="button"
                onClick={() => applyWrapping('behind')}
                className={`p-1.5 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'behind'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="Behind Text · Nằm chìm dưới chữ (Watermark mờ)"
              >
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                  <rect x="9" y="5" width="14" height="14" rx="1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1 1" opacity="0.6" />
                  <line x1="2" y1="6" x2="30" y2="6" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="12" x2="30" y2="12" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="18" x2="30" y2="18" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8.5px] text-slate-600 font-medium">Dưới chữ</span>
              </button>

              {/* 5. In Front of Text (Đè lên trên văn bản) */}
              <button
                type="button"
                onClick={() => applyWrapping('in-front')}
                className={`p-1.5 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'in-front'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="In Front of Text · Nằm đè lên trên chữ"
              >
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                  <line x1="2" y1="6" x2="30" y2="6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="12" x2="30" y2="12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="18" x2="30" y2="18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="9" y="5" width="14" height="14" rx="1" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  <path d="M12 14a2.5 2.5 0 0 1 5 0" stroke="#0369a1" strokeWidth="1.2" fill="#bae6fd" />
                </svg>
                <span className="text-[8.5px] text-slate-600 font-medium">Đè lên chữ</span>
              </button>

              {/* 6. Tight / Through (Bao sát) */}
              <button
                type="button"
                onClick={() => applyWrapping('tight')}
                className={`p-1.5 rounded border flex flex-col items-center justify-center transition-all ${
                  currentWrapping === 'tight'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title="Tight · Bao quanh sát cạnh ảnh"
              >
                <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                  <polygon points="4,4 14,8 12,18 2,14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
                  <line x1="18" y1="6" x2="30" y2="6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="12" x2="30" y2="12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="18" x2="30" y2="18" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[8.5px] text-slate-600 font-medium">Bao sát</span>
              </button>
            </div>
          </div>

          {/* Radio vị trí ảnh */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="imgPos" defaultChecked className="accent-blue-600 text-xs" />
              <span>Move with text</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="imgPos" className="accent-blue-600 text-xs" />
              <span>Fix position on page</span>
            </label>
          </div>
        </div>
      )}

      {/* 4. MODAL NHẬP KÍCH THƯỚC PIXEL TÙY CHỌN */}
      {showCustomPxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 max-w-xs w-full space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Kích thước chiều ngang ảnh (Pixels)</span>
            </h4>
            <div>
              <input
                type="number"
                min={30}
                max={1500}
                value={customPxInput}
                onChange={(e) => setCustomPxInput(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 350"
                autoFocus
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Chiều cao sẽ tự động co giãn theo tỉ lệ ảnh.</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCustomPxModal(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseInt(customPxInput, 10);
                  if (val > 0) {
                    applyWidthPreset(`${val}px`);
                  }
                  setShowCustomPxModal(false);
                }}
                className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-2xs"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
