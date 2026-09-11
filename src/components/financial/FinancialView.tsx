import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  Tag,
  BarChart3,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinancialStatus, FinancialTransactionType, FinancialTransaction } from '../../types';

export const FinancialView: React.FC = () => {
  const {
    transactions,
    clients,
    processes,
    financialSubmenu,
    setFinancialSubmenu,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    navigateToClientDetail,
    setActiveModal,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  // New Transaction Form
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [txType, setTxType] = useState<FinancialTransactionType>('receita');
  const [txDesc, setTxDesc] = useState('');
  const [txClientId, setTxClientId] = useState('');
  const [txCategory, setTxCategory] = useState('Honorários');
  const [txAmount, setTxAmount] = useState<number>(1500);
  const [txDueDate, setTxDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [txPaymentMethod, setTxPaymentMethod] = useState('Pix');
  const [txNotes, setTxNotes] = useState('');

  // Calculations
  const totalReceivablesPending = transactions
    .filter((t) => t.type === 'receita' && t.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPayablesPending = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'receita' && t.status === 'Recebido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPaid = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'Pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalReceived - totalPaid;

  // Filter list
  const filteredTransactions = transactions.filter((t) => {
    // Tab filter
    if (financialSubmenu === 'receitas' && t.type !== 'receita') return false;
    if (financialSubmenu === 'despesas' && t.type !== 'despesa') return false;
    if (financialSubmenu === 'receber' && (t.type !== 'receita' || t.status !== 'Pendente')) return false;
    if (financialSubmenu === 'pagar' && (t.type !== 'despesa' || t.status !== 'Pendente')) return false;

    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.description.toLowerCase().includes(term) ||
      (t.clientName && t.clientName.toLowerCase().includes(term)) ||
      t.category.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'todos' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'todos' || t.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || !txAmount) return;

    addTransaction({
      type: txType,
      description: txDesc.trim(),
      clientId: txType === 'receita' && txClientId ? txClientId : undefined,
      category: txCategory,
      amount: Number(txAmount),
      dueDate: txDueDate,
      paymentMethod: txPaymentMethod,
      status: 'Pendente',
      notes: txNotes.trim() || undefined,
    });

    setTxDesc('');
    setTxNotes('');
    setIsAddingTx(false);
  };

  const handleExportCSV = () => {
    const headers = 'Tipo,Descrição,Cliente,Categoria,Valor,Vencimento,Status\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.type}","${t.description}","${t.clientName || ''}","${t.category}","${t.amount}","${t.dueDate}","${t.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_financeiro_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Controle Financeiro Previdenciário
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Gestão de honorários contratuais, no êxito, despesas operacionais e fluxo de caixa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-xl text-xs font-semibold transition-colors"
            title="Exportar dados filtrados em CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#2D4739]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setTxType('receita');
              setIsAddingTx(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Receita</span>
          </button>

          <button
            onClick={() => {
              setTxType('despesa');
              setIsAddingTx(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* Submenu Navigation (Requirement 17) */}
      <div className="border-b border-[#E2E6E4] flex items-center gap-1 overflow-x-auto text-xs sm:text-sm font-medium">
        {[
          { id: 'dashboard', label: 'Visão Geral' },
          { id: 'receitas', label: 'Receitas / Honorários' },
          { id: 'despesas', label: 'Despesas' },
          { id: 'receber', label: 'Contas a Receber' },
          { id: 'pagar', label: 'Contas a Pagar' },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setFinancialSubmenu(sub.id as any)}
            className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
              financialSubmenu === sub.id
                ? 'border-[#2D4739] text-[#2D4739] font-bold bg-[#F1F6F3]/50'
                : 'border-transparent text-[#6B7770] hover:text-[#1A2521]'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* 5 Financial Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Recebido */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs">
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Receitas Realizadas
          </span>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-1">
            R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#6B7770] mt-0.5">Honorários pagos</div>
        </div>

        {/* Despesas Pagas */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs">
          <span className="text-xs text-red-600 font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Despesas Pagas
          </span>
          <div className="text-lg sm:text-xl font-bold text-red-600 mt-1">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#6B7770] mt-0.5">Custos e operações</div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs">
          <span className="text-xs text-[#2D4739] font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Saldo em Caixa
          </span>
          <div
            className={`text-lg sm:text-xl font-bold mt-1 ${
              netBalance >= 0 ? 'text-[#2D4739]' : 'text-red-600'
            }`}
          >
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#6B7770] mt-0.5">Receitas - Despesas</div>
        </div>

        {/* Contas a Receber */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs">
          <span className="text-xs text-[#C5A059] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> A Receber (Previsto)
          </span>
          <div className="text-lg sm:text-xl font-bold text-[#9E7B36] mt-1">
            R$ {totalReceivablesPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#6B7770] mt-0.5">Honorários pendentes</div>
        </div>

        {/* Contas a Pagar */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs">
          <span className="text-xs text-orange-700 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> A Pagar Pendente
          </span>
          <div className="text-lg sm:text-xl font-bold text-orange-700 mt-1">
            R$ {totalPayablesPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#6B7770] mt-0.5">Compromissos a liquidar</div>
        </div>
      </div>

      {/* New Transaction Form Modal */}
      {isAddingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D5DDD8] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-bold text-[#1A2521]">
                {txType === 'receita' ? 'Lançar Receita / Honorários' : 'Lançar Despesa'}
              </h3>
              <button onClick={() => setIsAddingTx(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('receita')}
                  className={`py-2 rounded-lg font-bold text-center border ${
                    txType === 'receita'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  Receita / Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('despesa')}
                  className={`py-2 rounded-lg font-bold text-center border ${
                    txType === 'despesa'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  Despesa / Saída
                </button>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honorários contratuais - Aposentadoria Especial"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              {txType === 'receita' && (
                <div>
                  <label className="font-semibold text-[#1A2521]">Cliente Vinculado</label>
                  <select
                    value={txClientId}
                    onChange={(e) => setTxClientId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  >
                    <option value="">Nenhum (Lançamento avulso)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} (CPF: {c.cpf})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A2521]">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={txDueDate}
                    onChange={(e) => setTxDueDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A2521]">Categoria</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  >
                    {txType === 'receita' ? (
                      <>
                        <option value="Honorários">Honorários</option>
                        <option value="Consulta Inicial">Consulta Inicial</option>
                        <option value="Planejamento Previdenciário">Planejamento Previdenciário</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Sistemas & Software">Sistemas & Software</option>
                        <option value="Cartório & Certidões">Cartório & Certidões</option>
                        <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
                        <option value="Marketing & Anúncios">Marketing & Anúncios</option>
                        <option value="Contabilidade & Impostos">Contabilidade & Impostos</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Forma de Pagamento</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                    <option value="Retenção RPV / Precatório">Retenção RPV / Precatório</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Observações</label>
                <input
                  type="text"
                  placeholder="Informações adicionais sobre o pagamento..."
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F4]">
                <button
                  type="button"
                  onClick={() => setIsAddingTx(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7770]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição, cliente ou categoria..."
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
          <option value="Honorários">Honorários</option>
          <option value="Consulta Inicial">Consulta Inicial</option>
          <option value="Sistemas & Software">Sistemas & Software</option>
          <option value="Cartório & Certidões">Cartório & Certidões</option>
          <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739] w-full md:w-auto"
        >
          <option value="todos">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Recebido">Recebido</option>
          <option value="Pago">Pago</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-[#E2E6E4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[11px] font-semibold border-b border-[#E2E6E4]">
              <tr>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Descrição</th>
                <th className="py-3.5 px-4">Cliente / Processo</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Vencimento</th>
                <th className="py-3.5 px-4">Valor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F4]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F9FAF9] transition-colors">
                  {/* Tipo */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tx.type === 'receita'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.type === 'receita' ? (
                        <>
                          <TrendingUp className="w-3 h-3" /> Receita
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3" /> Despesa
                        </>
                      )}
                    </span>
                  </td>

                  {/* Descrição */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1A2521]">{tx.description}</div>
                    <div className="text-[11px] text-[#6B7770]">Meio: {tx.paymentMethod}</div>
                  </td>

                  {/* Cliente */}
                  <td className="py-3.5 px-4">
                    {tx.clientId ? (
                      <button
                        onClick={() => navigateToClientDetail(tx.clientId!)}
                        className="font-medium text-[#2D4739] hover:underline text-left block"
                      >
                        {tx.clientName}
                      </button>
                    ) : (
                      <span className="text-[#8A968F]">-</span>
                    )}
                    {tx.processProtocol && (
                      <span className="text-[10px] text-[#6B7770]">Prot: {tx.processProtocol}</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-4 text-[#6B7770]">{tx.category}</td>

                  {/* Vencimento */}
                  <td className="py-3.5 px-4 text-[#6B7770] whitespace-nowrap">
                    {tx.dueDate}
                  </td>

                  {/* Valor */}
                  <td className="py-3.5 px-4 font-bold">
                    <span className={tx.type === 'receita' ? 'text-emerald-700' : 'text-red-700'}>
                      R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleTransactionStatus(tx.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        tx.status === 'Recebido' || tx.status === 'Pago'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Clique para alternar status"
                    >
                      {tx.status}
                    </button>
                  </td>

                  {/* Ação */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm('Excluir este lançamento financeiro?')) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 text-[#8A968F] hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6B7770]">
                    Nenhum lançamento financeiro encontrado para os critérios selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
