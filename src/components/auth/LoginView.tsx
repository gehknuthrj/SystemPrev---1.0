import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const {
    users,
    login,
    register,
    resetPassword,
    isSupabaseConfigured,
    showToast,
  } = useApp();

  const [email, setEmail] = useState('gehknuth@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Register & Forgot Password Views
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('(11) 98765-4321');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('lawyer');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAuthError(null);
    setIsLoading(true);

    try {
      const success = await login(email.trim(), password);
      if (!success) {
        setAuthError('Não foi possível autenticar. Verifique seu e-mail e senha ou use os botões de demonstração abaixo.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) return;

    if (regPassword.length < 6) {
      setAuthError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const success = await register(
        regName.trim(),
        regEmail.trim(),
        regPhone.trim(),
        regPassword,
        regRole
      );

      if (success) {
        setRegName('');
        setRegEmail('');
        setRegPassword('');
      } else {
        setAuthError('Falha ao registrar conta. Verifique se o e-mail já não está cadastrado.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await resetPassword(forgotEmail.trim());
      if (res.success) {
        setForgotSent(true);
        showToast(res.message, 'success');
      } else {
        setAuthError(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (u: User) => {
    setEmail(u.email);
    setPassword('123456');
    setIsLoading(true);
    try {
      await login(u.email, '123456');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* PrevConsult Monogram / Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3327] to-[#14231A] text-[#C5A059] flex items-center justify-center mx-auto shadow-lg border border-[#C5A059]/40 mb-3.5">
          <Scale className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1A2521]">
          PrevConsult
        </h1>
        <p className="text-xs text-[#6B7770] mt-1 font-medium">
          Sistema de Gestão & CRM Previdenciário Especializado
        </p>

        {/* Supabase Status Pill */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-[#D5DDD8] shadow-2xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[#3A4740]">
            {isSupabaseConfigured
              ? 'Supabase Auth & PostgreSQL Conectado'
              : 'Modo Local / Demonstração Ativo'}
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-9 rounded-2xl border border-[#E2E6E4] shadow-sm space-y-6">
          {/* Error Banner */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <p className="flex-1 leading-relaxed">{authError}</p>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#F1F6F3] text-[#2D4739] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#1A2521]">Recuperação de Senha</h3>
                <p className="text-[#6B7770] text-[11px]">
                  Informe seu e-mail corporativo cadastrado para receber o link de redefinição de acesso.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-emerald-800 font-medium text-xs">
                    Link de redefinição enviado com sucesso!
                  </p>
                  <p className="text-emerald-700 text-[11px]">
                    Verifique sua caixa de entrada e spam. Em seguida, retorne ao login.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setMode('login');
                    }}
                    className="mt-2 text-xs font-bold text-[#1E3327] hover:underline"
                  >
                    Voltar ao Login
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-semibold text-[#1A2521]">E-mail Cadastrado</label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu.email@prevconsult.com.br"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs text-[#1A2521]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E3327] hover:bg-[#14231A] disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                        <span>Enviando link...</span>
                      </>
                    ) : (
                      <span>Enviar Link de Recuperação</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="inline-flex items-center gap-1 text-xs text-[#2D4739] hover:underline font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para tela de login</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : mode === 'register' ? (
            /* MODE: REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#E2E6E4]">
                <h3 className="font-bold text-sm text-[#1A2521]">Cadastro de Novo Profissional</h3>
                <span className="text-[10px] text-[#C5A059] font-semibold uppercase tracking-wider">
                  Supabase Auth
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Costa Albuquerque"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A2521]">E-mail Corporativo</label>
                  <div className="relative mt-1">
                    <Mail className="w-3.5 h-3.5 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="mariana@prevconsult.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Telefone / WhatsApp</label>
                  <div className="relative mt-1">
                    <Phone className="w-3.5 h-3.5 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Função / Nível de Acesso</label>
                <div className="relative mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs appearance-none cursor-pointer"
                  >
                    <option value="lawyer">Advogado(a) Especialista em RGPS</option>
                    <option value="admin">Sócia / Advogada Previdenciarista (Admin)</option>
                    <option value="assistant">Assistente Previdenciária</option>
                    <option value="financial">Gestor Financeiro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Crie uma Senha Forte</label>
                <div className="relative mt-1">
                  <Lock className="w-3.5 h-3.5 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-8 pr-9 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A968F] hover:text-[#1A2521]"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E3327] hover:bg-[#14231A] disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                    <span>Criando conta no Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Cadastrar e Acessar Escritório</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-[#2D4739] hover:underline font-medium"
                >
                  Já possui conta cadastrada? Fazer login
                </button>
              </div>
            </form>
          ) : (
            /* MODE: LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#1A2521]">E-mail Corporativo</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@prevconsult.com.br"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs text-[#1A2521]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#1A2521]">Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setMode('forgot');
                    }}
                    className="text-[11px] text-[#2D4739] hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-[#F8F9FA] border border-[#D5DDD8] rounded-xl outline-none focus:border-[#2D4739] text-xs text-[#1A2521]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A968F] hover:text-[#1A2521]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E3327] hover:bg-[#14231A] disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                    <span>Autenticando sessão...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Painel Previdenciário</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-[#2D4739] hover:underline font-medium"
                >
                  Novo profissional no escritório? Criar conta
                </button>
              </div>
            </form>
          )}

          {/* Quick 1-Click Access for Administrator */}
          <div className="pt-4 border-t border-[#E2E6E4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6B7770] uppercase tracking-wider">
                Acesso do Administrador
              </span>
              <span className="text-[10px] text-[#C5A059] font-medium">1-Clique</span>
            </div>

            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemo(u)}
                  className="w-full p-2.5 rounded-xl border border-[#C5A059]/40 hover:border-[#2D4739] bg-[#FAFBFB] hover:bg-[#F1F6F3] text-left transition-colors flex items-center justify-between group disabled:opacity-50 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#2D4739] text-[#C5A059] flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#1A2521] group-hover:text-[#2D4739] block truncate">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-[#6B7770] block truncate">
                        {u.email}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#C5A059] font-bold px-2 py-0.5 bg-[#C5A059]/10 rounded-md shrink-0 ml-2">
                    {u.roleLabel || 'Administrador'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
