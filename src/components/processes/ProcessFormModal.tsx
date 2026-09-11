import React, { useState } from 'react';
import { X, FolderPlus, Save, Stethoscope, ShieldCheck, DollarSign, Calendar, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProcessStatus } from '../../types';

interface ProcessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessFormModal: React.FC<ProcessFormModalProps> = ({ isOpen, onClose }) => {
  const { clients, benefits, currentUser, addProcess, selectedClientId } = useApp();

  const [clientId, setClientId] = useState<string>(selectedClientId || (clients[0]?.id || ''));
  const [benefitId, setBenefitId] = useState<string>(benefits[0]?.id || '');
  const [protocolNumber, setProtocolNumber] = useState(`REQ-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [judicialProcessNumber, setJudicialProcessNumber] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [protocolDate, setProtocolDate] = useState('');
  const [status, setStatus] = useState<ProcessStatus>('Novo cliente');
  const [responsible, setResponsible] = useState(currentUser.name);
  const [feeAmount, setFeeAmount] = useState<number>(3500);
  const [paymentMethod, setPaymentMethod] = useState('30% sobre os valores atrasados no êxito');
  const [nextAction, setNextAction] = useState('Coletar documentos do checklist inicial');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  // Perícia Médica Toggle
  const [hasMedicalExam, setHasMedicalExam] = useState(false);
  const [medicalExamDate, setMedicalExamDate] = useState('');
  const [medicalExamTime, setMedicalExamTime] = useState('10:00');
  const [medicalExamLocation, setMedicalExamLocation] = useState('Agência da Previdência Social - APS');
  const [medicalExamDoctor, setMedicalExamDoctor] = useState('');
  const [medicalExamNotes, setMedicalExamNotes] = useState('Levar laudos médicos atualizados, exames de imagem e receitas com carimbo legível.');

  // Perícia Social Toggle
  const [hasSocialExam, setHasSocialExam] = useState(false);
  const [socialExamDate, setSocialExamDate] = useState('');
  const [socialExamTime, setSocialExamTime] = useState('14:00');
  const [socialExamLocation, setSocialExamLocation] = useState('Serviço Social da APS');
  const [socialExamNotes, setSocialExamNotes] = useState('Comprovantes de despesas com remédios, alimentação e aluguel.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addProcess({
      clientId,
      benefitId,
      protocolNumber,
      judicialProcessNumber: judicialProcessNumber.trim() || undefined,
      requestDate,
      protocolDate: protocolDate || undefined,
      status,
      lastProgress: 'Abertura de processo e checklist vinculados',
      nextAction,
      deadline: deadline || undefined,
      responsible,
      feeAmount: Number(feeAmount) || 0,
      paymentMethod,
      notes: notes.trim() || undefined,
      medicalExamDate: hasMedicalExam ? medicalExamDate : undefined,
      medicalExamTime: hasMedicalExam ? medicalExamTime : undefined,
      medicalExamLocation: hasMedicalExam ? medicalExamLocation : undefined,
      medicalExamDoctor: hasMedicalExam ? medicalExamDoctor : undefined,
      medicalExamNotes: hasMedicalExam ? medicalExamNotes : undefined,
      socialExamDate: hasSocialExam ? socialExamDate : undefined,
      socialExamTime: hasSocialExam ? socialExamTime : undefined,
      socialExamLocation: hasSocialExam ? socialExamLocation : undefined,
      socialExamNotes: hasSocialExam ? socialExamNotes : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#D5DDD8] overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1E3327] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C5A059] text-[#1E3327]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Abertura de Processo Previdenciário</h2>
              <p className="text-xs text-[#A3B8AD]">
                Geração automática de checklist de documentos, agenda de perícias e financeiro
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-[#1A2521]">Cliente Vinculado *</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (CPF: {c.cpf})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Tipo de Benefício / Ação *</label>
              <select
                required
                value={benefitId}
                onChange={(e) => setBenefitId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              >
                {benefits.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Número do Protocolo INSS *</label>
              <input
                type="text"
                required
                value={protocolNumber}
                onChange={(e) => setProtocolNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739] font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Processo Judicial (se houver)</label>
              <input
                type="text"
                placeholder="Ex: 5001234-56.2024.4.03.6100"
                value={judicialProcessNumber}
                onChange={(e) => setJudicialProcessNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739] font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Data de Requerimento *</label>
              <input
                type="date"
                required
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Data de Protocolo Efetivo</label>
              <input
                type="date"
                value={protocolDate}
                onChange={(e) => setProtocolDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Status Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcessStatus)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              >
                <option value="Novo cliente">Novo cliente</option>
                <option value="Documentação pendente">Documentação pendente</option>
                <option value="Documentação completa">Documentação completa</option>
                <option value="Protocolado no INSS">Protocolado no INSS</option>
                <option value="Em análise pelo INSS">Em análise pelo INSS</option>
                <option value="Exigência">Exigência</option>
                <option value="Perícia agendada">Perícia agendada</option>
                <option value="Aguardando resultado">Aguardando resultado</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Responsável pelo Processo</label>
              <input
                type="text"
                required
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>
          </div>

          {/* Financials & Deadlines */}
          <div className="p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DCC0] space-y-3">
            <h4 className="font-bold text-[#9E7B36] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Honorários & Condições Contratuais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-[#1A2521]">Valor Estimado / Previsto (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">Forma e Condição de Pagamento</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Ex: 30% no êxito, ou entrada + 3 parcelas..."
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">Próxima Ação a Executar</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Prazo Limite / Fatal</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>
            </div>
          </div>

          {/* Perícia Médica Section */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4] space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1A2521] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMedicalExam}
                  onChange={(e) => setHasMedicalExam(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2D4739] focus:ring-[#2D4739]"
                />
                <span className="flex items-center gap-1.5 text-amber-800">
                  <Stethoscope className="w-4 h-4" /> Agendar Perícia Médica no INSS
                </span>
              </label>
              {hasMedicalExam && (
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Criará evento na agenda e alerta automático
                </span>
              )}
            </div>

            {hasMedicalExam && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-[#1A2521]">Data da Perícia *</label>
                  <input
                    type="date"
                    required={hasMedicalExam}
                    value={medicalExamDate}
                    onChange={(e) => setMedicalExamDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Horário *</label>
                  <input
                    type="time"
                    value={medicalExamTime}
                    onChange={(e) => setMedicalExamTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#1A2521]">Local / Agência do INSS *</label>
                  <input
                    type="text"
                    required={hasMedicalExam}
                    value={medicalExamLocation}
                    onChange={(e) => setMedicalExamLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#1A2521]">Instruções e Laudos a Apresentar</label>
                  <input
                    type="text"
                    value={medicalExamNotes}
                    onChange={(e) => setMedicalExamNotes(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Perícia Social Section */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4] space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1A2521] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSocialExam}
                  onChange={(e) => setHasSocialExam(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2D4739] focus:ring-[#2D4739]"
                />
                <span className="flex items-center gap-1.5 text-purple-800">
                  <ShieldCheck className="w-4 h-4" /> Agendar Avaliação Social (BPC/LOAS)
                </span>
              </label>
            </div>

            {hasSocialExam && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-[#1A2521]">Data da Avaliação Social *</label>
                  <input
                    type="date"
                    required={hasSocialExam}
                    value={socialExamDate}
                    onChange={(e) => setSocialExamDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Horário *</label>
                  <input
                    type="time"
                    value={socialExamTime}
                    onChange={(e) => setSocialExamTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#1A2521]">Local do Atendimento Social</label>
                  <input
                    type="text"
                    value={socialExamLocation}
                    onChange={(e) => setSocialExamLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="font-semibold text-[#1A2521]">Observações Gerais da Causa</label>
            <textarea
              rows={2}
              placeholder="Detalhes adicionais sobre teses, súmulas aplicáveis ou acordos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E2E6E4] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6B7770] hover:text-[#1A2521]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2D4739] hover:bg-[#1E3327] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-[#C5A059]" />
              <span>Criar Processo com Checklist</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
