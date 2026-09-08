import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Building2, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Clock,
  Send,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { 
  AccessRequest, 
  SectorInfo, 
  OrderSector, 
  UserRoleProfile, 
  RncUser 
} from '../../types/rnc';
import { 
  ROLE_PROFILE_OPTIONS, 
  ORDER_SECTORS 
} from '../../data/rncData';

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: Omit<AccessRequest, 'id' | 'requestedAt' | 'status'>) => AccessRequest;
  sectors?: SectorInfo[];
  existingUsers?: RncUser[];
}

export const AccessRequestModal: React.FC<AccessRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
  sectors = ORDER_SECTORS,
  existingUsers = [],
}) => {
  // Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState<OrderSector>(sectors[0]?.id || 'separacao');
  const [profile, setProfile] = useState<UserRoleProfile>('operador');
  const [role, setRole] = useState('Operador de Produção');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [reason, setReason] = useState('');

  // UI States
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<AccessRequest | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState(false);

  if (!isOpen) return null;

  // Auto-generate suggested username on blur if empty
  const handleNameBlur = () => {
    if (fullName.trim() && !username.trim()) {
      const parts = fullName.trim().toLowerCase().split(/\s+/);
      if (parts.length === 1) {
        setUsername(parts[0]);
      } else {
        const cleanFirst = parts[0].replace(/[^a-z0-9]/g, '');
        const cleanLast = parts[parts.length - 1].replace(/[^a-z0-9]/g, '');
        setUsername(`${cleanFirst}.${cleanLast}`);
      }
    }
  };

  const handleProfileChange = (newProfile: UserRoleProfile) => {
    setProfile(newProfile);
    const profileOpt = ROLE_PROFILE_OPTIONS.find((p) => p.id === newProfile);
    if (profileOpt) {
      setRole(profileOpt.defaultRoleName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!fullName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('Por favor, defina um nome de usuário para login.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const isUserTaken = existingUsers.some(
      (u) => u.username?.toLowerCase() === cleanUsername
    );
    if (isUserTaken) {
      setErrorMsg('Este nome de usuário já está em uso no sistema. Por favor, escolha outro.');
      return;
    }

    if (!pin.trim()) {
      setErrorMsg('Por favor, crie uma senha ou PIN de acesso.');
      return;
    }

    if (pin.length < 3) {
      setErrorMsg('A senha ou PIN deve conter pelo menos 3 caracteres.');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMsg('A senha e a confirmação de senha não coincidem.');
      return;
    }

    // Submit Access Request
    const createdReq = onSubmitRequest({
      fullName: fullName.trim(),
      username: cleanUsername,
      pin: pin.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      sector,
      role: role.trim() || 'Operador',
      profile,
      reason: reason.trim() || undefined,
    });

    setSubmittedRequest(createdReq);
  };

  const handleCopyProtocol = () => {
    if (submittedRequest) {
      navigator.clipboard.writeText(submittedRequest.id);
      setCopiedProtocol(true);
      setTimeout(() => setCopiedProtocol(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setFullName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setPin('');
    setConfirmPin('');
    setReason('');
    setSubmittedRequest(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Solicitação de Acesso
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Novo Cadastro
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Defina seu usuário e senha/PIN para solicitar liberação ao supervisor de área.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
          {submittedRequest ? (
            /* Success State Screen */
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 border border-emerald-300 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Solicitação Enviada com Sucesso!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Seus dados cadastrais foram registrados na fila de aprovação. Assim que o supervisor ou administrador aprovar, você poderá entrar utilizando o usuário e senha definidos.
                </p>
              </div>

              {/* Protocol Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Protocolo de Acompanhamento:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyProtocol}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedProtocol ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedProtocol ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="text-center py-1">
                  <span className="text-lg font-mono font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
                    {submittedRequest.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Colaborador:</span>
                    <strong>{submittedRequest.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Usuário (Login):</span>
                    <strong className="font-mono">{submittedRequest.username}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Setor:</span>
                    <strong>
                      {sectors.find((s) => s.id === submittedRequest.sector)?.name || submittedRequest.sector}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Função:</span>
                    <strong>{submittedRequest.role}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Voltar para a Tela de Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRequest(null);
                    setFullName('');
                    setUsername('');
                    setPin('');
                    setConfirmPin('');
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Fazer Outra Solicitação
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SECTION 1: Personal Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>1. Dados Pessoais & Contato</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Clara dos Santos"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={handleNameBlur}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail Corporativo ou Pessoal
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="nome@biomeds.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8.5 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Telefone / WhatsApp (para liberação)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8.5 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Operational Sector & Role */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Setor de Atuação & Perfil Pretendido</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Setor Operacional <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value as OrderSector)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {sectors.map((sec, idx) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.order || idx + 1}. {sec.name} ({sec.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Perfil de Acesso <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profile}
                      onChange={(e) => handleProfileChange(e.target.value as UserRoleProfile)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {ROLE_PROFILE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cargo / Função no Posto <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Operador de Separação / Conferente"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8.5 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Login Credentials (Username & Password) */}
              <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center justify-between pb-1 border-b border-amber-200">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    <span>3. Credenciais Desejadas (Usuário e Senha)</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold">
                    Obrigatório
                  </span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nome de Usuário (Login) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: maria.santos ou maria.separacao"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full bg-white border border-amber-300 rounded-xl pl-8.5 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Utilize letras minúsculas sem espaços (ex: <code>nome.sobrenome</code>).
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Definir Senha ou PIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        required
                        placeholder="Digite sua senha"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl pl-8.5 pr-9 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Confirmar Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showConfirmPin ? 'text' : 'password'}
                        required
                        placeholder="Repita a senha"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl pl-8.5 pr-9 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Reason / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justificativa / Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Novo colaborador contratado para o turno matutino do setor de separação."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Footer Submit */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Solicitação de Acesso</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
