import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  FileCheck2,
  DollarSign,
  Calendar,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
  Scale,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  History,
  Shield,
} from 'lucide-react';
import { CurrentView, useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    notifications,
    currentUser,
    users,
    switchUserRole,
    logout,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: CurrentView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'clients', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { id: 'processes', label: 'Processos', icon: <FolderKanban className="w-5 h-5" /> },
    { id: 'benefits', label: 'Benefícios', icon: <FileCheck2 className="w-5 h-5" /> },
    { id: 'documents', label: 'Documentos', icon: <FileText className="w-5 h-5" /> },
    { id: 'financial', label: 'Financeiro', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'calendar', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tarefas', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'history', label: 'Auditoria & Logs', icon: <History className="w-5 h-5" /> },
    { id: 'users', label: 'Equipe & Usuários', icon: <Shield className="w-5 h-5" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (viewId: CurrentView) => {
    setCurrentView(viewId);
    setIsMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1E3327] text-white border-r border-[#2C4837] shadow-xl select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-[#2C4837] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#9E7B36] flex items-center justify-center shadow-lg shadow-black/20 text-[#1E3327]">
          <Scale className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-wider text-white">PREVCONSULT</span>
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
          </div>
          <span className="text-[11px] font-medium tracking-wider text-[#A3B8AD] uppercase">
            Consultoria Previdenciária
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7D9688]">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const isActive =
            currentView === item.id ||
            (item.id === 'clients' && currentView === 'client-detail') ||
            (item.id === 'processes' && currentView === 'process-detail');

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#2D4E3A] text-white shadow-sm shadow-black/10 border-l-4 border-[#C5A059]'
                  : 'text-[#C5D5CC] hover:bg-[#253E30] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#C5A059]' : 'text-[#8EA89B]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#C5A059] text-[#1E3327] rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Session & Role Selector */}
      <div className="p-3 border-t border-[#2C4837] bg-[#18291F]">
        <div className="px-2 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7D9688] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#C5A059]" /> Perfil Ativo
          </span>
          <select
            value={currentUser.id}
            onChange={(e) => switchUserRole(e.target.value)}
            className="bg-[#243E2F] text-[11px] text-[#C5D5CC] border border-[#355341] rounded px-1.5 py-0.5 outline-none focus:border-[#C5A059] cursor-pointer"
            title="Alternar usuário de teste"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.roleLabel.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#22392B] border border-[#2F4C39]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-[#C5A059]/40 shrink-0"
            />
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-semibold text-white truncate" title={currentUser.name}>
                {currentUser.name}
              </span>
              <span className="text-[11px] text-[#C5A059] truncate font-medium">
                {currentUser.roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sair do sistema"
            className="p-1.5 text-[#8EA89B] hover:text-[#EF4444] hover:bg-[#2E4837] rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen shrink-0 sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
