import React, { useState, useEffect } from 'react';
import { RncUser, OrderSector, SectorInfo } from '../../types/rnc';
import { ORDER_SECTORS } from '../../data/rncData';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Info,
  ShieldCheck,
  Building2,
  Maximize2,
  Share2,
  ExternalLink,
  UserPlus,
  Copy,
  Check,
  MessageCircle,
  Globe
} from 'lucide-react';
import { 
  isFullscreenRequestedInUrl, 
  triggerBrowserFullscreen, 
  getCleanAppUrl, 
  getWhatsAppShareUrl 
} from '../../utils/fullscreenHelper';

interface LoginScreenProps {
  users: RncUser[];
  onLogin: (user: RncUser) => void;
  onOpenShareModal?: () => void;
  onOpenAccessRequest?: () => void;
  sectors?: SectorInfo[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  users, 
  onLogin, 
  onOpenShareModal, 
  onOpenAccessRequest, 
  sectors = ORDER_SECTORS 
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterSector, setFilterSector] = useState<OrderSector | 'todos'>('todos');
  const [copiedDirectLink, setCopiedDirectLink] = useState<boolean>(false);

  const directAppUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  const handleCopyDirectLink = () => {
    const url = directAppUrl || getCleanAppUrl();
    navigator.clipboard.writeText(url);
    setCopiedDirectLink(true);
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const url = directAppUrl || getCleanAppUrl();
    const msg = `📋 *Biomeds - Painel de Ocorrências RNC*\n\nOlá equipe! Acesse o sistema diretamente pelo link abaixo:\n🔗 ${url}\n\nEntre com seu usuário e senha/PIN de acesso.`;
    window.open(getWhatsAppShareUrl(msg), '_blank');
  };
  const [isFsParamPresent, setIsFsParamPresent] = useState<boolean>(false);

  useEffect(() => {
    setIsFsParamPresent(isFullscreenRequestedInUrl());

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const sectorParam = searchParams.get('sector') || searchParams.get('setor');
      if (sectorParam && (sectorParam === 'todos' || sectors.some((s) => s.id === sectorParam))) {
        setFilterSector(sectorParam as OrderSector | 'todos');
        const userInSector = users.find((u) => u.active && u.sector === sectorParam);
        if (userInSector) {
          setSelectedUserId(userInSector.id);
        }
      }

      const userParam = searchParams.get('user') || searchParams.get('usuario');
      if (userParam && users.some((u) => u.id === userParam)) {
        setSelectedUserId(userParam);
        const targetUser = users.find((u) => u.id === userParam);
        if (targetUser?.sector) {
          setFilterSector(targetUser.sector);
        }
      }
    }
  }, [users, sectors]);

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleKeypadPress = (digit: string) => {
    setErrorMsg('');
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setErrorMsg('');
    setPin('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      setErrorMsg('Selecione um usuário para continuar.');
      return;
    }

    if (!pin.trim()) {
      setErrorMsg('Digite a senha ou PIN de acesso.');
      return;
    }

    setIsSubmitting(true);

    // If fullscreen is requested in URL, expand right now
    if (isFsParamPresent) {
      await triggerBrowserFullscreen();
    }

    // Validate PIN/Password
    setTimeout(() => {
      const userPin = selectedUser.pin || '1234';
      if (pin.trim() === userPin) {
        setErrorMsg('');
        onLogin({
          ...selectedUser,
          lastLogin: new Date().toISOString(),
        });
      } else {
        setErrorMsg('Senha ou PIN incorreto. Tente novamente ou consulte o supervisor.');
        setIsSubmitting(false);
      }
    }, 200);
  };

  const handleDirectFullscreen = async () => {
    await triggerBrowserFullscreen();
  };

  const filteredUsers = users.filter((u) => {
    if (!u.active) return false;
    if (filterSector === 'todos') return true;
    return u.sector === filterSector;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-4xl mb-3 flex flex-wrap items-center justify-between gap-2 z-10">
        {isFsParamPresent ? (
          <button
            type="button"
            onClick={handleDirectFullscreen}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2 hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Modo Posto Ativado: Toque para Expandir em Tela Cheia</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDirectFullscreen}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tela Cheia (F11)</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {onOpenAccessRequest && (
            <button
              type="button"
              onClick={onOpenAccessRequest}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Solicitar cadastro de novo usuário e senha"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Solicitar Acesso</span>
            </button>
          )}

          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/20"
              title="Copiar e compartilhar link de acesso para os operadores"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Gerador de Links</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Direct Link Bar for Supervisor */}
      <div className="w-full max-w-4xl mb-3 bg-slate-900/95 border border-amber-500/30 rounded-2xl p-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-10 shadow-lg shadow-black/40">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
              Link de Envio aos Usuários
            </span>
            <span className="text-xs font-mono text-slate-300 truncate max-w-xs sm:max-w-md block">
              {directAppUrl || 'Carregando link...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={handleCopyDirectLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              copiedDirectLink
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
            }`}
          >
            {copiedDirectLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDirectLink ? 'Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Enviar link pelo WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <a
            href={directAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            title="Abrir diretamente em uma nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
        {/* Left Side: System Info & Quick User Selection */}
        <div className="w-full md:w-5/12 bg-slate-900/90 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            {/* Header Badge & Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Acesso Restrito
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  Painel de RNC
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Controle de Não Conformidades, rastreabilidade de falhas por setor e gestão de permissões operacionais.
            </p>

            {/* Sector Quick Filter */}
            <div className="mb-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Filtrar por Setor:
              </label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value as OrderSector | 'todos')}
                className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="todos">Todos os setores ({users.length} usuários)</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick User List Scroll */}
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Selecione seu Colaborador / Perfil:
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredUsers.map((user) => {
                const isSelected = user.id === selectedUserId;
                const sectorInfo = sectors.find((s) => s.id === user.sector);
                const isAdmin = user.permissions?.canManageUsers;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setErrorMsg('');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-xs'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {user.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isAdmin && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-black border border-amber-400/20">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {user.role} • {sectorInfo?.shortName || user.sector}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Help Tip */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 bg-slate-800/30 p-3 rounded-xl">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-bold block">Acesso Master / Administrador:</span>
              Use o perfil de <strong>Elienai Silva (Usuário Master)</strong> com o PIN padrão <code className="text-amber-400 font-mono bg-slate-800 px-1 py-0.5 rounded">1234</code> para controle total, gestão de usuários e permissões.
            </div>
          </div>
        </div>

        {/* Right Side: Password / PIN Entry Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-slate-900">
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Identificação do Operador
              </span>
              <div className="mt-2 p-3 bg-slate-800/70 border border-slate-700/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                    {selectedUser?.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {selectedUser?.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {selectedUser?.role} • Setor {sectors.find((s) => s.id === selectedUser?.sector)?.name || selectedUser?.sector}
                    </p>
                  </div>
                </div>

                {selectedUser?.permissions?.canManageUsers ? (
                  <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Gestor de Acesso
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300">
                    Operacional
                  </span>
                )}
              </div>
            </div>

            {/* PIN Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Senha / PIN de Acesso</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPin('1234');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold transition-colors cursor-pointer"
                  >
                    Usar PIN Padrão (1234)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setErrorMsg('');
                      setPin(e.target.value);
                    }}
                    placeholder="Digite seu PIN ou senha..."
                    autoFocus
                    maxLength={12}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-center text-lg sm:text-xl tracking-widest rounded-2xl py-3 px-10 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Touchscreen Quick Numeric Keypad */}
              <div className="pt-2">
                <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500/30 text-white font-mono text-base font-bold transition-all border border-slate-700/60 shadow-xs cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="h-11 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-all border border-slate-700/60 cursor-pointer"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-base font-bold transition-all border border-slate-700/60 cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleKeypadBackspace}
                    className="h-11 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-all border border-slate-700/60 cursor-pointer"
                  >
                    Apagar
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Validando Acesso...</span>
                ) : (
                  <>
                    <span>ENTRAR NO SISTEMA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 1-Click Fast Pass Button */}
              <button
                type="button"
                onClick={() => {
                  setPin('1234');
                  setErrorMsg('');
                  if (selectedUser) {
                    onLogin({
                      ...selectedUser,
                      lastLogin: new Date().toISOString(),
                    });
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Entrar Rápido com PIN Padrão (1234)</span>
              </button>
            </form>

            {/* Access Request Prompt */}
            {onOpenAccessRequest && (
              <div className="mt-5 pt-4 border-t border-slate-800 text-center space-y-2">
                <span className="text-[11px] text-slate-400 block">
                  Novo operador ou ainda não possui credenciais?
                </span>
                <button
                  type="button"
                  onClick={onOpenAccessRequest}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Solicitar Novo Acesso com Usuário e Senha</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer security note */}
          <div className="mt-6 text-center text-[10px] text-slate-500">
            Ambiente com rastreabilidade de operações e controle de não conformidades (RNC).
          </div>
        </div>
      </div>
    </div>
  );
};
