import React, { useState } from 'react';
import {
  Settings,
  Building,
  Save,
  MessageCircle,
  Calendar,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseSqlSection } from './SupabaseSqlSection';
import { SUPABASE_SCHEMA_SQL } from '../../data/supabaseSchemaSql';

export const SettingsView: React.FC = () => {
  const { clients, processes, documents, transactions, addActivityLog, resetToCleanSlate } = useApp();

  const [officeName, setOfficeName] = useState('PrevConsult - Consultoria & Advocacia Previdenciária');
  const [cnpj, setCnpj] = useState('32.415.890/0001-24');
  const [oab, setOab] = useState('OAB/SP 412.390 - Sociedade Individual');
  const [email, setEmail] = useState('contato@prevconsult.com.br');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [address, setAddress] = useState('Av. Paulista, 1578, Conjunto 1204 - Bela Vista, São Paulo - SP');
  const [pixKey, setPixKey] = useState('financeiro@prevconsult.com.br (Chave E-mail)');

  // Integration states
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Olá, {cliente}! Lembramos que sua Perícia Médica no INSS está agendada para o dia {data} às {hora} na agência {local}. Lembre-se de levar documento com foto e laudos médicos atualizados.'
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveOffice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    addActivityLog('Edição', 'Configurações institucionais do escritório salvas.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      office: { officeName, cnpj, oab, email, phone, address, pixKey },
      clients,
      processes,
      documents,
      transactions,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prevconsult_backup_completo_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'ATENÇÃO: Deseja limpar todas as tabelas do Supabase e reiniciar o sistema do zero? Todos os dados ilustrativos serão removidos e apenas o usuário Administrador (Geison Murilo) será mantido.'
      )
    ) {
      await resetToCleanSlate();
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
          Configurações do Escritório & Integrações
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
          Personalize os dados cadastrais da sua consultoria, templates de WhatsApp e rotinas de backup.
        </p>
      </div>

      {/* Office Details Form */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
          <h2 className="text-sm font-bold text-[#1A2521] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#2D4739]" /> Dados da Consultoria Previdenciária
          </h2>
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveOffice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-[#1A2521]">Razão Social / Nome do Escritório</label>
              <input
                type="text"
                required
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Registro Profissional / OAB</label>
              <input
                type="text"
                value={oab}
                onChange={(e) => setOab(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">E-mail Institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Telefone / WhatsApp Oficial</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-[#1A2521]">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-[#1A2521]">Chave Pix para Pagamento de Honorários</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2D4739] hover:bg-[#1E3327] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-[#C5A059]" />
              <span>Salvar Dados do Escritório</span>
            </button>
          </div>
        </form>
      </div>

      {/* WhatsApp Template Card (Requirement 22) */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#1A2521] flex items-center gap-2 pb-2 border-b border-[#F1F3F4]">
          <MessageCircle className="w-4 h-4 text-emerald-600" /> Mensagens Automáticas de WhatsApp
        </h2>

        <p className="text-xs text-[#6B7770]">
          Modelo padrão disparado ao cliente quando uma perícia médica é agendada ou quando faltam documentos no checklist.
        </p>

        <div>
          <label className="text-xs font-semibold text-[#1A2521]">Texto da Mensagem de Alerta de Perícia</label>
          <textarea
            rows={3}
            value={whatsappTemplate}
            onChange={(e) => setWhatsappTemplate(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg text-xs outline-none focus:border-[#2D4739]"
          />
          <div className="text-[11px] text-[#8A968F] mt-1">
            Variáveis suportadas: {'{cliente}'}, {'{data}'}, {'{hora}'}, {'{local}'}
          </div>
        </div>
      </div>

      {/* Supabase Database Architecture & DDL Script */}
      <SupabaseSqlSection sqlContent={SUPABASE_SCHEMA_SQL} />

      {/* Backup & System Reset (Requirement 25) */}
      <div className="bg-white rounded-2xl border border-[#E2E6E4] p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#1A2521] flex items-center gap-2 pb-2 border-b border-[#F1F3F4]">
          <Database className="w-4 h-4 text-[#2D4739]" /> Segurança de Dados & Backup
        </h2>

        <p className="text-xs text-[#6B7770]">
          Exporte uma cópia completa dos clientes, processos, checklist de documentos e fluxo financeiro em formato JSON seguro.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleExportFullBackup}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D5DDD8] hover:bg-[#F8F9FA] text-[#1A2521] rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-[#2D4739]" />
            <span>Baixar Backup Completo (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <span>Limpar Tabelas e Começar do Zero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
