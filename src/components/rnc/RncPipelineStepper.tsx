import React from 'react';
import { OrderSector, SectorInfo } from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';
import { 
  FileEdit, 
  FlaskConical, 
  Boxes, 
  Tag, 
  Layers, 
  CheckCheck, 
  Truck, 
  Headphones, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface RncPipelineStepperProps {
  sectors?: SectorInfo[];
  selectedSector?: OrderSector | 'todos';
  onSelectSector?: (sector: OrderSector | 'todos') => void;
  rncCountsByResponsibleSector?: Record<string, number>;
  rncCountsByDetectingSector?: Record<string, number>;
}

const getSectorIcon = (sectorId: OrderSector) => {
  switch (sectorId) {
    case 'inclusao':
      return FileEdit;
    case 'conferencia_farmaceutica':
      return FlaskConical;
    case 'separacao':
      return Boxes;
    case 'rotulagem':
      return Tag;
    case 'colagem':
      return Layers;
    case 'conferencia_final':
      return CheckCheck;
    case 'expedicao':
      return Truck;
    case 'sac':
      return Headphones;
    default:
      return Layers;
  }
};

export const RncPipelineStepper: React.FC<RncPipelineStepperProps> = ({
  sectors = ORDER_SECTORS,
  selectedSector = 'todos',
  onSelectSector,
  rncCountsByResponsibleSector = {},
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              Fluxo do Pedido
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
              Mapeamento dos Setores e RNC de Processo Anterior
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize onde as falhas foram originadas na cadeia. Clique em um setor para filtrar as ocorrências.
          </p>
        </div>

        {onSelectSector && selectedSector !== 'todos' && (
          <button
            onClick={() => onSelectSector('todos')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            Limpar Filtro ({sectors.find((s) => s.id === selectedSector)?.shortName || selectedSector})
          </button>
        )}
      </div>

      {/* Stepper horizontal pipeline */}
      <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
        <div className="flex items-center min-w-[820px] justify-between gap-1.5">
          {sectors.map((sector, index) => {
            const Icon = getSectorIcon(sector.id);
            const isSelected = selectedSector === sector.id;
            const errorCount = rncCountsByResponsibleSector[sector.id] || 0;
            const isLast = index === sectors.length - 1;

            return (
              <React.Fragment key={sector.id}>
                {/* Sector Step Node */}
                <button
                  onClick={() => onSelectSector && onSelectSector(isSelected ? 'todos' : sector.id)}
                  className={`group relative flex-1 flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                      : 'bg-slate-50 hover:bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Error Count Pill (or spacer) */}
                  <div className="flex items-center justify-end w-full mb-1 h-4 px-0.5">
                    {errorCount > 0 ? (
                      <span
                        title={`${errorCount} RNC(s) originadas neste setor`}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {errorCount}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>

                  {/* Icon circle */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm'
                        : `bg-gradient-to-br ${sector.color} text-white shadow-xs`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Sector Title */}
                  <span
                    className={`text-xs font-bold leading-tight line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {sector.shortName}
                  </span>

                  <span
                    className={`text-[9.5px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {sector.order === 8 ? 'Pós-Venda' : 'Processo'}
                  </span>
                </button>

                {/* Arrow connector between steps */}
                {!isLast && (
                  <div className="shrink-0 text-slate-300 px-0.5 flex flex-col items-center">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
