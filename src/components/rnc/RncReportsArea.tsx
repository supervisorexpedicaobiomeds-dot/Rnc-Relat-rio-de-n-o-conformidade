import React, { useState, useMemo } from 'react';
import { OccurrenceRecord, SectorInfo, RncUser, OrderSector, RncSeverity, RncStatus } from '../../types/rnc';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  ShieldAlert, 
  ArrowRight,
  Search,
  FileSpreadsheet,
  PieChart,
  Activity,
  User,
  Eye,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface RncReportsAreaProps {
  records: OccurrenceRecord[];
  sectors: SectorInfo[];
  users: RncUser[];
  activeUser: RncUser;
  onOpenDetail?: (record: OccurrenceRecord) => void;
}

type PeriodFilter = 'all' | 'today' | '7days' | '30days' | 'month';

export const RncReportsArea: React.FC<RncReportsAreaProps> = ({
  records,
  sectors,
  users,
  activeUser,
  onOpenDetail,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [filterSector, setFilterSector] = useState<OrderSector | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<RncSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RncStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter records by period and criteria
  const filteredRecords = useMemo(() => {
    const now = new Date();

    return records.filter((r) => {
      const recordDate = new Date(r.createdAt);

      // Period Filter
      if (period === 'today') {
        const isToday =
          recordDate.getDate() === now.getDate() &&
          recordDate.getMonth() === now.getMonth() &&
          recordDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (period === '7days') {
        const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (period === '30days') {
        const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      } else if (period === 'month') {
        const isSameMonth =
          recordDate.getMonth() === now.getMonth() &&
          recordDate.getFullYear() === now.getFullYear();
        if (!isSameMonth) return false;
      }

      // Sector Filter
      if (filterSector !== 'all' && r.responsibleSector !== filterSector) {
        return false;
      }

      // Severity Filter
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) {
        return false;
      }

      // Status Filter
      if (filterStatus !== 'all' && r.status !== filterStatus) {
        return false;
      }

      // Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesOrder = r.orderNumber.toLowerCase().includes(term);
        const matchesError = r.errorTitle.toLowerCase().includes(term);
        const matchesCustom = r.customDescription?.toLowerCase().includes(term);
        const matchesPerson = r.responsiblePerson.toLowerCase().includes(term);
        if (!matchesOrder && !matchesError && !matchesCustom && !matchesPerson) {
          return false;
        }
      }

      return true;
    });
  }, [records, period, filterSector, filterSeverity, filterStatus, searchTerm]);

  // Key Metrics
  const totalRnc = filteredRecords.length;
  const resolvedCount = filteredRecords.filter((r) => r.status === 'resolvida').length;
  const openCount = filteredRecords.filter((r) => r.status === 'aberta').length;
  const inAnalysisCount = filteredRecords.filter((r) => r.status === 'em_analise').length;
  const criticalCount = filteredRecords.filter((r) => r.severity === 'critica').length;
  const graveCount = filteredRecords.filter((r) => r.severity === 'grave').length;
  const resolutionRate = totalRnc > 0 ? Math.round((resolvedCount / totalRnc) * 100) : 100;

  // RNCs grouped by Responsible Sector
  const sectorBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    sectors.forEach((s) => {
      counts[s.id] = 0;
    });
    filteredRecords.forEach((r) => {
      counts[r.responsibleSector] = (counts[r.responsibleSector] || 0) + 1;
    });

    return sectors
      .map((s) => ({
        ...s,
        count: counts[s.id] || 0,
        percentage: totalRnc > 0 ? Math.round(((counts[s.id] || 0) / totalRnc) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords, sectors, totalRnc]);

  // Top Sector Offender
  const topOffenderSector = sectorBreakdown[0]?.count > 0 ? sectorBreakdown[0] : null;

  // Group by Detecting Sector (Where it was found)
  const detectingBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.detectingSector] = (counts[r.detectingSector] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([secId, count]) => {
        const sectorInfo = sectors.find((s) => s.id === secId);
        return {
          id: secId,
          name: sectorInfo?.name || secId,
          shortName: sectorInfo?.shortName || secId,
          count,
          percentage: totalRnc > 0 ? Math.round((count / totalRnc) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords, sectors, totalRnc]);

  // Top Occurrences (Pareto)
  const topOccurrences = useMemo(() => {
    const counts: Record<string, { title: string; count: number; severity: RncSeverity; sector: OrderSector }> = {};
    filteredRecords.forEach((r) => {
      const key = r.errorTitle;
      if (!counts[key]) {
        counts[key] = { title: key, count: 0, severity: r.severity, sector: r.responsibleSector };
      }
      counts[key].count += 1;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRecords]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('Nenhum registro no filtro atual para exportação.');
      return;
    }

    const headers = [
      'Protocolo RNC',
      'Data de Registro',
      'Pedido',
      'Setor Origem (Quem Errou)',
      'Responsável pelo Erro',
      'Setor de Deteccao (Onde Foi Visto)',
      'Auditado Por',
      'Ocorrência / Falha',
      'Complemento / Detalhes',
      'Gravidade',
      'Status',
      'Acao Imediata',
      'Observacoes'
    ];

    const rows = filteredRecords.map((r) => {
      const respSector = sectors.find((s) => s.id === r.responsibleSector)?.name || r.responsibleSector;
      const detSector = sectors.find((s) => s.id === r.detectingSector)?.name || r.detectingSector;
      const formattedDate = new Date(r.createdAt).toLocaleString('pt-BR');

      return [
        r.id,
        `"${formattedDate}"`,
        r.orderNumber,
        `"${respSector}"`,
        `"${r.responsiblePerson}"`,
        `"${detSector}"`,
        `"${r.registeredBy}"`,
        `"${r.errorTitle.replace(/"/g, '""')}"`,
        `"${(r.customDescription || '').replace(/"/g, '""')}"`,
        r.severity.toUpperCase(),
        r.status.toUpperCase(),
        `"${(r.immediateAction || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_analitico_rnc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Export Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Inteligência de Qualidade & Rastreabilidade
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Área de Relatórios & Indicadores Gerenciais (RNC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise consolidada de incidências, causas-raiz, taxa de resolução e desempenho por setor.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Exportar planilha analítica em CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Imprimir relatório gerencial formatado"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Período:
            </span>
            {[
              { id: 'all', label: 'Todo o Histórico' },
              { id: 'today', label: 'Hoje' },
              { id: '7days', label: 'Últimos 7 Dias' },
              { id: '30days', label: 'Últimos 30 Dias' },
              { id: 'month', label: 'Mês Atual' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as PeriodFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por pedido, ocorrência..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Setor de Origem:
            </label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="all">Todos os Setores</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Nível de Gravidade:
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="all">Todas as Gravidades</option>
              <option value="critica">Crítica</option>
              <option value="grave">Grave</option>
              <option value="moderada">Moderada</option>
              <option value="leve">Leve</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Status da RNC:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="aberta">Aberta</option>
              <option value="em_analise">Em Análise</option>
              <option value="resolvida">Resolvida</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total RNCs */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de RNCs</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalRnc}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">no filtro selecionado</div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxa de Resolução</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{resolutionRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{resolvedCount} de {totalRnc} concluídas</div>
          </div>
        </div>

        {/* Critical & Grave */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Críticas & Graves</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600">{criticalCount + graveCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{criticalCount} críticas • {graveCount} graves</div>
          </div>
        </div>

        {/* Open / Pending */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pendentes</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700">{openCount + inAnalysisCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{openCount} abertas • {inAnalysisCount} em análise</div>
          </div>
        </div>

        {/* Principal Offender */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Maior Incidência</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 truncate">
              {topOffenderSector ? topOffenderSector.name : 'Nenhum'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-semibold">
              {topOffenderSector ? `${topOffenderSector.count} RNCs (${topOffenderSector.percentage}%)` : 'Sem falhas'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: RNCs by Responsible Sector */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Origem das Falhas por Setor (Ofensores)
              </h3>
              <p className="text-[11px] text-slate-500">
                Distribuição de não conformidades geradas em cada etapa operacional.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {sectorBreakdown.map((sec) => {
              const maxCount = sectorBreakdown[0]?.count || 1;
              const barWidth = maxCount > 0 ? Math.round((sec.count / maxCount) * 100) : 0;

              return (
                <div key={sec.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${sec.count > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      {sec.name} ({sec.shortName})
                    </span>
                    <span className="font-mono font-black text-slate-700">
                      {sec.count} <span className="text-[10px] text-slate-400 font-normal">({sec.percentage}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sec.count > 0
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top Occurrences (Pareto) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Principais Causas-Raiz & Reincidências
              </h3>
              <p className="text-[11px] text-slate-500">
                Ocorrências com maior frequência para direcionamento de treinamento.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {topOccurrences.length > 0 ? (
              topOccurrences.map((occ, idx) => {
                const sectorName = sectors.find((s) => s.id === occ.sector)?.shortName || occ.sector;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {occ.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span>Setor: <strong>{sectorName}</strong></span>
                          <span>•</span>
                          <span className={`font-bold uppercase ${
                            occ.severity === 'critica' ? 'text-rose-600' :
                            occ.severity === 'grave' ? 'text-orange-600' : 'text-amber-600'
                          }`}>
                            {occ.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-black text-slate-900 text-xs shadow-xs">
                        {occ.count}x
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                Nenhuma ocorrência encontrada para o filtro atual.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detection Audit vs Error Origin */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Barreira de Qualidade: Onde os Erros Foram Detectados
            </h3>
            <p className="text-[11px] text-slate-500">
              Setores que atuaram como conferência/barreira para evitar envio de falhas aos clientes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {detectingBreakdown.map((det) => (
            <div key={det.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-blue-900 truncate">
                {det.name}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-blue-950 font-mono">{det.count}</span>
                <span className="text-[10px] font-bold text-blue-700">{det.percentage}% das detecções</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytical Detail Table for Reporting & Printing */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Listagem Analítica de Ocorrências ({filteredRecords.length} Registros)
            </h3>
            <p className="text-xs text-slate-500">
              Documento oficial de rastreabilidade de não conformidades para auditoria.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Gerado por: <strong className="text-slate-900">{activeUser.name}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Protocolo / Data</th>
                <th className="py-3 px-3">Pedido</th>
                <th className="py-3 px-3">Origem (Setor)</th>
                <th className="py-3 px-3">Detectado Em</th>
                <th className="py-3 px-4">Descrição da Não Conformidade</th>
                <th className="py-3 px-3">Gravidade</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const respSector = sectors.find((s) => s.id === rec.responsibleSector);
                const detSector = sectors.find((s) => s.id === rec.detectingSector);
                const formattedDate = new Date(rec.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onOpenDetail && onOpenDetail(rec)}
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="font-black text-slate-900">{rec.id}</div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">{formattedDate}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-black text-blue-700">{rec.orderNumber}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span>{respSector?.name || rec.responsibleSector}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-700">
                        {detSector?.shortName || detSector?.name || rec.detectingSector}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {rec.errorTitle}
                      </div>
                      {rec.customDescription && (
                        <div className="text-[11px] text-amber-800 italic line-clamp-1 mt-0.5 bg-amber-50 px-1 rounded">
                          "{rec.customDescription}"
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        Ação: {rec.immediateAction}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          rec.severity === 'critica'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : rec.severity === 'grave'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : rec.severity === 'moderada'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {rec.severity}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          rec.status === 'resolvida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'em_analise'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail && onOpenDetail(rec);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Ver Processo Completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
