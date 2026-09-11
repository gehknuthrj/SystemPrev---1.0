import React, { useState } from 'react';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
  CheckSquare,
  History,
  MessageCircle,
  Plus,
  Edit2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  FolderKanban,
  Upload,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client, DocumentCategory, DocumentChecklistStatus } from '../../types';

export const ClientDetailView: React.FC = () => {
  const {
    selectedClientId,
    clients,
    processes,
    documents,
    transactions,
    events,
    tasks,
    updateClient,
    addClientTimelineEvent,
    navigateToProcessDetail,
    setActiveModal,
    openWhatsApp,
    uploadDocument,
    toggleTransactionStatus,
    moveTaskColumn,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dados' | 'caso' | 'processos' | 'documentos' | 'financeiro' | 'agenda' | 'tarefas' | 'historico'
  >('dados');

  // New timeline entry state
  const [newTimelineType, setNewTimelineType] = useState<'Atendimento' | 'Documento' | 'Andamento' | 'Perícia' | 'Financeiro' | 'Nota'>('Atendimento');
  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [newTimelineDesc, setNewTimelineDesc] = useState('');
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);

  // Quick document upload state
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocCategory, setUploadDocCategory] = useState<DocumentCategory>('Identificação');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const client = clients.find((c) => c.id === selectedClientId);

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Cliente não encontrado.</p>
        <button
          onClick={() => setCurrentView('clients')}
          className="mt-4 px-4 py-2 bg-[#2D4739] text-white rounded-lg text-sm"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  // Relations
  const clientProcesses = processes.filter((p) => p.clientId === client.id);
  const clientDocuments = documents.filter((d) => d.clientId === client.id);
  const clientTransactions = transactions.filter((t) => t.clientId === client.id);
  const clientEvents = events.filter((e) => e.clientId === client.id);
  const clientTasks = tasks.filter((t) => t.clientId === client.id);

  // Financial summary for client
  const totalReceivables = clientTransactions
    .filter((t) => t.type === 'receita')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceived = clientTransactions
    .filter((t) => t.type === 'receita' && t.status === 'Recebido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineTitle.trim()) return;

    addClientTimelineEvent(client.id, {
      type: newTimelineType,
      title: newTimelineTitle.trim(),
      description: newTimelineDesc.trim(),
    });

    setNewTimelineTitle('');
    setNewTimelineDesc('');
    setIsAddingTimeline(false);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocName.trim()) return;

    uploadDocument({
      clientId: client.id,
      processId: clientProcesses[0]?.id,
      name: uploadDocName.trim(),
      category: uploadDocCategory,
      fileType: 'application/pdf',
      fileSize: '1.8 MB',
      status: 'Recebido',
    });

    setUploadDocName('');
    setIsUploadingDoc(false);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Client Header Card */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D4739] to-[#1E3327] text-white flex items-center justify-center text-xl font-bold font-serif shrink-0 shadow-md">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">{client.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  client.status === 'Ativo'
                    ? 'bg-emerald-100 text-emerald-800'
                    : client.status === 'Em Análise'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {client.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#6B7770] mt-1.5 flex-wrap">
              <span>CPF: <strong className="text-[#1A2521]">{client.cpf}</strong></span>
              <span>•</span>
              <span>RG: {client.rg || 'Não informado'}</span>
              <span>•</span>
              <span>NIT/PIS: {client.nitPisPasep || 'Não informado'}</span>
              <span>•</span>
              <span>{client.city}/{client.state}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openWhatsApp(client.whatsapp, client.name)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chamar WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveModal('new-process')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Abrir Processo</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (8 Tabs Requirement 22) */}
      <div className="border-b border-[#E2E6E4] flex items-center gap-1 overflow-x-auto text-xs sm:text-sm font-medium">
        {[
          { id: 'dados', label: 'Dados Pessoais', icon: <Users className="w-4 h-4" /> },
          { id: 'caso', label: 'Histórico Previdenciário', icon: <FileText className="w-4 h-4" /> },
          { id: 'processos', label: `Processos (${clientProcesses.length})`, icon: <FolderKanban className="w-4 h-4" /> },
          { id: 'documentos', label: `Documentos (${clientDocuments.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'financeiro', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'agenda', label: `Agenda (${clientEvents.length})`, icon: <Calendar className="w-4 h-4" /> },
          { id: 'tarefas', label: `Tarefas (${clientTasks.length})`, icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'historico', label: `Histórico / Timeline (${client.timeline.length})`, icon: <History className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-[#2D4739] text-[#2D4739] font-bold bg-[#F1F6F3]/50'
                : 'border-transparent text-[#6B7770] hover:text-[#1A2521] hover:border-[#D5DDD8]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DADOS PESSOAIS */}
      {activeTab === 'dados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Informações Pessoais */}
          <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1A2521] pb-2 border-b border-[#F1F3F4] flex items-center justify-between">
              <span>Identificação do Segurado</span>
              <span className="text-xs font-normal text-[#6B7770]">Cadastrado em {client.createdAt}</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8A968F]">Nome Completo</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.name}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">CPF</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.cpf}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">RG / Órgão Emissor</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.rg || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">Data de Nascimento</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.birthDate || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">Sexo</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.gender || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">Estado Civil</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.maritalStatus || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">Profissão / Ocupação</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.profession || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-[#8A968F]">NIT / PIS / PASEP</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.nitPisPasep || 'Não informado'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[#8A968F]">Nome da Mãe</span>
                <p className="font-semibold text-[#1A2521] mt-0.5">{client.motherName || 'Não informado'}</p>
              </div>
              {client.fatherName && (
                <div className="col-span-2">
                  <span className="text-[#8A968F]">Nome do Pai</span>
                  <p className="font-semibold text-[#1A2521] mt-0.5">{client.fatherName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card: Contatos e Endereço */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A2521] pb-2 border-b border-[#F1F3F4]">
                Contatos & Comunicação
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A968F] flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </span>
                  <button
                    onClick={() => openWhatsApp(client.whatsapp, client.name)}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    {client.whatsapp}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8A968F] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Telefone Fixo
                  </span>
                  <span className="font-semibold text-[#1A2521]">{client.phone || 'Não informado'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8A968F] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </span>
                  <span className="font-semibold text-[#1A2521]">{client.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A2521] pb-2 border-b border-[#F1F3F4]">
                Endereço Residencial
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <span className="text-[#8A968F]">Logradouro</span>
                  <p className="font-semibold text-[#1A2521] mt-0.5">
                    {client.street}, {client.number} {client.complement ? `(${client.complement})` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-[#8A968F]">Bairro</span>
                  <p className="font-semibold text-[#1A2521] mt-0.5">{client.neighborhood}</p>
                </div>
                <div>
                  <span className="text-[#8A968F]">CEP</span>
                  <p className="font-semibold text-[#1A2521] mt-0.5">{client.cep}</p>
                </div>
                <div>
                  <span className="text-[#8A968F]">Cidade / UF</span>
                  <p className="font-semibold text-[#1A2521] mt-0.5">{client.city} - {client.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASO / HISTÓRICO PREVIDENCIÁRIO */}
      {activeTab === 'caso' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#1A2521]">Resumo do Caso & Situação Atual</h3>
              <p className="text-xs text-[#6B7770]">Diagnóstico inicial levantado na entrevista do cliente</p>
              <div className="mt-2 p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4] text-xs sm:text-sm text-[#1A2521] leading-relaxed">
                {client.caseSummary || 'Nenhum resumo cadastrado.'}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1A2521]">Histórico Previdenciário & Vínculos</h3>
              <p className="text-xs text-[#6B7770]">Vínculos em CTPS, carnês GPS, atividades especiais ou rurais</p>
              <div className="mt-2 p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4] text-xs sm:text-sm text-[#1A2521] leading-relaxed">
                {client.pensionHistory || 'Nenhum histórico informado.'}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1A2521]">Estratégia e Providências Recomendadas</h3>
              <p className="text-xs text-[#6B7770]">Plano de ação delineado pela consultoria previdenciária</p>
              <div className="mt-2 p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DCC0] text-xs sm:text-sm text-[#9E7B36] font-medium leading-relaxed">
                {client.notes || 'Análise de documentação em curso para definição da melhor regra de transição.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROCESSOS */}
      {activeTab === 'processos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A2521]">
              Processos Previdenciários do Cliente ({clientProcesses.length})
            </h3>
            <button
              onClick={() => setActiveModal('new-process')}
              className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Novo Processo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientProcesses.map((proc) => {
              const validatedDocs = proc.checklist.filter((i) => i.status === 'Validado').length;
              const checklistPct = Math.round((validatedDocs / (proc.checklist.length || 1)) * 100);

              return (
                <div
                  key={proc.id}
                  onClick={() => navigateToProcessDetail(proc.id)}
                  className="bg-white p-5 rounded-2xl border border-[#E2E6E4] hover:border-[#2D4739] shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#9E7B36] uppercase tracking-wider">
                        Protocolo: {proc.protocolNumber}
                      </span>
                      <h4 className="text-base font-bold text-[#1A2521] group-hover:text-[#2D4739]">
                        {proc.benefitName}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF6ED] text-[#9E7B36] border border-[#E8DCC0]">
                      {proc.status}
                    </span>
                  </div>

                  <div className="my-3 space-y-2 text-xs">
                    <div className="flex justify-between text-[#6B7770]">
                      <span>Checklist de Documentos:</span>
                      <span className="font-semibold text-[#1A2521]">{validatedDocs}/{proc.checklist.length} ({checklistPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F3F4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D4739] rounded-full" style={{ width: `${checklistPct}%` }} />
                    </div>

                    <div className="text-[11px] text-[#6B7770] pt-1">
                      Último andamento: <strong>{proc.lastProgress}</strong> ({proc.lastProgressDate})
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F1F3F4] flex items-center justify-between text-xs">
                    <span className="text-[#6B7770]">Honorários: R$ {proc.feeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-[#2D4739] font-semibold flex items-center gap-1 group-hover:underline">
                      Acessar Processo <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}

            {clientProcesses.length === 0 && (
              <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-[#D5DDD8] text-xs text-[#6B7770]">
                Nenhum processo previdenciário aberto para este cliente ainda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A2521]">Dossiê de Documentos do Cliente</h3>
              <p className="text-xs text-[#6B7770]">Análise, validação e guarda de peças documentais</p>
            </div>
            <button
              onClick={() => setIsUploadingDoc(!isUploadingDoc)}
              className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A059]" /> {isUploadingDoc ? 'Cancelar' : '+ Anexar Documento'}
            </button>
          </div>

          {/* Quick upload form */}
          {isUploadingDoc && (
            <form onSubmit={handleUploadDoc} className="bg-[#F8F9FA] p-4 rounded-xl border border-[#D5DDD8] space-y-3">
              <h4 className="text-xs font-bold text-[#1A2521]">Anexar Novo Documento</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#6B7770] font-medium">Nome do Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: RG e CPF frente e verso, Laudo Ortopédico 2024..."
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>
                <div>
                  <label className="text-[#6B7770] font-medium">Categoria do Documento</label>
                  <select
                    value={uploadDocCategory}
                    onChange={(e) => setUploadDocCategory(e.target.value as DocumentCategory)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  >
                    <option value="Identificação">Identificação</option>
                    <option value="Residência">Residência</option>
                    <option value="Previdenciário">Previdenciário (CNIS, CTPS, PPP)</option>
                    <option value="Médico">Médico (Laudos, Exames, Atestados)</option>
                    <option value="Renda / Socioeconômico">Renda / Socioeconômico</option>
                    <option value="Procuração e Contrato">Procuração e Contrato</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D4739] text-white rounded-lg text-xs font-semibold"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          )}

          {/* Documents Table */}
          <div className="bg-white rounded-2xl border border-[#E2E6E4] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[10px] font-semibold border-b border-[#E2E6E4]">
                <tr>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data de Envio</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F4]">
                {clientDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F9FAF9]">
                    <td className="py-3 px-4 font-semibold text-[#1A2521] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2D4739]" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7770]">{doc.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'Validado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Recebido'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7770]">{doc.uploadDate}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Visualizando documento simulado: ${doc.name}`)}
                        className="px-2.5 py-1 rounded bg-[#EBF1ED] text-[#2D4739] font-medium hover:bg-[#2D4739] hover:text-white transition-colors text-[11px]"
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}

                {clientDocuments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum documento anexado para este cliente ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCEIRO */}
      {activeTab === 'financeiro' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E6E4]">
              <span className="text-xs text-[#6B7770]">Total de Honorários Contratados</span>
              <div className="text-xl font-bold text-[#1A2521] mt-1">
                R$ {totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E6E4]">
              <span className="text-xs text-emerald-700">Honorários Recebidos</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E6E4]">
              <span className="text-xs text-amber-700">Honorários Pendentes / No Êxito</span>
              <div className="text-xl font-bold text-amber-700 mt-1">
                R$ {(totalReceivables - totalReceived).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-[#E2E6E4] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#F1F3F4] flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#1A2521] uppercase">Lançamentos Financeiros do Cliente</h4>
              <button
                onClick={() => setActiveModal('new-receita')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
              >
                + Lançar Honorário
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F4]">
                {clientTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F9FAF9]">
                    <td className="py-3 px-4 font-semibold text-[#1A2521]">{tx.description}</td>
                    <td className="py-3 px-4 text-[#6B7770]">{tx.dueDate}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'Recebido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleTransactionStatus(tx.id)}
                        className="text-[11px] text-[#2D4739] hover:underline font-semibold"
                      >
                        {tx.status === 'Recebido' ? 'Marcar Pendente' : 'Confirmar Recebimento'}
                      </button>
                    </td>
                  </tr>
                ))}

                {clientTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum lançamento financeiro para este cliente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AGENDA */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A2521]">Agenda de Compromissos & Perícias</h3>
            <button
              onClick={() => setActiveModal('new-event')}
              className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Novo Compromisso
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientEvents.map((evt) => (
              <div key={evt.id} className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-sm text-[#1A2521]">{evt.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                    {evt.category}
                  </span>
                </div>
                <div className="text-xs text-[#6B7770] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2D4739]" />
                    <span>{evt.date} às {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2D4739]" />
                    <span>{evt.location}</span>
                  </div>
                  {evt.description && <p className="pt-1 text-[#1A2521]">{evt.description}</p>}
                </div>
              </div>
            ))}

            {clientEvents.length === 0 && (
              <div className="col-span-2 py-8 text-center bg-white rounded-xl border border-dashed border-[#D5DDD8] text-xs text-[#6B7770]">
                Nenhum compromisso ou perícia agendada para este cliente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: TAREFAS */}
      {activeTab === 'tarefas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A2521]">Tarefas Vinculadas ao Cliente</h3>
            <button
              onClick={() => setActiveModal('new-task')}
              className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Nova Tarefa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientTasks.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-xs text-[#1A2521]">{t.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-[#6B7770]">{t.description}</p>
                <div className="pt-2 border-t border-[#F1F3F4] flex items-center justify-between text-xs">
                  <span className="text-[#8A968F]">Prazo: {t.deadline}</span>
                  <button
                    onClick={() => moveTaskColumn(t.id, t.column === 'done' ? 'todo' : 'done')}
                    className="text-[#2D4739] font-medium hover:underline"
                  >
                    {t.column === 'done' ? 'Reabrir Tarefa' : 'Concluir Tarefa'}
                  </button>
                </div>
              </div>
            ))}

            {clientTasks.length === 0 && (
              <div className="col-span-2 py-8 text-center bg-white rounded-xl border border-dashed border-[#D5DDD8] text-xs text-[#6B7770]">
                Nenhuma tarefa pendente para este cliente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: HISTÓRICO / TIMELINE */}
      {activeTab === 'historico' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A2521]">Linha do Tempo de Atendimentos</h3>
              <p className="text-xs text-[#6B7770]">Registro cronológico de todas as interações e atualizações</p>
            </div>
            <button
              onClick={() => setIsAddingTimeline(!isAddingTimeline)}
              className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> {isAddingTimeline ? 'Cancelar' : '+ Registrar Evento'}
            </button>
          </div>

          {/* New Event Form */}
          {isAddingTimeline && (
            <form onSubmit={handleAddTimeline} className="bg-[#F8F9FA] p-4 rounded-xl border border-[#D5DDD8] space-y-3">
              <h4 className="text-xs font-bold text-[#1A2521]">Novo Registro no Prontuário</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[#6B7770] font-medium">Tipo de Evento</label>
                  <select
                    value={newTimelineType}
                    onChange={(e) => setNewTimelineType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  >
                    <option value="Atendimento">Atendimento / Reunião</option>
                    <option value="Andamento">Andamento no INSS / Judicial</option>
                    <option value="Documento">Documentação Entregue</option>
                    <option value="Perícia">Perícia Médica / Social</option>
                    <option value="Financeiro">Movimentação Financeira</option>
                    <option value="Nota">Anotação Interna</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[#6B7770] font-medium">Título do Evento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Contato telefônico informando data da perícia..."
                    value={newTimelineTitle}
                    onChange={(e) => setNewTimelineTitle(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[#6B7770] font-medium">Descrição detalhada</label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes sobre o que foi conversado ou deliberado..."
                    value={newTimelineDesc}
                    onChange={(e) => setNewTimelineDesc(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D4739] text-white rounded-lg text-xs font-semibold"
                >
                  Registrar no Histórico
                </button>
              </div>
            </form>
          )}

          {/* Chronological Timeline */}
          <div className="relative pl-6 border-l-2 border-[#2D4739]/20 space-y-6">
            {client.timeline.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#2D4739] ring-4 ring-white" />

                <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#1A2521]">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF1ED] text-[#2D4739] font-semibold">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#55635B]">{item.description}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#8A968F]">
                    <span>Data: {item.date}</span>
                    <span>Autor: {item.author || 'Sistema'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
