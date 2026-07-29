import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { ScreenName } from '../types';
import { ArrowLeft, Settings, Smartphone } from 'lucide-react';
import { InstallAppModal } from './InstallAppModal';

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
};

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { currentScreen, navigate, goBack } = useAgenda();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E63946] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#FF6B35]/20">
                GT
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#F5F5F5] leading-tight">
                  {displayTitle}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#25D366]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  Salvo
                </span>
              </div>
              {subtitle ? (
                <p className="text-xs text-[#999999]">{subtitle}</p>
              ) : (
                <p className="text-xs text-[#999999] font-medium hidden sm:block">
                  Gustavo Tattoo Studio • Agenda Profissional
                </p>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
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
    </>
  );
};
