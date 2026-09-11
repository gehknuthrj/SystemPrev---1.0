import React, { useState } from 'react';
import {
  Search,
  Filter,
  FolderPlus,
  Eye,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProcessStatus } from '../../types';

export const ProcessesListView: React.FC = () => {
  const {
    processes,
    navigateToProcessDetail,
    navigateToClientDetail,
    deleteProcess,
    setActiveModal,
    setSelectedProcessId,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedBenefit, setSelectedBenefit] = useState<string>('todos');

  const filteredProcesses = processes.filter((proc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      proc.clientName.toLowerCase().includes(term) ||
      proc.benefitName.toLowerCase().includes(term) ||
      proc.protocolNumber.toLowerCase().includes(term) ||
      (proc.judicialProcessNumber && proc.judicialProcessNumber.toLowerCase().includes(term)) ||
      proc.responsible.toLowerCase().includes(term);

    const matchesStatus = selectedStatus === 'todos' || proc.status === selectedStatus;
    const matchesBenefit =
      selectedBenefit === 'todos' || proc.benefitName.toLowerCase().includes(selectedBenefit.toLowerCase());

    return matchesSearch && matchesStatus && matchesBenefit;
  });

  const getStatusBadge = (status: ProcessStatus) => {
    switch (status) {
      case 'Deferido':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Indeferido':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Exigência':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'Perícia agendada':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Documentação pendente':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Documentação completa':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Protocolado no INSS':
      case 'Em análise pelo INSS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Recurso administrativo':
      case 'Processo judicial':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Processos Previdenciários
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Acompanhe requerimentos no INSS, ações judiciais, perícias e checklists documentais.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('new-process')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
        >
          <FolderPlus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Novo Processo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, benefício, protocolo INSS ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] focus:border-[#2D4739] rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#6B7770]">
            <Filter className="w-3.5 h-3.5 text-[#2D4739]" />
            <span>Filtros:</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739]"
          >
            <option value="todos">Todos os Status</option>
            <option value="Novo cliente">Novo cliente</option>
            <option value="Documentação pendente">Documentação pendente</option>
            <option value="Documentação completa">Documentação completa</option>
            <option value="Protocolado no INSS">Protocolado no INSS</option>
            <option value="Em análise pelo INSS">Em análise pelo INSS</option>
            <option value="Exigência">Exigência</option>
            <option value="Perícia agendada">Perícia agendada</option>
            <option value="Aguardando resultado">Aguardando resultado</option>
            <option value="Deferido">Deferido</option>
            <option value="Indeferido">Indeferido</option>
            <option value="Recurso administrativo">Recurso administrativo</option>
            <option value="Processo judicial">Processo judicial</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          <select
            value={selectedBenefit}
            onChange={(e) => setSelectedBenefit(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739]"
          >
            <option value="todos">Todos os Benefícios</option>
            <option value="Especial">Aposentadoria Especial</option>
            <option value="Idade">Aposentadoria por Idade</option>
            <option value="BPC">BPC / LOAS</option>
            <option value="Incapacidade">Auxílio-Incapacidade</option>
            <option value="Professor">Professor</option>
            <option value="Pensão">Pensão por Morte</option>
          </select>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-white rounded-xl border border-[#E2E6E4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[11px] font-semibold border-b border-[#E2E6E4]">
              <tr>
                <th className="py-3.5 px-4">Benefício & Protocolo</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Checklist</th>
                <th className="py-3.5 px-4">Último Andamento</th>
                <th className="py-3.5 px-4">Próxima Ação & Prazo</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F4]">
              {filteredProcesses.map((proc) => {
                const validatedDocs = proc.checklist.filter((i) => i.status === 'Validado').length;
                const checklistPct = Math.round((validatedDocs / (proc.checklist.length || 1)) * 100);

                return (
                  <tr
                    key={proc.id}
                    className="hover:bg-[#F9FAF9] transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      navigateToProcessDetail(proc.id);
                    }}
                  >
                    {/* Benefício & Protocolo */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1A2521] group-hover:text-[#2D4739] transition-colors">
                        {proc.benefitName}
                      </div>
                      <div className="text-xs text-[#9E7B36] font-mono mt-0.5">
                        {proc.protocolNumber}
                      </div>
                      {proc.judicialProcessNumber && (
                        <div className="text-[10px] text-[#6B7770]">
                          Judicial: {proc.judicialProcessNumber}
                        </div>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToClientDetail(proc.clientId);
                        }}
                        className="font-medium text-[#1A2521] hover:text-[#2D4739] hover:underline text-left block"
                      >
                        {proc.clientName}
                      </button>
                      <span className="text-[11px] text-[#6B7770]">CPF: {proc.clientCpf}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          proc.status
                        )}`}
                      >
                        {proc.status}
                      </span>
                    </td>

                    {/* Checklist */}
                    <td className="py-3.5 px-4 min-w-[120px]">
                      <div className="flex items-center justify-between text-[11px] text-[#6B7770] mb-1">
                        <span>{validatedDocs}/{proc.checklist.length}</span>
                        <span className="font-semibold text-[#1A2521]">{checklistPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F3F4] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            checklistPct === 100
                              ? 'bg-emerald-600'
                              : checklistPct >= 50
                              ? 'bg-[#C5A059]'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${checklistPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Último Andamento */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="text-xs text-[#1A2521] truncate" title={proc.lastProgress}>
                        {proc.lastProgress}
                      </div>
                      <div className="text-[10px] text-[#8A968F] mt-0.5">{proc.lastProgressDate}</div>
                    </td>

                    {/* Próxima Ação & Prazo */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="text-xs font-medium text-[#1A2521] truncate" title={proc.nextAction}>
                        {proc.nextAction}
                      </div>
                      {proc.deadline && (
                        <div className="text-[11px] text-[#C5A059] font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Prazo: {proc.deadline}</span>
                        </div>
                      )}
                    </td>

                    {/* Responsável */}
                    <td className="py-3.5 px-4 text-xs text-[#6B7770]">
                      {proc.responsible.split(' ')[0]}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProcessDetail(proc.id);
                          }}
                          className="p-1.5 text-[#2D4739] hover:bg-[#EBF1ED] rounded-lg transition-colors"
                          title="Acessar processo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Confirma a exclusão do processo ${proc.protocolNumber}?`)) {
                              deleteProcess(proc.id);
                            }
                          }}
                          className="p-1.5 text-[#6B7770] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir processo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProcesses.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6B7770]">
                    Nenhum processo encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F8F9FA] border-t border-[#E2E6E4] flex items-center justify-between text-xs text-[#6B7770]">
          <span>Exibindo {filteredProcesses.length} de {processes.length} processos</span>
          <span className="text-[11px]">Clique em qualquer linha para abrir os detalhes completos</span>
        </div>
      </div>
    </div>
  );
};
