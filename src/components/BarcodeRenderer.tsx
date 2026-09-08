import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeFormat } from '../types';

interface BarcodeRendererProps {
  value: string;
  format?: BarcodeFormat;
  height?: number; // in pixels
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  lineColor?: string;
  background?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  height = 36,
  displayValue = true,
  fontSize = 11,
  className = '',
  lineColor = '#000000',
  background = 'transparent',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) {
      setError(null);
      return;
    }

    try {
      // Map to jsbarcode format names
      let jsFormat: string = 'CODE128';
      let cleanVal = String(value).trim();

      if (format === 'EAN13') {
        jsFormat = 'EAN13';
        // Sanitize EAN-13: must be digits only
        cleanVal = cleanVal.replace(/\D/g, '');
        if (cleanVal.length < 12) {
          cleanVal = cleanVal.padStart(12, '0');
        } else if (cleanVal.length > 13) {
          cleanVal = cleanVal.slice(0, 13);
        }
      } else if (format === 'CODE39') {
        jsFormat = 'CODE39';
        cleanVal = cleanVal.toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, '');
      } else if (format === 'UPC') {
        jsFormat = 'UPC';
        cleanVal = cleanVal.replace(/\D/g, '').slice(0, 12);
        if (cleanVal.length < 11) cleanVal = cleanVal.padStart(11, '0');
      } else if (format === 'ITF14') {
        jsFormat = 'ITF14';
        cleanVal = cleanVal.replace(/\D/g, '').slice(0, 14);
      }

      JsBarcode(svgRef.current, cleanVal, {
        format: jsFormat,
        width: 1.4,
        height: Math.max(16, height),
        displayValue: displayValue,
        fontSize: fontSize,
        font: 'monospace',
        fontOptions: 'bold',
        textMargin: 2,
        margin: 2,
        lineColor: lineColor,
        background: background,
      });
      setError(null);
    } catch (err: any) {
      console.warn('Barcode render error:', err);
      // Fallback to standard CODE128 if format failed
      try {
        if (svgRef.current) {
          JsBarcode(svgRef.current, String(value).trim() || '0000', {
            format: 'CODE128',
            width: 1.2,
            height: Math.max(16, height),
            displayValue: displayValue,
            fontSize: fontSize,
            font: 'monospace',
            fontOptions: 'bold',
            textMargin: 2,
            margin: 2,
            lineColor: lineColor,
            background: background,
          });
          setError(null);
        }
      } catch (fallbackErr) {
        setError('Código inválido');
      }
    }
  }, [value, format, height, displayValue, fontSize, lineColor, background]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center text-xs text-slate-400 bg-slate-100/80 rounded border border-dashed border-slate-300 py-1 px-2 ${className}`}>
        [Sem código de barras]
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center text-[10px] text-amber-700 bg-amber-50 rounded border border-amber-200 py-1 px-2 ${className}`}>
        <span className="font-mono font-bold truncate max-w-full">{value}</span>
        <span className="text-[9px] text-amber-600">{error}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center max-w-full overflow-hidden ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};
