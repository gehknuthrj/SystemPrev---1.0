-- ==============================================================================
-- PREVCONSULT - SCRIPT PARA LIMPAR TODAS AS TABELAS E INICIAR DO ZERO
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase para zerar os dados operacionais
-- e manter apenas o Administrador: Geison Murilo Ferreira de Andrade Knuth
-- ==============================================================================

-- 1. Limpar todas as tabelas filhas e operacionais
truncate table public.client_timeline_events cascade;
truncate table public.process_timeline_events cascade;
truncate table public.process_checklist_items cascade;
truncate table public.documents cascade;
truncate table public.financial_transactions cascade;
truncate table public.tasks cascade;
truncate table public.calendar_events cascade;
truncate table public.activity_logs cascade;
truncate table public.notifications cascade;
truncate table public.pension_processes cascade;
truncate table public.clients cascade;

-- 2. Limpar perfis antigos e manter exclusivamente o Administrador Geison Murilo
delete from public.profiles where email != 'gehknuth@gmail.com';

-- 3. Inserir ou atualizar o perfil do Administrador Geison Murilo
insert into public.profiles (
    name,
    email,
    role,
    role_label,
    phone
) values (
    'Geison Murilo Ferreira de Andrade Knuth',
    'gehknuth@gmail.com',
    'admin',
    'Administrador & Sócio Previdenciarista',
    '(11) 98765-4321'
)
on conflict (email) do update set
    name = excluded.name,
    role = excluded.role,
    role_label = excluded.role_label,
    phone = excluded.phone;

-- 4. Atualizar o vínculo com auth.users se o usuário já tiver se cadastrado
update public.profiles p
set auth_user_id = u.id
from auth.users u
where lower(u.email) = lower(p.email) and p.auth_user_id is null;

-- Visualizar resultado da limpeza
select id, name, email, role, role_label from public.profiles;
