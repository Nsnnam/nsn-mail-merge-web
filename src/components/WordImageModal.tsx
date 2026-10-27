import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, X, Check, Eye } from 'lucide-react';

export interface WordImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (imageHtml: string) => void;
}

export const WordImageModal: React.FC<WordImageModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [altText, setAltText] = useState<string>('Hình ảnh');
  const [imageWidth, setImageWidth] = useState<'150px' | '300px' | '500px' | '100%' | 'custom'>('300px');
  const [customWidthVal, setCustomWidthVal] = useState<number>(300);
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right'>('center');
  const [borderRadius, setBorderRadius] = useState<string>('4px');
  const [hasBorder, setHasBorder] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WebP, SVG, GIF...).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPreviewSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreviewSrc(urlInput.trim());
  };

  const handleConfirmInsert = () => {
    if (!previewSrc) {
      alert('Vui lòng chọn ảnh từ máy tính hoặc nhập link ảnh hợp lệ.');
      return;
    }

    const finalWidth = imageWidth === 'custom' ? `${customWidthVal}px` : imageWidth;
    const borderStyle = hasBorder ? '1.5px solid #cbd5e1' : 'none';

    // Tạo HTML ảnh với CSS inline chuẩn để in ấn và tương thích 100% trong Word
    const imgHtml = `<div style="text-align: ${imageAlign}; margin: 8px 0;"><img src="${previewSrc}" alt="${altText}" style="max-width: 100%; width: ${finalWidth}; height: auto; border-radius: ${borderRadius}; border: ${borderStyle}; display: inline-block; vertical-align: middle;" /></div><p><br></p>`;

    onInsertImage(imgHtml);
    onClose();
    setPreviewSrc('');
    setUrlInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden space-y-3.5 p-4.5 animate-in zoom-in-95 duration-100">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chèn Ảnh (Insert Picture)</h3>
              <p className="text-[11px] text-slate-500">Chuẩn Microsoft Word · Tương thích in &amp; xuất file 100%</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab chuyển đổi: Tải từ máy tính vs Link URL */}
        <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải ảnh từ máy tính</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Nhập link ảnh (URL)</span>
          </button>
        </div>

        {/* Nội dung Tab */}
        {activeTab === 'upload' ? (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 transition-colors group cursor-pointer text-center"
            >
              <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-600 group-hover:text-blue-600">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                Nhấp để chọn ảnh từ máy tính của bạn
              </span>
              <span className="text-[10px] text-slate-400">
                Hỗ trợ PNG, JPG, JPEG, WebP, SVG, GIF (Tự động chuyển Base64 an toàn 100%)
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/hinh-anh.png"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Xem thử
              </button>
            </div>
          </div>
        )}

        {/* Xem trước ảnh nếu có */}
        {previewSrc && (
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Xem trước ảnh:
            </span>
            <div className="max-h-36 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
              <img
                src={previewSrc}
                alt="Preview"
                className="max-h-32 object-contain rounded"
              />
            </div>

            {/* Các tùy chọn kích thước & căn lề */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Kích thước:</label>
                <select
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value as any)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="150px">Nhỏ (150 px)</option>
                  <option value="300px">Vừa phải (300 px - Khuyên dùng)</option>
                  <option value="500px">Lớn (500 px)</option>
                  <option value="100%">Toàn chiều rộng (100%)</option>
                  <option value="custom">Tùy chỉnh số pixel...</option>
                </select>
                {imageWidth === 'custom' && (
                  <input
                    type="number"
                    min={50}
                    max={1200}
                    value={customWidthVal}
                    onChange={(e) => setCustomWidthVal(parseInt(e.target.value) || 300)}
                    placeholder="Pixel..."
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Căn lề ảnh:</label>
                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setImageAlign('left')}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-medium ${imageAlign === 'left' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'}`}
                  >
                    Trái
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlign('center')}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-medium ${imageAlign === 'center' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'}`}
                  >
                    Giữa
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlign('right')}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-medium ${imageAlign === 'right' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'}`}
                  >
                    Phải
                  </button>
                </div>
              </div>
            </div>

            {/* Bo góc & Viền */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={hasBorder}
                  onChange={(e) => setHasBorder(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-[11px] font-medium">Kèm đường viền mờ</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Bo góc:</span>
                <select
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="px-1.5 py-0.5 border border-slate-300 rounded text-[11px] bg-slate-50"
                >
                  <option value="0px">Vuông (0px)</option>
                  <option value="4px">Bo nhẹ (4px)</option>
                  <option value="8px">Bo vừa (8px)</option>
                  <option value="16px">Bo tròn (16px)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirmInsert}
            disabled={!previewSrc}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all ${
              previewSrc
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Chèn ảnh vào văn bản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
