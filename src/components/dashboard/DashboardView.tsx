import React from 'react';
import {
  Users,
  FolderKanban,
  Stethoscope,
  CheckSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Calendar,
  ChevronRight,
  FileCheck2,
  CheckCircle2,
  CalendarClock,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    clients,
    processes,
    tasks,
    transactions,
    events,
    setActiveModal,
    navigateToClientDetail,
    navigateToProcessDetail,
    setCurrentView,
    moveTaskColumn,
  } = useApp();

  // Calculations for KPI Cards
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'Ativo').length;
  const activeProcesses = processes.filter(
    (p) => p.status !== 'Finalizado' && p.status !== 'Arquivado' && p.status !== 'Indeferido'
  ).length;
  const waitingProcesses = processes.filter(
    (p) =>
      p.status === 'Em análise pelo INSS' ||
      p.status === 'Aguardando resultado' ||
      p.status === 'Exigência' ||
      p.status === 'Perícia agendada'
  ).length;

  // Upcoming exams count (next 30 days)
  const upcomingExams = processes.filter(
    (p) =>
      (p.medicalExam && p.medicalExam.status === 'Agendada') ||
      (p.socialExam && p.socialExam.status === 'Agendada')
  ).length;

  const pendingTasks = tasks.filter((t) => t.column !== 'done').length;

  // Financial calculations
  const totalReceivables = transactions
    .filter((t) => t.type === 'receita' && t.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPayables = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentMonthRevenue = transactions
    .filter((t) => t.type === 'receita' && (t.status === 'Recebido' || t.status === 'Pendente'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'despesa' && (t.status === 'Pago' || t.status === 'Pendente'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentMonthBalance = currentMonthRevenue - currentMonthExpenses;

  // Process status distribution
  const processesByBenefit = processes.reduce((acc, curr) => {
    acc[curr.benefitName] = (acc[curr.benefitName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const processesByStatus = processes.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Task distribution
  const taskCountByCol = {
    todo: tasks.filter((t) => t.column === 'todo').length,
    in_progress: tasks.filter((t) => t.column === 'in_progress').length,
    waiting: tasks.filter((t) => t.column === 'waiting').length,
    done: tasks.filter((t) => t.column === 'done').length,
  };

  // Urgent tasks
  const urgentTasks = tasks
    .filter((t) => t.column !== 'done' && (t.priority === 'Urgente' || t.priority === 'Alta'))
    .slice(0, 4);

  // Upcoming appointments
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-[#1E3327] via-[#243E2F] to-[#2D4739] text-white rounded-2xl p-6 lg:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#C5A059]/30">
              <Award className="w-3.5 h-3.5" /> Gestão de Consultoria Previdenciária
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Painel de Controle Estratégico
            </h1>
            <p className="text-[#B4C6BC] text-sm mt-1 max-w-xl">
              Monitore clientes, prazos junto ao INSS, perícias agendadas, tarefas em andamento e fluxo de honorários.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
            <button
              onClick={() => setActiveModal('new-client')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Novo Cliente
            </button>
            <button
              onClick={() => setActiveModal('new-process')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Novo Processo
            </button>
            <button
              onClick={() => setActiveModal('new-task')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Nova Tarefa
            </button>
            <button
              onClick={() => setActiveModal('new-event')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Novo Evento
            </button>
            <button
              onClick={() => setActiveModal('new-receita')}
              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> + Nova Receita
            </button>
            <button
              onClick={() => setActiveModal('new-despesa')}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> + Nova Despesa
            </button>
          </div>
        </div>

        {/* Decorative background ring */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Clientes */}
        <div
          onClick={() => setCurrentView('clients')}
          className="bg-white p-4 rounded-xl border border-[#E2E6E4] hover:border-[#2D4739] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#6B7770] mb-2">
            <span className="text-xs font-medium">Total Clientes</span>
            <span className="p-2 rounded-lg bg-[#F1F6F3] text-[#2D4739] group-hover:bg-[#2D4739] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A2521]">{totalClients}</div>
          <div className="text-[11px] text-[#2D4739] font-medium mt-1">
            {activeClients} clientes ativos
          </div>
        </div>

        {/* Processos Ativos */}
        <div
          onClick={() => setCurrentView('processes')}
          className="bg-white p-4 rounded-xl border border-[#E2E6E4] hover:border-[#2D4739] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#6B7770] mb-2">
            <span className="text-xs font-medium">Processos Ativos</span>
            <span className="p-2 rounded-lg bg-[#FAF6ED] text-[#9E7B36] group-hover:bg-[#9E7B36] group-hover:text-white transition-colors">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A2521]">{activeProcesses}</div>
          <div className="text-[11px] text-[#6B7770] mt-1">
            {waitingProcesses} aguardando INSS
          </div>
        </div>

        {/* Perícias Próximas */}
        <div
          onClick={() => setCurrentView('calendar')}
          className="bg-white p-4 rounded-xl border border-[#E2E6E4] hover:border-[#2D4739] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#6B7770] mb-2">
            <span className="text-xs font-medium">Perícias Marcadas</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A2521]">{upcomingExams}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Exames confirmados
          </div>
        </div>

        {/* Tarefas Pendentes */}
        <div
          onClick={() => setCurrentView('tasks')}
          className="bg-white p-4 rounded-xl border border-[#E2E6E4] hover:border-[#2D4739] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#6B7770] mb-2">
            <span className="text-xs font-medium">Tarefas Pendentes</span>
            <span className="p-2 rounded-lg bg-[#F1F4F2] text-[#4A5E52] group-hover:bg-[#4A5E52] group-hover:text-white transition-colors">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#1A2521]">{pendingTasks}</div>
          <div className="text-[11px] text-[#6B7770] mt-1">
            {urgentTasks.length} com prioridade alta
          </div>
        </div>

        {/* Contas a Receber */}
        <div
          onClick={() => {
            setCurrentView('financial');
          }}
          className="bg-white p-4 rounded-xl border border-[#E2E6E4] hover:border-emerald-600 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#6B7770] mb-2">
            <span className="text-xs font-medium">A Receber</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700">
            R$ {totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#6B7770] mt-1">Honorários previstos</div>
        </div>

        {/* Saldo Líquido do Mês */}
        <div
          onClick={() => {
            setCurrentView('financial');
          }}
          className="bg-white p-4 rounded-xl border border-[#E2E6E4] hover:border-[#C5A059] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#6B7770] mb-2">
            <span className="text-xs font-medium">Saldo do Mês</span>
            <span className="p-2 rounded-lg bg-[#FAF6ED] text-[#9E7B36] group-hover:bg-[#C5A059] group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-lg sm:text-xl font-bold ${
              currentMonthBalance >= 0 ? 'text-[#2D4739]' : 'text-red-600'
            }`}
          >
            R$ {currentMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#6B7770] mt-1">
            Receitas - Despesas
          </div>
        </div>
      </div>

      {/* Charts & Analytical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Financial Flow (Receitas x Despesas) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A2521]">Fluxo Financeiro (Receitas x Despesas)</h3>
                <p className="text-xs text-[#6B7770]">Comparativo de movimentações do exercício atual</p>
              </div>
              <button
                onClick={() => setCurrentView('financial')}
                className="text-xs text-[#2D4739] hover:underline flex items-center gap-0.5 font-medium"
              >
                Detalhes <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Bars Comparison */}
            <div className="space-y-4 my-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Receitas do Mês
                  </span>
                  <span className="font-bold text-[#1A2521]">
                    R$ {currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-[#F1F3F4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentMonthRevenue / (currentMonthRevenue + currentMonthExpenses || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-red-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Despesas do Mês
                  </span>
                  <span className="font-bold text-[#1A2521]">
                    R$ {currentMonthExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-[#F1F3F4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentMonthExpenses / (currentMonthRevenue + currentMonthExpenses || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#9E7B36] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] inline-block" /> Contas a Pagar Pendentes
                  </span>
                  <span className="font-bold text-[#1A2521]">
                    R$ {totalPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F1F3F4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C5A059] rounded-full"
                    style={{ width: `${Math.min(100, (totalPayables / 10000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F3F4] flex items-center justify-between text-xs text-[#6B7770]">
            <span>Margem Operacional Líquida</span>
            <span className="font-bold text-[#2D4739]">
              {currentMonthRevenue > 0
                ? `${Math.round((currentMonthBalance / currentMonthRevenue) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Chart 2: Processos por Tipo de Benefício */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A2521]">Processos por Benefício</h3>
                <p className="text-xs text-[#6B7770]">Distribuição da carteira de causas</p>
              </div>
              <button
                onClick={() => setCurrentView('processes')}
                className="text-xs text-[#2D4739] hover:underline flex items-center gap-0.5 font-medium"
              >
                Ver lista <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 my-3">
              {Object.entries(processesByBenefit).slice(0, 5).map(([benefit, count]) => {
                const countNum = Number(count);
                const percentage = Math.round((countNum / (processes.length || 1)) * 100);
                return (
                  <div key={benefit} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#3A4841] font-medium truncate max-w-[200px]" title={benefit}>
                        {benefit}
                      </span>
                      <span className="text-[#6B7770] font-semibold">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F3F4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2D4739] rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F3F4] flex items-center justify-between text-xs text-[#6B7770]">
            <span>Total de Processos Cadastrados</span>
            <span className="font-bold text-[#1A2521]">{processes.length}</span>
          </div>
        </div>

        {/* Chart 3: Status de Tarefas & Processos */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A2521]">Tarefas & Prazos</h3>
                <p className="text-xs text-[#6B7770]">Progresso do fluxo Kanban</p>
              </div>
              <button
                onClick={() => setCurrentView('tasks')}
                className="text-xs text-[#2D4739] hover:underline flex items-center gap-0.5 font-medium"
              >
                Abrir Kanban <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4]">
                <div className="text-xs text-[#6B7770]">A Fazer</div>
                <div className="text-xl font-bold text-[#1A2521] mt-0.5">{taskCountByCol.todo}</div>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-2">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF6ED] border border-[#E8DCC0]">
                <div className="text-xs text-[#9E7B36]">Em Andamento</div>
                <div className="text-xl font-bold text-[#9E7B36] mt-0.5">{taskCountByCol.in_progress}</div>
                <div className="w-full h-1 bg-amber-200 rounded-full mt-2">
                  <div className="h-full bg-[#C5A059] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <div className="text-xs text-orange-700">Aguardando Terceiro</div>
                <div className="text-xl font-bold text-orange-700 mt-0.5">{taskCountByCol.waiting}</div>
                <div className="w-full h-1 bg-orange-200 rounded-full mt-2">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F1F6F3] border border-[#C5D5CC]">
                <div className="text-xs text-[#2D4739]">Concluídas</div>
                <div className="text-xl font-bold text-[#2D4739] mt-0.5">{taskCountByCol.done}</div>
                <div className="w-full h-1 bg-[#C5D5CC] rounded-full mt-2">
                  <div className="h-full bg-[#2D4739] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F3F4] flex items-center justify-between text-xs text-[#6B7770]">
            <span>Taxa de Resolução</span>
            <span className="font-bold text-[#2D4739]">
              {tasks.length > 0 ? `${Math.round((taskCountByCol.done / tasks.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Section: Próximos Compromissos & Tarefas Prioritárias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Compromissos */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F3F4]">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#2D4739]" />
              <div>
                <h3 className="text-sm font-bold text-[#1A2521]">Próximos Compromissos & Perícias</h3>
                <p className="text-xs text-[#6B7770]">Perícias médicas, sociais, audiências e atendimentos</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('calendar')}
              className="text-xs text-[#2D4739] hover:underline font-semibold"
            >
              Ver Agenda
            </button>
          </div>

          <div className="divide-y divide-[#F1F3F4] mt-2">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  if (evt.processId) navigateToProcessDetail(evt.processId);
                  else if (evt.clientId) navigateToClientDetail(evt.clientId);
                }}
                className="py-3 flex items-start justify-between gap-3 hover:bg-[#F9FAF9] px-2 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF1ED] text-[#2D4739] flex flex-col items-center justify-center shrink-0 border border-[#D5DDD8]">
                    <span className="text-[10px] uppercase font-bold">
                      {new Date(`${evt.date}T00:00:00`).toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-xs font-bold leading-none">
                      {new Date(`${evt.date}T00:00:00`).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#1A2521] group-hover:text-[#2D4739] truncate">
                      {evt.title}
                    </h4>
                    <div className="text-[11px] text-[#6B7770] flex items-center gap-2 mt-0.5">
                      <span>Horário: {evt.time}</span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    evt.category === 'Perícia médica'
                      ? 'bg-amber-100 text-amber-800'
                      : evt.category === 'Perícia social'
                      ? 'bg-purple-100 text-purple-800'
                      : evt.category === 'Audiência'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-[#EBF1ED] text-[#2D4739]'
                  }`}
                >
                  {evt.category}
                </span>
              </div>
            ))}

            {upcomingEvents.length === 0 && (
              <div className="py-8 text-center text-xs text-[#6B7770]">
                Nenhum compromisso agendado para os próximos dias.
              </div>
            )}
          </div>
        </div>

        {/* Tarefas Prioritárias */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F3F4]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C5A059]" />
              <div>
                <h3 className="text-sm font-bold text-[#1A2521]">Tarefas Prioritárias</h3>
                <p className="text-xs text-[#6B7770]">Ações urgentes que demandam providências imediatas</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-xs text-[#2D4739] hover:underline font-semibold"
            >
              Ver Todas ({pendingTasks})
            </button>
          </div>

          <div className="divide-y divide-[#F1F3F4] mt-2">
            {urgentTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex items-start justify-between gap-3 hover:bg-[#F9FAF9] px-2 rounded-lg transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => moveTaskColumn(task.id, 'done')}
                    title="Concluir tarefa"
                    className="mt-0.5 w-4 h-4 rounded border border-[#8A968F] hover:border-[#2D4739] hover:bg-[#EBF1ED] flex items-center justify-center shrink-0 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-transparent hover:text-[#2D4739]" />
                  </button>

                  <div className="min-w-0">
                    <h4
                      onClick={() => {
                        if (task.processId) navigateToProcessDetail(task.processId);
                        else if (task.clientId) navigateToClientDetail(task.clientId);
                      }}
                      className="text-xs font-semibold text-[#1A2521] hover:text-[#2D4739] cursor-pointer"
                    >
                      {task.title}
                    </h4>
                    <div className="text-[11px] text-[#6B7770] flex items-center gap-2 mt-0.5">
                      <span>Cliente: {task.clientName || 'Geral'}</span>
                      <span>•</span>
                      <span>Prazo: {task.deadline}</span>
                      <span>•</span>
                      <span>Resp: {task.responsible.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === 'Urgente'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}

            {urgentTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-[#6B7770]">
                Nenhuma tarefa prioritária pendente no momento. Excelente!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
