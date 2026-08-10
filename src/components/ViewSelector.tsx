import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { ViewMode, Tatuagem } from '../types';
import { TatuagemCard } from './TatuagemCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarCheck, Inbox, Plus, Clock } from 'lucide-react';
import { addDays, subDays, format, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViewSelectorProps {
  onPressImage?: (tatuagem: Tatuagem, initialIndex?: number) => void;
  onEdit?: (tatuagem: Tatuagem) => void;
  onDelete?: (tatuagem: Tatuagem) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  onPressImage,
  onEdit,
  onDelete,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    tatuagens,
    getTatuagensForDate,
    getTatuagensForWeek,
    updateTatuagem,
    navigate,
  } = useAgenda();

  const handleStatusChange = (id: string, newStatus: 'agendado' | 'concluído' | 'cancelado') => {
    updateTatuagem(id, { status: newStatus });
  };

  const goToPrevious = () => {
    if (viewMode === 'dia') {
      const next = subDays(selectedDate, 1);
      setSelectedDate(next);
      setCurrentDate(next);
    } else if (viewMode === 'semana') {
      const next = subDays(currentDate, 7);
      setCurrentDate(next);
    } else if (viewMode === 'mes') {
      const next = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(next);
    }
  };

  const goToNext = () => {
    if (viewMode === 'dia') {
      const next = addDays(selectedDate, 1);
      setSelectedDate(next);
      setCurrentDate(next);
    } else if (viewMode === 'semana') {
      const next = addDays(currentDate, 7);
      setCurrentDate(next);
    } else if (viewMode === 'mes') {
      const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(next);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Generate 35 or 42 grid cells for the current month view
  const getMonthCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0 = Sun
    const totalDays = lastDay.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      days.push({ date: d, isCurrentMonth: false, dateStr });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateStr = format(d, 'yyyy-MM-dd');
      days.push({ date: d, isCurrentMonth: true, dateStr });
    }

    // Next month padding to reach 35 or 42 grid cells
    const totalCells = days.length;
    const targetTotal = totalCells <= 35 ? 35 : 42;
    const remaining = targetTotal - totalCells;

    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      const dateStr = format(d, 'yyyy-MM-dd');
      days.push({ date: d, isCurrentMonth: false, dateStr });
    }

    return days;
  };

  const getHeaderText = (): string => {
    try {
      if (viewMode === 'dia') {
        return format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      }
      if (viewMode === 'semana') {
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `Semana: ${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM, yyyy", { locale: ptBR })}`;
      }
      if (viewMode === 'mes') {
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  // Get list of tattoos based on active mode / selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayList = tatuagens.filter(t => t.data === selectedDateStr);
  const weekList = getTatuagensForWeek(currentDate);
  const dayList = getTatuagensForDate(selectedDate);

  const monthDaysGrid = getMonthCalendarDays();
  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col gap-5">
      {/* View Mode Toggle Buttons */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-[#2A2A2A] p-1.5 rounded-2xl border border-[#3A3A3A] shadow-md">
        <button
          onClick={() => setViewMode('mes')}
          className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
            viewMode === 'mes'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <CalendarIcon size={15} />
          <span className="truncate">Mês</span>
        </button>

        <button
          onClick={() => setViewMode('semana')}
          className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
            viewMode === 'semana'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <CalendarIcon size={15} />
          <span className="truncate">Semana</span>
        </button>

        <button
          onClick={() => setViewMode('dia')}
          className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
            viewMode === 'dia'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <CalendarIcon size={15} />
          <span className="truncate">Dia</span>
        </button>
      </div>

      {/* Date Navigation Header */}
      <div className="flex items-center justify-between gap-2 bg-[#2D2D2D] p-3 sm:p-4 rounded-2xl border border-[#3A3A3A] shadow-lg">
        <button
          onClick={goToPrevious}
          className="flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:bg-[#3A3A3A] p-2 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <h2 className="text-sm sm:text-base font-black text-[#F5F5F5] capitalize text-center leading-snug px-2 tracking-wide">
          {getHeaderText()}
        </h2>

        <div className="flex items-center gap-1">
          <button
            onClick={goToToday}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#FF6B35]/20 hover:bg-[#FF6B35]/30 text-[#FF6B35] border border-[#FF6B35]/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
          >
            <CalendarCheck size={14} />
            <span>Hoje</span>
          </button>
          <button
            onClick={goToNext}
            className="flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:bg-[#3A3A3A] p-2 rounded-xl transition-colors"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Hoje Button */}
      <div className="flex justify-center sm:hidden -mt-2">
        <button
          onClick={goToToday}
          className="inline-flex items-center gap-1.5 bg-[#FF6B35] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-[#FF6B35]/20"
        >
          <CalendarCheck size={14} />
          <span>Ir para Hoje</span>
        </button>
      </div>

      {/* MONTHLY CALENDAR GRID (Rendered in 'mes' mode) */}
      {viewMode === 'mes' && (
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-[#3A3A3A] pb-2">
            {weekDayLabels.map((dayLabel, idx) => (
              <span
                key={dayLabel}
                className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-[#FF6B35]' : 'text-[#999999]'
                }`}
              >
                {dayLabel}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDaysGrid.map(({ date, isCurrentMonth, dateStr }) => {
              const selected = isSameDay(date, selectedDate);
              const today = isToday(date);
              const dayTattoos = tatuagens.filter(t => t.data === dateStr);
              const hasTats = dayTattoos.length > 0;
              const scheduledCount = dayTattoos.filter(t => t.status === 'agendado').length;
              const completedCount = dayTattoos.filter(t => t.status === 'concluído').length;

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(date);
                    if (!isCurrentMonth) {
                      setCurrentDate(date);
                    }
                  }}
                  className={`relative min-h-[52px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-2xl transition-all flex flex-col justify-between items-center border ${
                    selected
                      ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30 ring-2 ring-white/20 scale-[1.03] z-10'
                      : today
                      ? 'bg-[#333333] border-[#FFB703] text-[#FFB703] font-bold'
                      : isCurrentMonth
                      ? 'bg-[#242424] hover:bg-[#333333] border-[#383838] text-[#F5F5F5]'
                      : 'bg-[#1E1E1E]/60 hover:bg-[#252525] border-transparent text-[#666666]'
                  }`}
                >
                  {/* Day Number */}
                  <span
                    className={`text-xs sm:text-sm font-bold leading-none ${
                      selected
                        ? 'text-white'
                        : today
                        ? 'text-[#FFB703]'
                        : isCurrentMonth
                        ? 'text-[#F5F5F5]'
                        : 'text-[#666666]'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Indicators / Badges for appointments */}
                  {hasTats ? (
                    <div className="mt-1 flex items-center justify-center gap-1 w-full flex-wrap">
                      {selected ? (
                        <span className="bg-white text-[#FF6B35] text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                          {dayTattoos.length} {dayTattoos.length === 1 ? 'sessão' : 'sessões'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {scheduledCount > 0 && (
                            <span className="bg-[#FF6B35] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow">
                              {scheduledCount}
                            </span>
                          )}
                          {completedCount > 0 && (
                            <span className="bg-[#25D366] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow">
                              {completedCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-[#999999] border-t border-[#3A3A3A]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" /> Agendado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" /> Concluído
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-[#FFB703] bg-[#333333]" /> Hoje
            </span>
          </div>
        </div>
      )}

      {/* LIST OF APPOINTMENTS SECTION BELOW THE CALENDAR */}
      <div className="mt-1 space-y-4">
        {/* Selected Day Banner */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF6B35]/20 via-[#2D2D2D] to-[#1C1C1C] border border-[#FF6B35]/40 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center font-black shadow-md">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#F5F5F5] capitalize">
                {viewMode === 'mes' || viewMode === 'dia'
                  ? `Agendamentos: ${format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}`
                  : `Agendamentos da Semana`}
              </h3>
              <p className="text-[11px] text-[#999999]">
                {viewMode === 'mes' || viewMode === 'dia'
                  ? `${selectedDayList.length} ${selectedDayList.length === 1 ? 'trabalho marcado' : 'trabalhos marcados'}`
                  : `${weekList.length} trabalhos nesta semana`}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('add_tatuagem')}
            className="bg-[#FF6B35] hover:bg-[#E63946] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-[#FF6B35]/20 inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* List of Tattoos or Empty State */}
        <div className="flex flex-col gap-3">
          {(viewMode === 'mes' || viewMode === 'dia' ? selectedDayList : weekList).length > 0 ? (
            (viewMode === 'mes' || viewMode === 'dia' ? selectedDayList : weekList).map(tatuagem => (
              <TatuagemCard
                key={tatuagem.id}
                tatuagem={tatuagem}
                onPressImage={onPressImage}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1C] flex items-center justify-center text-[#999999] border border-[#3A3A3A] shadow-inner">
                <Inbox size={32} className="text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F5]">
                  Nenhum agendamento para esta data
                </h3>
                <p className="text-xs text-[#999999] mt-1 max-w-xs mx-auto">
                  {viewMode === 'mes' || viewMode === 'dia'
                    ? `Não há nenhuma sessão de tatuagem marcada para ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}.`
                    : 'Não há agendamentos para esta semana.'}
                </p>
              </div>
              <button
                onClick={() => navigate('add_tatuagem')}
                className="mt-2 inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E63946] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#FF6B35]/20"
              >
                <Plus size={16} />
                <span>Agendar Tatuagem neste Dia</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

