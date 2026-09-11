import React, { useState } from 'react';
import {
  FolderKanban,
  User,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  DollarSign,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  History,
  ShieldCheck,
  Edit2,
  Upload,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentChecklistStatus, ProcessStatus } from '../../types';

export const ProcessDetailView: React.FC = () => {
  const {
    selectedProcessId,
    processes,
    clients,
    updateProcess,
    updateProcessChecklistItem,
    addProcessTimelineEvent,
    navigateToClientDetail,
    uploadDocument,
    openWhatsApp,
    setCurrentView,
  } = useApp();

  const [newAndamentoTitle, setNewAndamentoTitle] = useState('');
  const [newAndamentoBadge, setNewAndamentoBadge] = useState('Andamento');
  const [newAndamentoDesc, setNewAndamentoDesc] = useState('');
  const [isAddingAndamento, setIsAddingAndamento] = useState(false);

  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);

  const process = processes.find((p) => p.id === selectedProcessId);
  const client = process ? clients.find((c) => c.id === process.clientId) : null;

  if (!process) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Processo não encontrado.</p>
        <button
          onClick={() => setCurrentView('processes')}
          className="mt-4 px-4 py-2 bg-[#2D4739] text-white rounded-lg text-sm"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const validatedDocsCount = process.checklist.filter((i) => i.status === 'Validado').length;
  const checklistPercentage = Math.round((validatedDocsCount / (process.checklist.length || 1)) * 100);

  const handleAddAndamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAndamentoTitle.trim()) return;

    addProcessTimelineEvent(
      process.id,
      newAndamentoTitle.trim(),
      newAndamentoDesc.trim() || 'Andamento registrado na pasta do processo.',
      newAndamentoBadge
    );

    setNewAndamentoTitle('');
    setNewAndamentoDesc('');
    setIsAddingAndamento(false);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      title: newChecklistTitle.trim(),
      required: true,
      status: 'Pendente' as DocumentChecklistStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    updateProcess(process.id, {
      checklist: [...process.checklist, newItem],
    });

    setNewChecklistTitle('');
    setIsAddingChecklistItem(false);
  };

  const handleStatusChange = (newStatus: ProcessStatus) => {
    updateProcess(process.id, { status: newStatus });
    addProcessTimelineEvent(
      process.id,
      `Status alterado para "${newStatus}"`,
      `O status geral do processo previdenciário foi atualizado pelo responsável.`,
      'Status'
    );
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#9E7B36] text-[#1E3327] flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
            <FolderKanban className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#9E7B36] bg-[#FAF6ED] px-2.5 py-0.5 rounded border border-[#E8DCC0]">
                Protocolo: {process.protocolNumber}
              </span>
              {process.judicialProcessNumber && (
                <span className="text-xs font-mono text-[#6B7770] bg-slate-100 px-2 py-0.5 rounded">
                  Judicial: {process.judicialProcessNumber}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521] mt-1">
              {process.benefitName}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[#6B7770] mt-1.5 flex-wrap">
              <button
                onClick={() => navigateToClientDetail(process.clientId)}
                className="text-[#2D4739] font-semibold hover:underline flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Cliente: {process.clientName}</span>
              </button>
              <span>•</span>
              <span>Responsável: <strong>{process.responsible}</strong></span>
              <span>•</span>
              <span>Data Requerimento: {process.requestDate}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Status Select */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#6B7770] uppercase">Alterar Status</label>
            <select
              value={process.status}
              onChange={(e) => handleStatusChange(e.target.value as ProcessStatus)}
              className="mt-0.5 py-1.5 px-3 rounded-xl bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] text-xs font-semibold outline-none focus:border-[#2D4739] cursor-pointer"
            >
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
          </div>

          {client && (
            <button
              onClick={() => openWhatsApp(client.whatsapp, client.name)}
              className="mt-auto flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp do Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Informações & Perícias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Informações Gerais & Honorários */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1A2521] pb-2 border-b border-[#F1F3F4] flex items-center justify-between">
            <span>Dados da Ação / Requerimento</span>
            <DollarSign className="w-4 h-4 text-[#C5A059]" />
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6B7770]">Honorários Contratados:</span>
              <span className="font-bold text-[#1A2521]">
                R$ {process.feeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#6B7770]">Condição de Pagamento:</span>
              <span className="font-medium text-[#1A2521] text-right">{process.paymentMethod}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#6B7770]">Data de Protocolo:</span>
              <span className="font-medium text-[#1A2521]">{process.protocolDate || 'Aguardando protocolo'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#6B7770]">Próxima Ação:</span>
              <span className="font-semibold text-[#2D4739] text-right">{process.nextAction}</span>
            </div>

            {process.deadline && (
              <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Prazo Fatal:
                </span>
                <span>{process.deadline}</span>
              </div>
            )}

            {process.notes && (
              <div className="pt-2 border-t border-[#F1F3F4]">
                <span className="text-[11px] text-[#6B7770] font-semibold">Observações Estratégicas:</span>
                <p className="text-[#1A2521] mt-0.5">{process.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Perícia Médica */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1A2521] pb-2 border-b border-[#F1F3F4] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-amber-600" /> Perícia Médica
            </span>
            {process.medicalExam ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {process.medicalExam.status}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">Não agendada</span>
            )}
          </h3>

          {process.medicalExam ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#1A2521] font-semibold">
                <Calendar className="w-4 h-4 text-[#2D4739]" />
                <span>{process.medicalExam.date} às {process.medicalExam.time}</span>
              </div>

              <div className="flex items-start gap-2 text-[#55635B]">
                <MapPin className="w-4 h-4 text-[#2D4739] shrink-0 mt-0.5" />
                <span>{process.medicalExam.location}</span>
              </div>

              {process.medicalExam.doctorName && (
                <div className="text-[#6B7770]">
                  Médico Perito: <strong>{process.medicalExam.doctorName}</strong>
                </div>
              )}

              {process.medicalExam.notes && (
                <div className="p-2.5 rounded-lg bg-[#FAF6ED] border border-[#E8DCC0] text-[11px] text-[#9E7B36]">
                  <strong>Orientações ao Cliente:</strong> {process.medicalExam.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#6B7770]">
              Nenhuma perícia médica registrada para este processo.
            </div>
          )}
        </div>

        {/* Card 3: Perícia / Avaliação Social */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6E4] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1A2521] pb-2 border-b border-[#F1F3F4] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Avaliação Social
            </span>
            {process.socialExam ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {process.socialExam.status}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">Não agendada</span>
            )}
          </h3>

          {process.socialExam ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#1A2521] font-semibold">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>{process.socialExam.date} às {process.socialExam.time}</span>
              </div>

              <div className="flex items-start gap-2 text-[#55635B]">
                <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>{process.socialExam.location}</span>
              </div>

              {process.socialExam.notes && (
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-900">
                  <strong>Orientações:</strong> {process.socialExam.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#6B7770]">
              Não se aplica ou ainda não foi agendada avaliação social para este benefício.
            </div>
          )}
        </div>
      </div>

      {/* CHECKLIST AUTOMÁTICO DE DOCUMENTOS (Requirement 14 & 16) */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#2D4739]" />
              <h3 className="text-base font-bold text-[#1A2521]">
                Checklist Automático de Documentos ({process.benefitName})
              </h3>
            </div>
            <p className="text-xs text-[#6B7770] mt-0.5">
              Valide os requisitos documentais essenciais para o deferimento do benefício
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-[#6B7770]">Progresso do Checklist:</div>
              <div className="text-sm font-bold text-[#2D4739]">{validatedDocsCount} de {process.checklist.length} ({checklistPercentage}%)</div>
            </div>
            <button
              onClick={() => setIsAddingChecklistItem(!isAddingChecklistItem)}
              className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> + Adicionar Item
            </button>
          </div>
        </div>

        {/* Percentage Progress Bar */}
        <div className="w-full h-3 bg-[#F1F3F4] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              checklistPercentage === 100
                ? 'bg-emerald-600'
                : checklistPercentage >= 60
                ? 'bg-[#2D4739]'
                : 'bg-amber-500'
            }`}
            style={{ width: `${checklistPercentage}%` }}
          />
        </div>

        {/* Add custom checklist item form */}
        {isAddingChecklistItem && (
          <form onSubmit={handleAddChecklistItem} className="p-3 bg-[#F8F9FA] rounded-xl border border-[#D5DDD8] flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Nome do novo documento obrigatório..."
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#2D4739] text-white text-xs font-semibold rounded-lg"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsAddingChecklistItem(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-black"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Checklist items list */}
        <div className="divide-y divide-[#F1F3F4] border border-[#E2E6E4] rounded-xl overflow-hidden">
          {process.checklist.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAF9] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.status === 'Validado' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : item.status === 'Recebido' ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : item.status === 'Em análise' ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1A2521]">
                    {item.title}
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-[#9E7B36] mt-0.5">
                      Obs: {item.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateProcessChecklistItem(process.id, item.id, e.target.value as DocumentChecklistStatus)
                  }
                  className={`text-xs py-1 px-2.5 rounded-lg border font-semibold outline-none cursor-pointer ${
                    item.status === 'Validado'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : item.status === 'Recebido'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : item.status === 'Em análise'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Recebido">Recebido</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Validado">Validado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LINHA DO TEMPO DO PROCESSO */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1A2521] flex items-center gap-2">
              <History className="w-5 h-5 text-[#2D4739]" /> Linha do Tempo & Andamentos do Processo
            </h3>
            <p className="text-xs text-[#6B7770]">Histórico de protocolos, decisões administrativas e judiciais</p>
          </div>

          <button
            onClick={() => setIsAddingAndamento(!isAddingAndamento)}
            className="px-3 py-1.5 bg-[#2D4739] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> {isAddingAndamento ? 'Cancelar' : '+ Novo Andamento'}
          </button>
        </div>

        {/* Add Andamento Form */}
        {isAddingAndamento && (
          <form onSubmit={handleAddAndamento} className="bg-[#F8F9FA] p-4 rounded-xl border border-[#D5DDD8] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">Título do Andamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cumprimento de exigência protocolado no Meu INSS..."
                  value={newAndamentoTitle}
                  onChange={(e) => setNewAndamentoTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Etiqueta / Tipo</label>
                <select
                  value={newAndamentoBadge}
                  onChange={(e) => setNewAndamentoBadge(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                >
                  <option value="Andamento">Andamento Geral</option>
                  <option value="Protocolo">Protocolo</option>
                  <option value="Exigência">Exigência</option>
                  <option value="Perícia">Perícia</option>
                  <option value="Decisão">Decisão / Deferimento</option>
                  <option value="Recurso">Recurso</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-[#1A2521]">Descrição Detalhada</label>
                <textarea
                  rows={2}
                  placeholder="Descreva as providências tomadas..."
                  value={newAndamentoDesc}
                  onChange={(e) => setNewAndamentoDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#2D4739] text-white rounded-lg text-xs font-semibold"
              >
                Registrar Andamento
              </button>
            </div>
          </form>
        )}

        {/* Timeline Events */}
        <div className="relative pl-6 border-l-2 border-[#2D4739]/20 space-y-6">
          {process.timeline.map((tl) => (
            <div key={tl.id} className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#2D4739] ring-4 ring-white" />

              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E6E4] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs sm:text-sm text-[#1A2521]">{tl.title}</span>
                  {tl.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#FAF6ED] text-[#9E7B36] border border-[#E8DCC0]">
                      {tl.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#55635B]">{tl.description}</p>
                <div className="pt-1 text-[11px] text-[#8A968F]">
                  Data: {tl.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
