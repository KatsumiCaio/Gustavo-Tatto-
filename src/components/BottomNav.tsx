import React from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { ScreenName } from '../types';
import { Home, Calendar, PlusCircle, Users, Bell, Settings, DollarSign } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, unreadNotificacoesCount, navigate } = useAgenda();

  const navItems: { screen: ScreenName; label: string; icon: React.ReactNode; badge?: number }[] = [
    { screen: 'main', label: 'Início', icon: <Home size={20} /> },
    { screen: 'agenda', label: 'Agenda', icon: <Calendar size={20} /> },
    { screen: 'add_tatuagem', label: 'Novo', icon: <PlusCircle size={20} /> },
    { screen: 'faturamento', label: 'Caixa', icon: <DollarSign size={20} /> },
    { screen: 'lista_clientes', label: 'Clientes', icon: <Users size={20} /> },
    { screen: 'notificacoes', label: 'Alertas', icon: <Bell size={20} />, badge: unreadNotificacoesCount },
    { screen: 'settings', label: 'Ajustes', icon: <Settings size={20} /> },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1C1C]/95 backdrop-blur-md border-t border-[#2A2A2A] px-2 pt-2 shadow-2xl"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
    >
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => navigate(item.screen)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 min-w-[48px] sm:min-w-[64px] relative ${
                isActive
                  ? 'text-[#FF6B35] font-bold'
                  : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors relative ${
                  isActive ? 'bg-[#FF6B35]/15' : ''
                }`}
              >
                {item.icon}
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
