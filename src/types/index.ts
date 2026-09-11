export type UserRole =
  | 'admin'
  | 'lawyer'
  | 'assistant'
  | 'financial'
  | 'Administrador'
  | 'Consultor'
  | 'Assistente'
  | 'Financeiro';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
}

export type UserProfile = User;

export type ClientStatus = 'Ativo' | 'Em Análise' | 'Aguardando Documentos' | 'Inativo' | 'Concluído';

export interface ClientTimelineEvent {
  id: string;
  date: string;
  type: 'Atendimento' | 'Documento' | 'Andamento' | 'Perícia' | 'Financeiro' | 'Nota';
  title: string;
  description: string;
  author: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  maritalStatus: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';
  profession: string;
  nitPisPasep: string;
  motherName: string;
  fatherName?: string;
  createdAt: string;
  whatsapp: string;
  phone?: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  caseSummary: string;
  pensionHistory: string;
  currentSituation: string;
  clientObjective: string;
  caseNotes: string;
  strategySteps: string;
  lastUpdatedAt: string;
  status: ClientStatus;
  benefitInterest?: string;
  timeline: ClientTimelineEvent[];
}

export type BenefitCategory =
  | 'Programáveis'
  | 'Incapacidade'
  | 'Assistenciais'
  | 'Dependentes'
  | 'Maternidade'
  | 'Outros';

export interface BenefitType {
  id: string;
  name: string;
  category: BenefitCategory;
  code?: string;
  description: string;
  defaultChecklist: string[];
}

export type DocumentChecklistStatus = 'Pendente' | 'Recebido' | 'Em análise' | 'Validado' | 'Recusado';

export interface ProcessChecklistItem {
  id: string;
  title: string;
  required: boolean;
  status: DocumentChecklistStatus;
  documentId?: string;
  updatedAt?: string;
  notes?: string;
}

export interface MedicalExam {
  date: string;
  time: string;
  location: string;
  doctorName?: string;
  notes?: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
}

export interface SocialExam {
  date: string;
  time: string;
  location: string;
  socialWorkerName?: string;
  notes?: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
}

export type ProcessStatus =
  | 'Novo cliente'
  | 'Em análise'
  | 'Documentação pendente'
  | 'Documentação completa'
  | 'Requerimento em preparação'
  | 'Requerimento protocolado'
  | 'Protocolado no INSS'
  | 'Em análise pelo INSS'
  | 'Exigência'
  | 'Perícia agendada'
  | 'Aguardando resultado'
  | 'Deferido'
  | 'Indeferido'
  | 'Recurso administrativo'
  | 'Processo judicial'
  | 'Implantado'
  | 'Finalizado'
  | 'Arquivado';

export interface ProcessTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  badge?: string;
}

export interface PensionProcess {
  id: string;
  clientId: string;
  clientName: string;
  clientCpf: string;
  benefitId: string;
  benefitName: string;
  protocolNumber: string;
  judicialProcessNumber?: string;
  requestDate: string;
  protocolDate?: string;
  status: ProcessStatus;
  lastProgress: string;
  lastProgressDate: string;
  nextAction: string;
  deadline?: string;
  responsible: string;
  feeAmount: number;
  paymentMethod: string;
  notes?: string;
  checklist: ProcessChecklistItem[];
  medicalExam?: MedicalExam;
  socialExam?: SocialExam;
  timeline: ProcessTimelineEvent[];
  createdAt: string;
}

export type DocumentCategory =
  | 'RG'
  | 'CPF'
  | 'Comprovante de residência'
  | 'CNIS'
  | 'CTPS'
  | 'Extrato previdenciário'
  | 'Laudos'
  | 'Atestados'
  | 'Exames'
  | 'Documentos médicos'
  | 'Documentos rurais'
  | 'Documentos de atividade especial'
  | 'Procuração'
  | 'Contrato'
  | 'Outros';

export interface DocumentItem {
  id: string;
  clientId: string;
  clientName?: string;
  processId?: string;
  processProtocol?: string;
  name: string;
  category: DocumentCategory;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  status: DocumentChecklistStatus;
  notes?: string;
  dataUrl?: string;
}

export type FinancialTransactionType = 'receita' | 'despesa';

export type FinancialStatus = 'Pendente' | 'Recebido' | 'Pago' | 'Atrasado' | 'Cancelado';

export interface FinancialTransaction {
  id: string;
  type: FinancialTransactionType;
  description: string;
  clientId?: string;
  clientName?: string;
  processId?: string;
  processProtocol?: string;
  category: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: string;
  status: FinancialStatus;
  notes?: string;
  supplier?: string;
  createdAt: string;
}

export type EventCategory =
  | 'Atendimento'
  | 'Perícia médica'
  | 'Perícia social'
  | 'Prazo'
  | 'Audiência'
  | 'Reunião'
  | 'Retorno ao cliente'
  | 'Pagamento'
  | 'Outros';

export type CalendarEventType =
  | EventCategory
  | 'Perícia Médica'
  | 'Perícia Social'
  | 'Atendimento Presencial'
  | 'Atendimento Online'
  | 'Prazo Fatal INSS'
  | 'Audiência Judicial'
  | 'Prazo de Recurso';

export interface CalendarEvent {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  processId?: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  category?: EventCategory;
  type?: CalendarEventType;
  description?: string;
  notes?: string;
  responsible: string;
}

export type TaskColumn =
  | 'todo'
  | 'in_progress'
  | 'waiting'
  | 'done'
  | 'a-fazer'
  | 'em-andamento'
  | 'aguardando-cliente'
  | 'aguardando-inss'
  | 'concluido';

export type KanbanColumnId = TaskColumn;

export type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface KanbanSubtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface KanbanComment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  processId?: string;
  processProtocol?: string;
  column: TaskColumn;
  priority: TaskPriority;
  deadline: string;
  responsible: string;
  checklist: KanbanSubtask[];
  comments: KanbanComment[];
  createdAt: string;
}

export type NotificationType = 'pericia' | 'documento' | 'financeiro' | 'tarefa' | 'prazo' | 'geral';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: string;
  linkType?: 'client' | 'process' | 'task' | 'finance' | 'agenda';
  targetId?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user?: string;
  userName?: string;
  action: string;
  target?: string;
  details: string;
  ip?: string;
}
