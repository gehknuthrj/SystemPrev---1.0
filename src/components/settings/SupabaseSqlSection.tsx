import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  ExternalLink,
  Table,
  Code2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseConnectionResult } from '../../services/supabaseService';

interface SupabaseSqlSectionProps {
  sqlContent: string;
}

export const SupabaseSqlSection: React.FC<SupabaseSqlSectionProps> = ({ sqlContent }) => {
  const {
    isSupabaseConfigured,
    supabaseStatus,
    isSupabaseSyncing,
    lastSupabaseSync,
    syncFromSupabase,
    syncToSupabase,
    testSupabaseConnection,
    clients,
    processes,
    benefits,
    documents,
    transactions,
    tasks,
    events,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instructions' | 'sql' | 'tables'>('instructions');
  const [testResult, setTestResult] = useState<SupabaseConnectionResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'prevconsult_supabase_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const tablesList = [
    { name: 'office_settings', desc: 'Dados do escritório, CNPJ, OAB e template de WhatsApp', rows: '1 registro' },
    { name: 'profiles', desc: 'Perfis de consultores/advogados integrados com auth.users', rows: 'RBAC (admin, lawyer, assistant, financial)' },
    { name: 'clients', desc: 'Cadastro dos segurados (CPF, contato, endereço, resumo e estratégia)', rows: `${clients.length} no sistema` },
    { name: 'client_timeline_events', desc: 'Histórico de atendimentos e anotações do cliente', rows: '1:N com clients' },
    { name: 'benefits_catalog', desc: 'Catálogo de benefícios do INSS (B41, B42, B31, B87, B21, etc.)', rows: `${benefits.length} benefícios cadastrados` },
    { name: 'pension_processes', desc: 'Processos administrativos/judiciais, status, prazos e perícias', rows: `${processes.length} no sistema` },
    { name: 'process_checklist_items', desc: 'Checklist de documentos exigidos por processo', rows: '1:N com pension_processes' },
    { name: 'process_timeline_events', desc: 'Linha do tempo e andamentos oficiais do processo', rows: '1:N com pension_processes' },
    { name: 'documents', desc: 'Metadados e referências de upload no Supabase Storage', rows: `${documents.length} no sistema` },
    { name: 'financial_transactions', desc: 'Lançamentos de honorários no êxito, contratuais e despesas', rows: `${transactions.length} no sistema` },
    { name: 'tasks', desc: 'Quadro Kanban operacional com prioridades e prazos', rows: `${tasks.length} no sistema` },
    { name: 'calendar_events', desc: 'Agenda de perícias médicas do INSS, audiências e prazos', rows: `${events.length} no sistema` },
    { name: 'activity_logs', desc: 'Trilha de auditoria para conformidade e segurança', rows: 'Ações registradas' },
    { name: 'notifications', desc: 'Alertas de prazos de exigência e perícias agendadas', rows: 'Status de leitura' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F3F4]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#1A2521]">
                Integração Banco de Dados Supabase (PostgreSQL 15+)
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                14 Tabelas + RLS
              </span>
            </div>
            <p className="text-xs text-[#6B7770] mt-0.5">
              Conexão direta, persistência permanente em nuvem e sincronização em tempo real para todo o sistema previdenciário.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-[#2D4739] hover:bg-[#1E3327] text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#C5A059]" />}
            <span>{copied ? 'SQL Copiado!' : 'Copiar DDL das Tabelas'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5DDD8] hover:bg-[#F8F9FA] text-[#1A2521] text-xs font-semibold transition-colors shadow-xs"
            title="Baixar arquivo .sql"
          >
            <Download className="w-4 h-4 text-[#2D4739]" />
            <span className="hidden sm:inline">Baixar .sql</span>
          </button>
        </div>
      </div>

      {/* Live Supabase Connection & Sync Card */}
      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {supabaseStatus === 'connected' && (
                <>
                  <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              )}
              {supabaseStatus === 'checking' && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 animate-pulse"></span>
              )}
              {supabaseStatus === 'error' && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              )}
              {supabaseStatus === 'disconnected' && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A2521]">
                  Status da Conexão:
                </span>
                {supabaseStatus === 'connected' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Conectado ao Supabase
                  </span>
                )}
                {supabaseStatus === 'checking' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> Verificando Conexão...
                  </span>
                )}
                {supabaseStatus === 'error' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> Falha ou Tabelas Pendentes
                  </span>
                )}
                {supabaseStatus === 'disconnected' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Aguardando Configuração (.env)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B7770] mt-0.5">
                {isSupabaseConfigured
                  ? 'As operações de criação, atualização e exclusão sincronizam em tempo real com as tabelas do PostgreSQL.'
                  : 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar a nuvem remota.'}
              </p>
            </div>
          </div>

          {/* Sync & Test Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5DDD8] hover:bg-[#F8F9FA] text-[#1A2521] text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2D4739] ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              onClick={syncFromSupabase}
              disabled={isSupabaseSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseSyncing ? 'animate-spin' : ''}`} />
              <span>{isSupabaseSyncing ? 'Sincronizando...' : 'Recarregar do Supabase'}</span>
            </button>

            <button
              onClick={syncToSupabase}
              disabled={isSupabaseSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D4739] hover:bg-[#1E3327] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              title="Envia todos os clientes, processos e registros locais para o banco Supabase"
            >
              <Send className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Enviar Dados para Supabase</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
              testResult.connected
                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{testResult.message}</div>
              {testResult.tableCounts && (
                <div className="mt-1 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200">
                  <span>Clientes: <strong>{testResult.tableCounts.clients}</strong></span>
                  <span>Processos: <strong>{testResult.tableCounts.processes}</strong></span>
                  <span>Benefícios: <strong>{testResult.tableCounts.benefits}</strong></span>
                  <span>Financeiro: <strong>{testResult.tableCounts.financial}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live System Count Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-emerald-200/60">
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Clientes</div>
            <div className="text-base font-bold text-[#1A2521]">{clients.length}</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Processos</div>
            <div className="text-base font-bold text-[#1A2521]">{processes.length}</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Catálogo INSS</div>
            <div className="text-base font-bold text-[#1A2521]">{benefits.length}</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Documentos</div>
            <div className="text-base font-bold text-[#1A2521]">{documents.length}</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Financeiro</div>
            <div className="text-base font-bold text-[#1A2521]">{transactions.length}</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Tarefas</div>
            <div className="text-base font-bold text-[#1A2521]">{tasks.length}</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-center">
            <div className="text-[10px] text-[#6B7770] uppercase font-semibold">Agenda</div>
            <div className="text-base font-bold text-[#1A2521]">{events.length}</div>
          </div>
        </div>

        {lastSupabaseSync && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7770]">
            <Clock className="w-3.5 h-3.5 text-[#2D4739]" />
            <span>Última sincronização com Supabase realizada às: <strong>{lastSupabaseSync}</strong></span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F1F3F4] text-xs">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`pb-2.5 px-2 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'instructions'
              ? 'border-[#2D4739] text-[#2D4739]'
              : 'border-transparent text-[#6B7770] hover:text-[#1A2521]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Guia de Configuração & SQL Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-2.5 px-2 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'tables'
              ? 'border-[#2D4739] text-[#2D4739]'
              : 'border-transparent text-[#6B7770] hover:text-[#1A2521]'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-[#2D4739]" />
          <span>Estrutura das 14 Tabelas</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-2.5 px-2 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'sql'
              ? 'border-[#2D4739] text-[#2D4739]'
              : 'border-transparent text-[#6B7770] hover:text-[#1A2521]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-[#2D4739]" />
          <span>Script SQL Completo (DDL)</span>
        </button>
      </div>

      {/* Tab Content: Instructions */}
      {activeTab === 'instructions' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E6E4] space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#2D4739] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-[#1A2521]">Acesse o Supabase</h3>
              <p className="text-[#6B7770] leading-relaxed">
                Entre no painel do Supabase e abra o seu projeto configurado.
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D4739] hover:underline pt-1"
              >
                Abrir Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E6E4] space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#2D4739] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-[#1A2521]">Execute o Script SQL</h3>
              <p className="text-[#6B7770] leading-relaxed">
                No menu lateral esquerdo, clique em <strong>SQL Editor</strong> &gt; <strong>New query</strong>, cole o script deste modal e clique em <strong>RUN</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E6E4] space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#2D4739] text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-[#1A2521]">Sincronize os Dados</h3>
              <p className="text-[#6B7770] leading-relaxed">
                Após executar o SQL, clique no botão <strong>"Enviar Dados para Supabase"</strong> acima para popular o banco de dados com a carga inicial completa!
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
            <h4 className="font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              Recursos Automáticos Ativados no Banco Supabase
            </h4>
            <ul className="list-disc list-inside text-[#2D4739] space-y-1 pl-1 text-[11.5px]">
              <li>Chaves estrangeiras e integridade referencial com exclusão em cascata (<code className="font-mono">ON DELETE CASCADE</code>).</li>
              <li>Triggers automáticos para atualizar a coluna <code className="font-mono">updated_at</code> em cada alteração.</li>
              <li>Políticas de Row Level Security (RLS) protegendo dados contra acessos indevidos.</li>
              <li>Carga inicial (Seed) dos benefícios previdenciários oficiais do INSS e seus checklists regulamentares.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab Content: Tables List */}
      {activeTab === 'tables' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-[#E2E6E4]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] text-[#6B7770] border-b border-[#E2E6E4] font-semibold">
                  <th className="py-2.5 px-3">Tabela no Supabase</th>
                  <th className="py-2.5 px-3">Finalidade no Sistema</th>
                  <th className="py-2.5 px-3">Status Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F4]">
                {tablesList.map((t) => (
                  <tr key={t.name} className="hover:bg-[#FAFBFB]">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#2D4739]">{t.name}</td>
                    <td className="py-2.5 px-3 text-[#1A2521]">{t.desc}</td>
                    <td className="py-2.5 px-3 text-[#6B7770] font-medium">{t.rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: SQL Viewer */}
      {activeTab === 'sql' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B7770]">
            <span>Arquivo DDL: <strong className="font-mono text-[#1A2521]">/supabase/schema.sql</strong> (PostgreSQL 15+)</span>
            <button
              onClick={handleCopy}
              className="text-[#2D4739] font-bold hover:underline flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar tudo
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 bg-[#14231A] text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-96 border border-[#2D4739]/40 leading-relaxed select-all">
              {sqlContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
