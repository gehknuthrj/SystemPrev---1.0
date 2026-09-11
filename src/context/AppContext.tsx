import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BenefitType,
  CalendarEvent,
  Client,
  DocumentCategory,
  DocumentChecklistStatus,
  DocumentItem,
  EventCategory,
  FinancialStatus,
  FinancialTransaction,
  FinancialTransactionType,
  KanbanTask,
  NotificationItem,
  PensionProcess,
  ProcessChecklistItem,
  ProcessStatus,
  TaskColumn,
  TaskPriority,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_BENEFITS,
  INITIAL_CLIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROCESSES,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '../data/initialData';
import { supabaseService, SupabaseConnectionResult, getRoleLabel } from '../services/supabaseService';

export type CurrentView =
  | 'dashboard'
  | 'clients'
  | 'client-detail'
  | 'processes'
  | 'process-detail'
  | 'benefits'
  | 'documents'
  | 'financial'
  | 'calendar'
  | 'tasks'
  | 'reports'
  | 'notifications'
  | 'history'
  | 'users'
  | 'settings';

export type FinancialSubmenu =
  | 'dashboard'
  | 'receitas'
  | 'despesas'
  | 'receber'
  | 'pagar'
  | 'categorias'
  | 'relatorios';

export type ActiveQuickModal =
  | null
  | 'new-client'
  | 'new-process'
  | 'new-task'
  | 'new-event'
  | 'new-receita'
  | 'new-despesa'
  | 'edit-client'
  | 'edit-process';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedProcessId: string | null;
  setSelectedProcessId: (id: string | null) => void;
  financialSubmenu: FinancialSubmenu;
  setFinancialSubmenu: (sub: FinancialSubmenu) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  activeModal: ActiveQuickModal;
  setActiveModal: (modal: ActiveQuickModal) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Auth & Users
  users: User[];
  currentUser: User;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUserRole: (userId: string) => void;
  updateCurrentUserProfile: (profile: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;

  // Core Data
  clients: Client[];
  processes: PensionProcess[];
  benefits: BenefitType[];
  documents: DocumentItem[];
  transactions: FinancialTransaction[];
  events: CalendarEvent[];
  tasks: KanbanTask[];
  notifications: NotificationItem[];

  // Client Actions
  addClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'lastUpdatedAt' | 'timeline'>) => Client;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addClientTimelineEvent: (
    clientId: string,
    event: { type: 'Atendimento' | 'Documento' | 'Andamento' | 'Perícia' | 'Financeiro' | 'Nota'; title: string; description: string }
  ) => void;

  // Process Actions
  addProcess: (processData: {
    clientId: string;
    benefitId: string;
    protocolNumber: string;
    judicialProcessNumber?: string;
    requestDate: string;
    protocolDate?: string;
    status: ProcessStatus;
    lastProgress: string;
    nextAction: string;
    deadline?: string;
    responsible: string;
    feeAmount: number;
    paymentMethod: string;
    notes?: string;
    medicalExamDate?: string;
    medicalExamTime?: string;
    medicalExamLocation?: string;
    medicalExamDoctor?: string;
    medicalExamNotes?: string;
    socialExamDate?: string;
    socialExamTime?: string;
    socialExamLocation?: string;
    socialExamNotes?: string;
  }) => PensionProcess;
  updateProcess: (id: string, processData: Partial<PensionProcess>) => void;
  deleteProcess: (id: string) => void;
  updateProcessChecklistItem: (
    processId: string,
    itemId: string,
    status: DocumentChecklistStatus,
    notes?: string
  ) => void;
  addProcessTimelineEvent: (processId: string, title: string, description: string, badge?: string) => void;

  // Benefit Actions
  addBenefit: (benefit: Omit<BenefitType, 'id'>) => BenefitType;
  updateBenefit: (id: string, benefit: Partial<BenefitType>) => void;
  deleteBenefit: (id: string) => void;

  // Document Actions
  uploadDocument: (doc: {
    clientId: string;
    processId?: string;
    name: string;
    category: DocumentCategory;
    fileType: string;
    fileSize: string;
    notes?: string;
    dataUrl?: string;
    status?: DocumentChecklistStatus;
  }) => DocumentItem;
  updateDocument: (id: string, docData: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  // Financial Actions
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => FinancialTransaction;
  updateTransaction: (id: string, txData: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;

  // Calendar Actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, eventData: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Task Actions
  addTask: (task: Omit<KanbanTask, 'id' | 'createdAt' | 'comments'>) => KanbanTask;
  updateTask: (id: string, taskData: Partial<KanbanTask>) => void;
  deleteTask: (id: string) => void;
  moveTaskColumn: (taskId: string, newColumn: TaskColumn) => void;
  toggleTaskSubtask: (taskId: string, subtaskId: string) => void;
  addTaskComment: (taskId: string, commentText: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Utility & Demo
  resetToDemoData: () => void;
  navigateToClientDetail: (clientId: string) => void;
  navigateToProcessDetail: (processId: string) => void;
  openWhatsApp: (phoneOrWhatsapp: string, clientName?: string) => void;

  // Supabase Database Integration
  isSupabaseConfigured: boolean;
  isSupabaseSyncing: boolean;
  supabaseStatus: 'connected' | 'disconnected' | 'checking' | 'error';
  lastSupabaseSync: string | null;
  syncFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  testSupabaseConnection: () => Promise<SupabaseConnectionResult>;
  resetToCleanSlate: () => Promise<void>;
}

const STORAGE_KEY = 'prevconsult_crm_v2_clean';

// Purge legacy mock data cached in browser storage from earlier versions
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'prevconsult_crm_db_v1_clients',
      'prevconsult_crm_db_v1_processes',
      'prevconsult_crm_db_v1_documents',
      'prevconsult_crm_db_v1_transactions',
      'prevconsult_crm_db_v1_tasks',
      'prevconsult_crm_db_v1_events',
      'prevconsult_crm_db_v1_notifications',
      'prevconsult_crm_db_v1_users',
      'prevconsult_crm_db_v1_current_user',
      'prevconsult_crm_db_v1_is_auth',
      'prevconsult_clients',
      'prevconsult_processes',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage access fallback
  }
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI State
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [financialSubmenu, setFinancialSubmenu] = useState<FinancialSubmenu>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<ActiveQuickModal>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Sync Auth State to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  // Core Data States with LocalStorage Hydration
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [processes, setProcesses] = useState<PensionProcess[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_processes`);
    return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
  });

  const [benefits, setBenefits] = useState<BenefitType[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_benefits`);
    return saved ? JSON.parse(saved) : INITIAL_BENEFITS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_processes`, JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_benefits`, JSON.stringify(benefits));
  }, [benefits]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Toast System
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Supabase Integration State
  const isSupabaseConfigured = supabaseService.isConfigured();
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'disconnected' | 'checking' | 'error'>(
    isSupabaseConfigured ? 'checking' : 'disconnected'
  );
  const [lastSupabaseSync, setLastSupabaseSync] = useState<string | null>(null);

  // Sync data from Supabase to local state
  const syncFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    setIsSupabaseSyncing(true);
    setSupabaseStatus('checking');

    try {
      const conn = await supabaseService.testConnection();
      if (!conn.connected) {
        setSupabaseStatus('error');
        showToast(conn.message, 'warning');
        setIsSupabaseSyncing(false);
        return;
      }
      setSupabaseStatus('connected');

      // Fetch all collections in parallel from Supabase
      const [sbClients, sbProcesses, sbBenefits, sbDocuments, sbFinancial, sbTasks, sbEvents] = await Promise.all([
        supabaseService.fetchClients(),
        supabaseService.fetchProcesses(),
        supabaseService.fetchBenefits(),
        supabaseService.fetchDocuments(),
        supabaseService.fetchFinancial(),
        supabaseService.fetchTasks(),
        supabaseService.fetchEvents(),
      ]);

      let importedAny = false;
      if (sbClients !== null) {
        setClients(sbClients);
        if (sbClients.length > 0) importedAny = true;
      }
      if (sbProcesses !== null) {
        setProcesses(sbProcesses);
        if (sbProcesses.length > 0) importedAny = true;
      }
      if (sbBenefits !== null && sbBenefits.length > 0) {
        setBenefits(sbBenefits);
      }
      if (sbDocuments !== null) {
        setDocuments(sbDocuments);
        if (sbDocuments.length > 0) importedAny = true;
      }
      if (sbFinancial !== null) {
        setTransactions(sbFinancial);
        if (sbFinancial.length > 0) importedAny = true;
      }
      if (sbTasks !== null) {
        setTasks(sbTasks);
        if (sbTasks.length > 0) importedAny = true;
      }
      if (sbEvents !== null) {
        setEvents(sbEvents);
        if (sbEvents.length > 0) importedAny = true;
      }

      const now = new Date().toLocaleTimeString('pt-BR');
      setLastSupabaseSync(now);

      if (importedAny) {
        showToast('Dados sincronizados do Supabase com sucesso!', 'success');
      } else {
        showToast('Conectado ao Supabase (Tabelas prontas para novos registros)', 'info');
      }
    } catch (err: unknown) {
      console.warn('Sync from Supabase failed:', err);
      setSupabaseStatus('error');
      showToast('Falha na sincronização com o Supabase.', 'error');
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  // Push local demo/offline data to Supabase (Initial seed or mass sync)
  const syncToSupabase = async () => {
    if (!isSupabaseConfigured) {
      showToast('Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.', 'warning');
      return;
    }
    setIsSupabaseSyncing(true);
    showToast('Enviando dados locais para o banco de dados Supabase...', 'info');

    try {
      const res = await supabaseService.pushLocalDataToSupabase({
        clients,
        processes,
        benefits,
        documents,
        transactions,
        tasks,
        events,
      });

      if (res.success) {
        setSupabaseStatus('connected');
        setLastSupabaseSync(new Date().toLocaleTimeString('pt-BR'));
        showToast(res.message, 'success');
      } else {
        setSupabaseStatus('error');
        showToast(res.message, 'error');
      }
    } catch (err: unknown) {
      setSupabaseStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Erro ao sincronizar: ${msg}`, 'error');
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  const testSupabaseConnection = async () => {
    return await supabaseService.testConnection();
  };

  // Supabase Auth Session Persistence & State Listener
  useEffect(() => {
    let authSub: { unsubscribe: () => void } | null = null;

    const initAuthSession = async () => {
      if (!isSupabaseConfigured) {
        setAuthLoading(false);
        return;
      }

      try {
        const session = await supabaseService.getSession();
        if (session?.user) {
          const appUser = await supabaseService.fetchCurrentAppUser(session.user);
          setCurrentUser(appUser);
          setIsAuthenticated(true);
          // Sync live data from Supabase for authenticated user
          syncFromSupabase().catch(() => {});
        } else {
          // If no active Supabase session, verify local state
          const savedAuth = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
          if (savedAuth !== null) {
            setIsAuthenticated(JSON.parse(savedAuth));
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('Supabase auth session check warning:', err);
      } finally {
        setAuthLoading(false);
      }

      // Listen to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
      const sub = supabaseService.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const appUser = await supabaseService.fetchCurrentAppUser(session.user);
          setCurrentUser(appUser);
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      });
      if (sub) {
        authSub = sub;
      }
    };

    initAuthSession();

    return () => {
      if (authSub) {
        authSub.unsubscribe();
      }
    };
  }, [isSupabaseConfigured]);

  // Auth Operations (Supabase Auth API Integration)
  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const res = await supabaseService.signIn(email, pass);
        if (res.error) {
          // Check for quick demo fallback if testing with demo accounts
          const demoUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (demoUser && (pass === '123456' || pass === 'demo' || !pass)) {
            setCurrentUser(demoUser);
            setIsAuthenticated(true);
            showToast(`Acesso concedido como ${demoUser.name} (Demonstração).`);
            setCurrentView('dashboard');
            return true;
          }

          showToast(`Erro no login: ${res.error}`, 'error');
          return false;
        }

        if (res.user) {
          const appUser = await supabaseService.fetchCurrentAppUser(res.user);
          setCurrentUser(appUser);
          setIsAuthenticated(true);
          showToast(`Bem-vindo(a) de volta, ${appUser.name}!`);
          setCurrentView('dashboard');
          syncFromSupabase().catch(() => {});
          return true;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`Falha no login: ${msg}`, 'error');
        return false;
      }
    }

    // Local / Demo Login fallback
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      showToast(`Bem-vindo(a) de volta, ${found.name}!`);
      setCurrentView('dashboard');
      return true;
    }

    // Default admin fallback for quick testing
    const adminUser = users[0];
    setCurrentUser(adminUser);
    setIsAuthenticated(true);
    showToast(`Login realizado com sucesso como Administrador.`);
    setCurrentView('dashboard');
    return true;
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    pass: string,
    role?: UserRole
  ): Promise<boolean> => {
    const userRole = role || 'lawyer';
    const roleLabel = getRoleLabel(userRole);

    if (isSupabaseConfigured) {
      try {
        const res = await supabaseService.signUp({
          email,
          password: pass,
          name,
          phone,
          role: userRole,
        });

        if (res.error) {
          showToast(`Erro no cadastro: ${res.error}`, 'error');
          return false;
        }

        if (res.user) {
          if (res.session) {
            const appUser = await supabaseService.fetchCurrentAppUser(res.user);
            setCurrentUser(appUser);
            setIsAuthenticated(true);
            setUsers((prev) => [appUser, ...prev.filter((u) => u.email !== appUser.email)]);
            showToast(`Conta criada com sucesso! Seja bem-vindo(a), ${name}.`);
            setCurrentView('dashboard');
          } else {
            showToast('Cadastro realizado no Supabase! Verifique seu e-mail caso seja necessária confirmação.', 'info');
          }
          return true;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`Falha no cadastro: ${msg}`, 'error');
        return false;
      }
    }

    // Local fallback
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role: userRole,
      roleLabel,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    showToast(`Conta criada com sucesso! Seja bem-vindo(a), ${name}.`);
    setCurrentView('dashboard');
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabaseService.signOut();
      } catch (err) {
        console.warn('Supabase signout warning:', err);
      }
    }
    setIsAuthenticated(false);
    localStorage.removeItem(`${STORAGE_KEY}_is_auth`);
    showToast('Sessão encerrada com segurança.', 'info');
  };

  const switchUserRole = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Perfil alterado para ${user.name} (${user.roleLabel})`, 'info');
    }
  };

  const updateCurrentUserProfile = async (profile: Partial<User>) => {
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    setUsers((prevUsers) => prevUsers.map((u) => (u.id === currentUser.id ? updated : u)));

    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateUserProfile(currentUser.id, profile);
      } catch (err) {
        console.warn('Supabase updateUserProfile error:', err);
      }
    }
    showToast('Perfil atualizado com sucesso.');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured) {
      return await supabaseService.resetPassword(email);
    }
    return {
      success: true,
      message: 'Instruções de redefinição enviadas para o e-mail informado (modo local).',
    };
  };

  // Navigation Helpers
  const navigateToClientDetail = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentView('client-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProcessDetail = (processId: string) => {
    setSelectedProcessId(processId);
    setCurrentView('process-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = (phoneOrWhatsapp: string, clientName?: string) => {
    const cleanNumber = phoneOrWhatsapp.replace(/\D/g, '');
    const standardNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const text = encodeURIComponent(
      `Olá${clientName ? ` ${clientName}` : ''}, tudo bem? Aqui é da PrevConsult Consultoria Previdenciária. Estamos acompanhando seu processo e gostaríamos de passar uma atualização.`
    );
    window.open(`https://wa.me/${standardNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Client Operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'lastUpdatedAt' | 'timeline'>): Client => {
    const today = new Date().toISOString().split('T')[0];
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: today,
      lastUpdatedAt: today,
      timeline: [
        {
          id: `clt-${Date.now()}`,
          date: today,
          type: 'Atendimento',
          title: 'Cadastro de Cliente Realizado',
          description: 'Ficha cadastral criada e histórico previdenciário registrado no sistema.',
          author: currentUser.name,
        },
      ],
    };

    setClients((prev) => [newClient, ...prev]);

    if (isSupabaseConfigured) {
      supabaseService.upsertClient(newClient).catch((err) => console.warn('Supabase upsertClient failed:', err));
    }

    // Create Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Novo Cliente Cadastrado',
      message: `${newClient.name} foi adicionado(a) à base de clientes.`,
      type: 'geral',
      read: false,
      date: new Date().toLocaleString('pt-BR'),
      linkType: 'client',
      targetId: newClient.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Cliente cadastrado com sucesso!');
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedClient: Client | undefined;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedClient = { ...c, ...clientData, lastUpdatedAt: today };
          return updatedClient;
        }
        return c;
      })
    );
    if (isSupabaseConfigured && updatedClient) {
      supabaseService.upsertClient(updatedClient).catch((err) => console.warn('Supabase updateClient failed:', err));
    }
    showToast('Dados do cliente atualizados com sucesso.');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured) {
      supabaseService.deleteClient(id).catch((err) => console.warn('Supabase deleteClient failed:', err));
    }
    if (selectedClientId === id) {
      setSelectedClientId(null);
      setCurrentView('clients');
    }
    showToast('Cliente removido com sucesso.', 'info');
  };

  const addClientTimelineEvent = (
    clientId: string,
    event: { type: 'Atendimento' | 'Documento' | 'Andamento' | 'Perícia' | 'Financeiro' | 'Nota'; title: string; description: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newEvent = {
      id: `clt-${Date.now()}`,
      date: today,
      type: event.type,
      title: event.title,
      description: event.description,
      author: currentUser.name,
    };

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              lastUpdatedAt: today,
              timeline: [newEvent, ...c.timeline],
            }
          : c
      )
    );

    if (isSupabaseConfigured) {
      supabaseService.addClientTimelineEvent(clientId, newEvent).catch((err) => console.warn('Supabase addClientTimelineEvent failed:', err));
    }
    showToast('Histórico atualizado.');
  };

  // Process Operations (With Automatic Relationship & Intelligence - Requirements 14, 32, 33)
  const addProcess = (processData: {
    clientId: string;
    benefitId: string;
    protocolNumber: string;
    judicialProcessNumber?: string;
    requestDate: string;
    protocolDate?: string;
    status: ProcessStatus;
    lastProgress: string;
    nextAction: string;
    deadline?: string;
    responsible: string;
    feeAmount: number;
    paymentMethod: string;
    notes?: string;
    medicalExamDate?: string;
    medicalExamTime?: string;
    medicalExamLocation?: string;
    medicalExamDoctor?: string;
    medicalExamNotes?: string;
    socialExamDate?: string;
    socialExamTime?: string;
    socialExamLocation?: string;
    socialExamNotes?: string;
  }): PensionProcess => {
    const client = clients.find((c) => c.id === processData.clientId);
    const benefit = benefits.find((b) => b.id === processData.benefitId);
    const today = new Date().toISOString().split('T')[0];

    // Auto-generate checklist based on benefit default documents
    const initialChecklist: ProcessChecklistItem[] = (benefit?.defaultChecklist || [
      'Documento de Identidade (RG) e CPF',
      'Comprovante de Residência Atualizado',
      'Extrato CNIS Completo',
      'Procuração e Contrato de Honorários',
    ]).map((docTitle, idx) => ({
      id: `chk-${Date.now()}-${idx}`,
      title: docTitle,
      required: true,
      status: 'Pendente' as DocumentChecklistStatus,
      updatedAt: today,
    }));

    // Auto-create Process
    const newProcessId = `prc-${Date.now()}`;
    const newProcess: PensionProcess = {
      id: newProcessId,
      clientId: processData.clientId,
      clientName: client?.name || 'Cliente',
      clientCpf: client?.cpf || '',
      benefitId: processData.benefitId,
      benefitName: benefit?.name || 'Benefício Previdenciário',
      protocolNumber: processData.protocolNumber || `PROT-${Date.now().toString().slice(-6)}`,
      judicialProcessNumber: processData.judicialProcessNumber,
      requestDate: processData.requestDate || today,
      protocolDate: processData.protocolDate,
      status: processData.status || 'Novo cliente',
      lastProgress: processData.lastProgress || 'Processo registrado no sistema',
      lastProgressDate: today,
      nextAction: processData.nextAction || 'Conferir documentação do checklist',
      deadline: processData.deadline,
      responsible: processData.responsible || currentUser.name,
      feeAmount: Number(processData.feeAmount) || 0,
      paymentMethod: processData.paymentMethod || 'A combinar no êxito',
      notes: processData.notes,
      checklist: initialChecklist,
      medicalExam: processData.medicalExamDate
        ? {
            date: processData.medicalExamDate,
            time: processData.medicalExamTime || '10:00',
            location: processData.medicalExamLocation || 'Agência da Previdência Social',
            doctorName: processData.medicalExamDoctor,
            notes: processData.medicalExamNotes,
            status: 'Agendada',
          }
        : undefined,
      socialExam: processData.socialExamDate
        ? {
            date: processData.socialExamDate,
            time: processData.socialExamTime || '14:00',
            location: processData.socialExamLocation || 'Serviço Social da APS',
            notes: processData.socialExamNotes,
            status: 'Agendada',
          }
        : undefined,
      timeline: [
        {
          id: `ptl-${Date.now()}`,
          date: today,
          title: 'Abertura do Processo Previdenciário',
          description: `Processo de ${benefit?.name || 'benefício'} cadastrado com protocolo ${processData.protocolNumber}.`,
          badge: 'Criado',
        },
      ],
      createdAt: today,
    };

    setProcesses((prev) => [newProcess, ...prev]);

    if (isSupabaseConfigured) {
      supabaseService.upsertProcess(newProcess).catch((err) => console.warn('Supabase upsertProcess failed:', err));
    }

    // AUTOMATION 1: Automatically create a Task "Conferir documentação"
    const autoTask: KanbanTask = {
      id: `tsk-${Date.now()}-auto`,
      title: `Conferir documentação e checklist - ${client?.name}`,
      description: `Verificar os ${initialChecklist.length} documentos obrigatórios para o benefício ${benefit?.name}.`,
      clientId: client?.id,
      clientName: client?.name,
      processId: newProcess.id,
      processProtocol: newProcess.protocolNumber,
      column: 'todo',
      priority: 'Alta',
      deadline: processData.deadline || today,
      responsible: processData.responsible || currentUser.name,
      checklist: initialChecklist.map((item) => ({
        id: `sub-${item.id}`,
        text: item.title,
        completed: false,
      })),
      comments: [],
      createdAt: today,
    };
    setTasks((prev) => [autoTask, ...prev]);

    // AUTOMATION 2: If Medical Exam is set, add to Calendar + Notification + Preparation Task
    if (processData.medicalExamDate) {
      const examEvent: CalendarEvent = {
        id: `evt-${Date.now()}-med`,
        title: `Perícia Médica - ${client?.name}`,
        clientId: client?.id,
        clientName: client?.name,
        processId: newProcess.id,
        date: processData.medicalExamDate,
        time: processData.medicalExamTime || '10:00',
        duration: '1h',
        location: processData.medicalExamLocation || 'APS Previdenciária',
        category: 'Perícia médica',
        description: `Perícia médica agendada para o benefício ${benefit?.name}. Observações: ${processData.medicalExamNotes || 'Levar laudos e receitas atualizadas.'}`,
        responsible: processData.responsible || currentUser.name,
      };
      setEvents((prev) => [examEvent, ...prev]);

      const examNotification: NotificationItem = {
        id: `notif-${Date.now()}-exam`,
        title: 'Perícia Médica Agendada',
        message: `Perícia Médica agendada para ${client?.name} em ${processData.medicalExamDate} às ${processData.medicalExamTime || '10:00'}.`,
        type: 'pericia',
        read: false,
        date: new Date().toLocaleString('pt-BR'),
        linkType: 'process',
        targetId: newProcess.id,
      };
      setNotifications((prev) => [examNotification, ...prev]);
    }

    // AUTOMATION 3: If Social Exam is set, add to Calendar
    if (processData.socialExamDate) {
      const socialEvent: CalendarEvent = {
        id: `evt-${Date.now()}-soc`,
        title: `Avaliação Social - ${client?.name}`,
        clientId: client?.id,
        clientName: client?.name,
        processId: newProcess.id,
        date: processData.socialExamDate,
        time: processData.socialExamTime || '14:00',
        duration: '1h',
        location: processData.socialExamLocation || 'Serviço Social da APS',
        category: 'Perícia social',
        description: `Avaliação social socioeconômica. Recomendar presença de familiar e comprovantes de gastos.`,
        responsible: processData.responsible || currentUser.name,
      };
      setEvents((prev) => [socialEvent, ...prev]);
    }

    // AUTOMATION 4: If fees specified, register pending receivable in Finance
    if (newProcess.feeAmount > 0) {
      const feeTx: FinancialTransaction = {
        id: `fin-${Date.now()}-fee`,
        type: 'receita',
        description: `Honorários previstos - ${benefit?.name} (${client?.name})`,
        clientId: client?.id,
        clientName: client?.name,
        processId: newProcess.id,
        processProtocol: newProcess.protocolNumber,
        category: 'Honorários',
        amount: newProcess.feeAmount,
        dueDate: processData.deadline || today,
        paymentMethod: processData.paymentMethod || 'A combinar',
        status: 'Pendente',
        notes: 'Lançamento automático gerado na abertura do processo previdenciário.',
        createdAt: today,
      };
      setTransactions((prev) => [feeTx, ...prev]);
    }

    // AUTOMATION 5: Add Timeline event in Client profile
    if (client) {
      addClientTimelineEvent(client.id, {
        type: 'Andamento',
        title: `Novo Processo Aberto: ${benefit?.name}`,
        description: `Processo n° ${newProcess.protocolNumber} vinculado com checklist de ${initialChecklist.length} itens.`,
      });
    }

    showToast('Processo criado com checklist e tarefas automáticas!');
    return newProcess;
  };

  const updateProcess = (id: string, processData: Partial<PensionProcess>) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedProcess: PensionProcess | undefined;
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedProcess = { ...p, ...processData, lastProgressDate: today };
          return updatedProcess;
        }
        return p;
      })
    );
    if (isSupabaseConfigured && updatedProcess) {
      supabaseService.upsertProcess(updatedProcess).catch((err) => console.warn('Supabase updateProcess failed:', err));
    }
    showToast('Processo atualizado com sucesso.');
  };

  const deleteProcess = (id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured) {
      supabaseService.deleteProcess(id).catch((err) => console.warn('Supabase deleteProcess failed:', err));
    }
    if (selectedProcessId === id) {
      setSelectedProcessId(null);
      setCurrentView('processes');
    }
    showToast('Processo removido com sucesso.', 'info');
  };

  const updateProcessChecklistItem = (
    processId: string,
    itemId: string,
    status: DocumentChecklistStatus,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    let itemTitle = '';
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id === processId) {
          const updatedChecklist = p.checklist.map((item) => {
            if (item.id === itemId) {
              itemTitle = item.title;
              return { ...item, status, updatedAt: today, notes: notes !== undefined ? notes : item.notes };
            }
            return item;
          });

          // Check if all items are validated/received to update process status suggestion
          const allCompleted = updatedChecklist.every(
            (i) => i.status === 'Validado' || i.status === 'Recebido'
          );

          let newStatus = p.status;
          if (allCompleted && p.status === 'Documentação pendente') {
            newStatus = 'Documentação completa';
          }

          return {
            ...p,
            checklist: updatedChecklist,
            status: newStatus,
          };
        }
        return p;
      })
    );

    if (isSupabaseConfigured && itemTitle) {
      supabaseService.updateProcessChecklistItem(processId, itemTitle, status, notes).catch((err) =>
        console.warn('Supabase updateProcessChecklistItem failed:', err)
      );
    }

    showToast(`Status do documento atualizado para "${status}".`);
  };

  const addProcessTimelineEvent = (
    processId: string,
    title: string,
    description: string,
    badge?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: `ptl-${Date.now()}`,
      date: today,
      title,
      description,
      badge,
    };

    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id === processId) {
          return {
            ...p,
            lastProgress: title,
            lastProgressDate: today,
            timeline: [newEntry, ...p.timeline],
          };
        }
        return p;
      })
    );

    if (isSupabaseConfigured) {
      supabaseService.addProcessTimelineEvent(processId, newEntry).catch((err) =>
        console.warn('Supabase addProcessTimelineEvent failed:', err)
      );
    }
    showToast('Novo andamento registrado na linha do tempo!');
  };

  // Benefit Management
  const addBenefit = (benefitData: Omit<BenefitType, 'id'>): BenefitType => {
    const newBen: BenefitType = {
      ...benefitData,
      id: `ben-${Date.now()}`,
    };
    setBenefits((prev) => [...prev, newBen]);
    if (isSupabaseConfigured) {
      supabaseService.upsertBenefit(newBen).catch((err) => console.warn('Supabase upsertBenefit failed:', err));
    }
    showToast('Novo benefício cadastrado com sucesso!');
    return newBen;
  };

  const updateBenefit = (id: string, benefitData: Partial<BenefitType>) => {
    let updatedBen: BenefitType | undefined;
    setBenefits((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          updatedBen = { ...b, ...benefitData };
          return updatedBen;
        }
        return b;
      })
    );
    if (isSupabaseConfigured && updatedBen) {
      supabaseService.upsertBenefit(updatedBen).catch((err) => console.warn('Supabase updateBenefit failed:', err));
    }
    showToast('Benefício atualizado com sucesso.');
  };

  const deleteBenefit = (id: string) => {
    setBenefits((prev) => prev.filter((b) => b.id !== id));
    showToast('Benefício removido.', 'info');
  };

  // Document Management (Upload simulation and linking)
  const uploadDocument = (doc: {
    clientId: string;
    processId?: string;
    name: string;
    category: DocumentCategory;
    fileType: string;
    fileSize: string;
    notes?: string;
    dataUrl?: string;
    status?: DocumentChecklistStatus;
  }): DocumentItem => {
    const client = clients.find((c) => c.id === doc.clientId);
    const process = processes.find((p) => p.id === doc.processId);
    const today = new Date().toISOString().split('T')[0];

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      clientId: doc.clientId,
      clientName: client?.name,
      processId: doc.processId,
      processProtocol: process?.protocolNumber,
      name: doc.name,
      category: doc.category,
      fileType: doc.fileType || 'application/pdf',
      fileSize: doc.fileSize || '1.2 MB',
      uploadDate: today,
      status: doc.status || 'Recebido',
      notes: doc.notes,
      dataUrl: doc.dataUrl,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    if (isSupabaseConfigured) {
      supabaseService.upsertDocument(newDoc).catch((err) => console.warn('Supabase upsertDocument failed:', err));
    }

    // Automatically update checklist item in process if it matches name/category
    if (doc.processId) {
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.id === doc.processId) {
            const updatedChecklist = p.checklist.map((item) => {
              const matchesTitle =
                item.title.toLowerCase().includes(doc.category.toLowerCase()) ||
                doc.name.toLowerCase().includes(item.title.toLowerCase().slice(0, 5));
              if (matchesTitle && item.status === 'Pendente') {
                return { ...item, status: 'Recebido' as DocumentChecklistStatus, documentId: newDoc.id, updatedAt: today };
              }
              return item;
            });
            return { ...p, checklist: updatedChecklist };
          }
          return p;
        })
      );
    }

    if (client) {
      addClientTimelineEvent(client.id, {
        type: 'Documento',
        title: `Documento Anexado: ${doc.name}`,
        description: `Categoria: ${doc.category}. Status: Recebido.`,
      });
    }

    showToast('Documento enviado com sucesso!');
    return newDoc;
  };

  const updateDocument = (id: string, docData: Partial<DocumentItem>) => {
    let updatedDoc: DocumentItem | undefined;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          updatedDoc = { ...d, ...docData };
          return updatedDoc;
        }
        return d;
      })
    );
    if (isSupabaseConfigured && updatedDoc) {
      supabaseService.upsertDocument(updatedDoc).catch((err) => console.warn('Supabase updateDocument failed:', err));
    }
    showToast('Documento atualizado.');
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (isSupabaseConfigured) {
      supabaseService.deleteDocument(id).catch((err) => console.warn('Supabase deleteDocument failed:', err));
    }
    showToast('Documento excluído.', 'info');
  };

  // Financial Management
  const addTransaction = (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>): FinancialTransaction => {
    const today = new Date().toISOString().split('T')[0];
    const client = clients.find((c) => c.id === tx.clientId);
    const process = processes.find((p) => p.id === tx.processId);

    const newTx: FinancialTransaction = {
      ...tx,
      id: `fin-${Date.now()}`,
      clientName: client?.name,
      processProtocol: process?.protocolNumber,
      createdAt: today,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured) {
      supabaseService.upsertFinancial(newTx).catch((err) => console.warn('Supabase upsertFinancial failed:', err));
    }

    // If transaction is linked to client, add to timeline
    if (client && tx.type === 'receita') {
      addClientTimelineEvent(client.id, {
        type: 'Financeiro',
        title: `Lançamento Financeiro: R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        description: `${tx.description}. Vencimento: ${tx.dueDate}. Status: ${tx.status}`,
      });
    }

    showToast(`${tx.type === 'receita' ? 'Receita' : 'Despesa'} registrada com sucesso!`);
    return newTx;
  };

  const updateTransaction = (id: string, txData: Partial<FinancialTransaction>) => {
    let updatedTx: FinancialTransaction | undefined;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTx = { ...t, ...txData };
          return updatedTx;
        }
        return t;
      })
    );
    if (isSupabaseConfigured && updatedTx) {
      supabaseService.upsertFinancial(updatedTx).catch((err) => console.warn('Supabase updateFinancial failed:', err));
    }
    showToast('Lançamento financeiro atualizado.');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured) {
      supabaseService.deleteFinancial(id).catch((err) => console.warn('Supabase deleteFinancial failed:', err));
    }
    showToast('Lançamento excluído.', 'info');
  };

  const toggleTransactionStatus = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedTx: FinancialTransaction | undefined;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.type === 'receita') {
            const nextStatus: FinancialStatus = t.status === 'Recebido' ? 'Pendente' : 'Recebido';
            updatedTx = {
              ...t,
              status: nextStatus,
              paymentDate: nextStatus === 'Recebido' ? today : undefined,
            };
            return updatedTx;
          } else {
            const nextStatus: FinancialStatus = t.status === 'Pago' ? 'Pendente' : 'Pago';
            updatedTx = {
              ...t,
              status: nextStatus,
              paymentDate: nextStatus === 'Pago' ? today : undefined,
            };
            return updatedTx;
          }
        }
        return t;
      })
    );
    if (isSupabaseConfigured && updatedTx) {
      supabaseService.upsertFinancial(updatedTx).catch((err) => console.warn('Supabase toggleFinancial failed:', err));
    }
    showToast('Status do lançamento financeiro atualizado!');
  };

  // Calendar Management
  const addEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const client = clients.find((c) => c.id === eventData.clientId);
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      clientName: client?.name,
    };
    setEvents((prev) => [...prev, newEvent]);

    if (isSupabaseConfigured) {
      supabaseService.upsertEvent(newEvent).catch((err) => console.warn('Supabase upsertEvent failed:', err));
    }

    if (client) {
      addClientTimelineEvent(client.id, {
        type: 'Atendimento',
        title: `Compromisso Agendado: ${newEvent.title}`,
        description: `${newEvent.category} em ${newEvent.date} às ${newEvent.time}. Local: ${newEvent.location}`,
      });
    }

    showToast('Compromisso adicionado à agenda!');
    return newEvent;
  };

  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    let updatedEvt: CalendarEvent | undefined;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          updatedEvt = { ...e, ...eventData };
          return updatedEvt;
        }
        return e;
      })
    );
    if (isSupabaseConfigured && updatedEvt) {
      supabaseService.upsertEvent(updatedEvt).catch((err) => console.warn('Supabase updateEvent failed:', err));
    }
    showToast('Evento da agenda atualizado.');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (isSupabaseConfigured) {
      supabaseService.deleteEvent(id).catch((err) => console.warn('Supabase deleteEvent failed:', err));
    }
    showToast('Evento removido da agenda.', 'info');
  };

  // Tasks (Kanban) Management
  const addTask = (taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'comments'>): KanbanTask => {
    const today = new Date().toISOString().split('T')[0];
    const client = clients.find((c) => c.id === taskData.clientId);
    const process = processes.find((p) => p.id === taskData.processId);

    const newTask: KanbanTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      clientName: client?.name,
      processProtocol: process?.protocolNumber,
      comments: [],
      createdAt: today,
    };

    setTasks((prev) => [newTask, ...prev]);

    if (isSupabaseConfigured) {
      supabaseService.upsertTask(newTask).catch((err) => console.warn('Supabase upsertTask failed:', err));
    }

    showToast('Tarefa criada com sucesso!');
    return newTask;
  };

  const updateTask = (id: string, taskData: Partial<KanbanTask>) => {
    let updatedTask: KanbanTask | undefined;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...taskData };
          return updatedTask;
        }
        return t;
      })
    );
    if (isSupabaseConfigured && updatedTask) {
      supabaseService.upsertTask(updatedTask).catch((err) => console.warn('Supabase updateTask failed:', err));
    }
    showToast('Tarefa atualizada.');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured) {
      supabaseService.deleteTask(id).catch((err) => console.warn('Supabase deleteTask failed:', err));
    }
    showToast('Tarefa removida.', 'info');
  };

  const moveTaskColumn = (taskId: string, newColumn: TaskColumn) => {
    let updatedTask: KanbanTask | undefined;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTask = { ...t, column: newColumn };
          return updatedTask;
        }
        return t;
      })
    );
    if (isSupabaseConfigured && updatedTask) {
      supabaseService.upsertTask(updatedTask).catch((err) => console.warn('Supabase moveTaskColumn failed:', err));
    }
  };

  const toggleTaskSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedChecklist = t.checklist.map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          return { ...t, checklist: updatedChecklist };
        }
        return t;
      })
    );
  };

  const addTaskComment = (taskId: string, commentText: string) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newComment = {
      id: `cmt-${Date.now()}`,
      author: currentUser.name,
      date: formattedDate,
      text: commentText,
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, comments: [...t.comments, newComment] };
        }
        return t;
      })
    );
    showToast('Comentário adicionado à tarefa.');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações foram marcadas como lidas.');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Reset Data to Factory Demo
  const resetToDemoData = () => {
    setClients(INITIAL_CLIENTS);
    setProcesses(INITIAL_PROCESSES);
    setBenefits(INITIAL_BENEFITS);
    setDocuments(INITIAL_DOCUMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setEvents(INITIAL_EVENTS);
    setTasks(INITIAL_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);

    localStorage.removeItem(`${STORAGE_KEY}_clients`);
    localStorage.removeItem(`${STORAGE_KEY}_processes`);
    localStorage.removeItem(`${STORAGE_KEY}_benefits`);
    localStorage.removeItem(`${STORAGE_KEY}_documents`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_events`);
    localStorage.removeItem(`${STORAGE_KEY}_tasks`);
    localStorage.removeItem(`${STORAGE_KEY}_notifications`);

    showToast('Dados de demonstração restaurados com sucesso!', 'info');
  };

  // Reset Everything to Clean Slate (Purge all tables and start completely fresh)
  const resetToCleanSlate = async () => {
    setIsSupabaseSyncing(true);
    showToast('Limpando todas as tabelas e dados ilustrativos...', 'info');

    try {
      if (isSupabaseConfigured) {
        await supabaseService.clearAllOperationalTables();
      }

      setClients([]);
      setProcesses([]);
      setDocuments([]);
      setTransactions([]);
      setTasks([]);
      setEvents([]);
      setNotifications([]);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);

      localStorage.removeItem(`${STORAGE_KEY}_clients`);
      localStorage.removeItem(`${STORAGE_KEY}_processes`);
      localStorage.removeItem(`${STORAGE_KEY}_documents`);
      localStorage.removeItem(`${STORAGE_KEY}_transactions`);
      localStorage.removeItem(`${STORAGE_KEY}_tasks`);
      localStorage.removeItem(`${STORAGE_KEY}_events`);
      localStorage.removeItem(`${STORAGE_KEY}_notifications`);
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(INITIAL_USERS[0]));

      showToast('Banco de dados e sistema limpos com sucesso! Pronto para cadastros do zero.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Erro ao limpar: ${msg}`, 'error');
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedClientId,
        setSelectedClientId,
        selectedProcessId,
        setSelectedProcessId,
        financialSubmenu,
        setFinancialSubmenu,
        globalSearchQuery,
        setGlobalSearchQuery,
        activeModal,
        setActiveModal,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,

        toasts,
        showToast,
        removeToast,

        users,
        currentUser,
        isAuthenticated,
        isLoggedIn: isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        switchUserRole,
        updateCurrentUserProfile,
        resetPassword,

        clients,
        processes,
        benefits,
        documents,
        transactions,
        events,
        tasks,
        notifications,

        addClient,
        updateClient,
        deleteClient,
        addClientTimelineEvent,

        addProcess,
        updateProcess,
        deleteProcess,
        updateProcessChecklistItem,
        addProcessTimelineEvent,

        addBenefit,
        updateBenefit,
        deleteBenefit,

        uploadDocument,
        updateDocument,
        deleteDocument,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleTransactionStatus,

        addEvent,
        updateEvent,
        deleteEvent,

        addTask,
        updateTask,
        deleteTask,
        moveTaskColumn,
        toggleTaskSubtask,
        addTaskComment,

        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,

        resetToDemoData,
        navigateToClientDetail,
        navigateToProcessDetail,
        openWhatsApp,

        isSupabaseConfigured,
        isSupabaseSyncing,
        supabaseStatus,
        lastSupabaseSync,
        syncFromSupabase,
        syncToSupabase,
        testSupabaseConnection,
        resetToCleanSlate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
