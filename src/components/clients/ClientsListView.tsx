import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  MessageCircle,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileCheck,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientStatus } from '../../types';

export const ClientsListView: React.FC = () => {
  const {
    clients,
    processes,
    navigateToClientDetail,
    deleteClient,
    setActiveModal,
    openWhatsApp,
    setSelectedClientId,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedBenefit, setSelectedBenefit] = useState<string>('todos');

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(term) ||
      client.cpf.includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.whatsapp.includes(term) ||
      client.city.toLowerCase().includes(term);

    const matchesStatus = selectedStatus === 'todos' || client.status === selectedStatus;
    const matchesBenefit =
      selectedBenefit === 'todos' ||
      (client.benefitInterest && client.benefitInterest.toLowerCase().includes(selectedBenefit.toLowerCase()));

    return matchesSearch && matchesStatus && matchesBenefit;
  });

  const getClientProcesses = (clientId: string) => {
    return processes.filter((p) => p.clientId === clientId);
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Em Análise':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Aguardando Documentos':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Concluído':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Inativo':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Clientes Cadastrados
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Gerencie prontuários, contatos, histórico previdenciário e status de atendimento.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('new-client')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nome, CPF, WhatsApp, E-mail ou Cidade..."
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
            <option value="Ativo">Ativo</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Aguardando Documentos">Aguardando Documentos</option>
            <option value="Concluído">Concluído</option>
            <option value="Inativo">Inativo</option>
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
            <option value="Incapacidade">Incapacidade / Auxílio-Doença</option>
            <option value="Professor">Professor</option>
            <option value="Morte">Pensão por Morte</option>
            <option value="Maternidade">Salário-Maternidade</option>
          </select>
        </div>
      </div>

      {/* Clientes Table */}
      <div className="bg-white rounded-xl border border-[#E2E6E4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[11px] font-semibold border-b border-[#E2E6E4]">
              <tr>
                <th className="py-3.5 px-4">Cliente & CPF</th>
                <th className="py-3.5 px-4">Contatos</th>
                <th className="py-3.5 px-4">Benefício Principal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Último Andamento</th>
                <th className="py-3.5 px-4">Data Cadastro</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F4]">
              {filteredClients.map((client) => {
                const clientProcs = getClientProcesses(client.id);
                const lastEvent = client.timeline[0];

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-[#F9FAF9] transition-colors group cursor-pointer"
                    onClick={(e) => {
                      // Only trigger if not clicking buttons
                      if ((e.target as HTMLElement).closest('button')) return;
                      navigateToClientDetail(client.id);
                    }}
                  >
                    {/* Cliente & CPF */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1A2521] group-hover:text-[#2D4739] transition-colors">
                        {client.name}
                      </div>
                      <div className="text-xs text-[#6B7770] flex items-center gap-1.5 mt-0.5">
                        <span>CPF: {client.cpf}</span>
                        <span>•</span>
                        <span>{client.city}/{client.state}</span>
                      </div>
                    </td>

                    {/* Contatos & Botão WhatsApp */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openWhatsApp(client.whatsapp, client.name);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs border border-emerald-200 transition-colors"
                          title="Enviar mensagem via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-[#6B7770] mt-1 truncate max-w-[160px]" title={client.email}>
                        {client.email}
                      </div>
                    </td>

                    {/* Benefício */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1A2521]">
                        {client.benefitInterest || (clientProcs[0]?.benefitName) || 'Não definido'}
                      </div>
                      <div className="text-[11px] text-[#6B7770]">
                        {clientProcs.length > 0 ? `${clientProcs.length} processo(s)` : 'Sem processo'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* Último Andamento */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-xs text-[#1A2521] truncate" title={lastEvent?.title || 'Cadastrado'}>
                        {lastEvent?.title || 'Cadastrado'}
                      </div>
                      <div className="text-[10px] text-[#8A968F] mt-0.5">
                        {lastEvent ? lastEvent.date : client.createdAt}
                      </div>
                    </td>

                    {/* Data Cadastro */}
                    <td className="py-3.5 px-4 text-xs text-[#6B7770] whitespace-nowrap">
                      {client.createdAt}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToClientDetail(client.id);
                          }}
                          className="p-1.5 text-[#2D4739] hover:bg-[#EBF1ED] rounded-lg transition-colors"
                          title="Ver dossiê completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientId(client.id);
                            setActiveModal('edit-client');
                          }}
                          className="p-1.5 text-[#6B7770] hover:text-[#2D4739] hover:bg-[#F1F3F4] rounded-lg transition-colors"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Confirma a exclusão do cliente ${client.name}?`)) {
                              deleteClient(client.id);
                            }
                          }}
                          className="p-1.5 text-[#6B7770] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B7770]">
                    Nenhum cliente encontrado para os critérios selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F8F9FA] border-t border-[#E2E6E4] flex items-center justify-between text-xs text-[#6B7770]">
          <span>Exibindo {filteredClients.length} de {clients.length} clientes</span>
          <span className="text-[11px]">Clique em qualquer cliente para acessar o dossiê 360°</span>
        </div>
      </div>
    </div>
  );
};
