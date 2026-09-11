import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BenefitType } from '../../types';

export const BenefitsListView: React.FC = () => {
  const { benefits, addBenefit, updateBenefit, deleteBenefit } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [expandedBenefitId, setExpandedBenefitId] = useState<string | null>(benefits[0]?.id || null);

  // Modal / Form for new Benefit
  const [isAddingBenefit, setIsAddingBenefit] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Aposentadoria');
  const [newCode, setNewCode] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newObservations, setNewObservations] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  const filteredBenefits = benefits.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(term) ||
      b.category.toLowerCase().includes(term) ||
      b.generalRequirements.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'todos' || b.category.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleCreateBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const checklistArray = newChecklistText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    addBenefit({
      name: newName.trim(),
      category: newCategory,
      code: newCode.trim() || undefined,
      generalRequirements: newRequirements.trim() || 'Conforme legislação previdenciária em vigor.',
      defaultChecklist:
        checklistArray.length > 0
          ? checklistArray
          : [
              'Documento de Identificação (RG e CPF)',
              'Comprovante de Residência Atualizado',
              'Extrato CNIS Completo',
              'Contrato de Honorários e Procuração',
            ],
      observations: newObservations.trim() || undefined,
    });

    setNewName('');
    setNewCode('');
    setNewRequirements('');
    setNewObservations('');
    setNewChecklistText('');
    setIsAddingBenefit(false);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Catálogo de Benefícios & Checklists
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Base de conhecimento com regras, carência e lista padrão de documentos exigidos pelo INSS.
          </p>
        </div>

        <button
          onClick={() => setIsAddingBenefit(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Novo Tipo de Benefício</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar benefício, requisitos ou palavras-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] focus:border-[#2D4739] rounded-lg outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739] w-full md:w-auto"
        >
          <option value="todos">Todas as Categorias</option>
          <option value="Aposentadoria">Aposentadorias</option>
          <option value="Assistencial">Assistenciais (BPC/LOAS)</option>
          <option value="Incapacidade">Incapacidade / Saúde</option>
          <option value="Pensão">Pensões / Sobrevivência</option>
          <option value="Planejamento">Planejamento Previdenciário</option>
        </select>
      </div>

      {/* Modal / Form New Benefit */}
      {isAddingBenefit && (
        <form onSubmit={handleCreateBenefit} className="bg-white p-6 rounded-2xl border border-[#D5DDD8] shadow-md space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
            <h3 className="text-sm font-bold text-[#1A2521]">Cadastrar Novo Benefício & Checklist</h3>
            <button
              type="button"
              onClick={() => setIsAddingBenefit(false)}
              className="text-gray-400 hover:text-black font-bold text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-[#1A2521]">Nome do Benefício *</label>
              <input
                type="text"
                required
                placeholder="Ex: Aposentadoria da Pessoa com Deficiência por Idade"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A2521]">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              >
                <option value="Aposentadoria">Aposentadoria</option>
                <option value="Assistencial">Assistencial (BPC/LOAS)</option>
                <option value="Incapacidade">Incapacidade</option>
                <option value="Pensão / Familiar">Pensão / Familiar</option>
                <option value="Consultoria">Consultoria / Planejamento</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-[#1A2521]">Requisitos Gerais & Critérios do INSS *</label>
              <textarea
                rows={2}
                placeholder="Idade mínima, tempo de contribuição, carência, pontuação ou regras de transição aplicáveis..."
                value={newRequirements}
                onChange={(e) => setNewRequirements(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-[#1A2521]">
                Checklist Padrão de Documentos Obrigatórios (1 por linha) *
              </label>
              <textarea
                rows={4}
                placeholder={"Documento de Identidade com foto e CPF\nComprovante de residência atualizado\nExtrato CNIS completo\nPerfil Profissiográfico Previdenciário (PPP)"}
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none focus:border-[#2D4739]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F3F4]">
            <button
              type="button"
              onClick={() => setIsAddingBenefit(false)}
              className="px-4 py-2 text-xs font-semibold text-[#6B7770]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold"
            >
              Salvar Benefício
            </button>
          </div>
        </form>
      )}

      {/* Benefits Accordion List */}
      <div className="space-y-4">
        {filteredBenefits.map((benefit) => {
          const isExpanded = expandedBenefitId === benefit.id;

          return (
            <div
              key={benefit.id}
              className="bg-white rounded-2xl border border-[#E2E6E4] shadow-xs overflow-hidden transition-all"
            >
              {/* Accordion Bar Header */}
              <div
                onClick={() => setExpandedBenefitId(isExpanded ? null : benefit.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#F9FAF9] select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] text-[#9E7B36] flex items-center justify-center font-bold border border-[#E8DCC0]">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#1A2521]">{benefit.name}</h3>
                      {benefit.code && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {benefit.code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6B7770] flex items-center gap-2 mt-0.5">
                      <span className="text-[#2D4739] font-medium">{benefit.category}</span>
                      <span>•</span>
                      <span>{benefit.defaultChecklist.length} documentos no checklist</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7770] hidden sm:inline">
                    {isExpanded ? 'Recolher detalhes' : 'Ver requisitos & checklist'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#2D4739]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8A968F]" />
                  )}
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-5 pt-2 border-t border-[#F1F3F4] space-y-5 text-xs bg-[#FBFDFB]/50 animate-in fade-in duration-150">
                  {/* Requisitos */}
                  <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4] space-y-1.5">
                    <h4 className="font-bold text-[#1A2521] flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-4 h-4 text-[#2D4739]" /> Requisitos Legais & Regras de Acesso
                    </h4>
                    <p className="text-[#4A5750] leading-relaxed">{benefit.generalRequirements}</p>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#1A2521] flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Documentação Obrigatória para este Benefício ({benefit.defaultChecklist.length} itens)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {benefit.defaultChecklist.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#E2E6E4] text-[#1A2521]"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#EBF1ED] text-[#2D4739] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium truncate">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Observações da Consultoria */}
                  {benefit.observations && (
                    <div className="p-3 rounded-xl bg-[#FAF6ED] border border-[#E8DCC0] text-[#9E7B36] space-y-1">
                      <span className="font-bold block">Dicas & Orientações Práticas do Consultor:</span>
                      <p>{benefit.observations}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredBenefits.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#D5DDD8] text-xs text-[#6B7770]">
            Nenhum tipo de benefício encontrado para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
