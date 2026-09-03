import React, { useState, useMemo } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { formatValor, maskNomeCliente } from '../utils/privacy';
import { Tatuagem } from '../types';
import {
  DollarSign,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Wallet,
  TrendingUp,
  XCircle,
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const FaturamentoScreen: React.FC = () => {
  const { tatuagens, navigate, modoPrivacidade } = useAgenda();

  // Default to current year and month YYYY-MM
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'concluido' | 'agendado'>('todos');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // List of available years from data
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    tatuagens.forEach(t => {
      if (t.data) {
        const y = parseInt(t.data.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [tatuagens, currentYear]);

  // Navigate month back and forward
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const formattedMonthStr = String(selectedMonth).padStart(2, '0');
  const targetYm = `${selectedYear}-${formattedMonthStr}`;

  // Filter tattoos for the chosen month and year
  const monthTatuagens = useMemo(() => {
    return tatuagens.filter(t => {
      if (!t.data) return false;
      return t.data.startsWith(targetYm);
    }).sort((a, b) => {
      // Sort by date ascending
      const dateA = `${a.data || ''} ${a.horario || ''}`;
      const dateB = `${b.data || ''} ${b.horario || ''}`;
      return dateA.localeCompare(dateB);
    });
  }, [tatuagens, targetYm]);

  // Calculations for chosen month
  const monthStats = useMemo(() => {
    let concluido = 0;
    let agendado = 0;
    let countConcluido = 0;
    let countAgendado = 0;
    let countCancelado = 0;

    monthTatuagens.forEach(t => {
      const val = t.valor || 0;
      if (t.status === 'concluído') {
        concluido += val;
        countConcluido++;
      } else if (t.status === 'agendado') {
        agendado += val;
        countAgendado++;
      } else if (t.status === 'cancelado') {
        countCancelado++;
      }
    });

    const totalEstimado = concluido + agendado;

    return {
      concluido,
      agendado,
      totalEstimado,
      countConcluido,
      countAgendado,
      countCancelado,
      totalTrabalhos: monthTatuagens.length
    };
  }, [monthTatuagens]);

  // Tattoos filtered by status tab & search term
  const displayedTatuagens = useMemo(() => {
    return monthTatuagens.filter(t => {
      // Status filter
      if (statusFilter === 'concluido' && t.status !== 'concluído') return false;
      if (statusFilter === 'agendado' && t.status !== 'agendado') return false;

      // Search term filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const matchName = t.cliente?.toLowerCase().includes(term);
        const matchDesc = t.descricao?.toLowerCase().includes(term);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    });
  }, [monthTatuagens, statusFilter, searchTerm]);

  const handleEditTatuagem = (tat: Tatuagem) => {
    navigate('add_tatuagem', { tatuagemId: tat.id });
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      
      {/* 1. Mês & Ano Selector Header */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 sm:p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-[#FF6B35] flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#F5F5F5]">
                Faturamento Mensal
              </h1>
              <p className="text-xs text-[#999999]">
                Selecione o mês para conferir entradas e previstos
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector Bar with Arrows and Dropdowns */}
        <div className="bg-[#1C1C1C] border border-[#3A3A3A] p-2 rounded-2xl flex items-center justify-between gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl bg-[#2D2D2D] hover:bg-[#3A3A3A] text-[#F5F5F5] transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#F5F5F5] font-extrabold text-sm sm:text-base px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-[#FF6B35]"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#FF6B35] font-extrabold text-sm sm:text-base px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-[#FF6B35]"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl bg-[#2D2D2D] hover:bg-[#3A3A3A] text-[#F5F5F5] transition-colors"
            title="Próximo mês"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 2. Key Monthly Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Realizado */}
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] border-t-4 border-t-[#4CAF50] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#999999] uppercase tracking-wider">Concluído</span>
            <div className="p-1.5 rounded-xl bg-[#4CAF50]/15 text-[#4CAF50]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#4CAF50] mt-2">
            {formatValor(monthStats.concluido, modoPrivacidade)}
          </p>
          <p className="text-[11px] text-[#999999] mt-1 font-medium">
            {monthStats.countConcluido} {monthStats.countConcluido === 1 ? 'trabalho realizado' : 'trabalhos realizados'}
          </p>
        </div>

        {/* Agendado */}
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] border-t-4 border-t-[#FFB703] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#999999] uppercase tracking-wider">Valores Agendados</span>
            <div className="p-1.5 rounded-xl bg-[#FFB703]/15 text-[#FFB703]">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#FFB703] mt-2">
            {formatValor(monthStats.agendado, modoPrivacidade)}
          </p>
          <p className="text-[11px] text-[#999999] mt-1 font-medium">
            {monthStats.countAgendado} {monthStats.countAgendado === 1 ? 'agendamento pendente' : 'agendamentos pendentes'}
          </p>
        </div>

        {/* Total do Mês */}
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] border-t-4 border-t-[#FF6B35] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#999999] uppercase tracking-wider">Total do Mês</span>
            <div className="p-1.5 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35]">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#F5F5F5] mt-2">
            {formatValor(monthStats.totalEstimado, modoPrivacidade)}
          </p>
          <p className="text-[11px] text-[#999999] mt-1 font-medium">
            Concluídos + Agendados
          </p>
        </div>
      </div>

      {/* 3. Collapsible Detailed List for Selected Month */}
      {!showDetails ? (
        <button
          onClick={() => setShowDetails(true)}
          className="w-full bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] hover:border-[#FF6B35]/50 p-4 sm:p-5 rounded-3xl shadow-xl flex items-center justify-between transition-all group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1C1C1C] border border-[#3A3A3A] text-[#FF6B35] group-hover:bg-[#FF6B35] group-hover:text-white flex items-center justify-center font-bold transition-all">
              <Eye size={22} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#F5F5F5] group-hover:text-[#FF6B35] transition-colors">
                Ver Clientes & Trabalhos de {MONTH_NAMES[selectedMonth - 1]}
              </h2>
              <p className="text-xs text-[#999999]">
                Clique para abrir a lista detalhada e pesquisar por nome
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 px-3 py-1 rounded-full">
              {monthTatuagens.length} {monthTatuagens.length === 1 ? 'registro' : 'registros'}
            </span>
            <ChevronDown size={20} className="text-[#999999] group-hover:text-[#F5F5F5] transition-colors" />
          </div>
        </button>
      ) : (
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 sm:p-5 rounded-3xl shadow-xl space-y-4 animate-fade-in">
          {/* Header & Collapse Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3A3A3A] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#F5F5F5]">
                Trabalhos de {MONTH_NAMES[selectedMonth - 1]} de {selectedYear}
              </h2>
              <p className="text-xs text-[#999999]">
                {monthTatuagens.length} {monthTatuagens.length === 1 ? 'registro encontrado' : 'registros encontrados'}
              </p>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#999999] hover:text-[#F5F5F5] bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#3A3A3A] transition-colors self-start sm:self-auto"
            >
              <EyeOff size={15} /> Ocultar lista
            </button>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por cliente ou projeto..."
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] text-[#F5F5F5] placeholder-[#777777] text-xs font-medium pl-9 pr-8 py-2.5 rounded-xl focus:outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#F5F5F5] p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#1C1C1C] p-1 rounded-xl border border-[#3A3A3A] shrink-0">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === 'todos'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-[#999999] hover:text-[#F5F5F5]'
                }`}
              >
                Todos ({monthTatuagens.length})
              </button>
              <button
                onClick={() => setStatusFilter('concluido')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === 'concluido'
                    ? 'bg-[#4CAF50] text-white'
                    : 'text-[#999999] hover:text-[#F5F5F5]'
                }`}
              >
                Concluídos ({monthStats.countConcluido})
              </button>
              <button
                onClick={() => setStatusFilter('agendado')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === 'agendado'
                    ? 'bg-[#FFB703] text-black'
                    : 'text-[#999999] hover:text-[#F5F5F5]'
                }`}
              >
                Agendados ({monthStats.countAgendado})
              </button>
            </div>
          </div>

          {/* List of Tattoos */}
          {displayedTatuagens.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1C1C] border border-[#3A3A3A] text-[#999999] flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <p className="text-sm font-bold text-[#F5F5F5]">
                {searchTerm ? `Nenhum trabalho encontrado para "${searchTerm}".` : `Nenhum registro para este filtro em ${MONTH_NAMES[selectedMonth - 1]}.`}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-[#FF6B35] font-bold hover:underline"
                >
                  Limpar pesquisa
                </button>
              ) : (
                <button
                  onClick={() => navigate('add_tatuagem')}
                  className="inline-flex items-center gap-2 text-xs font-bold bg-[#FF6B35] text-white px-4 py-2 rounded-xl hover:bg-[#FF6B35]/90 transition-colors"
                >
                  <PlusCircle size={16} /> Agendar Nova Tatuagem
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {displayedTatuagens.map(tat => {
                const [yyyy, mm, dd] = tat.data ? tat.data.split('-') : ['', '', ''];
                const dateDisplay = dd && mm ? `${dd}/${mm}` : tat.data;

                return (
                  <div
                    key={tat.id}
                    onClick={() => handleEditTatuagem(tat)}
                    className="bg-[#1C1C1C] hover:bg-[#252525] border border-[#3A3A3A] hover:border-[#FF6B35] p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#2D2D2D] border border-[#3A3A3A] text-[#FF6B35] font-black text-xs flex flex-col items-center justify-center shrink-0">
                        <span>{dateDisplay}</span>
                        {tat.horario && (
                          <span className="text-[10px] text-[#999999] font-normal leading-none mt-0.5">
                            {tat.horario}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F5F5] text-sm group-hover:text-[#FF6B35] transition-colors truncate">
                          {maskNomeCliente(tat.cliente, modoPrivacidade)}
                        </p>
                        <p className="text-xs text-[#999999] truncate">
                          {tat.descricao || 'Tatuagem'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="block font-black text-[#F5F5F5] text-sm sm:text-base">
                          {formatValor(tat.valor || 0, modoPrivacidade)}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                          tat.status === 'concluído'
                            ? 'bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30'
                            : tat.status === 'agendado'
                            ? 'bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/30'
                            : 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30'
                        }`}>
                          {tat.status === 'concluído' ? 'Concluído' : tat.status === 'agendado' ? 'Agendado' : 'Cancelado'}
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-[#999999] group-hover:text-[#F5F5F5] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

