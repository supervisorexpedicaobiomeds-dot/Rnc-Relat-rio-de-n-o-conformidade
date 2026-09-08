import React, { useState, useMemo, useRef } from 'react';
import { LabelData, LabelField, LabelStyleConfig, PaperSheetPreset } from '../types';
import { PAPER_PRESETS } from '../data/paperSizes';
import { LabelCard } from './LabelCard';
import { triggerPrintLabels } from '../utils/printHelper';
import { 
  Printer, 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Settings2,
  Grid,
  Square,
  CheckCircle2,
  Maximize,
  ExternalLink,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PrintSheetPreviewProps {
  data: LabelData[];
  style: LabelStyleConfig;
  fields: LabelField[];
  selectedPaperPreset: PaperSheetPreset;
  onChangePaperPreset: (preset: PaperSheetPreset) => void;
}

export const PrintSheetPreview: React.FC<PrintSheetPreviewProps> = ({
  data,
  style,
  fields,
  selectedPaperPreset,
  onChangePaperPreset,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<'sheet' | 'single'>('sheet');
  const [singleItemIndex, setSingleItemIndex] = useState<number>(0);
  const [isPrintingDialogActive, setIsPrintingDialogActive] = useState<boolean>(false);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  // Expand all data items according to their `copies` count
  const expandedLabels = useMemo(() => {
    const list: LabelData[] = [];
    data.forEach((item) => {
      const count = Math.max(1, Number(item.copies) || 1);
      for (let i = 0; i < count; i++) {
        list.push({
          ...item,
          _copyIndex: i + 1,
          _totalCopies: count,
        });
      }
    });
    return list;
  }, [data]);

  // Calculate items per page
  const isRoll = selectedPaperPreset.category === 'termica_bobina';
  const labelsPerPage = isRoll
    ? 1
    : Math.max(1, selectedPaperPreset.cols * selectedPaperPreset.rows);

  const totalPages = Math.max(1, Math.ceil(expandedLabels.length / labelsPerPage));

  // Slice for current page
  const pageLabels = useMemo(() => {
    if (isRoll) {
      return [expandedLabels[currentPage - 1] || expandedLabels[0]];
    }
    const start = (currentPage - 1) * labelsPerPage;
    return expandedLabels.slice(start, start + labelsPerPage);
  }, [expandedLabels, currentPage, labelsPerPage, isRoll]);

  // Handle direct print action
  const handlePrint = async () => {
    setIsPrintingDialogActive(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore
    }

    // Trigger system printer selection dialog
    await triggerPrintLabels('printable-labels-area', selectedPaperPreset);

    setTimeout(() => {
      setIsPrintingDialogActive(false);
    }, 2500);
  };

  // Open clean printable view in new window/tab as alternate method
  const handleOpenInNewWindow = () => {
    const printArea = document.getElementById('printable-labels-area');
    if (!printArea) return;

    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    let stylesHtml = '';
    styleElements.forEach((el) => {
      stylesHtml += el.outerHTML;
    });

    const printWin = window.open('', '_blank', 'width=1024,height=800');
    if (!printWin) {
      handlePrint();
      return;
    }

    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Imprimir Etiquetas - ${selectedPaperPreset.name}</title>
          ${stylesHtml}
          <style>
            @page {
              size: ${selectedPaperPreset.paperWidthMm}mm ${selectedPaperPreset.paperHeightMm}mm;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-break {
              page-break-before: always !important;
              break-before: page !important;
            }
            .print-label-item {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: inline-block !important;
              vertical-align: top !important;
            }
          </style>
        </head>
        <body>
          <div style="padding: 10px; background: #f8fafc; border-bottom: 1px solid #cbd5e1; text-align: center;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 24px; font-size: 14px; font-weight: bold; background: #2563eb; color: #fff; border: none; border-radius: 8px; cursor: pointer;">
              CLIQUE AQUI PARA IMPRIMIR (SELECIONAR IMPRESSORA)
            </button>
            <style>
              @media print { .no-print { display: none !important; } }
            </style>
          </div>
          <div id="printable-content">
            ${printArea.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Active Printing Notification Banner */}
      {isPrintingDialogActive && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center animate-pulse">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black">Diálogo de Impressão Acionado!</h4>
              <p className="text-xs text-emerald-100">
                Selecione sua impressora (Zebra, Elgin, Argox, HP, Epson ou Salvar em PDF) na caixa de diálogo do sistema.
              </p>
            </div>
          </div>
          <div className="text-xs bg-emerald-700/80 px-2.5 py-1 rounded-md font-semibold">
            {expandedLabels.length} etiquetas prontas
          </div>
        </div>
      )}

      {/* Top Controls Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left: Paper Preset Selector */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" /> Formato de Papel:
          </span>
          <select
            value={selectedPaperPreset.id}
            onChange={(e) => {
              const preset = PAPER_PRESETS.find((p) => p.id === e.target.value);
              if (preset) {
                onChangePaperPreset(preset);
                setCurrentPage(1);
              }
            }}
            className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
          >
            <optgroup label="Folhas A4 (Cartelas Pimaco / Pré-cortadas)">
              {PAPER_PRESETS.filter((p) => p.category === 'a4_cartela').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.cols}x{p.rows} etiquetas - {p.labelWidthMm}x{p.labelHeightMm}mm)
                </option>
              ))}
            </optgroup>
            <optgroup label="Impressoras Térmicas (Bobina Contínua)">
              {PAPER_PRESETS.filter((p) => p.category === 'termica_bobina').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.labelWidthMm}x{p.labelHeightMm}mm)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Middle: Mode & Zoom */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setPreviewMode('sheet')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                previewMode === 'sheet'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Folha Inteira
            </button>
            <button
              onClick={() => setPreviewMode('single')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                previewMode === 'single'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Square className="w-3.5 h-3.5" /> Individual
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 min-w-[40px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Print Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInNewWindow}
            title="Abrir página de impressão em nova aba"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Nova Aba</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>CHAMAR IMPRESSORAS ({expandedLabels.length})</span>
          </button>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-1 font-medium">
            <span>Página</span>
            <strong className="text-slate-900 font-bold">{currentPage}</strong>
            <span>de</span>
            <strong className="text-slate-900 font-bold">{totalPages}</strong>
            <span className="text-slate-400 ml-1">
              ({expandedLabels.length} etiquetas no total)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Visual Stage Canvas */}
      <div className="bg-slate-200/80 rounded-2xl p-6 overflow-auto flex justify-center items-start min-h-[560px] border border-slate-300/80 shadow-inner">
        {previewMode === 'single' ? (
          /* Single Label Preview */
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-3 rounded-lg shadow-md border border-slate-300">
              <LabelCard
                data={data[singleItemIndex] || data[0]}
                style={style}
                fields={fields}
                scale={zoomLevel}
              />
            </div>

            {/* Switch single item selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Visualizando item:</span>
              <select
                value={singleItemIndex}
                onChange={(e) => setSingleItemIndex(parseInt(e.target.value))}
                className="p-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
              >
                {data.map((item, idx) => (
                  <option key={item.id || idx} value={idx}>
                    #{idx + 1} - {item.title || item.recipient || item.code || item.assetTag || item.liberationDate || 'Etiqueta'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* Full Sheet Grid Preview (A4 Sheet or Thermal Roll) */
          <div
            ref={sheetContainerRef}
            style={{
              width: `${selectedPaperPreset.paperWidthMm}mm`,
              minHeight: `${selectedPaperPreset.paperHeightMm}mm`,
              paddingTop: `${selectedPaperPreset.marginTopMm}mm`,
              paddingBottom: `${selectedPaperPreset.marginBottomMm}mm`,
              paddingLeft: `${selectedPaperPreset.marginLeftMm}mm`,
              paddingRight: `${selectedPaperPreset.marginRightMm}mm`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
            }}
            className="bg-white shadow-2xl relative transition-transform duration-100 box-border text-slate-900 border border-slate-300"
          >
            {/* Grid of labels */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${selectedPaperPreset.cols}, ${style.widthMm}mm)`,
                gridAutoRows: `${style.heightMm}mm`,
                columnGap: `${selectedPaperPreset.gapXmm}mm`,
                rowGap: `${selectedPaperPreset.gapYmm}mm`,
                justifyContent: 'center',
                alignContent: 'start',
              }}
            >
              {pageLabels.map((item, idx) => {
                if (!item) return null;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    style={{
                      width: `${style.widthMm}mm`,
                      height: `${style.heightMm}mm`,
                    }}
                    className="relative flex items-center justify-center box-border"
                  >
                    <LabelCard
                      data={item}
                      style={style}
                      fields={fields}
                      isPrintMode={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY CONTAINER (Invisible on screen, styled exclusively for @media print) */}
      <div id="printable-labels-area" className="hidden print:block">
        {expandedLabels.map((item, index) => {
          const isPageBreak =
            !isRoll &&
            index > 0 &&
            index % (selectedPaperPreset.cols * selectedPaperPreset.rows) === 0;

          return (
            <React.Fragment key={`print-${item.id}-${index}`}>
              {isPageBreak && <div className="page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />}
              <div
                className="print-label-item inline-block box-border"
                style={{
                  width: `${style.widthMm}mm`,
                  height: `${style.heightMm}mm`,
                  marginRight: `${selectedPaperPreset.gapXmm}mm`,
                  marginBottom: `${selectedPaperPreset.gapYmm}mm`,
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                }}
              >
                <LabelCard
                  data={item}
                  style={style}
                  fields={fields}
                  isPrintMode={true}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Printer Selection & Configuration Helper Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
          <Printer className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-blue-950">Como escolher sua impressora:</span>
            <p className="text-blue-800 text-[11px]">
              Ao clicar no botão <strong>"Chamar Impressoras"</strong>, a janela nativa do seu sistema operacional/navegador será exibida. No campo <strong>"Destino" (Printer)</strong>, selecione a sua impressora instalada (ex: Zebra, Elgin, Argox, HP, Epson, Bematech ou Salvar em PDF).
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <SlidersHorizontal className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-amber-950">Ajuste recomendado para não cortar:</span>
            <p className="text-amber-800 text-[11px]">
              Defina as <strong>Margens como "Nenhuma" (None)</strong> e a <strong>Escala em "100%" (Padrão)</strong> na janela de impressão para manter o alinhamento exato nas cartelas e bobinas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

