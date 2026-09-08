import React, { useState } from 'react';
import { RncUser, OrderSector, UserPermissions, UserRoleProfile } from '../../types/rnc';
import { ORDER_SECTORS, ROLE_PROFILE_OPTIONS, DEFAULT_PROFILE_PERMISSIONS } from '../../data/rncData';
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
  EyeOff
} from 'lucide-react';

interface AccessManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: RncUser[];
  activeUser: RncUser;
  onSelectActiveUser: (user: RncUser) => void;
  onAddUser: (user: Omit<RncUser, 'id'>) => void;
  onUpdateUser: (user: RncUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const AccessManagementModal: React.FC<AccessManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUser,
  onSelectActiveUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedFilterSector, setSelectedFilterSector] = useState<OrderSector | 'todos'>('todos');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [role, setRole] = useState('');
  const [profile, setProfile] = useState<UserRoleProfile>('operador');
  const [sector, setSector] = useState<OrderSector>('separacao');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PROFILE_PERMISSIONS.operador);

  if (!isOpen) return null;

  const handleProfileChange = (newProfile: UserRoleProfile) => {
    setProfile(newProfile);
    const profileOpt = ROLE_PROFILE_OPTIONS.find((p) => p.id === newProfile);
    if (profileOpt && !role.trim()) {
      setRole(profileOpt.defaultRoleName);
    }
    // Auto populate permissions preset
    setPermissions({ ...DEFAULT_PROFILE_PERMISSIONS[newProfile] });
  };

  const handleTogglePermission = (permKey: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  const handleGenerateRandomPin = () => {
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    setPin(randomPin);
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPin('1234');
    setShowPin(false);
    setRole('');
    setProfile('operador');
    setSector('separacao');
    setEmail('');
    setActive(true);
    setPermissions(DEFAULT_PROFILE_PERMISSIONS.operador);
    setEditingUserId(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab('create');
  };

  const handleStartEdit = (user: RncUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username || user.name.toLowerCase().replace(/\s+/g, '.'));
    setPin(user.pin || '1234');
    setShowPin(false);
    setRole(user.role);
    setProfile(user.profile || 'operador');
    setSector(user.sector);
    setEmail(user.email || '');
    setActive(user.active);
    setPermissions(user.permissions || DEFAULT_PROFILE_PERMISSIONS[user.profile || 'operador']);
    setActiveTab('edit');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome completo do usuário.');
      return;
    }

    if (!pin.trim()) {
      alert('Por favor, informe um PIN ou senha de acesso.');
      return;
    }

    const generatedUsername = username.trim() || name.toLowerCase().replace(/\s+/g, '.');

    if (activeTab === 'create') {
      onAddUser({
        name: name.trim(),
        username: generatedUsername,
        pin: pin.trim(),
        role: role.trim() || 'Operador',
        profile,
        sector,
        email: email.trim() || undefined,
        active,
        permissions,
      });
    } else if (activeTab === 'edit' && editingUserId) {
      const existing = users.find((u) => u.id === editingUserId);
      if (existing) {
        onUpdateUser({
          ...existing,
          name: name.trim(),
          username: generatedUsername,
          pin: pin.trim(),
          role: role.trim() || existing.role,
          profile,
          sector,
          email: email.trim() || undefined,
          active,
          permissions,
        });
      }
    }

    resetForm();
    setActiveTab('list');
  };

  const filteredUsers = users.filter((u) => {
    if (selectedFilterSector === 'todos') return true;
    return u.sector === selectedFilterSector;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Controle de Acessos & Permissões
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Administração
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Crie novos usuários, defina senhas/PINs e configure as permissões de cada colaborador no fluxo RNC.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Equipe Cadastrada ({users.length})
          </button>

          <button
            onClick={handleStartCreate}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Novo Usuário & Permissões</span>
          </button>

          {activeTab === 'edit' && (
            <button
              className="pb-3 text-xs font-bold border-b-2 border-amber-600 text-amber-900 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Usuário: {name}</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Top controls: Filter & Quick Add button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs font-bold text-slate-600 shrink-0">Setor:</span>
                  <button
                    onClick={() => setSelectedFilterSector('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedFilterSector === 'todos'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Todos ({users.length})
                  </button>
                  {ORDER_SECTORS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedFilterSector(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        selectedFilterSector === s.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {s.shortName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleStartCreate}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Usuário</span>
                </button>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUsers.map((user) => {
                  const sectorInfo = ORDER_SECTORS.find((s) => s.id === user.sector);
                  const isCurrent = user.id === activeUser.id;
                  const perms = user.permissions || DEFAULT_PROFILE_PERMISSIONS.operador;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {user.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{user.name}</h4>
                                {isCurrent && (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-600 text-white">
                                    VOCÊ
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {user.role} • <strong className="text-slate-700">{sectorInfo?.name}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(user)}
                              title="Editar dados e permissões"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {users.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`Excluir o usuário "${user.name}"?`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                title="Excluir usuário"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Login & PIN indicator */}
                        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400">Usuário:</span>{' '}
                            <strong className="font-mono text-slate-800">{user.username || user.name.toLowerCase().replace(/\s+/g, '.')}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">PIN:</span>{' '}
                            <strong className="font-mono text-slate-800">{user.pin || '1234'}</strong>
                          </div>
                          <div className="ml-auto">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>

                        {/* Permissions Badges */}
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Permissões Ativas:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {perms.canRegisterRnc && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                📝 Registrar RNC
                              </span>
                            )}
                            {perms.canResolveRnc && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                🩺 Resolver / Tratar
                              </span>
                            )}
                            {perms.canDeleteRnc && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                                🗑️ Excluir
                              </span>
                            )}
                            {perms.canManageUsers && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                                👥 Gerenciar Acessos
                              </span>
                            )}
                            {perms.canManageStandardOccurrences && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                                ⚙️ Falhas Padrão
                              </span>
                            )}
                            {perms.canExportReports && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                                📊 Relatórios
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Switch to this user button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectActiveUser(user);
                              alert(`Operando agora como: ${user.name}`);
                            }}
                            className="text-xs font-bold text-slate-700 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Trocar para este usuário</span>
                            <span>→</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Usuário atualmente ativo</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTab === 'create' || activeTab === 'edit') && (
            <form onSubmit={handleSaveSubmit} className="space-y-6 max-w-2xl mx-auto">
              {/* Section 1: User Basic Information */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Dados Cadastrais do Usuário</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!username && activeTab === 'create') {
                          setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                        }
                      }}
                      placeholder="Ex: João da Silva Santos"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nome de Usuário (Login) *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Ex: joao.silva"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* PIN / Password with generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Senha / PIN de Acesso (4-6 dígitos) *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomPin}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Gerar PIN</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Ex: 1234"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Role / Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Cargo / Função Exibida
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Ex: Conferente de Qualidade"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Primary Sector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Setor Principal de Atuação *
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value as OrderSector)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {ORDER_SECTORS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.order}. {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      E-mail (Opcional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* User Status */}
                  <div className="flex items-center gap-3 pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-xs font-bold text-slate-700">
                        {active ? 'Usuário Ativo (Pode Acessar)' : 'Usuário Inativo (Bloqueado)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Preset Profile & Permissions Matrix */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Nível de Acesso & Matriz de Permissões</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Selecione um perfil ou personalize as chaves abaixo
                  </span>
                </div>

                {/* Profile Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Perfil Base de Permissões:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {ROLE_PROFILE_OPTIONS.map((opt) => {
                      const isSelected = profile === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleProfileChange(opt.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                            {opt.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Granular Permission Toggles */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    Permissões Granulares Específicas:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. canRegisterRnc */}
                    <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={permissions.canRegisterRnc}
                        onChange={() => handleTogglePermission('canRegisterRnc')}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Registrar Ocorrências (RNC)</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          Permite abrir novos registros de não conformidades no fluxo do pedido.
                        </div>
                      </div>
                    </label>

                    {/* 2. canResolveRnc */}
                    <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={permissions.canResolveRnc}
                        onChange={() => handleTogglePermission('canResolveRnc')}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Dar Tratativa & Resolver RNCs</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          Permite alterar status para Em Análise, Resolvida ou Improcedente e inserir notas.
                        </div>
                      </div>
                    </label>

                    {/* 3. canDeleteRnc */}
                    <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={permissions.canDeleteRnc}
                        onChange={() => handleTogglePermission('canDeleteRnc')}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Excluir Registros de RNC</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          Permite apagar permanentemente ocorrências do banco de dados.
                        </div>
                      </div>
                    </label>

                    {/* 4. canManageUsers */}
                    <label className="p-3 bg-amber-50/50 border border-amber-300 rounded-xl flex items-start gap-3 cursor-pointer hover:border-amber-400">
                      <input
                        type="checkbox"
                        checked={permissions.canManageUsers}
                        onChange={() => handleTogglePermission('canManageUsers')}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <span>Criar Usuários & Gerenciar Permissões</span>
                          <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-black">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-800 leading-tight">
                          Acesso a esta tela de controle de acessos, senhas e cadastro da equipe.
                        </div>
                      </div>
                    </label>

                    {/* 5. canManageStandardOccurrences */}
                    <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={permissions.canManageStandardOccurrences}
                        onChange={() => handleTogglePermission('canManageStandardOccurrences')}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Gerenciar Falhas Padrão</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          Permite adicionar ou remover textos de ocorrências pré-definidas por setor.
                        </div>
                      </div>
                    </label>

                    {/* 6. canExportReports */}
                    <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={permissions.canExportReports}
                        onChange={() => handleTogglePermission('canExportReports')}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Exportar Relatórios & Fichas</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          Permite baixar planilhas CSV e imprimir fichas formais de RNC.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{activeTab === 'create' ? 'CRIAR USUÁRIO & SALVAR PERMISSÕES' : 'SALVAR ALTERAÇÕES DO USUÁRIO'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Usuário conectado: <strong>{activeUser.name}</strong> ({activeUser.role})
          </span>
          <span className="text-[11px] text-slate-400">
            Alterações entram em vigor imediatamente para todos os colaboradores.
          </span>
        </div>
      </div>
    </div>
  );
};
