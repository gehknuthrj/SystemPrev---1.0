import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Sparkles, Building2, Phone, MapPin, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientStatus } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientIdToEdit?: string | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  clientIdToEdit,
}) => {
  const { clients, addClient, updateClient, benefits } = useApp();

  const [activeTab, setActiveTab] = useState<'pessoal' | 'contato' | 'endereco' | 'previdenciario'>('pessoal');

  // Form State
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [maritalStatus, setMaritalStatus] = useState('Casado(a)');
  const [profession, setProfession] = useState('');
  const [nitPisPasep, setNitPisPasep] = useState('');
  const [motherName, setMotherName] = useState('');
  const [fatherName, setFatherName] = useState('');

  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');

  const [benefitInterest, setBenefitInterest] = useState('');
  const [status, setStatus] = useState<ClientStatus>('Ativo');
  const [caseSummary, setCaseSummary] = useState('');
  const [pensionHistory, setPensionHistory] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing client if editing
  useEffect(() => {
    if (clientIdToEdit) {
      const existing = clients.find((c) => c.id === clientIdToEdit);
      if (existing) {
        setName(existing.name);
        setCpf(existing.cpf);
        setRg(existing.rg || '');
        setBirthDate(existing.birthDate || '');
        setGender(existing.gender || 'Masculino');
        setMaritalStatus(existing.maritalStatus || 'Casado(a)');
        setProfession(existing.profession || '');
        setNitPisPasep(existing.nitPisPasep || '');
        setMotherName(existing.motherName || '');
        setFatherName(existing.fatherName || '');
        setWhatsapp(existing.whatsapp);
        setPhone(existing.phone || '');
        setEmail(existing.email);
        setCep(existing.cep);
        setStreet(existing.street);
        setNumber(existing.number);
        setComplement(existing.complement || '');
        setNeighborhood(existing.neighborhood);
        setCity(existing.city);
        setState(existing.state);
        setBenefitInterest(existing.benefitInterest || '');
        setStatus(existing.status);
        setCaseSummary(existing.caseSummary || '');
        setPensionHistory(existing.pensionHistory || '');
        setNotes(existing.notes || '');
      }
    } else {
      // Reset form
      setName('');
      setCpf('');
      setRg('');
      setBirthDate('');
      setGender('Masculino');
      setMaritalStatus('Casado(a)');
      setProfession('');
      setNitPisPasep('');
      setMotherName('');
      setFatherName('');
      setWhatsapp('');
      setPhone('');
      setEmail('');
      setCep('');
      setStreet('');
      setNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('');
      setState('SP');
      setBenefitInterest('Aposentadoria Especial');
      setStatus('Ativo');
      setCaseSummary('');
      setPensionHistory('');
      setNotes('');
    }
  }, [clientIdToEdit, isOpen]);

  // CEP Auto-fill helper
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || 'SP');
        }
      } catch (err) {
        // silent fallback
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (clientIdToEdit) {
      updateClient(clientIdToEdit, {
        name,
        cpf,
        rg,
        birthDate,
        gender,
        maritalStatus,
        profession,
        nitPisPasep,
        motherName,
        fatherName,
        whatsapp,
        phone,
        email,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        benefitInterest,
        status,
        caseSummary,
        pensionHistory,
        notes,
      });
    } else {
      addClient({
        name,
        cpf,
        rg,
        birthDate,
        gender,
        maritalStatus,
        profession,
        nitPisPasep,
        motherName,
        fatherName,
        whatsapp,
        phone,
        email,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        benefitInterest,
        status,
        caseSummary,
        pensionHistory,
        notes,
      });
    }

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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                {clientIdToEdit ? 'Editar Dados do Cliente' : 'Novo Cadastro de Cliente'}
              </h2>
              <p className="text-xs text-[#A3B8AD]">Ficha cadastral completa e diagnóstico previdenciário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="px-6 border-b border-[#E2E6E4] flex items-center gap-2 overflow-x-auto text-xs font-semibold bg-[#F8F9FA]">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${
              activeTab === 'pessoal'
                ? 'border-[#2D4739] text-[#2D4739]'
                : 'border-transparent text-[#6B7770]'
            }`}
          >
            1. Dados Pessoais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contato')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${
              activeTab === 'contato'
                ? 'border-[#2D4739] text-[#2D4739]'
                : 'border-transparent text-[#6B7770]'
            }`}
          >
            2. Contatos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${
              activeTab === 'endereco'
                ? 'border-[#2D4739] text-[#2D4739]'
                : 'border-transparent text-[#6B7770]'
            }`}
          >
            3. Endereço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('previdenciario')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${
              activeTab === 'previdenciario'
                ? 'border-[#2D4739] text-[#2D4739]'
                : 'border-transparent text-[#6B7770]'
            }`}
          >
            4. Histórico Previdenciário
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* TAB 1: PESSOAL */}
          {activeTab === 'pessoal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">CPF *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">RG</label>
                <input
                  type="text"
                  placeholder="00.000.000-0 SSP/SP"
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Data de Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Sexo</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Estado Civil</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Profissão / Ocupação</label>
                <input
                  type="text"
                  placeholder="Ex: Vigilante, Metalúrgico, Professor..."
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">NIT / PIS / PASEP</label>
                <input
                  type="text"
                  placeholder="000.00000.00-0"
                  value={nitPisPasep}
                  onChange={(e) => setNitPisPasep(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Status Cadastral</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Aguardando Documentos">Aguardando Documentos</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Nome da Mãe</label>
                <input
                  type="text"
                  placeholder="Nome completo da genitora"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Nome do Pai (opcional)</label>
                <input
                  type="text"
                  placeholder="Nome completo do pai"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONTATOS */}
          {activeTab === 'contato' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#1A2521]">WhatsApp (com DDD) *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 98765-4321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Telefone Fixo / Recado</label>
                <input
                  type="text"
                  placeholder="(11) 3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ENDEREÇO */}
          {activeTab === 'endereco' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-[#1A2521]">CEP *</label>
                <input
                  type="text"
                  required
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">Logradouro / Rua *</label>
                <input
                  type="text"
                  required
                  placeholder="Av. Paulista, Rua das Flores..."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Número *</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Complemento</label>
                <input
                  type="text"
                  placeholder="Apto 42, Bloco B"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Bairro *</label>
                <input
                  type="text"
                  required
                  placeholder="Centro, Jardim América..."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-[#1A2521]">Cidade *</label>
                <input
                  type="text"
                  required
                  placeholder="São Paulo, Campinas..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Estado (UF) *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                >
                  {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES', 'AM', 'PA'].map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: PREVIDENCIARIO */}
          {activeTab === 'previdenciario' && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-[#1A2521]">Benefício de Interesse Principal</label>
                <select
                  value={benefitInterest}
                  onChange={(e) => setBenefitInterest(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                >
                  {benefits.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                  <option value="Outro">Outro / Planejamento Geral</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Resumo do Caso</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Segurado com 34 anos de contribuição, 15 anos exposto a ruído excessivo em metalúrgica..."
                  value={caseSummary}
                  onChange={(e) => setCaseSummary(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Histórico Previdenciário</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Períodos rurais não averbados, pendência de código PREV-EXT no CNIS..."
                  value={pensionHistory}
                  onChange={(e) => setPensionHistory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Estratégia / Providências Recomendadas</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Solicitar PPP retificado ao empregador antes do protocolo no INSS..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#E2E6E4] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6B7770] hover:text-[#1A2521]"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'previdenciario' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'pessoal') setActiveTab('contato');
                    else if (activeTab === 'contato') setActiveTab('endereco');
                    else if (activeTab === 'endereco') setActiveTab('previdenciario');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2D4739] text-white text-xs font-semibold"
                >
                  Próxima Etapa →
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D4739] hover:bg-[#1E3327] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Save className="w-4 h-4 text-[#C5A059]" />
                  <span>{clientIdToEdit ? 'Atualizar Cliente' : 'Salvar Cadastro'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
