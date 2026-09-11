import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskColumn, TaskPriority, KanbanTask } from '../../types';

export const TasksKanbanView: React.FC = () => {
  const {
    tasks,
    clients,
    processes,
    addTask,
    moveTaskColumn,
    deleteTask,
    navigateToClientDetail,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('todos');

  // New task form
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskClientId, setTaskClientId] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Média');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskAssignee, setTaskAssignee] = useState(currentUser.name);
  const [taskColumn, setTaskColumn] = useState<TaskColumn>('todo');

  const columns: { id: TaskColumn; title: string; color: string }[] = [
    { id: 'todo', title: 'A Fazer', color: 'border-t-slate-400 bg-slate-50/50' },
    { id: 'in_progress', title: 'Em Andamento', color: 'border-t-blue-500 bg-blue-50/30' },
    { id: 'waiting', title: 'Aguardando Cliente / INSS', color: 'border-t-amber-500 bg-amber-50/30' },
    { id: 'done', title: 'Concluído', color: 'border-t-emerald-500 bg-emerald-50/30' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(term) ||
      (t.clientName && t.clientName.toLowerCase().includes(term)) ||
      (t.responsible && t.responsible.toLowerCase().includes(term));

    const matchesPriority = selectedPriority === 'todos' || t.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      description: taskTitle.trim(),
      column: taskColumn,
      clientId: taskClientId || undefined,
      priority: taskPriority,
      deadline: taskDueDate,
      responsible: taskAssignee,
      checklist: [],
    });

    setTaskTitle('');
    setIsAddingTask(false);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Alta':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Média':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Baixa':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Tarefas & Workflow Kanban
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Organize prazos, cumprimento de exigências e diligências operacionais por estágio.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTask(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Nova Tarefa</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tarefas por título, cliente ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] focus:border-[#2D4739] rounded-lg outline-none"
          />
        </div>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739] w-full md:w-auto"
        >
          <option value="todos">Todas as Prioridades</option>
          <option value="Urgente">Urgente</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
      </div>

      {/* New Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D5DDD8] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-bold text-[#1A2521]">Criar Nova Tarefa Operacional</h3>
              <button onClick={() => setIsAddingTask(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="font-semibold text-[#1A2521]">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Anexar petição de cumprimento de exigência no SAG/INSS"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Cliente Relacionado</label>
                <select
                  value={taskClientId}
                  onChange={(e) => setTaskClientId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                >
                  <option value="">Nenhum (Tarefa de rotina interna)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} (CPF: {c.cpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A2521]">Coluna Inicial</label>
                  <select
                    value={taskColumn}
                    onChange={(e) => setTaskColumn(e.target.value as TaskColumn)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="waiting">Aguardando Cliente / INSS</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none font-semibold"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A2521]">Data Limite / Prazo</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Responsável</label>
                  <input
                    type="text"
                    required
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F4]">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7770]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col, colIndex) => {
          const colTasks = filteredTasks.filter((t) => t.column === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border-t-4 border border-[#E2E6E4] p-3.5 shadow-xs space-y-3 ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-xs text-[#1A2521] uppercase tracking-wide">
                  {col.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-[#1A2521]/10 text-[#1A2521] text-[10px] font-bold flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-3.5 rounded-xl border border-[#E2E6E4] shadow-xs hover:border-[#2D4739]/40 transition-all text-xs space-y-2.5 group"
                  >
                    {/* Header: Priority & Delete */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir tarefa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Task Title */}
                    <div className="font-semibold text-[#1A2521] leading-snug">
                      {task.title}
                    </div>

                    {/* Client Link if available */}
                    {task.clientId && (
                      <button
                        onClick={() => navigateToClientDetail(task.clientId!)}
                        className="text-[11px] font-medium text-[#2D4739] hover:underline flex items-center gap-1 truncate w-full text-left"
                      >
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{task.clientName}</span>
                      </button>
                    )}

                    {/* Due Date & Assignee */}
                    <div className="flex items-center justify-between text-[10px] text-[#6B7770] pt-1 border-t border-[#F1F3F4]">
                      <span className="flex items-center gap-1 font-medium text-amber-800">
                        <Clock className="w-3 h-3" />
                        {task.deadline}
                      </span>
                      <span>{(task.responsible || 'Equipe').split(' ')[0]}</span>
                    </div>

                    {/* Move Controls */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                      {colIndex > 0 ? (
                        <button
                          onClick={() => moveTaskColumn(task.id, columns[colIndex - 1].id)}
                          className="hover:text-[#2D4739] flex items-center gap-0.5 font-semibold"
                          title={`Mover para ${columns[colIndex - 1].title}`}
                        >
                          <ChevronLeft className="w-3 h-3" /> Voltar
                        </button>
                      ) : <span />}

                      {colIndex < columns.length - 1 ? (
                        <button
                          onClick={() => moveTaskColumn(task.id, columns[colIndex + 1].id)}
                          className="hover:text-[#2D4739] flex items-center gap-0.5 font-semibold"
                          title={`Avançar para ${columns[colIndex + 1].title}`}
                        >
                          Avançar <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : <span />}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="py-6 text-center text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    Nenhuma tarefa nesta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
