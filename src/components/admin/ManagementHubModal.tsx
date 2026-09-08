import React, { useState } from 'react';
import { 
  RncUser, 
  SectorInfo, 
  OrderSector, 
  UserPermissions, 
  UserRoleProfile, 
  StandardOccurrence,
  RncSeverity,
  AccessRequest 
} from '../../types/rnc';
import { 
  ROLE_PROFILE_OPTIONS, 
  DEFAULT_PROFILE_PERMISSIONS, 
  STAGE_COLOR_PRESETS,
  ORDER_SECTORS 
} from '../../data/rncData';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Check, 
  Building2, 
  Mail, 
  User, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Layers,
  ArrowUp,
  ArrowDown,
  PlusCircle,
  Clock,
  Users,
  Search,
  CheckCheck,
  Tag,
  Boxes,
  Truck,
  Headphones,
  RotateCcw,
  MessageCircle,
  Send,
  XCircle
} from 'lucide-react';
import { getWhatsAppShareUrl } from '../../utils/fullscreenHelper';

interface ManagementHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Users
  users: RncUser[];
  activeUser: RncUser;
  onSelectActiveUser: (user: RncUser) => void;
  onAddUser: (user: Omit<RncUser, 'id'>) => void;
  onUpdateUser: (user: RncUser) => void;
  onDeleteUser: (userId: string) => void;
  // Stages / Sectors
  sectors: SectorInfo[];
  onAddSector: (sector: Omit<SectorInfo, 'order'>) => void;
  onUpdateSector: (sector: SectorInfo) => void;
  onDeleteSector: (sectorId: string) => void;
  onReorderSectors: (reorderedSectors: SectorInfo[]) => void;
  onResetSectors: () => void;
  // Standard Occurrences
  standardOccurrences: StandardOccurrence[];
  onAddStandardOccurrence: (occurrence: Omit<StandardOccurrence, 'id'>) => void;
  onDeleteStandardOccurrence: (id: string) => void;
  // Access Requests
  accessRequests?: AccessRequest[];
  onApproveAccessRequest?: (requestId: string) => void;
  onRejectAccessRequest?: (requestId: string, reason?: string) => void;
}

export const ManagementHubModal: React.FC<ManagementHubModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUser,
  onSelectActiveUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  sectors,
  onAddSector,
  onUpdateSector,
  onDeleteSector,
  onReorderSectors,
  onResetSectors,
  standardOccurrences,
  onAddStandardOccurrence,
  onDeleteStandardOccurrence,
  accessRequests = [],
  onApproveAccessRequest,
  onRejectAccessRequest,
}) => {
  // Main Tab State
  const [mainTab, setMainTab] = useState<'users' | 'stages' | 'occurrences' | 'requests'>('users');
  const [requestFilterStatus, setRequestFilterStatus] = useState<'todos' | 'pendente' | 'aprovado' | 'rejeitado'>('pendente');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');

  // ================= USERS STATE =================
  const [userSubTab, setUserSubTab] = useState<'list' | 'create' | 'edit'>('list');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterSector, setUserFilterSector] = useState<string>('todos');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // User Form
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPin, setUserPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userProfile, setUserProfile] = useState<UserRoleProfile>('operador');
  const [userSector, setUserSector] = useState<string>(sectors[0]?.id || 'separacao');
  const [userEmail, setUserEmail] = useState('');
  const [userActive, setUserActive] = useState(true);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>(DEFAULT_PROFILE_PERMISSIONS.operador);

  // ================= STAGES STATE =================
  const [stageSubTab, setStageSubTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  // Stage Form
  const [stageName, setStageName] = useState('');
  const [stageShortName, setStageShortName] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [stageColorPreset, setStageColorPreset] = useState<string>('blue');
  const [stageSlaMinutes, setStageSlaMinutes] = useState<number>(15);
  const [stageActive, setStageActive] = useState(true);

  // ================= OCCURRENCES TAB STATE =================
  const [selectedOccSector, setSelectedOccSector] = useState<string>(sectors[0]?.id || 'separacao');
  const [newOccTitle, setNewOccTitle] = useState('');
  const [newOccSeverity, setNewOccSeverity] = useState<RncSeverity>('moderada');

  if (!isOpen) return null;

  // ----------------------------------------------------
  // USERS HANDLERS
  // ----------------------------------------------------
  const handleProfileChange = (newProfile: UserRoleProfile) => {
    setUserProfile(newProfile);
    const profileOpt = ROLE_PROFILE_OPTIONS.find((p) => p.id === newProfile);
    if (profileOpt && !userRole.trim()) {
      setUserRole(profileOpt.defaultRoleName);
    }
    setUserPermissions({ ...DEFAULT_PROFILE_PERMISSIONS[newProfile] });
  };

  const handleTogglePermission = (permKey: keyof UserPermissions) => {
    setUserPermissions((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  const handleGenerateRandomPin = () => {
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    setUserPin(randomPin);
  };

  const resetUserForm = () => {
    setUserName('');
    setUserUsername('');
    setUserPin('1234');
    setShowPin(false);
    setUserRole('');
    setUserProfile('operador');
    setUserSector(sectors[0]?.id || 'separacao');
    setUserEmail('');
    setUserActive(true);
    setUserPermissions(DEFAULT_PROFILE_PERMISSIONS.operador);
    setEditingUserId(null);
  };

  const handleStartCreateUser = () => {
    resetUserForm();
    setUserSubTab('create');
  };

  const handleStartEditUser = (user: RncUser) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserUsername(user.username || user.name.toLowerCase().replace(/\s+/g, '.'));
    setUserPin(user.pin || '1234');
    setShowPin(false);
    setUserRole(user.role);
    setUserProfile(user.profile || 'operador');
    setUserSector(user.sector);
    setUserEmail(user.email || '');
    setUserActive(user.active);
    setUserPermissions(user.permissions || DEFAULT_PROFILE_PERMISSIONS[user.profile || 'operador']);
    setUserSubTab('edit');
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Por favor, informe o nome completo do colaborador.');
      return;
    }
    if (!userPin.trim()) {
      alert('Por favor, informe um PIN ou senha de acesso.');
      return;
    }

    const generatedUsername = userUsername.trim() || userName.toLowerCase().replace(/\s+/g, '.');

    if (userSubTab === 'create') {
      onAddUser({
        name: userName.trim(),
        username: generatedUsername,
        pin: userPin.trim(),
        role: userRole.trim() || 'Operador',
        profile: userProfile,
        sector: userSector as OrderSector,
        email: userEmail.trim() || undefined,
        active: userActive,
        permissions: userPermissions,
      });
    } else if (userSubTab === 'edit' && editingUserId) {
      const existing = users.find((u) => u.id === editingUserId);
      if (existing) {
        onUpdateUser({
          ...existing,
          name: userName.trim(),
          username: generatedUsername,
          pin: userPin.trim(),
          role: userRole.trim() || existing.role,
          profile: userProfile,
          sector: userSector as OrderSector,
          email: userEmail.trim() || undefined,
          active: userActive,
          permissions: userPermissions,
        });
      }
    }

    resetUserForm();
    setUserSubTab('list');
  };

  // ----------------------------------------------------
  // STAGES HANDLERS
  // ----------------------------------------------------
  const resetStageForm = () => {
    setStageName('');
    setStageShortName('');
    setStageDescription('');
    setStageColorPreset('blue');
    setStageSlaMinutes(15);
    setStageActive(true);
    setEditingStageId(null);
  };

  const handleStartCreateStage = () => {
    resetStageForm();
    setStageSubTab('create');
  };

  const handleStartEditStage = (sector: SectorInfo) => {
    setEditingStageId(sector.id);
    setStageName(sector.name);
    setStageShortName(sector.shortName);
    setStageDescription(sector.description || '');
    // Find matching preset
    const matchingPreset = STAGE_COLOR_PRESETS.find((p) => p.color === sector.color) || STAGE_COLOR_PRESETS[0];
    setStageColorPreset(matchingPreset.id);
    setStageSlaMinutes(sector.slaMinutes || 15);
    setStageActive(sector.active !== false);
    setStageSubTab('edit');
  };

  const handleSaveStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) {
      alert('Por favor, informe o nome da etapa do processo.');
      return;
    }

    const shortName = stageShortName.trim() || stageName.trim().slice(0, 14);
    const selectedPreset = STAGE_COLOR_PRESETS.find((p) => p.id === stageColorPreset) || STAGE_COLOR_PRESETS[0];

    if (stageSubTab === 'create') {
      const generatedId = stageName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || `etapa_${Date.now()}`;

      // Check if ID already exists
      const finalId = sectors.some((s) => s.id === generatedId) ? `${generatedId}_${Date.now()}` : generatedId;

      onAddSector({
        id: finalId,
        name: stageName.trim(),
        shortName,
        description: stageDescription.trim() || 'Etapa integrante do fluxo operacional',
        color: selectedPreset.color,
        textColor: selectedPreset.textColor,
        borderColor: selectedPreset.borderColor,
        bgLight: selectedPreset.bgLight,
        slaMinutes: stageSlaMinutes > 0 ? stageSlaMinutes : undefined,
        active: stageActive,
      });
    } else if (stageSubTab === 'edit' && editingStageId) {
      const existing = sectors.find((s) => s.id === editingStageId);
      if (existing) {
        onUpdateSector({
          ...existing,
          name: stageName.trim(),
          shortName,
          description: stageDescription.trim() || existing.description,
          color: selectedPreset.color,
          textColor: selectedPreset.textColor,
          borderColor: selectedPreset.borderColor,
          bgLight: selectedPreset.bgLight,
          slaMinutes: stageSlaMinutes > 0 ? stageSlaMinutes : undefined,
          active: stageActive,
        });
      }
    }

    resetStageForm();
    setStageSubTab('list');
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newSectors = [...sectors];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSectors.length) return;

    const temp = newSectors[index];
    newSectors[index] = newSectors[targetIndex];
    newSectors[targetIndex] = temp;

    // Re-assign order numbers 1..N
    const renumbered = newSectors.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));

    onReorderSectors(renumbered);
  };

  const handleDeleteStagePrompt = (sector: SectorInfo) => {
    // Check if users are assigned to this sector
    const usersInSector = users.filter((u) => u.sector === sector.id);
    if (usersInSector.length > 0) {
      const confirmDelete = confirm(
        `Atenção: Existem ${usersInSector.length} colaborador(es) vinculado(s) à etapa "${sector.name}". Se excluir, eles ficarão sem etapa definida. Deseja continuar?`
      );
      if (!confirmDelete) return;
    } else {
      const confirmDelete = confirm(`Deseja realmente excluir a etapa "${sector.name}" do fluxo?`);
      if (!confirmDelete) return;
    }

    onDeleteSector(sector.id);
  };

  // ----------------------------------------------------
  // OCCURRENCES HANDLERS
  // ----------------------------------------------------
  const handleAddOccurrenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccTitle.trim()) {
      alert('Por favor, digite o título da não conformidade padrão.');
      return;
    }

    onAddStandardOccurrence({
      sector: selectedOccSector as OrderSector,
      title: newOccTitle.trim(),
      severity: newOccSeverity,
    });

    setNewOccTitle('');
  };

  // Filtering users
  const filteredUsers = users.filter((u) => {
    const matchesSector = userFilterSector === 'todos' || u.sector === userFilterSector;
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const occurrencesForSelectedSector = standardOccurrences.filter(
    (o) => o.sector === selectedOccSector
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Central de Cadastros: Etapas & Usuários
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40">
                  Acesso Master • {activeUser.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure as etapas do fluxo do pedido, cadastre colaboradores, defina PINs de acesso e gerencie as falhas padrão.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              setMainTab('users');
              setUserSubTab('list');
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'users'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Colaboradores & Permissões</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setMainTab('stages');
              setStageSubTab('list');
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'stages'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Etapas do Processo (Fluxo)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
              {sectors.length} Etapas
            </span>
          </button>

          <button
            onClick={() => setMainTab('occurrences')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'occurrences'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>3. Falhas Padrão por Setor</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
              {standardOccurrences.length}
            </span>
          </button>

          <button
            onClick={() => setMainTab('requests')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'requests'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>4. Solicitações de Acesso</span>
            {accessRequests.filter((r) => r.status === 'pendente').length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                {accessRequests.filter((r) => r.status === 'pendente').length} Pendente{accessRequests.filter((r) => r.status === 'pendente').length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                {accessRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">

          {/* ==================================================================== */}
          {/* TAB 1: USUÁRIOS & PERMISSÕES */}
          {/* ==================================================================== */}
          {mainTab === 'users' && (
            <div>
              {/* Sub-actions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserSubTab('list')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userSubTab === 'list'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Equipe Cadastrada ({users.length})
                  </button>

                  <button
                    onClick={handleStartCreateUser}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      userSubTab === 'create'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-500/10 text-amber-800 border border-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Novo Colaborador</span>
                  </button>
                </div>

                {userSubTab === 'list' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, login..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-44 sm:w-56"
                      />
                    </div>

                    {/* Sector Filter */}
                    <select
                      value={userFilterSector}
                      onChange={(e) => setUserFilterSector(e.target.value)}
                      className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="todos">Todos os Setores ({users.length})</option>
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>
                          Setor: {s.name} ({users.filter((u) => u.sector === s.id).length})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* LIST VIEW */}
              {userSubTab === 'list' && (
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                      <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">Nenhum colaborador encontrado</p>
                      <p className="text-xs text-slate-400 mt-1">Tente ajustar seus filtros de busca ou cadastre um novo usuário.</p>
                      <button
                        onClick={handleStartCreateUser}
                        className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                      >
                        + Cadastrar Colaborador
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredUsers.map((user) => {
                        const sectorInfo = sectors.find((s) => s.id === user.sector);
                        const isMaster = user.profile === 'admin' || user.id === 'u1';
                        const isCurrentActive = user.id === activeUser.id;

                        return (
                          <div
                            key={user.id}
                            className={`bg-white rounded-2xl p-4 border transition-all ${
                              isCurrentActive
                                ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20'
                                : 'border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs ${
                                  isMaster ? 'bg-amber-600' : 'bg-slate-800'
                                }`}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                                    {isMaster && (
                                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                        MASTER
                                      </span>
                                    )}
                                    {isCurrentActive && (
                                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        CONECTADO
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {user.role} • <span className="font-mono text-[11px] text-slate-400">@{user.username}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Sector Badge */}
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                                sectorInfo?.bgLight || 'bg-slate-50'
                              } ${sectorInfo?.textColor || 'text-slate-700'} ${sectorInfo?.borderColor || 'border-slate-200'}`}>
                                {sectorInfo?.shortName || user.sector}
                              </span>
                            </div>

                            {/* User details row */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-400">PIN de Acesso:</span>
                                <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                                  {user.pin || '1234'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStartEditUser(user)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Editar colaborador e permissões"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {!isMaster && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Deseja realmente excluir o colaborador ${user.name}?`)) {
                                        onDeleteUser(user.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Excluir colaborador"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* CREATE / EDIT USER FORM */}
              {(userSubTab === 'create' || userSubTab === 'edit') && (
                <form onSubmit={handleSaveUserSubmit} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      {userSubTab === 'create' ? 'Cadastrar Novo Colaborador' : `Editar: ${userName}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setUserSubTab('list')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      ← Voltar para lista
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome Completo do Colaborador *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Amanda Souza, Marcos Vinicius"
                        value={userName}
                        onChange={(e) => {
                          setUserName(e.target.value);
                          if (userSubTab === 'create') {
                            setUserUsername(e.target.value.toLowerCase().trim().replace(/\s+/g, '.'));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Login / Username */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome de Usuário (Login) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: amanda.souza"
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Cargo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cargo / Função Operacional *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Operador de Separação, Conferente Final"
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Setor / Etapa Vinculada */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Setor / Etapa de Lotação *
                      </label>
                      <select
                        value={userSector}
                        onChange={(e) => setUserSector(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {sectors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.order}. {s.name} ({s.shortName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Perfil de Acesso */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Perfil de Acesso Pré-configurado
                      </label>
                      <select
                        value={userProfile}
                        onChange={(e) => handleProfileChange(e.target.value as UserRoleProfile)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {ROLE_PROFILE_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PIN / Senha */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Senha / PIN de Acesso *
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUserPin('1234')}
                            className="text-[10px] text-amber-700 font-bold hover:underline"
                          >
                            Padrão (1234)
                          </button>
                          <button
                            type="button"
                            onClick={handleGenerateRandomPin}
                            className="text-[10px] text-blue-700 font-bold hover:underline"
                          >
                            Gerar Aleatório
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type={showPin ? 'text' : 'password'}
                          required
                          value={userPin}
                          onChange={(e) => setUserPin(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissões Granulares */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Permissões Operacionais
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'canRegisterRnc' as const, label: 'Registrar Novas Ocorrências (RNC)' },
                        { key: 'canResolveRnc' as const, label: 'Dar Tratativa & Concluir Ocorrências' },
                        { key: 'canDeleteRnc' as const, label: 'Excluir Registros de Não Conformidade' },
                        { key: 'canManageUsers' as const, label: 'Gerenciar Etapas e Colaboradores' },
                        { key: 'canManageStandardOccurrences' as const, label: 'Editar Catálogo de Falhas Padrão' },
                        { key: 'canExportReports' as const, label: 'Exportar Relatórios & Fichas' },
                      ].map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={userPermissions[perm.key]}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                          />
                          <span>{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setUserSubTab('list')}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{userSubTab === 'create' ? 'Salvar Colaborador' : 'Salvar Alterações'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: ETAPAS DO PROCESSO / ESTEIRA */}
          {/* ==================================================================== */}
          {mainTab === 'stages' && (
            <div>
              {/* Stages Sub-actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    Cadeia de Etapas do Fluxo do Pedido ({sectors.length} Etapas Ativas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    A ordem das etapas abaixo define a esteira operacional e mapeia de qual setor anterior veio a falha.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartCreateStage}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Nova Etapa do Processo</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Deseja restaurar a cadeia de etapas para a configuração padrão original da fábrica?')) {
                        onResetSectors();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Restaurar etapas originais"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Restaurar Padrão</span>
                  </button>
                </div>
              </div>

              {/* LIST / CARDS VIEW */}
              {stageSubTab === 'list' && (
                <div className="space-y-3">
                  {sectors.map((sector, index) => {
                    const isFirst = index === 0;
                    const isLast = index === sectors.length - 1;
                    const matchingPreset = STAGE_COLOR_PRESETS.find((p) => p.color === sector.color) || STAGE_COLOR_PRESETS[0];
                    const usersCount = users.filter((u) => u.sector === sector.id).length;
                    const occsCount = standardOccurrences.filter((o) => o.sector === sector.id).length;

                    return (
                      <div
                        key={sector.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Stage Info */}
                        <div className="flex items-start sm:items-center gap-3.5 flex-1">
                          {/* Order number badge */}
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${sector.color} text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0`}>
                            {index + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">{sector.name}</h4>
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${sector.bgLight} ${sector.textColor} ${sector.borderColor}`}>
                                {sector.shortName}
                              </span>
                              {sector.slaMinutes && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  SLA: {sector.slaMinutes} min
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{sector.description}</p>
                            
                            {/* Meta stats */}
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <strong className="text-slate-600">{usersCount}</strong> colaboradores vinculados
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                <strong className="text-slate-600">{occsCount}</strong> falhas padrão cadastradas
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reorder and Edit Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            disabled={isFirst}
                            onClick={() => handleMoveStage(index, 'up')}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                              isFirst
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                            }`}
                            title="Mover etapa para cima no fluxo"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={isLast}
                            onClick={() => handleMoveStage(index, 'down')}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                              isLast
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                            }`}
                            title="Mover etapa para baixo no fluxo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleStartEditStage(sector)}
                            className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Editar etapa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {sectors.length > 2 && (
                            <button
                              onClick={() => handleDeleteStagePrompt(sector)}
                              className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Excluir etapa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CREATE / EDIT STAGE FORM */}
              {(stageSubTab === 'create' || stageSubTab === 'edit') && (
                <form onSubmit={handleSaveStageSubmit} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      {stageSubTab === 'create' ? 'Cadastrar Nova Etapa do Processo' : `Editar Etapa: ${stageName}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStageSubTab('list')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      ← Voltar para lista
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nome Completo da Etapa */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome da Etapa / Setor *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Almoxarifado, Pesagem & Dosagem, Controle de Qualidade"
                        value={stageName}
                        onChange={(e) => {
                          setStageName(e.target.value);
                          if (stageSubTab === 'create' && !stageShortName) {
                            setStageShortName(e.target.value.slice(0, 14));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Nome Curto / Sigla */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sigla / Nome Curto (Para badges e esteira) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Almox., Pesagem, CQ Físico"
                        value={stageShortName}
                        onChange={(e) => setStageShortName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Descrição */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Descrição das Atividades da Etapa
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Recebimento de matéria-prima, conferência de laudos e quarentena de insumos"
                        value={stageDescription}
                        onChange={(e) => setStageDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* SLA Estimado */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tempo Médio Estimado (SLA em minutos)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={stageSlaMinutes}
                        onChange={(e) => setStageSlaMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStageSubTab('list')}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{stageSubTab === 'create' ? 'Salvar Nova Etapa' : 'Salvar Alterações'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: FALHAS PADRÃO POR ETAPA */}
          {/* ==================================================================== */}
          {mainTab === 'occurrences' && (
            <div className="space-y-4">
              {/* Sector selector */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Selecione a Etapa para gerenciar as falhas pré-cadastradas:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {sectors.map((s) => {
                    const isSelected = selectedOccSector === s.id;
                    const occsCount = standardOccurrences.filter((o) => o.sector === s.id).length;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedOccSector(s.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <span>{s.order}. {s.shortName}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {occsCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add standard occurrence form */}
              <form onSubmit={handleAddOccurrenceSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                  Adicionar Nova Falha Padrão para Etapa: {sectors.find((s) => s.id === selectedOccSector)?.name}
                </h4>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lote divergente, lacre rompido, ausência de assinatura..."
                    value={newOccTitle}
                    onChange={(e) => setNewOccTitle(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <select
                    value={newOccSeverity}
                    onChange={(e) => setNewOccSeverity(e.target.value as RncSeverity)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
                  >
                    <option value="leve">Severidade: Leve</option>
                    <option value="moderada">Severidade: Moderada</option>
                    <option value="grave">Severidade: Grave</option>
                    <option value="critica">Severidade: Crítica</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </form>

              {/* Occurrences List */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Falhas Cadastradas ({occurrencesForSelectedSector.length})
                </h4>

                {occurrencesForSelectedSector.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Nenhuma falha padrão cadastrada para este setor. Use o formulário acima para adicionar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {occurrencesForSelectedSector.map((occ) => (
                      <div
                        key={occ.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            occ.severity === 'critica'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : occ.severity === 'grave'
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : occ.severity === 'moderada'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {occ.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{occ.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteStandardOccurrence(occ.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover falha padrão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: SOLICITAÇÕES DE ACESSO */}
          {/* ==================================================================== */}
          {mainTab === 'requests' && (
            <div className="space-y-4">
              {/* Header and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 mr-1">Filtrar:</span>
                  {(['pendente', 'aprovado', 'rejeitado', 'todos'] as const).map((st) => {
                    const count = st === 'todos' 
                      ? accessRequests.length 
                      : accessRequests.filter((r) => r.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setRequestFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          requestFilterStatus === st
                            ? st === 'pendente'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : st === 'aprovado'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'rejeitado'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className="capitalize">{st === 'todos' ? 'Todas' : st === 'pendente' ? 'Pendentes' : st === 'aprovado' ? 'Aprovadas' : 'Rejeitadas'}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-black">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou login..."
                    value={requestSearchTerm}
                    onChange={(e) => setRequestSearchTerm(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Requests List */}
              {(() => {
                const filtered = accessRequests.filter((req) => {
                  const matchesStatus = requestFilterStatus === 'todos' || req.status === requestFilterStatus;
                  const matchesSearch = 
                    req.fullName.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
                    req.username.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
                    req.role.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
                    req.id.toLowerCase().includes(requestSearchTerm.toLowerCase());
                  return matchesStatus && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        Nenhuma solicitação de acesso encontrada.
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Novos colaboradores podem solicitar cadastro diretamente na tela inicial de login através do botão "Solicitar Acesso".
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((req) => {
                      const sectorObj = sectors.find((s) => s.id === req.sector);
                      return (
                        <div
                          key={req.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                {req.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-black text-slate-900">
                                    {req.fullName}
                                  </h4>
                                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {req.id}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                  Login sugerido: <strong className="text-slate-800">{req.username}</strong> • Senha/PIN: <strong className="text-slate-800">{req.pin}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                req.status === 'pendente'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                  : req.status === 'aprovado'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}>
                                {req.status === 'pendente' ? 'Pendente de Aprovação' : req.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                              </span>
                            </div>
                          </div>

                          {/* Request Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Setor & Função</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${sectorObj?.color || 'bg-slate-700'}`}>
                                  {sectorObj?.name || req.sector}
                                </span>
                                <span className="font-medium text-slate-800">{req.role}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Contatos</span>
                              <div className="space-y-0.5 mt-0.5">
                                {req.email && <div className="truncate text-slate-600">{req.email}</div>}
                                {req.phone && <div className="text-slate-800 font-medium">{req.phone}</div>}
                                {!req.email && !req.phone && <span className="text-slate-400 italic">Nenhum contato informado</span>}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Data da Solicitação</span>
                              <div className="mt-0.5 text-slate-600">
                                {new Date(req.requestedAt).toLocaleString('pt-BR')}
                              </div>
                            </div>
                          </div>

                          {req.reason && (
                            <div className="text-xs bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-amber-950">
                              <strong className="text-amber-900 block text-[10px] uppercase font-black">Justificativa do Solicitante:</strong>
                              <p className="mt-0.5 italic">"{req.reason}"</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              {req.phone && (
                                <a
                                  href={`https://wa.me/55${req.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${req.fullName}, recebemos sua solicitação de acesso ao Sistema RNC.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>

                            {req.status === 'pendente' && onApproveAccessRequest && (
                              <div className="flex items-center gap-2">
                                {onRejectAccessRequest && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const reasonPrompt = window.prompt('Motivo da recusa (opcional):');
                                      if (reasonPrompt !== null) {
                                        onRejectAccessRequest(req.id, reasonPrompt);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Recusar</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onApproveAccessRequest(req.id)}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Aprovar e Liberar Acesso</span>
                                </button>
                              </div>
                            )}

                            {req.status === 'aprovado' && (
                              <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovado por {req.reviewedBy || 'Administrador'} em {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('pt-BR') : 'Hoje'}</span>
                              </div>
                            )}

                            {req.status === 'rejeitado' && (
                              <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Recusado por {req.reviewedBy || 'Administrador'}. {req.reviewNotes ? `Motivo: ${req.reviewNotes}` : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-medium">
            Painel Administrativo da Qualidade • Alterações sincronizadas em tempo real
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
