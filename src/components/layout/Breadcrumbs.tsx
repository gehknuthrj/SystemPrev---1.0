import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Breadcrumbs: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedClientId,
    selectedProcessId,
    clients,
    processes,
    financialSubmenu,
  } = useApp();

  const selectedClient = selectedClientId ? clients.find((c) => c.id === selectedClientId) : null;
  const selectedProcess = selectedProcessId ? processes.find((p) => p.id === selectedProcessId) : null;

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    clients: 'Clientes',
    'client-detail': 'Dossiê do Cliente',
    processes: 'Processos Previdenciários',
    'process-detail': 'Processo Previdenciário',
    benefits: 'Tipos de Benefícios & Checklists',
    documents: 'Repositório de Documentos',
    financial: 'Módulo Financeiro',
    calendar: 'Agenda de Compromissos & Perícias',
    tasks: 'Quadro Kanban de Tarefas',
    reports: 'Relatórios & Exportações',
    notifications: 'Central de Notificações',
    settings: 'Configurações do Sistema',
  };

  const handleBack = () => {
    if (currentView === 'client-detail') {
      setCurrentView('clients');
    } else if (currentView === 'process-detail') {
      setCurrentView('processes');
    } else {
      setCurrentView('dashboard');
    }
  };

  const isDetailView = currentView === 'client-detail' || currentView === 'process-detail';

  return (
    <div className="flex items-center justify-between py-3 px-4 lg:px-8 bg-white border-b border-[#E8ECE9] text-xs text-[#6B7770]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="hover:text-[#2D4739] flex items-center gap-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Início</span>
        </button>

        <ChevronRight className="w-3 h-3 text-[#A3B0A8]" />

        {currentView === 'client-detail' ? (
          <>
            <button
              onClick={() => setCurrentView('clients')}
              className="hover:text-[#2D4739] transition-colors"
            >
              Clientes
            </button>
            <ChevronRight className="w-3 h-3 text-[#A3B0A8]" />
            <span className="font-semibold text-[#1A2521] truncate max-w-[200px]">
              {selectedClient ? selectedClient.name : 'Detalhes'}
            </span>
          </>
        ) : currentView === 'process-detail' ? (
          <>
            <button
              onClick={() => setCurrentView('processes')}
              className="hover:text-[#2D4739] transition-colors"
            >
              Processos
            </button>
            <ChevronRight className="w-3 h-3 text-[#A3B0A8]" />
            <span className="font-semibold text-[#1A2521] truncate max-w-[220px]">
              {selectedProcess
                ? `${selectedProcess.benefitName} (${selectedProcess.clientName})`
                : 'Detalhes'}
            </span>
          </>
        ) : (
          <span className="font-semibold text-[#1A2521]">
            {viewTitles[currentView] || 'Painel'}
          </span>
        )}

        {currentView === 'financial' && financialSubmenu !== 'dashboard' && (
          <>
            <ChevronRight className="w-3 h-3 text-[#A3B0A8]" />
            <span className="capitalize font-medium text-[#2D4739]">
              {financialSubmenu}
            </span>
          </>
        )}
      </div>

      {isDetailView && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F1F4F2] hover:bg-[#E2E8E4] text-[#2D4739] font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </button>
      )}
    </div>
  );
};
