import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Maximize2, 
  ExternalLink, 
  QrCode, 
  Smartphone, 
  Monitor, 
  Share2, 
  Send, 
  Sparkles,
  Info,
  Terminal,
  Layers,
  Globe,
  MessageCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { 
  getCleanAppUrl, 
  getFullscreenShareUrl, 
  getSectorShareUrl, 
  getWhatsAppShareUrl, 
  triggerBrowserFullscreen 
} from '../../utils/fullscreenHelper';
import { SectorInfo, RncUser } from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';

interface ShareFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectors?: SectorInfo[];
  users?: RncUser[];
}

export type ShareMode = 'direct' | 'fullscreen' | 'sector';

export const ShareFullscreenModal: React.FC<ShareFullscreenModalProps> = ({
  isOpen,
  onClose,
  sectors = ORDER_SECTORS,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>('direct');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(sectors[0]?.id || 'inclusao');
  const [shareUrl, setShareUrl] = useState('');

  // Compute active URL based on mode
  useEffect(() => {
    if (!isOpen) return;
    if (shareMode === 'direct') {
      setShareUrl(getCleanAppUrl());
    } else if (shareMode === 'fullscreen') {
      setShareUrl(getFullscreenShareUrl());
    } else if (shareMode === 'sector') {
      setShareUrl(getSectorShareUrl(selectedSectorId, false));
    }
  }, [isOpen, shareMode, selectedSectorId]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getFormattedMessage = () => {
    let modeTitle = 'Acesso Direto ao Sistema RNC';
    if (shareMode === 'fullscreen') modeTitle = 'Modo Posto / Tela Cheia';
    if (shareMode === 'sector') {
      const sectorObj = sectors.find(s => s.id === selectedSectorId);
      modeTitle = `Acesso Direto ao Setor: ${sectorObj?.name || selectedSectorId}`;
    }

    return `📋 *Biomeds - Painel de Ocorrências RNC*\n*${modeTitle}*\n\nClique no link abaixo para abrir diretamente a aplicação:\n🔗 ${shareUrl}\n\n💡 *Dica:* Para usar como aplicativo no computador ou celular, adicione este link aos favoritos ou crie um atalho na tela inicial.`;
  };

  const handleCopyMessage = () => {
    const msg = getFormattedMessage();
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const msg = getFormattedMessage();
    window.open(getWhatsAppShareUrl(msg), '_blank');
  };

  const handleOpenNow = () => {
    window.open(shareUrl, '_blank');
  };

  const handleTestFullscreen = async () => {
    await triggerBrowserFullscreen();
  };

  // Generate QR Code URL using safe SVG encoder or data provider
  const qrCodeImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    shareUrl || getCleanAppUrl()
  )}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Link de Acesso Direto à Aplicação
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Compartilhar
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Envie o link direto para que operadores e supervisores abram o sistema em seus postos, tablets ou celulares.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Link Type Selector Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
            <button
              onClick={() => setShareMode('direct')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                shareMode === 'direct'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 text-amber-600" />
              <span>Link Padrão</span>
            </button>

            <button
              onClick={() => setShareMode('fullscreen')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                shareMode === 'fullscreen'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="w-4 h-4 text-indigo-600" />
              <span>Modo Tela Cheia</span>
            </button>

            <button
              onClick={() => setShareMode('sector')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                shareMode === 'sector'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Por Setor</span>
            </button>
          </div>

          {/* Sector Selector if Sector Mode is active */}
          {shareMode === 'sector' && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl animate-in fade-in duration-150">
              <label className="text-xs font-bold text-emerald-950 block mb-1.5">
                Selecione o setor para o link direto pré-configurado:
              </label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {sectors.map((sec, idx) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.order || idx + 1}. {sec.name} ({sec.shortName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Main Link Box */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>URL Direta para Envio aos Colaboradores:</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Link Pronto</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 select-all focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNow}
                  title="Abrir diretamente em uma nova aba do navegador"
                  className="px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Abrir Aba</span>
                </button>
              </div>
            </div>

            {/* Ready WhatsApp / Team message copy */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Enviar rapidamente para a equipe:
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copiedMsg
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{copiedMsg ? 'Mensagem Copiada!' : 'Copiar Mensagem'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* QR Code & Mobile Station Scan */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="bg-white p-2 rounded-2xl shadow-lg shrink-0 flex items-center justify-center">
              <img
                src={qrCodeImageSrc}
                alt="QR Code para abrir a aplicação diretamente"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  QR Code para Celular / Tablet / Coletor
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Abertura Instantânea por Câmera
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Os operadores podem apontar a câmera do smartphone ou tablet para o QR Code para acessar imediatamente a plataforma sem digitar a URL.
              </p>
            </div>
          </div>

          {/* Practical Tips for Operating Stations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Como Usar no Dia a Dia dos Postos de Trabalho:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Card 1: Browser Link */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>1. Navegador Direto</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Abra o link em qualquer navegador (Chrome, Edge, Safari, Firefox) no computador de bancada ou celular.
                </p>
              </div>

              {/* Card 2: F11 Shortcut */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>2. Tecla F11</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Em computadores de bancada, pressione a tecla <strong>F11</strong> para modo tela cheia contínua sem barras.
                </p>
              </div>

              {/* Card 3: PWA / WebApp */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>3. Atalho na Área de Trabalho</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  No menu do navegador, selecione <em>Adicionar à tela inicial</em> ou <em>Criar atalho</em> para abrir como aplicativo nativo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestFullscreen}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Testar Tela Cheia Neste Computador</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

