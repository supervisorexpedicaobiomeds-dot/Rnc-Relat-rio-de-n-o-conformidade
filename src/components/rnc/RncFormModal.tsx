import React, { useState, useEffect } from 'react';
import { 
  OrderSector, 
  RncSeverity, 
  RncStatus, 
  RncUser, 
  StandardOccurrence, 
  OccurrenceRecord,
  SectorInfo 
} from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Hash, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  PlusCircle,
  ShieldAlert,
  Info
} from 'lucide-react';

interface RncFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<OccurrenceRecord, 'id' | 'createdAt'>) => void;
  activeUser: RncUser;
  users: RncUser[];
  standardOccurrences: StandardOccurrence[];
  initialSector?: OrderSector;
  sectors?: SectorInfo[];
}

export const RncFormModal: React.FC<RncFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activeUser,
  users,
  standardOccurrences,
  initialSector,
  sectors = ORDER_SECTORS,
}) => {
  // Form states
  const [orderNumber, setOrderNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [productInfo, setProductInfo] = useState('');
  
  // Sectors: Detecting (where found) and Responsible (who made the mistake)
  const [detectingSector, setDetectingSector] = useState<OrderSector>(activeUser.sector || (sectors[0]?.id || 'separacao'));
  const [responsibleSector, setResponsibleSector] = useState<OrderSector>(initialSector || (sectors[0]?.id || 'separacao'));
  
  // Who made the mistake
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [isCustomPerson, setIsCustomPerson] = useState(false);
  const [customPersonName, setCustomPersonName] = useState('');
  
  // What was the error
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');
  const [isCustomError, setIsCustomError] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  
  // Severity and Immediate Action
  const [severity, setSeverity] = useState<RncSeverity>('moderada');
  const [immediateAction, setImmediateAction] = useState('');
  const [notes, setNotes] = useState('');

  // Update responsible sector or active user when modal opens
  useEffect(() => {
    if (isOpen) {
      setDetectingSector(activeUser.sector || 'conferencia_final');
      if (initialSector) {
        setResponsibleSector(initialSector);
      }
    }
  }, [isOpen, activeUser, initialSector]);

  // Filter users by the chosen responsible sector
  const sectorUsers = users.filter((u) => u.sector === responsibleSector && u.active);

  // Auto-select first user from sector when sector changes if not already matching
  useEffect(() => {
    if (sectorUsers.length > 0 && !isCustomPerson) {
      setResponsiblePerson(sectorUsers[0].name);
    } else if (!isCustomPerson) {
      setResponsiblePerson('');
    }
  }, [responsibleSector, sectorUsers.length, isCustomPerson]);

  // Filter standard occurrences for the selected responsible sector
  const sectorOccurrences = standardOccurrences.filter((so) => so.sector === responsibleSector);

  // When standard occurrence changes, update severity if standard
  const handleSelectStandardOccurrence = (soId: string) => {
    if (soId === 'outros') {
      setSelectedStandardId('outros');
      setIsCustomError(true);
      return;
    }

    const found = sectorOccurrences.find((s) => s.id === soId);
    if (found) {
      setSelectedStandardId(found.id);
      setIsCustomError(false);
      setSeverity(found.severity);
    }
  };

  // Quick immediate action presets
  const quickActions = [
    'Item corrigido/substituído antes do envio',
    'Rótulo reimpresso com dados corretos',
    'Retornado para re-separação imediata',
    'Fórmula revisada com o farmacêutico',
    'Caixa re-embalada e peso retificado',
    'Logística reversa / reenvio emergencial',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      alert('Por favor, informe o número do Pedido.');
      return;
    }

    const finalPerson = isCustomPerson ? customPersonName.trim() : responsiblePerson.trim();
    if (!finalPerson) {
      alert('Por favor, selecione ou digite quem cometeu o erro.');
      return;
    }

    let finalErrorTitle = '';
    if (!selectedStandardId && !isCustomError) {
      alert('Por favor, selecione obrigatoriamente qual foi o erro ocorrido ou a opção "Outros".');
      return;
    }

    if (isCustomError) {
      if (!customDescription.trim()) {
        alert('Você selecionou a opção "Outros". Por favor, preencha o campo descrevendo a ocorrência detalhadamente.');
        return;
      }
      finalErrorTitle = 'Outros: ' + (customDescription.slice(0, 60) + (customDescription.length > 60 ? '...' : ''));
    } else {
      const found = sectorOccurrences.find((s) => s.id === selectedStandardId);
      if (!found) {
        alert('Por favor, selecione obrigatoriamente uma das opções de erro da lista.');
        return;
      }
      finalErrorTitle = found.title;
    }

    onSave({
      orderNumber: orderNumber.trim(),
      clientName: clientName.trim() || undefined,
      productInfo: productInfo.trim() || undefined,
      detectingSector,
      responsibleSector,
      responsiblePerson: finalPerson,
      errorTitle: finalErrorTitle,
      isCustomError,
      customDescription: customDescription.trim() || undefined,
      severity,
      immediateAction: immediateAction.trim() || 'Ação corretiva realizada pelo setor',
      status: 'aberta',
      registeredBy: activeUser.name,
      registeredById: activeUser.id,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setOrderNumber('');
    setClientName('');
    setProductInfo('');
    setCustomDescription('');
    setIsCustomError(false);
    setSelectedStandardId('');
    setImmediateAction('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Registro de Ocorrência (RNC)
                </h2>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Processo Anterior
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Registrado por: <strong className="text-white">{activeUser.name}</strong> ({sectors.find((s) => s.id === activeUser.sector)?.name || activeUser.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Pedido & Detecção */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              1. Identificação do Pedido e Onde Foi Detectado
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Order number */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nº do Pedido <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: #104928"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-black font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                />
              </div>

              {/* Client Name (Optional) */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente / Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Drogaria Saúde / Dra. Ana"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Detecting Sector */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Setor que Detectou a Falha
                </label>
                <select
                  value={detectingSector}
                  onChange={(e) => setDetectingSector(e.target.value as OrderSector)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.order}. {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product / Lot Info */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produto / Fórmula / Lote (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Minoxidil 5% Solução 60ml - Lote 2026/09"
                value={productInfo}
                onChange={(e) => setProductInfo(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Section 2: Qual Setor Foi o Erro (Processo Anterior) */}
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                2. Qual Setor Foi o Erro? (Origem da Falha)
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                Selecione o setor responsável
              </span>
            </div>

            {/* Grid of Sectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sectors.map((s) => {
                const isSelected = responsibleSector === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setResponsibleSector(s.id);
                      setSelectedStandardId('');
                      setIsCustomError(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-amber-600 border-amber-700 text-white shadow-sm ring-2 ring-amber-400'
                        : 'bg-white hover:bg-amber-100/50 border-amber-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {s.shortName}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="text-xs font-bold leading-snug">{s.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Quem Errou? */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                3. Quem Errou? (Colaborador Responsável)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCustomPerson(!isCustomPerson);
                  if (!isCustomPerson) setCustomPersonName('');
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {isCustomPerson ? '← Selecionar da Lista' : '+ Digitar Outro Nome'}
              </button>
            </div>

            {!isCustomPerson ? (
              <div>
                <select
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="">-- Selecione o colaborador que cometeu o erro --</option>
                  {sectorUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                  {users.filter(u => u.sector !== responsibleSector).map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role} - {sectors.find(s => s.id === u.sector)?.shortName || u.sector})
                    </option>
                  ))}
                </select>
                {sectorUsers.length === 0 && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Nenhum colaborador cadastrado diretamente neste setor. Você pode selecionar de outro setor ou clicar em "+ Digitar Outro Nome".
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Digite o nome completo do operador/colaborador"
                  value={customPersonName}
                  onChange={(e) => setCustomPersonName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 4: Qual Foi o Erro? (Seleção Obrigatória + Campo de Complemento) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                4. Qual Foi o Erro? (Seleção Obrigatória)
                <span className="text-rose-600 font-bold text-xs">*</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Setor: {sectors.find((s) => s.id === responsibleSector)?.name || responsibleSector}
              </span>
            </div>

            {/* List of Standard Errors for Sector */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {sectorOccurrences.map((so) => {
                const isSelected = !isCustomError && selectedStandardId === so.id;
                return (
                  <button
                    key={so.id}
                    type="button"
                    onClick={() => handleSelectStandardOccurrence(so.id)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-white/20' : 'border-slate-300 bg-white'}`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <span>{so.title}</span>
                    </div>
                    <span
                      className={`text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : so.severity === 'critica'
                          ? 'bg-red-100 text-red-700'
                          : so.severity === 'grave'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {so.severity}
                    </span>
                  </button>
                );
              })}

              {/* "OUTROS" Option Button */}
              <button
                type="button"
                onClick={() => handleSelectStandardOccurrence('outros')}
                className={`w-full p-2.5 rounded-lg border text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isCustomError
                    ? 'bg-amber-600 border-amber-700 text-white font-bold shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isCustomError ? 'border-white bg-white/20' : 'border-amber-400 bg-white'}`}>
                    {isCustomError && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Outros (Caso não tenha nas opções acima - Digitar Erro)</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isCustomError ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
                  Digitação Livre
                </span>
              </button>
            </div>

            {/* Field to Complement the Selected Option */}
            {isCustomError ? (
              <div className="mt-3 p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-950">
                    Descreva o Erro Ocorrido Detalhadamente <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                    Obrigatório
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Explique com clareza o que aconteceu, qual insumo, frasco, procedimento ou informação sofreu o erro..."
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed font-medium"
                />
              </div>
            ) : selectedStandardId ? (
              <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-blue-950">
                    Complemento / Detalhes da Opção Selecionada
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Complementar Opção
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Informe detalhes complementares da falha (ex: lote divergente, código do insumo, quantidade faltante/excedente, frasco trocado, etc.)..."
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-medium"
                />
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">
                  Selecione obrigatoriamente uma das opções acima para continuar e preencher o complemento.
                </span>
              </div>
            )}
          </div>

          {/* Section 5: Gravidade & Ação Imediata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gravidade */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                5. Gravidade da Ocorrência
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'leve', label: 'Leve', color: 'bg-emerald-500', activeBg: 'bg-emerald-600 text-white' },
                  { id: 'moderada', label: 'Média', color: 'bg-amber-500', activeBg: 'bg-amber-600 text-white' },
                  { id: 'grave', label: 'Grave', color: 'bg-orange-500', activeBg: 'bg-orange-600 text-white' },
                  { id: 'critica', label: 'Crítica', color: 'bg-rose-500', activeBg: 'bg-rose-600 text-white' },
                ].map((sev) => {
                  const isAct = severity === sev.id;
                  return (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSeverity(sev.id as RncSeverity)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isAct ? sev.activeBg : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sev.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ação Imediata Tomada */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                6. Ação Corretiva Imediata
              </label>
              <input
                type="text"
                placeholder="Ex: Refeito no ato, caixa repassada..."
                value={immediateAction}
                onChange={(e) => setImmediateAction(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-0.5">
                {quickActions.slice(0, 3).map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImmediateAction(act)}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 truncate whitespace-nowrap cursor-pointer"
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Registro de Ocorrência (RNC)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
