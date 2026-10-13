import React, { useState } from 'react';
import { Coffee, Copy, Check, Heart, ExternalLink } from 'lucide-react';
import { APP_META } from '../lib/meta';

export const CoffeeTab: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(APP_META.coffee.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 border-b border-slate-100 pb-5">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
          <Coffee className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{APP_META.coffee.title}</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {APP_META.coffee.blurb}
        </p>
      </div>

      <div className="bg-gradient-to-b from-amber-50/70 to-amber-100/30 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Ảnh QR VietQR */}
        <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex-shrink-0 text-center">
          <img
            src="docs/coffee-qr.jpg"
            alt={APP_META.coffee.qrAlt}
            className="w-48 h-48 object-contain rounded-lg mx-auto"
            onError={(e) => {
              // Fallback nếu ảnh docs chưa load
              (e.target as HTMLImageElement).src = 'https://api.vietqr.io/image/970418-8855989777-print.jpg?accountName=NGUYEN%20SON%20NAM';
            }}
          />
          <span className="text-[11px] text-slate-500 mt-2 block font-medium">
            Quét mã VietQR bằng App Ngân hàng
          </span>
        </div>

        {/* Thông tin chuyển khoản chi tiết */}
        <div className="space-y-4 flex-1 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
            <div className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              {APP_META.coffee.accountName}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Số tài khoản BIDV:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {APP_META.coffee.accountNumber}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
                title="Sao chép số tài khoản"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              {copied && <span className="text-[11px] text-emerald-600 font-semibold">Đã chép!</span>}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Ngân hàng:</span>
            <div className="text-xs font-semibold text-slate-800">
              {APP_META.coffee.bank}
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 text-slate-500 italic">
            {APP_META.coffee.thanks}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>Sản phẩm hữu ích cho cộng đồng hành chính &amp; y tế Việt Nam</span>
      </div>
    </div>
  );
};
