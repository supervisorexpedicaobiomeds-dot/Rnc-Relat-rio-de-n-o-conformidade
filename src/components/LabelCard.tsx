import React from 'react';
import { LabelData, LabelField, LabelStyleConfig } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { QRCodeRenderer } from './QRCodeRenderer';
import { 
  Building2, 
  MapPin, 
  Package, 
  Tag, 
  ShieldCheck, 
  Calendar, 
  User, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LabelCardProps {
  data: LabelData;
  style: LabelStyleConfig;
  fields: LabelField[];
  className?: string;
  isPrintMode?: boolean;
  scale?: number;
}

export const LabelCard: React.FC<LabelCardProps> = ({
  data,
  style,
  fields,
  className = '',
  isPrintMode = false,
  scale = 1,
}) => {
  const visibleFields = fields.filter((f) => f.visible);

  // Helper to extract formatted text
  const getFieldValue = (field: LabelField): string => {
    const rawVal = data[field.key] !== undefined ? data[field.key] : (field.value || '');
    if (rawVal === '' || rawVal === null || rawVal === undefined) return '';
    const prefix = field.prefix || '';
    const suffix = field.suffix || '';
    return `${prefix}${rawVal}${suffix}`;
  };

  const barcodeValue = data[style.barcodeField] || data.code || data.tracking || data.assetTag || data.ean || data.boxCode || data.id || '';
  const qrcodeValue = data[style.qrcodeField] || data.code || data.tracking || data.assetTag || data.passId || data.id || '';

  // Calculate pixel or mm dimensions
  // In print mode, exact mm dimensions are applied via inline style for 1:1 hardware output
  const cardStyle: React.CSSProperties = {
    width: `${style.widthMm}mm`,
    height: `${style.heightMm}mm`,
    backgroundColor: style.backgroundColor || '#ffffff',
    borderRadius: style.showBorder ? `${style.borderRadiusMm}mm` : '0px',
    border: style.showBorder
      ? `${style.borderWidthPx}px solid ${style.borderColor || '#cbd5e1'}`
      : 'none',
    boxSizing: 'border-box',
    color: style.textColor || '#0f172a',
    fontFamily:
      style.fontFamily === 'mono'
        ? '"JetBrains Mono", monospace'
        : style.fontFamily === 'serif'
        ? 'Georgia, serif'
        : '"Plus Jakarta Sans", sans-serif',
    transform: !isPrintMode && scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };

  // Render layout mode specific structures
  const renderLayoutContent = () => {
    switch (style.layoutMode) {
      case 'quarantine':
        return renderQuarantineLayout();
      case 'shipping-box':
        return renderShippingLayout();
      case 'badge-id':
        return renderBadgeLayout();
      case 'split':
        return renderSplitLayout();
      case 'compact':
        return renderCompactLayout();
      case 'standard':
      default:
        return renderStandardLayout();
    }
  };

  // --- LAYOUT 1: STANDARD (Biomed / Lab / Products / General) ---
  const renderStandardLayout = () => {
    const titleField = visibleFields.find((f) => f.key === 'title' || f.key === 'name');
    const otherFields = visibleFields.filter((f) => f !== titleField);

    return (
      <div className="w-full h-full flex flex-col justify-between p-2.5 overflow-hidden box-border">
        {/* Main Content Area */}
        <div className="flex-1 flex gap-2.5 items-start min-h-0">
          {/* Left / Center data */}
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            {titleField && (
              <div
                className="font-bold text-slate-900 leading-tight mb-1.5 line-clamp-2"
                style={{
                  fontSize: `${titleField.fontSize || 12}pt`,
                  color: titleField.fontColor || style.textColor,
                }}
              >
                {getFieldValue(titleField)}
              </div>
            )}

            {/* Field badges / lines */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-700">
              {otherFields.map((f) => {
                const val = getFieldValue(f);
                if (!val) return null;

                if (f.type === 'badge') {
                  return (
                    <div key={f.id} className="col-span-1 flex items-center">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {val}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={f.id}
                    className={`leading-snug truncate ${f.isCode ? 'col-span-2 font-mono font-bold text-slate-900' : 'col-span-1'}`}
                    style={{
                      fontSize: `${f.fontSize || 9.5}pt`,
                      fontWeight: f.fontWeight || 'normal',
                      color: f.fontColor || (f.isCode ? style.accentColor : style.textColor),
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>

          {/* QR Code on Right if enabled */}
          {style.showQrCode && qrcodeValue && (
            <div className="shrink-0 flex flex-col items-center justify-center p-1 bg-white rounded border border-slate-200">
              <QRCodeRenderer
                value={qrcodeValue}
                size={style.qrcodeSizeMm * 3.78}
                color={style.textColor || '#000000'}
              />
            </div>
          )}
        </div>

        {/* Bottom Barcode */}
        {style.showBarcode && barcodeValue && (
          <div className="mt-1 pt-1 border-t border-slate-100 flex flex-col items-center justify-center">
            <BarcodeRenderer
              value={barcodeValue}
              format={style.barcodeType}
              height={style.barcodeHeightMm * 2.8}
              displayValue={style.showBarcodeText}
              fontSize={10}
            />
          </div>
        )}
      </div>
    );
  };

  // --- LAYOUT 2: SHIPPING BOX (Logistics / Transport) ---
  const renderShippingLayout = () => {
    const recipient = data.recipient || 'DESTINATÁRIO NÃO INFORMADO';
    const address = data.address || '';
    const cityState = data.cityState || '';
    const invoice = data.invoice || '';
    const volume = data.packageVolume || '1 / 1';
    const weight = data.weight ? `${data.weight} kg` : '';
    const carrier = data.carrier || '';

    return (
      <div className="w-full h-full flex flex-col justify-between p-3.5 box-border bg-white text-slate-900">
        {/* Top: Recipient Block */}
        <div className="border-2 border-slate-800 rounded p-2 bg-slate-50/50">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-600" /> Destinatário
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-800 text-white rounded">
              VOL: {volume}
            </span>
          </div>
          <div className="text-sm font-black text-slate-950 leading-tight line-clamp-2">
            {recipient}
          </div>
          {address && <div className="text-[11px] text-slate-700 leading-snug mt-1">{address}</div>}
          {cityState && <div className="text-[12px] font-bold text-slate-900 mt-0.5">{cityState}</div>}
        </div>

        {/* Middle Meta Info Grid */}
        <div className="grid grid-cols-3 gap-1.5 my-2 text-center text-[10px]">
          <div className="p-1 border border-slate-300 rounded bg-white">
            <span className="text-[8.5px] text-slate-500 block uppercase font-semibold">Nota Fiscal</span>
            <span className="font-mono font-bold text-slate-900">{invoice || 'N/A'}</span>
          </div>
          <div className="p-1 border border-slate-300 rounded bg-white">
            <span className="text-[8.5px] text-slate-500 block uppercase font-semibold">Peso Bruto</span>
            <span className="font-bold text-slate-900">{weight || 'N/A'}</span>
          </div>
          <div className="p-1 border border-slate-300 rounded bg-white">
            <span className="text-[8.5px] text-slate-500 block uppercase font-semibold">Transporte</span>
            <span className="font-semibold truncate text-slate-900 block">{carrier || 'Padrão'}</span>
          </div>
        </div>

        {/* Middle-Bottom QR + Instructions */}
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 rounded border border-slate-200">
          <div className="text-[9px] text-slate-600 flex-1 leading-tight">
            <p className="font-bold text-slate-800 uppercase">Atenção Expedição:</p>
            <p>Conferir integridade do lacre na entrega. Rastreie pelo QR Code.</p>
          </div>
          {style.showQrCode && qrcodeValue && (
            <QRCodeRenderer
              value={qrcodeValue}
              size={style.qrcodeSizeMm * 3.2}
              color="#0f172a"
            />
          )}
        </div>

        {/* Bottom Tracking Barcode */}
        {style.showBarcode && barcodeValue && (
          <div className="mt-2 pt-1 border-t-2 border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              Rastreamento de Carga
            </span>
            <BarcodeRenderer
              value={barcodeValue}
              format={style.barcodeType}
              height={style.barcodeHeightMm * 2.6}
              displayValue={true}
              fontSize={11}
            />
          </div>
        )}
      </div>
    );
  };

  // --- LAYOUT 3: SPLIT (Patrimônio / Ativos) ---
  const renderSplitLayout = () => {
    return (
      <div className="w-full h-full flex flex-col justify-between p-2.5 box-border">
        <div className="flex-1 flex gap-3 items-center">
          {/* Left: QR Code + Big Asset Tag */}
          <div className="w-1/3 flex flex-col items-center justify-center p-1.5 bg-slate-50 rounded border border-slate-200 text-center">
            {style.showQrCode && qrcodeValue && (
              <QRCodeRenderer
                value={qrcodeValue}
                size={style.qrcodeSizeMm * 3.5}
                color={style.accentColor || '#0f766e'}
              />
            )}
            <div className="text-[9px] font-mono font-black text-slate-800 mt-1 uppercase tracking-wider">
              {data.assetTag || data.code || ''}
            </div>
          </div>

          {/* Right: Technical specifications */}
          <div className="w-2/3 flex flex-col justify-center space-y-1">
            {visibleFields
              .filter((f) => f.key !== 'assetTag')
              .map((f) => {
                const val = getFieldValue(f);
                if (!val) return null;
                return (
                  <div
                    key={f.id}
                    className="leading-tight truncate"
                    style={{
                      fontSize: `${f.fontSize || 9}pt`,
                      fontWeight: f.fontWeight || 'normal',
                      color: f.fontColor || style.textColor,
                    }}
                  >
                    {val}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Barcode bottom if toggled */}
        {style.showBarcode && barcodeValue && (
          <div className="mt-1 pt-1 border-t border-slate-100 flex flex-col items-center">
            <BarcodeRenderer
              value={barcodeValue}
              format={style.barcodeType}
              height={style.barcodeHeightMm * 2.2}
              displayValue={style.showBarcodeText}
              fontSize={9}
            />
          </div>
        )}
      </div>
    );
  };

  // --- LAYOUT 4: BADGE ID (Crachá / Visitante / Eventos) ---
  const renderBadgeLayout = () => {
    const fullName = data.fullName || data.name || 'NOME DO VISITANTE';
    const company = data.company || '';
    const role = data.role || '';
    const hostSector = data.hostSector || '';
    const validity = data.validity || '';

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 box-border bg-white text-center">
        {/* Person icon avatar or photo holder */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600">
            <User className="w-6 h-6" />
          </div>
          {validity && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              {validity}
            </span>
          )}
        </div>

        {/* Name & Company */}
        <div className="my-auto py-1">
          <div className="text-base font-black text-slate-900 leading-tight">
            {fullName}
          </div>
          {company && (
            <div className="text-xs font-bold text-indigo-600 mt-0.5">
              {company}
            </div>
          )}
          {role && (
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
              {role}
            </div>
          )}
          {hostSector && (
            <div className="text-[10px] text-slate-500 mt-0.5">
              Setor: {hostSector}
            </div>
          )}
        </div>

        {/* Access QR Code Bottom */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="text-left text-[9px] text-slate-500 leading-tight">
            <div className="font-bold text-slate-800">Credencial # {data.passId || data.id}</div>
            <div>Uso obrigatório visível</div>
          </div>
          {style.showQrCode && qrcodeValue && (
            <QRCodeRenderer
              value={qrcodeValue}
              size={style.qrcodeSizeMm * 3}
              color="#312e81"
            />
          )}
        </div>
      </div>
    );
  };

  // --- LAYOUT 6: QUARENTENA & DATA DE LIBERAÇÃO (Básica & Direta) ---
  const renderQuarantineLayout = () => {
    const statusText = data.status || data.title || 'QUARENTENA';
    const releaseDate = data.liberationDate || data.releaseDate || data.dataLiberacao || data.date || data.expiry || '';
    const lot = data.lot || data.code || '';

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 box-border bg-white text-slate-900 text-center select-none">
        {/* Top Status Header if showHeader is false, or large focal status */}
        {!style.showHeader && (
          <div
            className="w-full py-1.5 px-2 rounded font-black tracking-wider uppercase border-2 text-center"
            style={{
              backgroundColor: style.headerColor || '#fef3c7',
              borderColor: style.borderColor || '#d97706',
              color: style.headerTextColor || '#92400e',
              fontSize: '15pt',
            }}
          >
            {statusText}
          </div>
        )}

        {/* Central Focus: DATA DE LIBERAÇÃO */}
        <div className="my-auto flex flex-col items-center justify-center py-2 px-3 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/70">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Data de Liberação
          </span>
          <div
            className="font-mono font-black text-slate-950 tracking-tight leading-none"
            style={{
              fontSize: '20pt',
              color: style.accentColor || '#b45309',
            }}
          >
            {releaseDate || '___ / ___ / ______'}
          </div>
          {lot && (
            <span className="mt-1.5 text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              Lote / Ref: {lot}
            </span>
          )}
        </div>

        {/* Bottom Barcode / QR Code if enabled */}
        {style.showBarcode && barcodeValue && (
          <div className="mt-1 flex flex-col items-center justify-center">
            <BarcodeRenderer
              value={barcodeValue}
              format={style.barcodeType}
              height={style.barcodeHeightMm * 2}
              displayValue={style.showBarcodeText}
              fontSize={8.5}
            />
          </div>
        )}

        {style.showQrCode && qrcodeValue && !style.showBarcode && (
          <div className="mt-1 flex justify-center">
            <QRCodeRenderer
              value={qrcodeValue}
              size={style.qrcodeSizeMm * 2.8}
              color={style.textColor || '#000000'}
            />
          </div>
        )}
      </div>
    );
  };

  // --- LAYOUT 5: COMPACT (Retail / Gondola / Shelves) ---
  const renderCompactLayout = () => {
    const productName = data.productName || data.title || 'PRODUTO';
    const price = data.price || '0,00';
    const sku = data.sku || '';

    return (
      <div className="w-full h-full flex flex-col justify-between p-1.5 box-border bg-white text-slate-900">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] font-bold text-slate-900 leading-tight truncate">
              {productName}
            </div>
            {sku && <div className="text-[8px] font-mono text-slate-500">SKU: {sku}</div>}
          </div>
          {price && (
            <div className="text-right shrink-0">
              <span className="text-[8px] text-slate-500 block leading-none">R$</span>
              <span className="text-sm font-black text-emerald-700 leading-none">{price}</span>
            </div>
          )}
        </div>

        {style.showBarcode && barcodeValue && (
          <div className="mt-0.5 flex flex-col items-center">
            <BarcodeRenderer
              value={barcodeValue}
              format={style.barcodeType}
              height={style.barcodeHeightMm * 2.2}
              displayValue={true}
              fontSize={8.5}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={cardStyle}
      className={`relative overflow-hidden shadow-xs select-none print:shadow-none ${
        style.showCutLines ? 'outline-1 outline-dashed outline-slate-300' : ''
      } ${className}`}
    >
      {/* Optional Header Banner */}
      {style.showHeader && style.headerTitle && (
        <div
          className="w-full px-2.5 py-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider shrink-0"
          style={{
            backgroundColor: style.headerColor || '#0284c7',
            color: style.headerTextColor || '#ffffff',
          }}
        >
          <div className="truncate flex items-center gap-1.5">
            <Tag className="w-3 h-3 shrink-0" />
            <span>{style.headerTitle}</span>
          </div>
          {style.headerSubtitle && (
            <span className="text-[7.5px] opacity-85 font-medium truncate ml-2">
              {style.headerSubtitle}
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 h-full min-h-0">
        {renderLayoutContent()}
      </div>
    </div>
  );
};
