import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound, AlertCircle, Clock, ShieldAlert, Code2, UserCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, logoutReason, getLockoutSeconds } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutTimer, setLockoutTimer] = useState<number>(() => getLockoutSeconds());
  const [showSupportHelp, setShowSupportHelp] = useState(false);

  // Monitor lockout countdown
  useEffect(() => {
    const initialSec = getLockoutSeconds();
    setLockoutTimer(initialSec);

    if (initialSec <= 0) return;

    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [getLockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, digite seu usuário e senha.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username, password, rememberMe);
      if (!result.success) {
        setErrorMessage(result.error || 'Credenciais inválidas.');
        const remainingLockout = getLockoutSeconds();
        if (remainingLockout > 0) {
          setLockoutTimer(remainingLockout);
        }
      }
    } catch (err) {
      setErrorMessage('Erro ao autenticar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-8 selection:bg-[#FF6B35] selection:text-white relative overflow-hidden">
      {/* Subtle ambient lighting effect */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-10 right-1/4 w-72 h-72 bg-[#FFB703]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Studio Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#D9481E] text-white shadow-xl shadow-[#FF6B35]/25 border border-[#FF6B35]/40 mb-1">
            <span className="text-2xl font-black tracking-tight">GT</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
              Gustavo Tattoo
            </h1>
            <p className="text-xs sm:text-sm text-[#999999] mt-1 font-medium">
              Agenda & Gestão Profissional do Estúdio
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#252525] border border-[#3A3A3A] text-[11px] font-semibold text-[#4CAF50]">
            <ShieldCheck size={13} className="text-[#4CAF50]" />
            <span>Ambiente Protegido contra Vazamento de Dados</span>
          </div>
        </div>

        {/* Inactivity Logout Notice */}
        {logoutReason && (
          <div 
            role="status" 
            className="p-3.5 rounded-2xl bg-[#FFB703]/10 border border-[#FFB703]/30 text-[#FFB703] text-xs font-semibold flex items-start gap-2.5 animate-fadeIn"
          >
            <Clock size={17} className="shrink-0 mt-0.5 text-[#FFB703]" />
            <div>
              <p className="font-bold">Bloqueio Automático Ativo</p>
              <p className="text-[11px] opacity-90 mt-0.5">{logoutReason}</p>
            </div>
          </div>
        )}

        {/* Lockout Notice */}
        {lockoutTimer > 0 && (
          <div 
            role="alert" 
            className="p-4 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/50 text-[#FF6B6B] text-xs font-semibold flex items-start gap-3 animate-fadeIn"
          >
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-[#E63946]" />
            <div>
              <p className="font-bold text-sm">Acesso Temporariamente Bloqueado</p>
              <p className="text-xs text-[#FFC4C4] mt-0.5">
                Muitas tentativas falhas. Por segurança dos dados, aguarde <span className="font-black text-white underline">{lockoutTimer}s</span> antes de tentar novamente.
              </p>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-[#222222] border border-[#333333] p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5">
          <div className="border-b border-[#333333] pb-3">
            <h2 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <Lock size={16} className="text-[#FF6B35]" />
              Entrar no Sistema
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Autenticação obrigatória para acessar dados confidenciais de clientes e finanças
            </p>
          </div>

          {errorMessage && lockoutTimer <= 0 && (
            <div 
              role="alert" 
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/40 text-[#FF6B6B] text-xs font-medium animate-fadeIn"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#E63946]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-username" 
                className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider"
              >
                Usuário do Estúdio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777777]">
                  <User size={16} />
                </div>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário ou login"
                  disabled={lockoutTimer > 0}
                  className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-[#333333] rounded-xl text-sm text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider"
                >
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777777]">
                  <KeyRound size={16} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={lockoutTimer > 0}
                  className="w-full pl-10 pr-11 py-3 bg-[#181818] border border-[#333333] rounded-xl text-sm text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777777] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#AAAAAA] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#181818] border-[#444444] text-[#FF6B35] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#FF6B35]"
                />
                <span>Lembrar sessão neste navegador</span>
              </label>

              <button
                type="button"
                onClick={() => setShowSupportHelp(!showSupportHelp)}
                className="text-xs text-[#888888] hover:text-[#FF6B35] underline cursor-pointer transition-colors"
              >
                Precisa de ajuda?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutTimer > 0}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#FA5D24] hover:to-[#D9481E] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/20 hover:shadow-xl hover:shadow-[#FF6B35]/30 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando credenciais...</span>
                </>
              ) : lockoutTimer > 0 ? (
                <>
                  <Clock size={16} />
                  <span>Bloqueado ({lockoutTimer}s)</span>
                </>
              ) : (
                <>
                  <span>Entrar com Segurança</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Discreet Help / Security Policy Modal or Collapsible */}
          {showSupportHelp && (
            <div className="pt-4 border-t border-[#333333] space-y-3 text-xs text-[#999999] animate-fadeIn">
              <div>
                <p className="font-bold text-[#F5F5F5] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#4CAF50]" />
                  Acesso Autorizado ao Estúdio
                </p>
                <p className="text-[11px] text-[#888888] mt-1">
                  Selecione seu perfil abaixo para preencher automaticamente ou digite suas credenciais:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('Caio');
                    setPassword('310319');
                    setErrorMessage('');
                  }}
                  className="p-2.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-left transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-black text-[#C4B5FD] flex items-center gap-1.5 group-hover:text-white">
                    <Code2 size={13} className="text-[#A78BFA]" />
                    Caio (Desenvolvedor)
                  </span>
                  <span className="text-[10px] text-[#A699CC] block mt-0.5">
                    Admin Master • Acesso técnico
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsername('Gustavo');
                    setPassword('1234');
                    setErrorMessage('');
                  }}
                  className="p-2.5 rounded-xl bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 text-left transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-black text-[#FF9E79] flex items-center gap-1.5 group-hover:text-white">
                    <UserCheck size={13} className="text-[#FF6B35]" />
                    Gustavo (Tatuador)
                  </span>
                  <span className="text-[10px] text-[#B38F80] block mt-0.5">
                    Agenda & Atendimentos
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-[#777777]">
                Se você esqueceu sua credencial, o Desenvolvedor Caio possui permissão para redefinir qualquer senha no painel de administração.
              </p>
            </div>
          )}
        </div>

        {/* Security badge footer */}
        <div className="text-center space-y-1 text-[11px] text-[#777777]">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-[#4CAF50]" />
            <span>Proteção contra invasões, ataques de força bruta e vazamentos de dados</span>
          </p>
          <p>© {new Date().getFullYear()} Gustavo Tattoo Studio • Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};
