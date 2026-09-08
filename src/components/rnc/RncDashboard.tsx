import React, { useState, useMemo } from 'react';
import { 
  OccurrenceRecord, 
  RncUser, 
  StandardOccurrence, 
  OrderSector, 
  RncSeverity, 
  RncStatus,
  SectorInfo 
} from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';
import { RncFormModal } from './RncFormModal';
import { AccessManagementModal } from '../auth/AccessManagementModal';
import { RncStandardOccurrenceModal } from './RncStandardOccurrenceModal';
import { RncDetailModal } from './RncDetailModal';
import { ShareFullscreenModal } from '../common/ShareFullscreenModal';
import { ManagementHubModal } from '../admin/ManagementHubModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  Users, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight, 
  FileText, 
  Trash2, 
  Eye, 
  RefreshCw,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  LogOut,
  KeyRound,
  ShieldAlert,
  Share2,
  Maximize2,
  Layers,
  Settings,
  Menu,
  BarChart3
} from 'lucide-react';

interface RncDashboardProps {
  records: OccurrenceRecord[];
  users: RncUser[];
  activeUser: RncUser;
  sectors?: SectorInfo[];
  standardOccurrences: StandardOccurrence[];
  onSaveRecord: (record: Omit<OccurrenceRecord, 'id' | 'createdAt'>) => void;
  onUpdateRecordStatus: (id: string, status: RncStatus, resolutionNote?: string) => void;
  onDeleteRecord: (id: string) => void;
  onSelectActiveUser: (user: RncUser) => void;
  onAddUser: (user: Omit<RncUser, 'id'>) => void;
  onUpdateUser: (user: RncUser) => void;
  onDeleteUser: (userId: string) => void;
  onAddSector?: (sector: Omit<SectorInfo, 'order'>) => void;
  onUpdateSector?: (sector: SectorInfo) => void;
  onDeleteSector?: (sectorId: string) => void;
  onReorderSectors?: (reorderedSectors: SectorInfo[]) => void;
  onResetSectors?: () => void;
  onAddStandardOccurrence: (occ: Omit<StandardOccurrence, 'id'>) => void;
  onDeleteStandardOccurrence: (occId: string) => void;
  onResetData: () => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
  onNavigateToReports?: () => void;
}

export const RncDashboard: React.FC<RncDashboardProps> = ({
  records,
  users,
  activeUser,
  sectors = ORDER_SECTORS,
  standardOccurrences,
  onSaveRecord,
  onUpdateRecordStatus,
  onDeleteRecord,
  onSelectActiveUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddSector,
  onUpdateSector,
  onDeleteSector,
  onReorderSectors,
  onResetSectors,
  onAddStandardOccurrence,
  onDeleteStandardOccurrence,
  onResetData,
  onLogout,
  onToggleMobileMenu,
  onNavigateToReports,
}) => {
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManagementHubOpen, setIsManagementHubOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isStandardOccModalOpen, setIsStandardOccModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<OccurrenceRecord | null>(null);
  const [initialFormSector, setInitialFormSector] = useState<OrderSector | undefined>(undefined);

  // User permissions shortcuts
  const userPerms = activeUser.permissions || {
    canRegisterRnc: true,
    canResolveRnc: true,
    canDeleteRnc: true,
    canManageUsers: true,
    canManageStandardOccurrences: true,
    canExportReports: true,
  };

  // Check if active user is Master / Administrator
  const isMasterUser = activeUser.profile === 'admin' || activeUser.role?.toLowerCase().includes('master');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponsibleSector, setSelectedResponsibleSector] = useState<OrderSector | 'todos'>('todos');
  const [selectedDetectingSector, setSelectedDetectingSector] = useState<OrderSector | 'todos'>('todos');
  const [selectedStatus, setSelectedStatus] = useState<RncStatus | 'todos'>('todos');
  const [selectedSeverity, setSelectedSeverity] = useState<RncSeverity | 'todos'>('todos');

  // Calculate RNC counts by responsible sector
  const rncCountsByResponsible = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.responsibleSector] = (counts[r.responsibleSector] || 0) + 1;
    });
    return counts;
  }, [records]);

  // KPIs
  const totalRNCs = records.length;
  const openRNCs = records.filter((r) => r.status === 'aberta' || r.status === 'em_analise').length;
  const resolvedRNCs = records.filter((r) => r.status === 'resolvida').length;
  const resolutionRate = totalRNCs > 0 ? Math.round((resolvedRNCs / totalRNCs) * 100) : 100;

  // Most frequent sector with errors
  const mostFrequentSector = useMemo(() => {
    let topSector: OrderSector | null = null;
    let maxCount = 0;
    Object.entries(rncCountsByResponsible).forEach(([sec, val]) => {
      const count = Number(val);
      if (count > maxCount) {
        maxCount = count;
        topSector = sec as OrderSector;
      }
    });
    return { sector: topSector, count: maxCount };
  }, [rncCountsByResponsible]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesOrder = rec.orderNumber.toLowerCase().includes(term);
        const matchesClient = rec.clientName?.toLowerCase().includes(term);
        const matchesPerson = rec.responsiblePerson.toLowerCase().includes(term);
        const matchesError = rec.errorTitle.toLowerCase().includes(term);
        const matchesCustom = rec.customDescription?.toLowerCase().includes(term);
        if (!matchesOrder && !matchesClient && !matchesPerson && !matchesError && !matchesCustom) {
          return false;
        }
      }

      // Responsible sector
      if (selectedResponsibleSector !== 'todos' && rec.responsibleSector !== selectedResponsibleSector) {
        return false;
      }

      // Detecting sector
      if (selectedDetectingSector !== 'todos' && rec.detectingSector !== selectedDetectingSector) {
        return false;
      }

      // Status
      if (selectedStatus !== 'todos' && rec.status !== selectedStatus) {
        return false;
      }

      // Severity
      if (selectedSeverity !== 'todos' && rec.severity !== selectedSeverity) {
        return false;
      }

      return true;
    });
  }, [records, searchTerm, selectedResponsibleSector, selectedDetectingSector, selectedStatus, selectedSeverity]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Data/Hora',
      'Pedido',
      'Cliente',
      'Setor Origem (Quem Errou)',
      'Responsavel (Quem Errou)',
      'Setor Detector',
      'Registrado Por',
      'Ocorrencia',
      'Descricao Outros',
      'Gravidade',
      'Status',
      'Acao Imediata',
      'Notas'
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      new Date(r.createdAt).toLocaleString('pt-BR'),
      r.orderNumber,
      `"${(r.clientName || '').replace(/"/g, '""')}"`,
      sectors.find((s) => s.id === r.responsibleSector)?.name || r.responsibleSector,
      `"${r.responsiblePerson.replace(/"/g, '""')}"`,
      sectors.find((s) => s.id === r.detectingSector)?.name || r.detectingSector,
      `"${r.registeredBy.replace(/"/g, '""')}"`,
      `"${r.errorTitle.replace(/"/g, '""')}"`,
      `"${(r.customDescription || '').replace(/"/g, '""')}"`,
      r.severity,
      r.status,
      `"${(r.immediateAction || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_rnc_ocorrencias_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topSectorInfo = mostFrequentSector.sector ? sectors.find((s) => s.id === mostFrequentSector.sector) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 border border-white/10 transition-colors cursor-pointer shrink-0 mt-0.5"
                title="Abrir Menu Lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  Controle de Qualidade & Processos
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">RNC - Registro de Não Conformidade</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                Painel Operacional de Ocorrências
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Mapeamento do caminho do pedido para registrar falhas do processo anterior, quem errou, qual foi o erro e ação corretiva imediata.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            {onNavigateToReports && (
              <button
                onClick={onNavigateToReports}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ir para a Área de Relatórios e Métricas"
              >
                <BarChart3 className="w-4 h-4 text-indigo-300" />
                <span>Área de Relatórios</span>
              </button>
            )}

            {/* Primary Action: New RNC */}
            <button
              onClick={() => {
                if (!userPerms.canRegisterRnc) {
                  alert('Acesso Restrito: Seu usuário não tem permissão para registrar novas não conformidades.');
                  return;
                }
                setInitialFormSector(undefined);
                setIsFormOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>+ REGISTRAR NOVA RNC</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total RNCs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Total de RNCs</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalRNCs}</div>
          <div className="text-[11px] text-slate-400 mt-1">Registros no histórico</div>
        </div>

        {/* Open / Under Review */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Abertas / Em Análise</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900">{openRNCs}</div>
          <div className="text-[11px] text-amber-700 mt-1">Requerem tratativa</div>
        </div>

        {/* Top Responsible Sector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Maior Reincidência</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 truncate">
            {topSectorInfo ? topSectorInfo.name : 'Nenhum'}
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">
            {mostFrequentSector.count} falha(s) originada(s)
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Taxa de Resolução</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{resolutionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{resolvedRNCs} de {totalRNCs} resolvidas</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nº do Pedido, Cliente, Quem Errou ou Ocorrência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Responsible Sector Filter */}
            <select
              value={selectedResponsibleSector}
              onChange={(e) => setSelectedResponsibleSector(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[190px]"
            >
              <option value="todos">Setor RNC: Todos</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  Setor RNC: {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="todos">Status: Todos</option>
              <option value="aberta">Abertas</option>
              <option value="em_analise">Em Análise</option>
              <option value="resolvida">Resolvidas</option>
              <option value="improcedente">Improcedentes</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="todos">Gravidade: Todas</option>
              <option value="leve">Leve</option>
              <option value="moderada">Média</option>
              <option value="grave">Grave</option>
              <option value="critica">Crítica</option>
            </select>

            {/* Detecting Sector */}
            <select
              value={selectedDetectingSector}
              onChange={(e) => setSelectedDetectingSector(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[180px]"
            >
              <option value="todos">Detectado em: Todos</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  Det: {s.shortName}
                </option>
              ))}
            </select>

            {/* Export CSV Button */}
            <button
              onClick={() => {
                if (userPerms.canExportReports) {
                  handleExportCSV();
                } else {
                  alert('Acesso Restrito: Seu perfil de usuário não possui permissão para exportar relatórios.');
                }
              }}
              title="Exportar registros filtrados para Excel/CSV"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* RNC Occurrence Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="text-xs font-bold text-slate-700">
            Exibindo <strong>{filteredRecords.length}</strong> de <strong>{records.length}</strong> ocorrências
          </div>
          {filteredRecords.length !== records.length && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedResponsibleSector('todos');
                setSelectedDetectingSector('todos');
                setSelectedStatus('todos');
                setSelectedSeverity('todos');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhuma ocorrência encontrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhum registro corresponde aos filtros selecionados ou nenhuma RNC foi registrada ainda.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Nova RNC</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Protocolo / Data</th>
                  <th className="py-3 px-3">Pedido</th>
                  <th className="py-3 px-3">Origem do Erro</th>
                  <th className="py-3 px-3">Detectado Em</th>
                  <th className="py-3 px-4">Ocorrência Registrada</th>
                  <th className="py-3 px-3">Gravidade</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
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
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecordForDetail(rec)}
                    >
                      {/* Protocolo / Data */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-black text-slate-900">{rec.id}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">{formattedDate}</div>
                      </td>

                      {/* Pedido */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-black text-blue-700">{rec.orderNumber}</div>
                      </td>

                      {/* Origem do Erro */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span>{respSector?.name || rec.responsibleSector}</span>
                        </div>
                      </td>

                      {/* Detectado Em */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-700">
                          {detSector?.shortName || detSector?.name || rec.detectingSector}
                        </div>
                      </td>

                      {/* Ocorrência Registrada */}
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

                      {/* Gravidade */}
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

                      {/* Status */}
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

                      {/* Ações */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecordForDetail(rec)}
                            title="Ver Ficha / Processo Completo"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {rec.status !== 'resolvida' && userPerms.canResolveRnc && (
                            <button
                              onClick={() => onUpdateRecordStatus(rec.id, 'resolvida')}
                              title="Marcar como Resolvida"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {userPerms.canDeleteRnc && (
                            <button
                              onClick={() => {
                                if (confirm(`Excluir o registro ${rec.id}?`)) {
                                  onDeleteRecord(rec.id);
                                }
                              }}
                              title="Excluir Registro"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Modal Components */}
      <RncFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={onSaveRecord}
        activeUser={activeUser}
        users={users}
        sectors={sectors}
        standardOccurrences={standardOccurrences}
        initialSector={initialFormSector}
      />

      {/* Unified Management Hub for Stages, Users, and Occurrences */}
      <ManagementHubModal
        isOpen={isManagementHubOpen}
        onClose={() => setIsManagementHubOpen(false)}
        users={users}
        activeUser={activeUser}
        onSelectActiveUser={onSelectActiveUser}
        onAddUser={onAddUser}
        onUpdateUser={onUpdateUser}
        onDeleteUser={onDeleteUser}
        sectors={sectors}
        onAddSector={onAddSector || (() => {})}
        onUpdateSector={onUpdateSector || (() => {})}
        onDeleteSector={onDeleteSector || (() => {})}
        onReorderSectors={onReorderSectors || (() => {})}
        onResetSectors={onResetSectors || (() => {})}
        standardOccurrences={standardOccurrences}
        onAddStandardOccurrence={onAddStandardOccurrence}
        onDeleteStandardOccurrence={onDeleteStandardOccurrence}
      />

      <AccessManagementModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        users={users}
        activeUser={activeUser}
        onSelectActiveUser={onSelectActiveUser}
        onAddUser={onAddUser}
        onUpdateUser={onUpdateUser}
        onDeleteUser={onDeleteUser}
      />

      <RncStandardOccurrenceModal
        isOpen={isStandardOccModalOpen}
        onClose={() => setIsStandardOccModalOpen(false)}
        occurrences={standardOccurrences}
        sectors={sectors}
        onAddOccurrence={onAddStandardOccurrence}
        onDeleteOccurrence={onDeleteStandardOccurrence}
      />

      <RncDetailModal
        record={selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onUpdateStatus={onUpdateRecordStatus}
        currentUserName={activeUser.name}
        sectors={sectors}
        canResolve={userPerms.canResolveRnc}
        canExportReports={userPerms.canExportReports}
      />

      <ShareFullscreenModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
