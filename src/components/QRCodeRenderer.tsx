import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeRendererProps {
  value: string;
  size?: number; // size in pixels
  color?: string;
  backgroundColor?: string;
  className?: string;
  showCaption?: boolean;
}

export const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  value,
  size = 72,
  color = '#000000',
  backgroundColor = '#ffffff',
  className = '',
  showCaption = false,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!value) {
      setDataUrl(null);
      return;
    }

    QRCode.toDataURL(value, {
      width: size * 2, // 2x for sharp retina rendering and crisp print
      margin: 1,
      color: {
        dark: color,
        light: backgroundColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setDataUrl(url);
        setError(false);
      })
      .catch((err) => {
        console.warn('QR Code generation error:', err);
        setError(true);
      });
  }, [value, size, color, backgroundColor]);

  if (!value) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center text-[10px] text-slate-400 bg-slate-100 rounded border border-dashed border-slate-300 p-1 text-center ${className}`}
      >
        QR
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center text-[9px] text-red-500 bg-red-50 rounded border border-red-200 p-1 text-center ${className}`}
      >
        Erro QR
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <img
        src={dataUrl}
        alt={`QR Code: ${value}`}
        style={{ width: size, height: size }}
        className="block object-contain rounded"
        referrerPolicy="no-referrer"
      />
      {showCaption && (
        <span className="text-[8px] font-mono text-slate-500 text-center truncate max-w-full mt-0.5">
          {value}
        </span>
      )}
    </div>
  );
};
