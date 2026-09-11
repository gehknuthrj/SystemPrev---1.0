export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- PREVCONSULT - CRM & GESTÃO PREVIDENCIÁRIA ESPECIALIZADA
-- SCRIPT SQL COMPLETO PARA SUPABASE (POSTGRESQL 15+)
-- ==============================================================================
-- Instruções de uso:
-- 1. Acesse seu painel no Supabase (https://supabase.com).
-- 2. Crie ou selecione seu projeto.
-- 3. No menu lateral, clique em "SQL Editor" -> "New Query".
-- 4. Cole todo este script e clique em "RUN".
-- ==============================================================================

-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. CRIAÇÃO DOS TIPOS ENUM PERSONALIZADOS
-- ==============================================================================

do $$ begin
    create type user_role_type as enum (
        'admin',
        'lawyer',
        'assistant',
        'financial'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type client_status_type as enum (
        'Ativo',
        'Em Análise',
        'Aguardando Documentos',
        'Inativo',
        'Concluído'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type benefit_category_type as enum (
        'Programáveis',
        'Incapacidade',
        'Assistenciais',
        'Dependentes',
        'Maternidade',
        'Outros'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type process_status_type as enum (
        'Novo cliente',
        'Em análise',
        'Documentação pendente',
        'Documentação completa',
        'Requerimento em preparação',
        'Requerimento protocolado',
        'Protocolado no INSS',
        'Em análise pelo INSS',
        'Exigência',
        'Perícia agendada',
        'Aguardando resultado',
        'Deferido',
        'Indeferido',
        'Recurso administrativo',
        'Processo judicial',
        'Implantado',
        'Finalizado',
        'Arquivado'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type document_status_type as enum (
        'Pendente',
        'Recebido',
        'Em análise',
        'Validado',
        'Recusado'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type financial_type as enum (
        'receita',
        'despesa'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type financial_status_type as enum (
        'Pendente',
        'Recebido',
        'Pago',
        'Atrasado',
        'Cancelado'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type task_column_type as enum (
        'todo',
        'in_progress',
        'waiting',
        'done'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type task_priority_type as enum (
        'Baixa',
        'Média',
        'Alta',
        'Urgente'
    );
exception
    when duplicate_object then null;
end $$;

-- ==============================================================================
-- 3. FUNÇÃO GATILHO PARA ATUALIZAÇÃO AUTOMÁTICA DE DATA (updated_at)
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- 4. TABELAS DO SISTEMA
-- ==============================================================================

-- 4.1. Configurações Institucionais do Escritório
create table if not exists public.office_settings (
    id uuid primary key default gen_random_uuid(),
    office_name text not null default 'PrevConsult - Consultoria & Advocacia Previdenciária',
    cnpj varchar(25),
    oab varchar(60),
    email text,
    phone varchar(30),
    address text,
    pix_key text,
    whatsapp_template text default 'Olá, {cliente}! Lembramos que sua Perícia Médica no INSS está agendada para o dia {data} às {hora} na agência {local}. Lembre-se de levar documento com foto e laudos médicos atualizados.',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.2. Perfis de Usuários (Integrado com auth.users do Supabase)
create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    email text not null unique,
    role user_role_type not null default 'lawyer',
    role_label text not null default 'Consultor Previdenciário',
    phone varchar(30),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.3. Clientes (Segurados & Requerentes)
create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    cpf varchar(18) not null unique,
    rg varchar(25),
    birth_date date not null,
    gender varchar(20) not null check (gender in ('Masculino', 'Feminino', 'Outro')),
    marital_status varchar(30) default 'Casado(a)',
    profession varchar(100),
    nit_pis_pasep varchar(30),
    mother_name text not null,
    father_name text,
    whatsapp varchar(30) not null,
    phone varchar(30),
    email text,
    cep varchar(12),
    street text,
    number varchar(20),
    complement text,
    neighborhood varchar(100),
    city varchar(100) not null,
    state varchar(2) not null,
    case_summary text,
    pension_history text,
    current_situation text,
    client_objective text,
    case_notes text,
    strategy_steps text,
    status client_status_type not null default 'Ativo',
    benefit_interest text,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.4. Timeline de Atendimento do Cliente
create table if not exists public.client_timeline_events (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients(id) on delete cascade,
    date timestamp with time zone not null default timezone('utc'::text, now()),
    type varchar(50) not null check (type in ('Atendimento', 'Documento', 'Andamento', 'Perícia', 'Financeiro', 'Nota')),
    title text not null,
    description text not null,
    author text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.5. Catálogo Parametrizado de Benefícios do INSS
create table if not exists public.benefits_catalog (
    id uuid primary key default gen_random_uuid(),
    code varchar(20) unique,
    name text not null,
    category benefit_category_type not null,
    description text not null,
    default_checklist jsonb not null default '[]'::jsonb,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.6. Processos Previdenciários (Administrativos e Judiciais)
create table if not exists public.pension_processes (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients(id) on delete cascade,
    benefit_id uuid references public.benefits_catalog(id) on delete set null,
    benefit_name text not null,
    protocol_number varchar(60) not null,
    judicial_process_number varchar(60),
    request_date date not null default current_date,
    protocol_date date,
    status process_status_type not null default 'Novo cliente',
    last_progress text,
    last_progress_date date,
    next_action text,
    deadline date,
    responsible text not null,
    fee_amount numeric(12, 2) default 0.00,
    payment_method varchar(50) default 'Honorários no Êxito (30%)',
    notes text,
    medical_exam jsonb,
    social_exam jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.7. Checklist de Documentos do Processo
create table if not exists public.process_checklist_items (
    id uuid primary key default gen_random_uuid(),
    process_id uuid not null references public.pension_processes(id) on delete cascade,
    title text not null,
    required boolean not null default true,
    status document_status_type not null default 'Pendente',
    notes text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.8. Histórico de Andamentos do Processo
create table if not exists public.process_timeline_events (
    id uuid primary key default gen_random_uuid(),
    process_id uuid not null references public.pension_processes(id) on delete cascade,
    date timestamp with time zone not null default timezone('utc'::text, now()),
    title text not null,
    description text not null,
    badge varchar(50),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.9. Repositório de Documentos e Arquivos
create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients(id) on delete cascade,
    process_id uuid references public.pension_processes(id) on delete set null,
    name text not null,
    category varchar(60) not null,
    file_type varchar(50) not null default 'application/pdf',
    file_size varchar(30) not null default '1.2 MB',
    storage_path text,
    file_url text,
    status document_status_type not null default 'Em análise',
    notes text,
    verified_by text,
    verified_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.10. Fluxo Financeiro (Honorários & Despesas)
create table if not exists public.financial_transactions (
    id uuid primary key default gen_random_uuid(),
    type financial_type not null,
    description text not null,
    client_id uuid references public.clients(id) on delete set null,
    process_id uuid references public.pension_processes(id) on delete set null,
    category varchar(80) not null,
    amount numeric(12, 2) not null check (amount >= 0),
    due_date date not null,
    payment_date date,
    payment_method varchar(60) not null default 'Pix',
    status financial_status_type not null default 'Pendente',
    notes text,
    supplier text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.11. Tarefas Operacionais (Quadro Kanban)
create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    client_id uuid references public.clients(id) on delete set null,
    process_id uuid references public.pension_processes(id) on delete set null,
    column_status task_column_type not null default 'todo',
    priority task_priority_type not null default 'Média',
    deadline date not null,
    responsible text not null,
    checklist jsonb not null default '[]'::jsonb,
    comments jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.12. Agenda de Compromissos & Perícias Médicas
create table if not exists public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    client_id uuid references public.clients(id) on delete set null,
    process_id uuid references public.pension_processes(id) on delete set null,
    date date not null,
    time time not null,
    duration varchar(30) default '1h',
    location text default 'Agência da Previdência Social - APS',
    category varchar(50) default 'Perícia médica',
    event_type varchar(50) default 'Perícia Médica',
    description text,
    notes text,
    responsible text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.13. Logs de Auditoria & Atividades
create table if not exists public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
    user_name text not null,
    user_id uuid references public.profiles(id) on delete set null,
    action varchar(60) not null,
    target text not null,
    details text
);

-- 4.14. Notificações do Sistema
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    message text not null,
    type varchar(30) not null check (type in ('pericia', 'documento', 'financeiro', 'tarefa', 'prazo', 'geral')),
    read boolean not null default false,
    link_type varchar(30),
    target_id uuid,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 5. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ==============================================================================

drop trigger if exists set_updated_at_office_settings on public.office_settings;
create trigger set_updated_at_office_settings
before update on public.office_settings
for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_clients on public.clients;
create trigger set_updated_at_clients
before update on public.clients
for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_pension_processes on public.pension_processes;
create trigger set_updated_at_pension_processes
before update on public.pension_processes
for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_financial_transactions on public.financial_transactions;
create trigger set_updated_at_financial_transactions
before update on public.financial_transactions
for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_tasks on public.tasks;
create trigger set_updated_at_tasks
before update on public.tasks
for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 6. ÍNDICES PARA ALTA PERFORMANCE DE CONSULTA
-- ==============================================================================

create index if not exists idx_clients_cpf on public.clients(cpf);
create index if not exists idx_clients_status on public.clients(status);
create index if not exists idx_clients_name on public.clients using gin (to_tsvector('portuguese', name));

create index if not exists idx_processes_client_id on public.pension_processes(client_id);
create index if not exists idx_processes_protocol on public.pension_processes(protocol_number);
create index if not exists idx_processes_status on public.pension_processes(status);

create index if not exists idx_documents_client_id on public.documents(client_id);
create index if not exists idx_documents_process_id on public.documents(process_id);

create index if not exists idx_financial_client_id on public.financial_transactions(client_id);
create index if not exists idx_financial_status on public.financial_transactions(status);
create index if not exists idx_financial_due_date on public.financial_transactions(due_date);

create index if not exists idx_tasks_column on public.tasks(column_status);
create index if not exists idx_tasks_deadline on public.tasks(deadline);

create index if not exists idx_calendar_date on public.calendar_events(date);

-- ==============================================================================
-- 7. SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.office_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_timeline_events enable row level security;
alter table public.benefits_catalog enable row level security;
alter table public.pension_processes enable row level security;
alter table public.process_checklist_items enable row level security;
alter table public.process_timeline_events enable row level security;
alter table public.documents enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- Políticas de Acesso Total para Usuários Autenticados (Equipe do Escritório)
create policy "Acesso completo a membros autenticados" on public.office_settings for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.profiles for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.clients for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.client_timeline_events for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.benefits_catalog for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.pension_processes for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.process_checklist_items for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.process_timeline_events for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.documents for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.financial_transactions for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.tasks for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.calendar_events for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.activity_logs for all to authenticated using (true) with check (true);
create policy "Acesso completo a membros autenticados" on public.notifications for all to authenticated using (true) with check (true);

-- Política permissiva de leitura para catálogo e configurações (caso use modo híbrido)
create policy "Permitir leitura anonima do catalogo" on public.benefits_catalog for select to anon using (true);
create policy "Permitir leitura anonima de configuracoes" on public.office_settings for select to anon using (true);

-- ==============================================================================
-- 8. GATILHO AUTOMÁTICO PARA CRIAÇÃO DE PROFILE AO CRIAR CONTA NO SUPABASE AUTH
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (auth_user_id, name, email, role, role_label)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        'lawyer',
        'Consultor Previdenciário'
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 9. CONFIGURAÇÃO DE BUCKET DO SUPABASE STORAGE (DOCUMENTOS DOS CLIENTES)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('prevconsult-docs', 'prevconsult-docs', false)
on conflict (id) do nothing;

create policy "Upload autenticado de documentos"
on storage.objects for insert to authenticated
with check (bucket_id = 'prevconsult-docs');

create policy "Leitura autenticada de documentos"
on storage.objects for select to authenticated
using (bucket_id = 'prevconsult-docs');

-- ==============================================================================
-- 10. CARGA INICIAL (SEEDS) - CATÁLOGO DE BENEFÍCIOS DO INSS & DADOS PADRÃO
-- ==============================================================================

-- 10.1. Dados Padrão do Escritório
insert into public.office_settings (
    office_name,
    cnpj,
    oab,
    email,
    phone,
    address,
    pix_key
) values (
    'PrevConsult - Consultoria & Advocacia Previdenciária',
    '32.415.890/0001-24',
    'OAB/SP 412.390 - Sociedade Individual',
    'contato@prevconsult.com.br',
    '(11) 98765-4321',
    'Av. Paulista, 1578, Conjunto 1204 - Bela Vista, São Paulo - SP',
    'financeiro@prevconsult.com.br'
);

-- 10.2. Usuário Administrador
insert into public.profiles (
    name,
    email,
    role,
    role_label,
    phone
) values 
    ('Geison Murilo Ferreira de Andrade Knuth', 'gehknuth@gmail.com', 'admin', 'Administrador & Sócio Previdenciarista', '(11) 98765-4321');

-- 10.3. Catálogo Parametrizado de Benefícios do INSS
insert into public.benefits_catalog (code, name, category, description, default_checklist) values
(
    'B42',
    'Aposentadoria por Tempo de Contribuição (Regras de Transição)',
    'Programáveis',
    'Benefício concedido aos segurados que atingirem os requisitos de pedágio 50%, pedágio 100%, pontos ou idade mínima progressiva.',
    '["RG e CPF do Segurado", "Comprovante de Residência Atualizado", "Extrato do CNIS Completo", "Carteiras de Trabalho (CTPS originais)", "Carnês / Guias GPS pagas", "Certidão de Tempo de Contribuição (CTC se houver)"]'::jsonb
),
(
    'B41',
    'Aposentadoria por Idade Urbana',
    'Programáveis',
    'Homens a partir de 65 anos e mulheres a partir de 62 anos, com carência mínima de 180 contribuições mensais (15 anos).',
    '["RG e CPF do Segurado", "Comprovante de Residência Atualizado", "Extrato CNIS", "Carteiras de Trabalho (CTPS)"]'::jsonb
),
(
    'B46',
    'Aposentadoria Especial (Insalubridade / Periculosidade)',
    'Programáveis',
    'Para segurados expostos a agentes nocivos químicos, físicos ou biológicos durante 15, 20 ou 25 anos de trabalho.',
    '["RG e CPF", "Extrato CNIS", "Carteiras de Trabalho (CTPS)", "Perfil Profissiográfico Previdenciário (PPP assinado)", "Laudo Técnico das Condições Ambientais de Trabalho (LTCAT)", "Comprovante de entrega de EPI"]'::jsonb
),
(
    'B31',
    'Auxílio por Incapacidade Temporária (Auxílio-Doença)',
    'Incapacidade',
    'Benefício devido ao segurado que ficar incapacitado temporariamente para o trabalho por mais de 15 dias consecutivos.',
    '["Documento de Identidade e CPF", "Comprovante de Residência", "Extrato CNIS", "Atestados médicos detalhados com CID", "Laudos de exames de imagem e laboratoriais", "Receituários de medicamentos em uso", "Declaração de afastamento do último dia de trabalho"]'::jsonb
),
(
    'B32',
    'Aposentadoria por Incapacidade Permanente (Invalidez)',
    'Incapacidade',
    'Concedida ao segurado considerado permanentemente incapaz de exercer qualquer atividade laborativa e sem reabilitação profissional.',
    '["Documento com foto e CPF", "CNIS", "Laudos médicos comprobatórios de incapacidade total e definitiva", "Histórico de internações ou cirurgias", "Relatório do médico assistente com prognóstico"]'::jsonb
),
(
    'B87',
    'Benefício de Prestação Continuada (BPC/LOAS) - Pessoa com Deficiência',
    'Assistenciais',
    'Benefício de 1 salário mínimo para pessoas com deficiência de qualquer idade com impedimento de longo prazo e baixa renda.',
    '["Documentos de todos os membros do grupo familiar (RG/CPF)", "Comprovante de Inscrição no Cadastro Único (CadÚnico atualizado)", "Comprovante de Renda Familiar", "Laudo médico circunstanciado comprovando a deficiência e barreiras sociais", "Comprovante de despesas com remédios e fraldas"]'::jsonb
),
(
    'B88',
    'Benefício de Prestação Continuada (BPC/LOAS) - Idoso (65+ anos)',
    'Assistenciais',
    'Benefício de 1 salário mínimo mensal concedido ao idoso com 65 anos ou mais em situação de vulnerabilidade socioeconômica.',
    '["RG e CPF de todos os residentes", "CadÚnico atualizado no CRAS", "Comprovante de endereço", "Extrato bancário de renda familiar"]'::jsonb
),
(
    'B21',
    'Pensão por Morte Urbana / Rural',
    'Dependentes',
    'Benefício pago aos dependentes do segurado que falecer, aposentado ou não.',
    '["Certidão de Óbito do Segurado", "Documentos do falecido (RG, CPF, CNIS)", "Documentos dos dependentes", "Certidão de Casamento ou Provas de União Estável (ao menos 3 documentos)", "Certidão de Nascimento de filhos menores"]'::jsonb
),
(
    'B80',
    'Salário-Maternidade',
    'Maternidade',
    'Benefício devido aos segurados por motivo de nascimento de filho, adoção ou guarda judicial com fins de adoção.',
    '["Documento com foto e CPF", "Certidão de Nascimento da criança ou termo de guarda/adoção", "Atestado médico em caso de afastamento 28 dias antes do parto", "Comprovantes de contribuição"]'::jsonb
),
(
    'REV',
    'Revisão da Vida Toda / Revisão de RMI',
    'Outros',
    'Ação revisional para recalcular o valor inicial do benefício incluindo contribuições anteriores a julho de 1994.',
    '["Carta de Concessão do Benefício", "Memória de Cálculo da RMI", "Extrato CNIS completo com salários anteriores a 07/1994", "Microfichas do INSS ou carnês antigos", "Cálculo pericial demonstrativo de vantagem"]'::jsonb
);
`;
