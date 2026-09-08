import React, { useState } from 'react';
import { OccurrenceRecord, RncStatus, SectorInfo } from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  User, 
  Clock, 
  Building2, 
  FileText,
  ShieldCheck,
  Check,
  MessageSquare
} from 'lucide-react';

interface RncDetailModalProps {
  record: OccurrenceRecord | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RncStatus, resolutionNote?: string) => void;
  currentUserName: string;
  canResolve?: boolean;
  canExportReports?: boolean;
  sectors?: SectorInfo[];
}

export const RncDetailModal: React.FC<RncDetailModalProps> = ({
  record,
  onClose,
  onUpdateStatus,
  currentUserName,
  canResolve = true,
  canExportReports = true,
  sectors = ORDER_SECTORS,
}) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!record) return null;

  const respSectorInfo = sectors.find((s) => s.id === record.responsibleSector);
  const detSectorInfo = sectors.find((s) => s.id === record.detectingSector);

  const formattedDate = new Date(record.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleResolve = () => {
    onUpdateStatus(record.id, 'resolvida', resolutionNote.trim() || undefined);
    setIsResolving(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
              record.status === 'resolvida'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                : record.status === 'em_analise'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-mono">
                  {record.id}
                </h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  record.status === 'resolvida'
                    ? 'bg-emerald-500 text-white'
                    : record.status === 'em_analise'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}>
                  {record.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pedido: <strong className="text-white font-mono text-sm">{record.orderNumber}</strong> • Registrado em {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canExportReports && (
              <button
                onClick={handlePrint}
                title="Imprimir ficha de RNC"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet Body */}
        <div id="rnc-printable-sheet" className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Header visible on print */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
            <h1 className="text-xl font-black text-slate-900 uppercase">
              Ficha de Registro de Não Conformidade (RNC)
            </h1>
            <p className="text-xs text-slate-600">
              Protocolo: {record.id} | Pedido: {record.orderNumber} | Emitido em: {formattedDate}
            </p>
          </div>

          {/* Path Flow: Processo Anterior -> Onde Foi Detectado */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">
              Mapeamento do Fluxo do Erro (Processo Anterior)
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
              {/* Origin Sector (Who made the mistake) */}
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                  1. Setor Origem do Erro
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  {respSectorInfo?.name}
                </h4>
                <div className="text-xs text-slate-600 flex items-center gap-1 justify-center sm:justify-start mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Responsável: <strong className="text-slate-900">{record.responsiblePerson}</strong></span>
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0 flex items-center gap-1 text-rose-500 font-black text-xs px-2 py-1 bg-rose-50 rounded-lg border border-rose-200">
                <span>Falha Identificada</span>
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Detecting Sector */}
              <div className="flex-1 text-center sm:text-right">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  2. Setor Onde Foi Detectado
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  {detSectorInfo?.name}
                </h4>
                <div className="text-xs text-slate-600 flex items-center gap-1 justify-center sm:justify-end mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Auditado por: <strong className="text-slate-900">{record.registeredBy}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-0.5">Nº do Pedido</span>
              <span className="font-mono font-black text-slate-900 text-sm">{record.orderNumber}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-0.5">Cliente / Paciente</span>
              <span className="font-bold text-slate-900">{record.clientName || 'Não especificado'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-0.5">Gravidade</span>
              <span className={`inline-block font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                record.severity === 'critica'
                  ? 'bg-red-100 text-red-700'
                  : record.severity === 'grave'
                  ? 'bg-orange-100 text-orange-700'
                  : record.severity === 'moderada'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {record.severity}
              </span>
            </div>
          </div>

          {/* What was the error */}
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
            <span className="text-xs font-black uppercase text-rose-950 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              Descrição da Ocorrência / Erro Comprovado
            </span>

            <div className="p-3 bg-white rounded-lg border border-rose-200/80">
              <h3 className="text-sm font-black text-slate-900 mb-1">
                {record.errorTitle}
              </h3>
              {record.customDescription && (
                <div className="mt-2 p-2.5 bg-amber-50 rounded border border-amber-200 text-xs text-slate-800 leading-relaxed font-medium">
                  <strong>{record.isCustomError ? 'Texto informado pelo colaborador (Outros):' : 'Complemento / Detalhes da Ocorrência:'}</strong>
                  <p className="mt-1 text-slate-900">{record.customDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Immediate Action */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <span className="font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Ação Imediata Executada no Ato
            </span>
            <p className="text-slate-800 font-semibold bg-white p-3 rounded-lg border border-slate-200">
              {record.immediateAction}
            </p>
          </div>

          {/* Resolution / Closure notes if resolved */}
          {record.status === 'resolvida' && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
              <span className="font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Resolução da RNC & Tratativa
              </span>
              <p className="text-emerald-900 font-medium bg-white p-3 rounded-lg border border-emerald-200">
                {record.notes || 'Ocorrência resolvida com ajuste de processo.'}
              </p>
              <div className="text-[11px] text-emerald-800 flex items-center gap-2 pt-1">
                <span>Finalizado por: <strong>{record.resolvedBy || record.registeredBy}</strong></span>
                {record.resolvedAt && (
                  <span>em {new Date(record.resolvedAt).toLocaleString('pt-BR')}</span>
                )}
              </div>
            </div>
          )}

          {/* Status Change Controls (no-print) */}
          <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Alterar Status da Ocorrência
              </span>
              <span className="text-[11px] text-slate-500">
                Usuário logado: <strong>{currentUserName}</strong>
              </span>
            </div>

            {canResolve ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(record.id, 'aberta')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    record.status === 'aberta'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Aberta (Pendente)
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateStatus(record.id, 'em_analise')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    record.status === 'em_analise'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Em Análise
                </button>

                <button
                  type="button"
                  onClick={() => setIsResolving(!isResolving)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    record.status === 'resolvida'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marcar como Resolvida</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateStatus(record.id, 'improcedente')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    record.status === 'improcedente'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Improcedente
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Seu perfil de usuário possui acesso apenas para consulta. Apenas usuários com permissão de tratativa podem alterar o status desta RNC.</span>
              </div>
            )}

            {/* If resolving, ask for resolution note */}
            {isResolving && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2 mt-2">
                <label className="block text-xs font-bold text-emerald-950">
                  Descreva a tratativa ou resolução adotada:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Orientado operador no DDS, ajustado fluxo de conferência..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResolving(false)}
                    className="px-3 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleResolve}
                    className="px-4 py-1 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Confirmar Resolução
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-black text-white bg-slate-800 hover:bg-slate-900 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
