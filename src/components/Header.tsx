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
  const { currentScreen, goBack } = useAgenda();

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

        {/* Status Badge */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] text-xs font-bold px-2.5 py-1 rounded-full border border-[#25D366]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </header>
  );
};
