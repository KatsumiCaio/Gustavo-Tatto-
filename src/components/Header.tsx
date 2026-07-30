import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { ScreenName } from '../types';
import { ArrowLeft, Settings, Smartphone, Bell } from 'lucide-react';
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
};

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { currentScreen, unreadNotificacoesCount, permissaoNotificacaoState, navigate, goBack } = useAgenda();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNotifPromptOpen, setIsNotifPromptOpen] = useState(false);

  const displayTitle = title || titlesMap[currentScreen] || 'Gustavo Tattoo';

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#1C1C1C]/95 backdrop-blur border-b border-[#2A2A2A] px-4 py-3 sm:px-6">
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
              <img
                src="/pwa-192.svg"
                alt="Gustavo Tattoo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover shadow-md shadow-[#FF6B35]/20 border border-[#3A3A3A] bg-[#141414]"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-[#F5F5F5] leading-tight truncate">
                  {displayTitle}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#25D366]/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  Salvo
                </span>
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

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            {/* Bell Notifications Button */}
            <button
              onClick={() => {
                if (permissaoNotificacaoState !== 'granted') {
                  setIsNotifPromptOpen(true);
                } else {
                  navigate('notificacoes');
                }
              }}
              className={`p-2.5 rounded-lg border transition-all relative ${
                currentScreen === 'notificacoes'
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                  : permissaoNotificacaoState !== 'granted'
                  ? 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40 hover:bg-[#FFB703]/30'
                  : 'bg-[#2A2A2A] text-[#999999] border-transparent hover:text-[#FF6B35] hover:bg-[#3A3A3A]'
              }`}
              title={permissaoNotificacaoState !== 'granted' ? 'Ativar Notificações no Celular' : 'Aba de Notificações'}
            >
              <Bell size={20} />
              {unreadNotificacoesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {unreadNotificacoesCount > 9 ? '9+' : unreadNotificacoesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 hover:bg-[#FF6B35] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Instalar aplicativo no iPhone ou Celular"
            >
              <Smartphone size={16} />
              <span className="hidden sm:inline">Baixar App / iPhone</span>
            </button>

            {currentScreen !== 'main' && (
              <button
                onClick={() => navigate('main')}
                className="p-2 rounded-lg bg-[#2A2A2A] text-[#999999] hover:text-white hover:bg-[#3A3A3A] transition-colors text-xs font-semibold hidden sm:flex items-center gap-1.5"
              >
                Menu
              </button>
            )}

            {currentScreen !== 'settings' && (
              <button
                onClick={() => navigate('settings')}
                className="p-2.5 rounded-lg bg-[#2A2A2A] text-[#999999] hover:text-[#FF6B35] hover:bg-[#3A3A3A] transition-colors"
                title="Configurações e Resumo"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <NotificationPromptModal
        isOpen={isNotifPromptOpen}
        onClose={() => setIsNotifPromptOpen(false)}
      />
    </>
  );
};
