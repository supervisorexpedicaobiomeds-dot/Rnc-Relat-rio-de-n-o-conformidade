import React, { useState } from 'react';
import { StandardOccurrence, OrderSector, RncSeverity, SectorInfo } from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';
import { 
  X, 
  Plus, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  Sliders
} from 'lucide-react';

interface RncStandardOccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  occurrences: StandardOccurrence[];
  onAddOccurrence: (occ: Omit<StandardOccurrence, 'id'>) => void;
  onDeleteOccurrence: (occId: string) => void;
  sectors?: SectorInfo[];
}

export const RncStandardOccurrenceModal: React.FC<RncStandardOccurrenceModalProps> = ({
  isOpen,
  onClose,
  occurrences,
  onAddOccurrence,
  onDeleteOccurrence,
  sectors = ORDER_SECTORS,
}) => {
  const [selectedSector, setSelectedSector] = useState<OrderSector>(sectors[0]?.id || 'separacao');
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState<RncSeverity>('moderada');

  const filteredOccurrences = occurrences.filter((o) => o.sector === selectedSector);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Por favor, informe o texto da ocorrência padrão.');
      return;
    }

    onAddOccurrence({
      sector: selectedSector,
      title: newTitle.trim(),
      severity: newSeverity,
    });

    setNewTitle('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Textos de Ocorrências Padrão por Setor
              </h2>
              <p className="text-xs text-slate-300">
                Personalize os erros comuns pré-cadastrados para agilizar o lançamento das RNCs.
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

        {/* Sector Selector */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {sectors.map((s) => {
              const count = occurrences.filter((o) => o.sector === s.id).length;
              const isSelected = selectedSector === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSector(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {s.shortName} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Add New Occurrence Form */}
          <form onSubmit={handleAdd} className="bg-purple-50/60 p-4 rounded-xl border border-purple-200/80 space-y-3">
            <div className="text-xs font-black uppercase text-purple-950 tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-purple-700" />
              Adicionar Novo Texto Padrão para {sectors.find((s) => s.id === selectedSector)?.name || selectedSector}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="Ex: Frasco com lacre de segurança rompido..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Gravidade Sugerida:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'leve', label: 'Leve' },
                      { id: 'moderada', label: 'Média' },
                      { id: 'grave', label: 'Grave' },
                      { id: 'critica', label: 'Crítica' },
                    ].map((sev) => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setNewSeverity(sev.id as RncSeverity)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          newSeverity === sev.id
                            ? 'bg-purple-700 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-100'
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-black text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </div>
          </form>

          {/* Current List for Selected Sector */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
              <span>Textos cadastrados para este setor ({filteredOccurrences.length})</span>
              <span className="text-[11px] text-slate-400">* A opção "Outros" é sempre exibida no formulário</span>
            </div>

            {filteredOccurrences.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhum texto cadastrado para este setor ainda. Use o formulário acima para adicionar.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOccurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-800">{occ.title}</div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span
                          className={`uppercase font-bold px-1.5 py-0.2 rounded ${
                            occ.severity === 'critica'
                              ? 'bg-red-100 text-red-700'
                              : occ.severity === 'grave'
                              ? 'bg-orange-100 text-orange-700'
                              : occ.severity === 'moderada'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          Gravidade: {occ.severity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteOccurrence(occ.id)}
                      title="Excluir texto padrão"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
