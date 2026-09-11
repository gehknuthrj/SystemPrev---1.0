import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Client,
  PensionProcess,
  BenefitType,
  DocumentItem,
  FinancialTransaction,
  KanbanTask,
  CalendarEvent,
  ActivityLogItem,
  ProcessChecklistItem,
  ProcessTimelineEvent,
  ClientTimelineEvent,
  User,
  UserRole,
} from '../types';

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'admin':
    case 'Administrador':
      return 'Sócia / Advogada Previdenciarista';
    case 'lawyer':
    case 'Consultor':
      return 'Advogado(a) Especialista em RGPS';
    case 'assistant':
    case 'Assistente':
      return 'Assistente Previdenciária';
    case 'financial':
    case 'Financeiro':
      return 'Gestor Financeiro';
    default:
      return 'Consultor Previdenciário';
  }
};

export interface SupabaseConnectionResult {
  connected: boolean;
  message: string;
  tableCounts?: {
    clients: number;
    processes: number;
    benefits: number;
    financial: number;
    tasks: number;
    events: number;
    documents: number;
  };
}

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured,

  /**
   * Tests the connection to Supabase and counts records in primary tables
   */
  async testConnection(): Promise<SupabaseConnectionResult> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        connected: false,
        message: 'Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      };
    }

    try {
      // Query benefits_catalog and clients count
      const [bRes, cRes, pRes, fRes, tRes, eRes, dRes] = await Promise.all([
        client.from('benefits_catalog').select('id', { count: 'exact', head: true }),
        client.from('clients').select('id', { count: 'exact', head: true }),
        client.from('pension_processes').select('id', { count: 'exact', head: true }),
        client.from('financial_transactions').select('id', { count: 'exact', head: true }),
        client.from('tasks').select('id', { count: 'exact', head: true }),
        client.from('calendar_events').select('id', { count: 'exact', head: true }),
        client.from('documents').select('id', { count: 'exact', head: true }),
      ]);

      if (bRes.error && cRes.error) {
        return {
          connected: false,
          message: `Erro ao consultar tabelas do Supabase: ${bRes.error.message || cRes.error.message}. Verifique se o script SQL foi executado.`,
        };
      }

      return {
        connected: true,
        message: 'Conexão com o Supabase estabelecida com sucesso!',
        tableCounts: {
          benefits: bRes.count || 0,
          clients: cRes.count || 0,
          processes: pRes.count || 0,
          financial: fRes.count || 0,
          tasks: tRes.count || 0,
          events: eRes.count || 0,
          documents: dRes.count || 0,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        connected: false,
        message: `Falha na conexão com Supabase: ${msg}`,
      };
    }
  },

  // ==========================================
  // AUTH & PROFILES (SUPABASE AUTH API)
  // ==========================================
  async getSession() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.warn('Supabase getSession error:', err);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data: { subscription } } = client.auth.onAuthStateChange(callback);
    return subscription;
  },

  async signUp(params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ user: any; session: any; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, session: null, error: 'Supabase não está configurado.' };
    }

    try {
      const userRole = (params.role || 'lawyer').toLowerCase() as UserRole;
      const roleLabel = getRoleLabel(userRole);

      const { data, error } = await client.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            name: params.name.trim(),
            full_name: params.name.trim(),
            phone: params.phone || '',
            role: userRole,
            role_label: roleLabel,
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      // If user created, ensure profile exists in public.profiles
      if (data.user) {
        try {
          await client.from('profiles').upsert(
            {
              auth_user_id: data.user.id,
              name: params.name.trim(),
              email: params.email.trim().toLowerCase(),
              role: ['admin', 'lawyer', 'assistant', 'financial'].includes(userRole) ? userRole : 'lawyer',
              role_label: roleLabel,
              phone: params.phone || null,
            },
            { onConflict: 'email' }
          );
        } catch (profErr) {
          console.warn('Profile upsert warning:', profErr);
        }
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { user: null, session: null, error: msg };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: any; session: any; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, session: null, error: 'Supabase não está configurado.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { user: null, session: null, error: msg };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { error: null };
    try {
      const { error } = await client.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase não configurado.' };
    }
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return { success: true, message: 'Link de recuperação enviado para seu e-mail!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  },

  async fetchUserProfile(userId?: string, email?: string): Promise<Partial<User> | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      let query = client.from('profiles').select('*');
      if (userId) {
        query = query.eq('auth_user_id', userId);
      } else if (email) {
        query = query.eq('email', email);
      }
      const { data, error } = await query.maybeSingle();
      if (error || !data) return null;
      return {
        id: data.auth_user_id || data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        roleLabel: data.role_label,
        phone: data.phone || undefined,
        avatar: data.avatar_url || undefined,
        avatarUrl: data.avatar_url || undefined,
      };
    } catch (err) {
      console.warn('fetchUserProfile error:', err);
      return null;
    }
  },

  async fetchCurrentAppUser(authUser: any): Promise<User> {
    const profile = await this.fetchUserProfile(authUser.id, authUser.email);
    const meta = authUser.user_metadata || {};
    const email = (profile?.email || authUser.email || '').toLowerCase();

    // Administrador principal
    const isMainAdmin = email === 'gehknuth@gmail.com';
    const role: UserRole = isMainAdmin ? 'admin' : (profile?.role || meta.role || 'lawyer');
    const roleLabel = isMainAdmin
      ? 'Administrador & Sócio Previdenciarista'
      : (profile?.roleLabel || meta.role_label || getRoleLabel(role));
    const name = isMainAdmin
      ? 'Geison Murilo Ferreira de Andrade Knuth'
      : (profile?.name || meta.name || meta.full_name || authUser.email?.split('@')[0] || 'Consultor Previdenciário');
    const phone = profile?.phone || meta.phone || '(11) 98765-4321';
    const avatar = profile?.avatar || profile?.avatarUrl || meta.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    return {
      id: authUser.id,
      name,
      email: authUser.email || email,
      role,
      roleLabel,
      phone,
      avatar,
      avatarUrl: avatar,
    };
  },

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const updates: any = {};
      if (profileData.name) updates.name = profileData.name;
      if (profileData.phone !== undefined) updates.phone = profileData.phone;
      if (profileData.role) {
        updates.role = profileData.role;
        updates.role_label = getRoleLabel(profileData.role);
      }
      if (profileData.avatar || profileData.avatarUrl) {
        updates.avatar_url = profileData.avatar || profileData.avatarUrl;
      }
      const { error } = await client
        .from('profiles')
        .update(updates)
        .or(`auth_user_id.eq.${userId},id.eq.${userId}`);
      return !error;
    } catch (err) {
      console.warn('updateUserProfile error:', err);
      return false;
    }
  },

  // ==========================================
  // CLIENTS
  // ==========================================
  async fetchClients(): Promise<Client[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data: clientsData, error } = await client
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!clientsData) return [];

      // Fetch timeline events for all clients
      const { data: timelineData } = await client
        .from('client_timeline_events')
        .select('*')
        .order('date', { ascending: false });

      const timelineMap = new Map<string, ClientTimelineEvent[]>();
      if (timelineData) {
        for (const item of timelineData) {
          const list = timelineMap.get(item.client_id) || [];
          list.push({
            id: item.id,
            date: item.date,
            type: item.type,
            title: item.title,
            description: item.description,
            author: item.author,
          });
          timelineMap.set(item.client_id, list);
        }
      }

      return clientsData.map((row: any) => ({
        id: row.id,
        name: row.name,
        cpf: row.cpf,
        rg: row.rg || '',
        birthDate: row.birth_date,
        gender: row.gender,
        maritalStatus: row.marital_status || 'Casado(a)',
        profession: row.profession || '',
        nitPisPasep: row.nit_pis_pasep || '',
        motherName: row.mother_name || '',
        fatherName: row.father_name || '',
        whatsapp: row.whatsapp || '',
        phone: row.phone || '',
        email: row.email || '',
        cep: row.cep || '',
        street: row.street || '',
        number: row.number || '',
        complement: row.complement || '',
        neighborhood: row.neighborhood || '',
        city: row.city || '',
        state: row.state || 'SP',
        caseSummary: row.case_summary || '',
        pensionHistory: row.pension_history || '',
        currentSituation: row.current_situation || '',
        clientObjective: row.client_objective || '',
        caseNotes: row.case_notes || '',
        strategySteps: row.strategy_steps || '',
        status: row.status || 'Ativo',
        benefitInterest: row.benefit_interest || '',
        createdAt: row.created_at,
        lastUpdatedAt: row.updated_at || row.created_at,
        timeline: timelineMap.get(row.id) || [],
      }));
    } catch (err) {
      console.warn('Supabase fetchClients error:', err);
      return null;
    }
  },

  async upsertClient(clientItem: Client): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const payload: any = {
        name: clientItem.name,
        cpf: clientItem.cpf,
        rg: clientItem.rg,
        birth_date: clientItem.birthDate,
        gender: clientItem.gender,
        marital_status: clientItem.maritalStatus,
        profession: clientItem.profession,
        nit_pis_pasep: clientItem.nitPisPasep,
        mother_name: clientItem.motherName,
        father_name: clientItem.fatherName,
        whatsapp: clientItem.whatsapp,
        phone: clientItem.phone,
        email: clientItem.email,
        cep: clientItem.cep,
        street: clientItem.street,
        number: clientItem.number,
        complement: clientItem.complement,
        neighborhood: clientItem.neighborhood,
        city: clientItem.city,
        state: clientItem.state,
        case_summary: clientItem.caseSummary,
        pension_history: clientItem.pensionHistory,
        current_situation: clientItem.currentSituation,
        client_objective: clientItem.clientObjective,
        case_notes: clientItem.caseNotes,
        strategy_steps: clientItem.strategySteps,
        status: clientItem.status,
        benefit_interest: clientItem.benefitInterest,
      };

      // Only include id if it's a valid UUID
      if (clientItem.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientItem.id)) {
        payload.id = clientItem.id;
      }

      const { error } = await client.from('clients').upsert(payload, { onConflict: 'cpf' });
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase upsertClient error:', err);
      return false;
    }
  },

  async deleteClient(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('clients').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteClient error:', err);
      return false;
    }
  },

  async addClientTimelineEvent(clientId: string, event: ClientTimelineEvent): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('client_timeline_events').insert({
        client_id: clientId,
        date: event.date,
        type: event.type,
        title: event.title,
        description: event.description,
        author: event.author,
      });
      return !error;
    } catch (err) {
      console.warn('Supabase addClientTimelineEvent error:', err);
      return false;
    }
  },

  // ==========================================
  // PROCESSES
  // ==========================================
  async fetchProcesses(): Promise<PensionProcess[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data: procData, error } = await client
        .from('pension_processes')
        .select(`
          *,
          client:clients (id, name, cpf)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!procData) return [];

      // Fetch checklist items and timeline events
      const [chkRes, timeRes] = await Promise.all([
        client.from('process_checklist_items').select('*'),
        client.from('process_timeline_events').select('*').order('date', { ascending: false }),
      ]);

      const chkMap = new Map<string, ProcessChecklistItem[]>();
      if (chkRes.data) {
        for (const item of chkRes.data) {
          const list = chkMap.get(item.process_id) || [];
          list.push({
            id: item.id,
            title: item.title,
            required: item.required,
            status: item.status,
            notes: item.notes || '',
            updatedAt: item.updated_at,
          });
          chkMap.set(item.process_id, list);
        }
      }

      const timeMap = new Map<string, ProcessTimelineEvent[]>();
      if (timeRes.data) {
        for (const item of timeRes.data) {
          const list = timeMap.get(item.process_id) || [];
          list.push({
            id: item.id,
            date: item.date,
            title: item.title,
            description: item.description,
            badge: item.badge || undefined,
          });
          timeMap.set(item.process_id, list);
        }
      }

      return procData.map((row: any) => ({
        id: row.id,
        clientId: row.client_id,
        clientName: row.client?.name || 'Cliente Vinculado',
        clientCpf: row.client?.cpf || '',
        benefitId: row.benefit_id || '',
        benefitName: row.benefit_name || 'Benefício Previdenciário',
        protocolNumber: row.protocol_number,
        judicialProcessNumber: row.judicial_process_number || '',
        requestDate: row.request_date,
        protocolDate: row.protocol_date || undefined,
        status: row.status,
        lastProgress: row.last_progress || '',
        lastProgressDate: row.last_progress_date || row.request_date,
        nextAction: row.next_action || '',
        deadline: row.deadline || undefined,
        responsible: row.responsible || 'Equipe Previdenciária',
        feeAmount: Number(row.fee_amount || 0),
        paymentMethod: row.payment_method || 'Honorários no Êxito (30%)',
        notes: row.notes || '',
        checklist: chkMap.get(row.id) || [],
        timeline: timeMap.get(row.id) || [],
        medicalExam: row.medical_exam || undefined,
        socialExam: row.social_exam || undefined,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetchProcesses error:', err);
      return null;
    }
  },

  async upsertProcess(proc: PensionProcess): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const payload: any = {
        client_id: proc.clientId,
        benefit_id: proc.benefitId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proc.benefitId) ? proc.benefitId : null,
        benefit_name: proc.benefitName,
        protocol_number: proc.protocolNumber,
        judicial_process_number: proc.judicialProcessNumber || null,
        request_date: proc.requestDate,
        protocol_date: proc.protocolDate || null,
        status: proc.status,
        last_progress: proc.lastProgress,
        last_progress_date: proc.lastProgressDate || null,
        next_action: proc.nextAction,
        deadline: proc.deadline || null,
        responsible: proc.responsible,
        fee_amount: proc.feeAmount,
        payment_method: proc.paymentMethod,
        notes: proc.notes || null,
        medical_exam: proc.medicalExam || null,
        social_exam: proc.socialExam || null,
      };

      if (proc.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proc.id)) {
        payload.id = proc.id;
      }

      const { data, error } = await client.from('pension_processes').upsert(payload).select().single();
      if (error) throw error;

      const processId = data?.id || proc.id;

      // Sync checklist items if processId is a valid UUID
      if (processId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processId) && proc.checklist?.length) {
        for (const item of proc.checklist) {
          await client.from('process_checklist_items').upsert({
            process_id: processId,
            title: item.title,
            required: item.required,
            status: item.status,
            notes: item.notes || null,
          });
        }
      }

      return true;
    } catch (err) {
      console.warn('Supabase upsertProcess error:', err);
      return false;
    }
  },

  async deleteProcess(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('pension_processes').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteProcess error:', err);
      return false;
    }
  },

  async updateProcessChecklistItem(
    processId: string,
    title: string,
    status: string,
    notes?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client
        .from('process_checklist_items')
        .update({ status, notes: notes || null })
        .eq('process_id', processId)
        .eq('title', title);
      return !error;
    } catch (err) {
      console.warn('Supabase updateProcessChecklistItem error:', err);
      return false;
    }
  },

  async addProcessTimelineEvent(
    processId: string,
    event: ProcessTimelineEvent
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('process_timeline_events').insert({
        process_id: processId,
        date: event.date,
        title: event.title,
        description: event.description,
        badge: event.badge || null,
      });
      return !error;
    } catch (err) {
      console.warn('Supabase addProcessTimelineEvent error:', err);
      return false;
    }
  },

  // ==========================================
  // BENEFITS CATALOG
  // ==========================================
  async fetchBenefits(): Promise<BenefitType[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('benefits_catalog').select('*').order('name');
      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map((row: any) => ({
        id: row.id,
        code: row.code || '',
        name: row.name,
        category: row.category,
        description: row.description,
        defaultChecklist: Array.isArray(row.default_checklist) ? row.default_checklist : [],
      }));
    } catch (err) {
      console.warn('Supabase fetchBenefits error:', err);
      return null;
    }
  },

  async upsertBenefit(benefit: BenefitType): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload: any = {
        name: benefit.name,
        code: benefit.code || null,
        category: benefit.category,
        description: benefit.description,
        default_checklist: benefit.defaultChecklist,
      };
      if (benefit.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(benefit.id)) {
        payload.id = benefit.id;
      }
      const { error } = await client.from('benefits_catalog').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('Supabase upsertBenefit error:', err);
      return false;
    }
  },

  // ==========================================
  // DOCUMENTS
  // ==========================================
  async fetchDocuments(): Promise<DocumentItem[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('documents')
        .select(`
          *,
          client:clients (name),
          process:pension_processes (protocol_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        clientId: row.client_id,
        clientName: row.client?.name || 'Cliente',
        processId: row.process_id || undefined,
        processProtocol: row.process?.protocol_number || undefined,
        name: row.name,
        category: row.category,
        fileType: row.file_type || 'application/pdf',
        fileSize: row.file_size || '1.2 MB',
        uploadDate: row.created_at,
        status: row.status || 'Em análise',
        notes: row.notes || '',
        dataUrl: row.file_url || undefined,
      }));
    } catch (err) {
      console.warn('Supabase fetchDocuments error:', err);
      return null;
    }
  },

  async upsertDocument(doc: DocumentItem): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload: any = {
        client_id: doc.clientId,
        process_id: doc.processId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.processId) ? doc.processId : null,
        name: doc.name,
        category: doc.category,
        file_type: doc.fileType,
        file_size: doc.fileSize,
        file_url: doc.dataUrl || null,
        status: doc.status,
        notes: doc.notes || null,
      };
      if (doc.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id)) {
        payload.id = doc.id;
      }
      const { error } = await client.from('documents').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('Supabase upsertDocument error:', err);
      return false;
    }
  },

  async deleteDocument(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('documents').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteDocument error:', err);
      return false;
    }
  },

  // ==========================================
  // FINANCIAL TRANSACTIONS
  // ==========================================
  async fetchFinancial(): Promise<FinancialTransaction[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('financial_transactions')
        .select(`
          *,
          client:clients (name),
          process:pension_processes (protocol_number)
        `)
        .order('due_date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        type: row.type,
        description: row.description,
        clientId: row.client_id || undefined,
        clientName: row.client?.name || undefined,
        processId: row.process_id || undefined,
        processProtocol: row.process?.protocol_number || undefined,
        category: row.category,
        amount: Number(row.amount),
        dueDate: row.due_date,
        paymentDate: row.payment_date || undefined,
        paymentMethod: row.payment_method || 'Pix',
        status: row.status,
        notes: row.notes || '',
        supplier: row.supplier || undefined,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetchFinancial error:', err);
      return null;
    }
  },

  async upsertFinancial(tx: FinancialTransaction): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload: any = {
        type: tx.type,
        description: tx.description,
        client_id: tx.clientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.clientId) ? tx.clientId : null,
        process_id: tx.processId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.processId) ? tx.processId : null,
        category: tx.category,
        amount: tx.amount,
        due_date: tx.dueDate,
        payment_date: tx.paymentDate || null,
        payment_method: tx.paymentMethod,
        status: tx.status,
        notes: tx.notes || null,
        supplier: tx.supplier || null,
      };
      if (tx.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.id)) {
        payload.id = tx.id;
      }
      const { error } = await client.from('financial_transactions').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('Supabase upsertFinancial error:', err);
      return false;
    }
  },

  async deleteFinancial(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('financial_transactions').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteFinancial error:', err);
      return false;
    }
  },

  // ==========================================
  // TASKS (KANBAN)
  // ==========================================
  async fetchTasks(): Promise<KanbanTask[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('tasks')
        .select(`
          *,
          client:clients (name),
          process:pension_processes (protocol_number)
        `)
        .order('deadline');

      if (error) throw error;
      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        clientId: row.client_id || undefined,
        clientName: row.client?.name || undefined,
        processId: row.process_id || undefined,
        processProtocol: row.process?.protocol_number || undefined,
        column: row.column_status || 'todo',
        priority: row.priority || 'Média',
        deadline: row.deadline,
        responsible: row.responsible,
        checklist: Array.isArray(row.checklist) ? row.checklist : [],
        comments: Array.isArray(row.comments) ? row.comments : [],
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetchTasks error:', err);
      return null;
    }
  },

  async upsertTask(task: KanbanTask): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload: any = {
        title: task.title,
        description: task.description || null,
        client_id: task.clientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(task.clientId) ? task.clientId : null,
        process_id: task.processId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(task.processId) ? task.processId : null,
        column_status: task.column,
        priority: task.priority,
        deadline: task.deadline,
        responsible: task.responsible,
        checklist: task.checklist,
        comments: task.comments,
      };
      if (task.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(task.id)) {
        payload.id = task.id;
      }
      const { error } = await client.from('tasks').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('Supabase upsertTask error:', err);
      return false;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('tasks').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteTask error:', err);
      return false;
    }
  },

  // ==========================================
  // CALENDAR EVENTS
  // ==========================================
  async fetchEvents(): Promise<CalendarEvent[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('calendar_events')
        .select(`
          *,
          client:clients (name),
          process:pension_processes (protocol_number)
        `)
        .order('date');

      if (error) throw error;
      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        clientId: row.client_id || undefined,
        clientName: row.client?.name || undefined,
        processId: row.process_id || undefined,
        date: row.date,
        time: row.time,
        duration: row.duration || '1h',
        location: row.location || '',
        category: row.category,
        type: row.event_type || row.category,
        description: row.description || '',
        notes: row.notes || '',
        responsible: row.responsible,
      }));
    } catch (err) {
      console.warn('Supabase fetchEvents error:', err);
      return null;
    }
  },

  async upsertEvent(event: CalendarEvent): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload: any = {
        title: event.title,
        client_id: event.clientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.clientId) ? event.clientId : null,
        process_id: event.processId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.processId) ? event.processId : null,
        date: event.date,
        time: event.time,
        duration: event.duration || '1h',
        location: event.location || 'Agência da Previdência Social - APS',
        category: event.category || 'Perícia médica',
        event_type: event.type || 'Perícia Médica',
        description: event.description || null,
        notes: event.notes || null,
        responsible: event.responsible,
      };
      if (event.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.id)) {
        payload.id = event.id;
      }
      const { error } = await client.from('calendar_events').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('Supabase upsertEvent error:', err);
      return false;
    }
  },

  async deleteEvent(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('calendar_events').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteEvent error:', err);
      return false;
    }
  },

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  async fetchActivityLogs(): Promise<ActivityLogItem[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        userName: row.user_name,
        action: row.action,
        target: row.target,
        details: row.details || '',
      }));
    } catch (err) {
      console.warn('Supabase fetchActivityLogs error:', err);
      return null;
    }
  },

  async insertActivityLog(log: ActivityLogItem): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('activity_logs').insert({
        user_name: log.userName,
        action: log.action,
        target: log.target,
        details: log.details || null,
        timestamp: log.timestamp || new Date().toISOString(),
      });
      return !error;
    } catch (err) {
      console.warn('Supabase insertActivityLog error:', err);
      return false;
    }
  },

  // ==========================================
  // SEED LOCAL DATA INTO SUPABASE (ONE-CLICK INITIAL PUSH)
  // ==========================================
  async pushLocalDataToSupabase(data: {
    clients: Client[];
    processes: PensionProcess[];
    benefits: BenefitType[];
    documents: DocumentItem[];
    transactions: FinancialTransaction[];
    tasks: KanbanTask[];
    events: CalendarEvent[];
  }): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase não configurado.' };
    }

    try {
      let count = 0;

      // 1. Benefits
      for (const b of data.benefits) {
        await this.upsertBenefit(b);
        count++;
      }

      // 2. Clients
      for (const c of data.clients) {
        await this.upsertClient(c);
        count++;
      }

      // 3. Processes
      for (const p of data.processes) {
        await this.upsertProcess(p);
        count++;
      }

      // 4. Financial
      for (const f of data.transactions) {
        await this.upsertFinancial(f);
        count++;
      }

      // 5. Tasks
      for (const t of data.tasks) {
        await this.upsertTask(t);
        count++;
      }

      // 6. Events
      for (const e of data.events) {
        await this.upsertEvent(e);
        count++;
      }

      return {
        success: true,
        message: `Sincronização concluída com sucesso! ${count} registros integrados ao banco de dados Supabase.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Erro na sincronização em lote: ${msg}`,
      };
    }
  },

  /**
   * Limpa todas as tabelas operacionais do Supabase para começar do zero
   */
  async clearAllOperationalTables(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase não está configurado.' };
    }

    try {
      // Deleta em ordem respeitando chaves estrangeiras
      await Promise.allSettled([
        client.from('client_timeline_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('process_timeline_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('process_checklist_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('financial_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('calendar_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('pension_processes').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        client.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      return {
        success: true,
        message: 'Todas as tabelas operacionais do Supabase foram limpas com sucesso. Pronto para novos cadastros do zero.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Erro ao limpar tabelas do Supabase: ${msg}`,
      };
    }
  },
};
