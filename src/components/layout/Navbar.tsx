import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  CheckCheck,
  UserPlus,
  FolderPlus,
  CalendarPlus,
  ListPlus,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ExternalLink,
  Users,
  FolderKanban,
  FileCheck2,
  Calendar,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    globalSearchQuery,
    setGlobalSearchQuery,
    clients,
    processes,
    benefits,
    tasks,
    navigateToClientDetail,
    navigateToProcessDetail,
    setCurrentView,
    setActiveModal,
    resetToDemoData,
    setIsMobileSidebarOpen,
  } = useApp();

  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const quickRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter((n) => !n.read);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search filtering
  const query = globalSearchQuery.trim().toLowerCase();
  const filteredClients = query
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.cpf.includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.whatsapp.includes(query)
      ).slice(0, 4)
    : [];

  const filteredProcesses = query
    ? processes.filter(
        (p) =>
          p.clientName.toLowerCase().includes(query) ||
          p.benefitName.toLowerCase().includes(query) ||
          p.protocolNumber.toLowerCase().includes(query) ||
          (p.judicialProcessNumber && p.judicialProcessNumber.toLowerCase().includes(query))
      ).slice(0, 4)
    : [];

  const filteredBenefits = query
    ? benefits.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          (b.code && b.code.toLowerCase().includes(query)) ||
          b.category.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const filteredTasks = query
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.clientName && t.clientName.toLowerCase().includes(query))
      ).slice(0, 3)
    : [];

  const hasSearchResults =
    filteredClients.length > 0 ||
    filteredProcesses.length > 0 ||
    filteredBenefits.length > 0 ||
    filteredTasks.length > 0;

  return (
    <header className="h-16 bg-white border-b border-[#E2E6E4] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile hamburger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 text-[#2D4739] hover:bg-[#F1F3F4] rounded-lg"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-[#6B7770]">Consultoria & Previdência</span>
          <h2 className="text-sm font-semibold text-[#1A2521]">
            Olá, <span className="text-[#2D4739]">{currentUser.name.split(' ')[0]}</span>
          </h2>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-3 lg:mx-8">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Buscar por cliente, CPF, protocolo, benefício..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-[#F8F9FA] hover:bg-[#F1F3F4] focus:bg-white text-[#1A2521] border border-[#D5DDD8] focus:border-[#2D4739] focus:ring-2 focus:ring-[#2D4739]/15 rounded-lg outline-none transition-all placeholder:text-[#8A968F]"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A968F] hover:text-[#1A2521] p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchFocused && globalSearchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-[#D5DDD8] max-h-96 overflow-y-auto z-50 p-2 text-xs">
            {hasSearchResults ? (
              <div className="space-y-3">
                {/* Clients */}
                {filteredClients.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#6B7770] uppercase flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#2D4739]" /> Clientes ({filteredClients.length})
                    </div>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          navigateToClientDetail(client.id);
                          setIsSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#F1F6F3] rounded-lg flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-[#1A2521] group-hover:text-[#2D4739]">
                            {client.name}
                          </div>
                          <div className="text-[11px] text-[#6B7770]">CPF: {client.cpf} • {client.city}/{client.state}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#EBF1ED] text-[#2D4739] font-medium">
                          {client.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Processes */}
                {filteredProcesses.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#6B7770] uppercase flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-[#C5A059]" /> Processos ({filteredProcesses.length})
                    </div>
                    {filteredProcesses.map((proc) => (
                      <button
                        key={proc.id}
                        onClick={() => {
                          navigateToProcessDetail(proc.id);
                          setIsSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#FAF6ED] rounded-lg flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-[#1A2521] group-hover:text-[#9E7B36]">
                            {proc.benefitName}
                          </div>
                          <div className="text-[11px] text-[#6B7770]">
                            Prot: {proc.protocolNumber} • Cliente: {proc.clientName}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF6ED] text-[#9E7B36] font-medium border border-[#E8DCC0]">
                          {proc.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Benefits */}
                {filteredBenefits.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#6B7770] uppercase flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#2D4739]" /> Benefícios
                    </div>
                    {filteredBenefits.map((ben) => (
                      <button
                        key={ben.id}
                        onClick={() => {
                          setCurrentView('benefits');
                          setIsSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F1F6F3] rounded-lg flex items-center justify-between group"
                      >
                        <span className="font-medium text-[#1A2521]">{ben.name}</span>
                        <span className="text-[10px] text-[#6B7770]">{ben.category}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tasks */}
                {filteredTasks.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-bold text-[#6B7770] uppercase flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#2D4739]" /> Tarefas
                    </div>
                    {filteredTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setCurrentView('tasks');
                          setIsSearchFocused(false);
                          setGlobalSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#F1F6F3] rounded-lg flex items-center justify-between group"
                      >
                        <span className="font-medium text-[#1A2521] truncate max-w-[200px]">{task.title}</span>
                        <span className="text-[10px] text-[#6B7770]">{task.priority}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-[#6B7770]">
                Nenhum resultado encontrado para "{globalSearchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick Action Button, Notifications, Demo Reset */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button Dropdown */}
        <div ref={quickRef} className="relative">
          <button
            id="quick-add-btn"
            onClick={() => setIsQuickOpen(!isQuickOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2D4739] hover:bg-[#23382D] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Novo</span>
          </button>

          {isQuickOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#D5DDD8] p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7770] border-b border-[#F1F3F4]">
                Ações Rápidas
              </div>

              <button
                onClick={() => {
                  setActiveModal('new-client');
                  setIsQuickOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1A2521] hover:bg-[#EBF1ED] hover:text-[#2D4739] font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#2D4739]" />
                + Novo Cliente
              </button>

              <button
                onClick={() => {
                  setActiveModal('new-process');
                  setIsQuickOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1A2521] hover:bg-[#EBF1ED] hover:text-[#2D4739] font-medium transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-[#C5A059]" />
                + Novo Processo
              </button>

              <button
                onClick={() => {
                  setActiveModal('new-task');
                  setIsQuickOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1A2521] hover:bg-[#EBF1ED] hover:text-[#2D4739] font-medium transition-colors"
              >
                <ListPlus className="w-4 h-4 text-[#2D4739]" />
                + Nova Tarefa
              </button>

              <button
                onClick={() => {
                  setActiveModal('new-event');
                  setIsQuickOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1A2521] hover:bg-[#EBF1ED] hover:text-[#2D4739] font-medium transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-[#2D4739]" />
                + Novo Evento
              </button>

              <div className="my-1 border-t border-[#F1F3F4]" />

              <button
                onClick={() => {
                  setActiveModal('new-receita');
                  setIsQuickOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1A2521] hover:bg-[#EBF1ED] hover:text-[#10B981] font-medium transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                + Nova Receita
              </button>

              <button
                onClick={() => {
                  setActiveModal('new-despesa');
                  setIsQuickOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#1A2521] hover:bg-[#EBF1ED] hover:text-[#EF4444] font-medium transition-colors"
              >
                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                + Nova Despesa
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-[#4A5750] hover:text-[#2D4739] hover:bg-[#F1F3F4] rounded-lg transition-colors"
            title="Notificações e Alertas"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C5A059] text-[#1E3327] font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#D5DDD8] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F4]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-[#1A2521]">Notificações</span>
                  {unreadNotifications.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FAF6ED] text-[#9E7B36] rounded">
                      {unreadNotifications.length} novas
                    </span>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#2D4739] hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3 h-3" /> Marcar lidas
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#F1F3F4] max-h-80 overflow-y-auto py-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.linkType === 'client' && n.targetId) navigateToClientDetail(n.targetId);
                      if (n.linkType === 'process' && n.targetId) navigateToProcessDetail(n.targetId);
                      if (n.linkType === 'finance') setCurrentView('financial');
                      if (n.linkType === 'agenda') setCurrentView('calendar');
                      if (n.linkType === 'task') setCurrentView('tasks');
                      setIsNotifOpen(false);
                    }}
                    className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                      !n.read ? 'bg-[#F9FAF9] font-medium' : 'hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-[#1A2521] flex items-center gap-1.5">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#8A968F] whitespace-nowrap">{n.date.split(' ')[0]}</span>
                    </div>
                    <p className="text-[11px] text-[#55635B] mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-6 text-center text-xs text-[#8A968F]">Nenhuma notificação recente.</div>
                )}
              </div>

              <div className="pt-2 border-t border-[#F1F3F4] text-center">
                <button
                  onClick={() => {
                    setCurrentView('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-[#2D4739] hover:underline inline-flex items-center gap-1"
                >
                  Ver Central de Notificações <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo reset button */}
        <button
          onClick={resetToDemoData}
          title="Restaurar dados fictícios de demonstração"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#6B7770] hover:text-[#2D4739] hover:bg-[#F1F3F4] border border-[#D5DDD8] rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Demo Data</span>
        </button>
      </div>
    </header>
  );
};
