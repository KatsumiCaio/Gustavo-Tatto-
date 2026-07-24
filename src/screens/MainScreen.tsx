import React from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Calendar, UserPlus, PlusCircle, History, Settings, DollarSign, Users, Clock, Sparkles, ShieldAlert, FileText } from 'lucide-react';

export const MainScreen: React.FC = () => {
  const { navigate, tatuagens, clientes } = useAgenda();

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
      desc: 'Cadastrar nova sessão de tatuagem',
      screen: 'add_tatuagem' as const,
      icon: PlusCircle,
      color: 'from-[#FFB703] to-[#FF6B35]',
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
      id: 'anamnese',
      title: 'Anamnese & Termo',
      desc: 'Checklist de saúde e cuidados pós-tatuagem',
      screen: 'anamnese' as const,
      icon: ShieldAlert,
      color: 'from-[#25D366] to-[#059669]',
    },
    {
      id: 'flashes',
      title: 'Galeria de Flashes',
      desc: 'Projetos disponíveis com preço e tamanho',
      screen: 'flashes' as const,
      icon: Sparkles,
      color: 'from-[#7B2CBF] to-[#5A189A]',
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
      </div>

      {/* Main Grid Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-auto">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.screen)}
              className="group relative bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] hover:border-[#FF6B35] rounded-3xl p-6 text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#FF6B35]/10 flex flex-col justify-between min-h-[160px] overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent size={28} />
                </div>
                {item.badge && (
                  <span className="bg-[#FF6B35] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-bold text-[#F5F5F5] group-hover:text-[#FF6B35] transition-colors">
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
      <div className="grid grid-cols-3 gap-3 bg-[#2A2A2A] border border-[#3A3A3A] p-4 rounded-3xl shadow-lg">
        <div className="text-center p-2 border-r border-[#3A3A3A]">
          <div className="flex items-center justify-center gap-1 text-[#FF6B35] text-xs font-semibold mb-1">
            <Clock size={14} /> Agendados
          </div>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tatuagens.filter(t => t.status === 'agendado').length}
          </span>
        </div>

        <div className="text-center p-2 border-r border-[#3A3A3A]">
          <div className="flex items-center justify-center gap-1 text-[#4CAF50] text-xs font-semibold mb-1">
            <DollarSign size={14} /> Concluídos
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#4CAF50]">
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
    </div>
  );
};
