import React from 'react';
import { LabelCategory, LabelTemplate } from '../types';
import { LABEL_TEMPLATES } from '../data/templates';
import { 
  FlaskConical, 
  Truck, 
  Box, 
  CreditCard, 
  ShoppingBag, 
  FolderArchive,
  Layers,
  Sparkles,
  Check,
  AlertTriangle
} from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: LabelTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Modelos', icon: Layers },
    { id: 'quarentena', label: 'Quarentena & CQ', icon: AlertTriangle },
    { id: 'laboratorio', label: 'Laboratório & Saúde', icon: FlaskConical },
    { id: 'logistica', label: 'Logística & Caixas', icon: Truck },
    { id: 'patrimonio', label: 'Patrimônio & Ativos', icon: Box },
    { id: 'cracha', label: 'Crachás & Acesso', icon: CreditCard },
    { id: 'varejo', label: 'Produtos & Varejo', icon: ShoppingBag },
    { id: 'personalizado', label: 'Arquivos & Geral', icon: FolderArchive },
  ];

  const filteredTemplates = selectedCategory === 'todos'
    ? LABEL_TEMPLATES
    : LABEL_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTemplates.map((tmpl) => {
          const isSelected = tmpl.id === selectedTemplateId;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className={`group relative p-3.5 rounded-xl border-2 cursor-pointer transition-all bg-white flex flex-col justify-between text-left ${
                isSelected
                  ? 'border-blue-600 shadow-md ring-2 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tmpl.style.headerColor || tmpl.style.borderColor }}
                    />
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {tmpl.title}
                    </h4>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      <Check className="w-3 h-3" /> Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              {/* Meta details footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {tmpl.style.widthMm} x {tmpl.style.heightMm} mm
                </span>
                <span className="text-[10px] text-slate-400">
                  {tmpl.fields.length} campos • {tmpl.style.barcodeType}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
