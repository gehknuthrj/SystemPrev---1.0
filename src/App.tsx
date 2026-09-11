import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { ToastContainer } from './components/layout/ToastContainer';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsListView } from './components/clients/ClientsListView';
import { ClientDetailView } from './components/clients/ClientDetailView';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { ProcessesListView } from './components/processes/ProcessesListView';
import { ProcessDetailView } from './components/processes/ProcessDetailView';
import { ProcessFormModal } from './components/processes/ProcessFormModal';
import { BenefitsListView } from './components/benefits/BenefitsListView';
import { DocumentsView } from './components/documents/DocumentsView';
import { FinancialView } from './components/financial/FinancialView';
import { TasksKanbanView } from './components/tasks/TasksKanbanView';
import { CalendarView } from './components/calendar/CalendarView';
import { ActivityHistoryView } from './components/history/ActivityHistoryView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { isLoggedIn, authLoading, currentView, activeModal, setActiveModal } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1E3327] flex flex-col items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A059] flex items-center justify-center shadow-lg">
            <span className="text-xl font-serif font-black text-[#1E3327]">P</span>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-serif font-bold tracking-wide">PrevConsult</h1>
            <p className="text-xs text-[#8EA89B] mt-0.5 font-medium">Validando sessão segura...</p>
          </div>
          <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientsListView />;
      case 'client-detail':
        return <ClientDetailView />;
      case 'processes':
        return <ProcessesListView />;
      case 'process-detail':
        return <ProcessDetailView />;
      case 'benefits':
        return <BenefitsListView />;
      case 'documents':
        return <DocumentsView />;
      case 'financial':
        return <FinancialView />;
      case 'tasks':
        return <TasksKanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'history':
        return <ActivityHistoryView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] text-[#1A2521]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Breadcrumb Navigation Path */}
        <Breadcrumbs />

        {/* Scrollable View Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      <ClientFormModal
        isOpen={activeModal === 'new-client'}
        onClose={() => setActiveModal(null)}
      />
      <ProcessFormModal
        isOpen={activeModal === 'new-process'}
        onClose={() => setActiveModal(null)}
      />

      {/* Toast Feedback Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
