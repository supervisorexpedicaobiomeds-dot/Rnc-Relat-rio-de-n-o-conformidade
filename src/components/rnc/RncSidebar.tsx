import React from 'react';
import { RncUser, UserPermissions } from '../../types/rnc';
import { 
  Plus, 
  Layers, 
  BarChart3, 
  Sliders, 
  Share2, 
  LogOut, 
  ShieldAlert, 
  ClipboardList, 
  User, 
  CheckCircle,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export type MainNavTab = 'dashboard' | 'reports';

interface RncSidebarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  activeUser: RncUser;
  userPerms: UserPermissions;
  onOpenNewRnc: () => void;
  onOpenManagementHub: () => void;
  onOpenStandardOccurrences: () => void;
  onOpenShareModal: () => void;
  onOpenAccessRequest?: () => void;
  pendingRequestsCount?: number;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const RncSidebar: React.FC<RncSidebarProps> = ({
  activeTab,
  onSelectTab,
  activeUser,
  userPerms,
  onOpenNewRnc,
  onOpenManagementHub,
  onOpenStandardOccurrences,
  onOpenShareModal,
  onOpenAccessRequest,
  pendingRequestsCount = 0,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const isMasterUser = activeUser.profile === 'admin' || activeUser.role?.toLowerCase().includes('master');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white flex flex-col justify-between z-50 border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Biomeds
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  RNC
                </span>
              </div>
              <h1 className="text-sm font-black text-white leading-none mt-0.5">
                Gestão de Qualidade
              </h1>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation & Actions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Primary Action: + REGISTRAR NOVA RNC */}
          <div>
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onOpenNewRnc();
              }}
              title="Registrar nova não conformidade operacional"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-98 cursor-pointer group"
            >
              <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
              <span>REGISTRAR NOVA RNC</span>
            </button>
          </div>

          {/* Main Views Navigation */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Navegação Principal
            </span>

            {/* Tab: Operational Dashboard */}
            <button
              onClick={() => {
                onSelectTab('dashboard');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Painel Operacional</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Tab: Reports & Analytics Area */}
            <button
              onClick={() => {
                onSelectTab('reports');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'reports' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Área de Relatórios</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Métricas
              </span>
            </button>
          </div>

          {/* Administration & Configuration Section */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Gestão & Configuração
            </span>

            {/* Management Hub */}
            {userPerms.canManageUsers && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenManagementHub();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition-colors cursor-pointer"
                title="Cadastro e Gestão de Etapas do Fluxo, Usuários e Permissões"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Gestão de Etapas & Usuários</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Standard Occurrences Manager */}
            {userPerms.canManageStandardOccurrences && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenStandardOccurrences();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
                title="Cadastrar e editar catálogo de falhas padrão por setor"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Falhas Padrão por Setor</span>
              </button>
            )}

            {/* Request Access Button in Sidebar */}
            {onOpenAccessRequest && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenAccessRequest();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Solicitar novo cadastro de usuário e senha"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Solicitar Novo Acesso</span>
              </button>
            )}

            {/* Direct Link to Application */}
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onOpenShareModal();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 border border-amber-400/20 transition-colors cursor-pointer"
              title="Gerar e compartilhar link direto para os usuários abrirem a aplicação"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Link Direto da Aplicação</span>
            </button>
          </div>
        </div>

        {/* Bottom User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2">
            {/* User Profile Card */}
            <div
              onClick={() => {
                if (userPerms.canManageUsers) {
                  onOpenManagementHub();
                }
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
              title={activeUser.name}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-black text-xs text-slate-950 shrink-0 shadow-md">
                {activeUser.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs truncate block">
                    {activeUser.name}
                  </span>
                  {activeUser.profile === 'admin' && (
                    <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-500 text-slate-950">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {activeUser.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sair / Trocar de Colaborador"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
