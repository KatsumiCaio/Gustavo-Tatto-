import React from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { ScreenName } from '../types';
import { Home, Calendar, PlusCircle, Users, Sparkles, FileText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate } = useAgenda();

  const navItems: { screen: ScreenName; label: string; icon: React.ReactNode }[] = [
    { screen: 'main', label: 'Início', icon: <Home size={20} /> },
    { screen: 'agenda', label: 'Agenda', icon: <Calendar size={20} /> },
    { screen: 'add_tatuagem', label: 'Novo', icon: <PlusCircle size={20} /> },
    { screen: 'lista_clientes', label: 'Clientes', icon: <Users size={20} /> },
    { screen: 'flashes', label: 'Flashes', icon: <Sparkles size={20} /> },
    { screen: 'anamnese', label: 'Termos', icon: <FileText size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1C1C]/95 backdrop-blur-md border-t border-[#2A2A2A] md:hidden px-1 py-1.5 safe-area-bottom shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => navigate(item.screen)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 min-w-[52px] ${
                isActive
                  ? 'text-[#FF6B35] font-bold'
                  : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#FF6B35]/15' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
