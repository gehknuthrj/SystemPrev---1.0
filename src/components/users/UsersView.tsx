import React, { useState } from 'react';
import {
  Users,
  Shield,
  Plus,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';

export const UsersView: React.FC = () => {
  const { users, currentUser, switchUserRole } = useApp();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('lawyer');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    alert(`Usuário "${userName}" adicionado com sucesso à equipe.`);
    setUserName('');
    setUserEmail('');
    setIsAddingUser(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
      case 'Administrador':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'lawyer':
      case 'Consultor':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'financial':
      case 'Financeiro':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'assistant':
      case 'Assistente':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Usuários & Permissões de Acesso
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Gerencie sua equipe, níveis de acesso (Admin, Consultor, Assistente, Financeiro) e credenciais.
          </p>
        </div>

        <button
          onClick={() => setIsAddingUser(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Novo Usuário</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            role: 'Administrador',
            desc: 'Acesso total a relatórios, financeiro, clientes, processos e configurações do escritório.',
            color: 'border-purple-200 bg-purple-50/40',
          },
          {
            role: 'Consultor Previdenciário',
            desc: 'Acesso completo a clientes, processos, checklists, agenda de perícias e tarefas.',
            color: 'border-emerald-200 bg-emerald-50/40',
          },
          {
            role: 'Assistente Previdenciário',
            desc: 'Cadastro inicial, triagem documental, checklists e agendamento de atendimentos.',
            color: 'border-blue-200 bg-blue-50/40',
          },
          {
            role: 'Financeiro',
            desc: 'Controle exclusivo de honorários, fluxo de caixa, pagamentos e cobranças.',
            color: 'border-teal-200 bg-teal-50/40',
          },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${item.color} space-y-1 text-xs`}>
            <div className="font-bold text-[#1A2521] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#2D4739]" /> {item.role}
            </div>
            <p className="text-[#55635B]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D5DDD8] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-bold text-[#1A2521]">Convidar Novo Membro da Equipe</h3>
              <button onClick={() => setIsAddingUser(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="font-semibold text-[#1A2521]">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Costa"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="mariana@prevconsult.com.br"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Perfil / Nível de Acesso *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Consultor">Consultor Previdenciário</option>
                  <option value="Assistente">Assistente</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F4]">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7770]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold"
                >
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#E2E6E4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[11px] font-semibold border-b border-[#E2E6E4]">
              <tr>
                <th className="py-3.5 px-4">Nome & Contato</th>
                <th className="py-3.5 px-4">Perfil de Acesso</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Último Acesso</th>
                <th className="py-3.5 px-4 text-right">Simular Sessão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F4]">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-[#F9FAF9] transition-colors">
                    {/* Nome & Contato */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2D4739] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1A2521] flex items-center gap-2">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF6ED] text-[#9E7B36] border border-[#E8DCC0]">
                                Você está aqui
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#6B7770] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-[#8A968F]" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Perfil */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    </td>

                    {/* Último Acesso */}
                    <td className="py-3.5 px-4 text-xs text-[#6B7770]">
                      Hoje, às 14:15
                    </td>

                    {/* Ação: Alternar Usuário */}
                    <td className="py-3.5 px-4 text-right">
                      {!isCurrent ? (
                        <button
                          onClick={() => switchUserRole(u.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5DDD8] hover:bg-[#F1F6F3] text-xs font-medium text-[#2D4739] transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Mudar para este</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#2D4739]">Sessão Ativa</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
