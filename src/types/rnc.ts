export type DefaultOrderSector =
  | 'inclusao'
  | 'conferencia_farmaceutica'
  | 'separacao'
  | 'rotulagem'
  | 'colagem'
  | 'conferencia_final'
  | 'expedicao'
  | 'sac';

export type OrderSector = DefaultOrderSector | (string & {});

export type RncSeverity = 'leve' | 'moderada' | 'grave' | 'critica';
export type RncStatus = 'aberta' | 'em_analise' | 'resolvida' | 'improcedente';

export type UserRoleProfile = 
  | 'admin' 
  | 'supervisor' 
  | 'farmaceutico' 
  | 'conferente' 
  | 'operador' 
  | 'visualizador';

export interface UserPermissions {
  canRegisterRnc: boolean;               // Registrar novas ocorrências
  canResolveRnc: boolean;                // Dar tratativa, alterar status e resolver
  canDeleteRnc: boolean;                 // Excluir registros de RNC
  canManageUsers: boolean;               // Criar, editar usuários, etapas e permissões
  canManageStandardOccurrences: boolean; // Gerenciar catálogo de falhas padrão dos setores
  canExportReports: boolean;             // Exportar relatórios CSV/JSON e imprimir fichas
}

export interface SectorInfo {
  id: OrderSector;
  name: string;
  shortName: string;
  order: number;
  description: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  active?: boolean;
  slaMinutes?: number;
  iconName?: string;
}

export interface RncUser {
  id: string;
  name: string;
  username: string;
  pin: string; // PIN ou Senha de acesso numérico/alfanumérico
  role: string;
  profile: UserRoleProfile;
  sector: OrderSector;
  email?: string;
  active: boolean;
  permissions: UserPermissions;
  lastLogin?: string;
}

export interface StandardOccurrence {
  id: string;
  sector: OrderSector;
  title: string;
  severity: RncSeverity;
  category?: string;
}

export interface OccurrenceRecord {
  id: string;
  orderNumber: string;
  clientName?: string;
  productInfo?: string;
  detectingSector: OrderSector; // Setor que encontrou o erro (processo posterior)
  responsibleSector: OrderSector; // Qual setor foi o erro (processo anterior/causador)
  responsiblePerson: string; // Quem errou
  responsiblePersonId?: string;
  errorTitle: string; // Ocorrência selecionada ou resumo
  isCustomError: boolean;
  customDescription?: string; // Campo outros para digitação
  severity: RncSeverity;
  immediateAction: string;
  correctiveAction?: string;
  status: RncStatus;
  registeredBy: string; // Quem registrou
  registeredById?: string;
  createdAt: string; // ISO string
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export type AccessRequestStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface AccessRequest {
  id: string;
  fullName: string;
  username: string;
  pin: string; // Senha ou PIN desejado
  email?: string;
  phone?: string;
  sector: OrderSector;
  role: string;
  profile: UserRoleProfile;
  reason?: string;
  status: AccessRequestStatus;
  requestedAt: string; // ISO string
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

