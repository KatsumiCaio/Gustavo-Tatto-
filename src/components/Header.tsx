import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { useAuth } from '../contexts/AuthContext';
import { ScreenName } from '../types';
import { ArrowLeft, Settings, Smartphone, Bell, Sun, Moon, Eye, EyeOff, LogOut, Lock, Code2 } from 'lucide-react';
import { InstallAppModal } from './InstallAppModal';
import { NotificationPromptModal } from './NotificationPromptModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const titlesMap: Record<ScreenName, string> = {
  main: 'Menu Principal',
  agenda: 'Agenda de Tatuagens',
  add_tatuagem: 'Agendar Tatuagem',
  cadastro_cliente: 'Cadastrar Cliente',
  lista_clientes: 'Histórico por Cliente',
  historico_trabalhos: 'Histórico de Trabalhos',
  settings: 'Configurações & Resumo',
  notificacoes: 'Aba de Notificações',
  faturamento: 'Faturamento Mês a Mês',
};

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { currentScreen, goBack, navigate, theme, toggleTheme, modoPrivacidade, toggleModoPrivacidade } = useAgenda();
  const { logout, currentUser } = useAuth();

  const displayTitle = title || titlesMap[currentScreen] || 'Gustavo Tattoo';

  return (
    <header 
      className="sticky top-0 z-30 bg-[#1C1C1C]/95 backdrop-blur border-b border-[#2A2A2A] px-4 pb-3 sm:px-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentScreen !== 'main' ? (
            <button
              onClick={goBack}
              className="p-2 rounded-lg bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#3A3A3A] hover:text-[#FF6B35] transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] text-white font-black text-base flex items-center justify-center shadow-md shadow-[#FF6B35]/20 border border-[#FF6B35]/30 shrink-0">
              GT
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-[#F5F5F5] leading-tight truncate">
                {displayTitle}
              </h1>
            </div>
            {subtitle ? (
              <p className="text-xs text-[#999999] truncate">{subtitle}</p>
            ) : (
              <p className="text-xs text-[#999999] font-medium hidden sm:block truncate">
                Gustavo Tattoo Studio • Agenda Profissional
              </p>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Privacy Toggle Button */}
          <button
            onClick={toggleModoPrivacidade}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer ${
              modoPrivacidade
                ? 'bg-[#E63946]/15 border-[#E63946]/50 text-[#E63946] hover:bg-[#E63946]/25'
                : 'bg-[#2A2A2A] border-[#3A3A3A] text-[#999999] hover:bg-[#3A3A3A] hover:text-[#F5F5F5]'
            }`}
            title={modoPrivacidade ? 'Modo Privativo Ativo (Valores e dados ocultos). Clique para exibir.' : 'Ocultar valores e dados sigilosos'}
            aria-label="Alternar modo privacidade"
          >
            {modoPrivacidade ? (
              <>
                <EyeOff size={18} className="text-[#E63946]" />
                <span className="hidden sm:inline text-[#E63946] font-bold">Privado</span>
              </>
            ) : (
              <>
                <Eye size={18} className="text-[#999999]" />
                <span className="hidden sm:inline">Visível</span>
              </>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#2A2A2A] text-[#FFB703] hover:bg-[#3A3A3A] border border-[#3A3A3A] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={18} className="text-[#FFB703]" /> : <Moon size={18} className="text-[#6366F1]" />}
            <span className="hidden sm:inline text-[#F5F5F5]">
              {theme === 'dark' ? 'Claro' : 'Escuro'}
            </span>
          </button>

          {/* Quick Lock / Logout */}
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-[#2A2A2A] hover:bg-[#E63946]/20 border border-[#3A3A3A] hover:border-[#E63946]/50 text-[#888888] hover:text-[#FF6B6B] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
            title="Bloquear aplicativo (Sair da sessão)"
            aria-label="Bloquear aplicativo"
          >
            <Lock size={17} />
            <span className="hidden md:inline">Bloquear</span>
          </button>

          {/* Dev Badge if logged in as Caio */}
          {currentUser?.isDev && (
            <button
              onClick={() => navigate('settings')}
              className="inline-flex items-center gap-1.5 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#C4B5FD] text-xs font-bold px-2.5 py-1.5 rounded-full border border-[#8B5CF6]/40 transition-colors cursor-pointer"
              title="Logado como Desenvolvedor (Caio). Clique para abrir o Painel Admin."
            >
              <Code2 size={13} className="text-[#A78BFA]" />
              <span className="hidden sm:inline">Dev:</span>
              <span>Caio</span>
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] text-xs font-bold px-2.5 py-1.5 rounded-full border border-[#25D366]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </header>
  );
};
