import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  FileCheck2,
  FolderKanban,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActivityHistoryView: React.FC = () => {
  const { activityLogs, navigateToClientDetail, navigateToProcessDetail } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('todos');

  const filteredLogs = activityLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.description.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      (log.clientName && log.clientName.toLowerCase().includes(term)) ||
      (log.processProtocol && log.processProtocol.toLowerCase().includes(term));

    const matchesAction = selectedAction === 'todos' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Criação':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Edição':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Status':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Exclusão':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Documento':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Financeiro':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
          Histórico de Atividades & Auditoria
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
          Rastreabilidade completa de todas as operações, alterações de status e uploads no sistema.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição, usuário ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] focus:border-[#2D4739] rounded-lg outline-none"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739] w-full sm:w-auto"
        >
          <option value="todos">Todas as Ações</option>
          <option value="Criação">Criação</option>
          <option value="Edição">Edição</option>
          <option value="Status">Status</option>
          <option value="Documento">Documento</option>
          <option value="Financeiro">Financeiro</option>
          <option value="Exclusão">Exclusão</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E2E6E4] shadow-xs overflow-hidden">
        <div className="divide-y divide-[#F1F3F4]">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAF9] transition-colors text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#FAF6ED] text-[#9E7B36] border border-[#E8DCC0] mt-0.5">
                  <History className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-[#1A2521]">{log.description}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[#6B7770] flex-wrap text-[11px]">
                    <span className="flex items-center gap-1 font-medium text-[#1A2521]">
                      <User className="w-3 h-3 text-[#2D4739]" /> {log.userName}
                    </span>

                    {log.clientName && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => log.clientId && navigateToClientDetail(log.clientId)}
                          className="hover:underline text-[#2D4739] font-medium"
                        >
                          Cliente: {log.clientName}
                        </button>
                      </>
                    )}

                    {log.processProtocol && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => log.processId && navigateToProcessDetail(log.processId)}
                          className="hover:underline text-[#9E7B36] font-mono"
                        >
                          Processo: {log.processProtocol}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[#8A968F] text-[11px] whitespace-nowrap self-end sm:self-center font-mono">
                {log.timestamp}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6B7770]">
              Nenhum registro de atividade encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
