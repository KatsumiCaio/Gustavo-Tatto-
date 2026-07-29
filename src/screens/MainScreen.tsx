import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Calendar, UserPlus, PlusCircle, History, DollarSign, Users, Clock, Sparkles, Smartphone, Apple, Bell, ShieldCheck } from 'lucide-react';
import { InstallAppModal } from '../components/InstallAppModal';
import { NotificationPromptModal } from '../components/NotificationPromptModal';

export const MainScreen: React.FC = () => {
  const { navigate, tatuagens, clientes, unreadNotificacoesCount, permissaoNotificacaoState } = useAgenda();
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isNotifPromptOpen, setIsNotifPromptOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const agendamentosHoje = tatuagens.filter(t => t.data === todayStr && t.status === 'agendado');

  const totalConcluidosMes = tatuagens.filter(t => t.status === 'concluído');
  const faturamentoTotal = totalConcluidosMes.reduce((acc, t) => acc + (t.valor || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const menuItems = [
    {
      id: 'agenda',
      title: 'Agenda',
      desc: 'Visualizar por dia, semana ou mês',
      screen: 'agenda' as const,
      icon: Calendar,
      color: 'from-[#FF6B35] to-[#E63946]',
      badge: agendamentosHoje.length > 0 ? `${agendamentosHoje.length} hoje` : undefined,
    },
    {
      id: 'add_tatuagem',
      title: 'Agendar Trabalho',
      desc: 'Cadastrar nova sessão com lembrete',
      screen: 'add_tatuagem' as const,
      icon: PlusCircle,
      color: 'from-[#FFB703] to-[#FF6B35]',
    },
    {
      id: 'notificacoes',
      title: 'Aba Notificações',
      desc: 'Lembretes e avisos de tatuagens',
      screen: 'notificacoes' as const,
      icon: Bell,
      color: 'from-[#FF6B35] to-[#FFB703]',
      badge: unreadNotificacoesCount > 0 ? `${unreadNotificacoesCount} novas` : undefined,
    },
    {
      id: 'cadastro_cliente',
      title: 'Cadastrar Cliente',
      desc: 'Adicionar novo cliente à lista',
      screen: 'cadastro_cliente' as const,
      icon: UserPlus,
      color: 'from-[#E63946] to-[#C1121F]',
    },
    {
      id: 'historico',
      title: 'Histórico de Clientes',
      desc: 'Histórico completo por cliente',
      screen: 'lista_clientes' as const,
      icon: History,
      color: 'from-[#2A2A2A] to-[#3A3A3A]',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-60px)] p-4 sm:p-8 flex flex-col justify-between max-w-5xl mx-auto gap-8">
      {/* Studio Header Banner */}
      <div className="text-center relative pt-4 pb-2">
        <div className="inline-flex items-center gap-2 bg-[#2A2A2A] border border-[#3A3A3A] px-3.5 py-1.5 rounded-full text-xs text-[#FF6B35] font-semibold mb-3">
          <Sparkles size={14} /> Studio Gustavo Tattoo
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F5F5F5] tracking-tight">
          Menu Principal
        </h1>
        <p className="text-xs sm:text-sm text-[#999999] mt-2 max-w-md mx-auto">
          Gerenciamento prático e moderno de agendamentos, clientes e faturamento
        </p>

        {/* PWA / iPhone App Download Banner & Notification Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35]/20 via-[#2D2D2D] to-[#1C1C1C] border border-[#FF6B35]/40 p-2.5 px-4 rounded-2xl text-xs text-[#F5F5F5] shadow-lg">
            <Apple size={16} className="text-[#FF6B35]" />
            <span>Quer usar como aplicativo no seu <strong>iPhone / Celular</strong>?</span>
            <button
              onClick={() => setIsInstallOpen(true)}
              className="ml-1 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold px-3 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1 shadow-md"
            >
              <Smartphone size={13} /> Instalar App
            </button>
          </div>

          {permissaoNotificacaoState !== 'granted' && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFB703]/20 via-[#2D2D2D] to-[#1C1C1C] border border-[#FFB703]/50 p-2.5 px-4 rounded-2xl text-xs text-[#F5F5F5] shadow-lg animate-fade-in">
              <Bell size={16} className="text-[#FFB703] animate-bounce" />
              <span>Receba os lembretes direto no seu <strong>Celular</strong>!</span>
              <button
                onClick={() => setIsNotifPromptOpen(true)}
                className="ml-1 bg-[#FFB703] hover:bg-[#e0a100] text-black font-extrabold px-3 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1 shadow-md"
              >
                <ShieldCheck size={13} /> Ativar Notificações
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-auto">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.screen)}
              className="group relative bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] hover:border-[#FF6B35] rounded-3xl p-5 sm:p-6 text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#FF6B35]/10 flex flex-col justify-between min-h-[150px] overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent size={26} />
                </div>
                {item.badge && (
                  <span className="bg-[#FF6B35] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] group-hover:text-[#FF6B35] transition-colors">
                  {item.title}
                </h2>
                <p className="text-xs text-[#999999] mt-1 font-medium">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Dashboard Stat Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#2A2A2A] border border-[#3A3A3A] p-4 rounded-3xl shadow-lg">
        <div className="text-center p-2 border-b sm:border-b-0 sm:border-r border-[#3A3A3A]">
          <div className="flex items-center justify-center gap-1 text-[#FF6B35] text-xs font-semibold mb-1">
            <Clock size={14} /> Agendados
          </div>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tatuagens.filter(t => t.status === 'agendado').length}
          </span>
        </div>

        <div className="text-center p-2 border-b sm:border-b-0 sm:border-r border-[#3A3A3A]">
          <div className="flex items-center justify-center gap-1 text-[#4CAF50] text-xs font-semibold mb-1">
            <DollarSign size={14} /> Concluídos
          </div>
          <span className="text-lg sm:text-2xl font-black text-[#4CAF50]">
            {formatCurrency(faturamentoTotal)}
          </span>
        </div>

        <div className="text-center p-2">
          <div className="flex items-center justify-center gap-1 text-[#FFB703] text-xs font-semibold mb-1">
            <Users size={14} /> Clientes
          </div>
          <span className="text-xl sm:text-2xl font-black text-white">
            {clientes.length}
          </span>
        </div>
      </div>

      <InstallAppModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
      <NotificationPromptModal isOpen={isNotifPromptOpen} onClose={() => setIsNotifPromptOpen(false)} />
    </div>
  );
};
