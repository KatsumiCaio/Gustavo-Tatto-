import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { ViewMode, Tatuagem } from '../types';
import { TatuagemCard } from './TatuagemCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarCheck, Inbox } from 'lucide-react';
import { addDays, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViewSelectorProps {
  onPressImage?: (tatuagem: Tatuagem) => void;
  onEdit?: (tatuagem: Tatuagem) => void;
  onDelete?: (tatuagem: Tatuagem) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  onPressImage,
  onEdit,
  onDelete,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dia');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const {
    getTatuagensForDate,
    getTatuagensForWeek,
    getTatuagensForMonth,
    updateTatuagem,
    navigate,
  } = useAgenda();

  const getTatuagens = (): Tatuagem[] => {
    switch (viewMode) {
      case 'dia':
        return getTatuagensForDate(currentDate);
      case 'semana':
        return getTatuagensForWeek(currentDate);
      case 'mes':
        return getTatuagensForMonth(currentDate);
      default:
        return [];
    }
  };

  const getHeaderText = (): string => {
    try {
      if (viewMode === 'dia') {
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
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

  const goToPrevious = () => {
    if (viewMode === 'dia') setCurrentDate(subDays(currentDate, 1));
    else if (viewMode === 'semana') setCurrentDate(subDays(currentDate, 7));
    else if (viewMode === 'mes') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNext = () => {
    if (viewMode === 'dia') setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === 'semana') setCurrentDate(addDays(currentDate, 7));
    else if (viewMode === 'mes') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleStatusChange = (id: string, newStatus: 'agendado' | 'concluído' | 'cancelado') => {
    updateTatuagem(id, { status: newStatus });
  };

  const list = getTatuagens();

  return (
    <div className="flex flex-col gap-4">
      {/* View Mode Toggle Buttons */}
      <div className="grid grid-cols-3 gap-2 bg-[#2A2A2A] p-1.5 rounded-2xl border border-[#3A3A3A]">
        <button
          onClick={() => {
            setViewMode('dia');
            setCurrentDate(new Date());
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            viewMode === 'dia'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <CalendarIcon size={16} />
          <span>Dia</span>
        </button>

        <button
          onClick={() => {
            setViewMode('semana');
            setCurrentDate(new Date());
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            viewMode === 'semana'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <CalendarIcon size={16} />
          <span>Semana</span>
        </button>

        <button
          onClick={() => {
            setViewMode('mes');
            setCurrentDate(new Date());
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            viewMode === 'mes'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <CalendarIcon size={16} />
          <span>Mês</span>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-2 bg-[#2D2D2D] p-3 rounded-2xl border border-[#3A3A3A]">
        <button
          onClick={goToPrevious}
          className="flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:bg-[#3A3A3A] p-2 rounded-xl transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <h2 className="text-xs sm:text-sm font-bold text-[#F5F5F5] capitalize text-center leading-snug px-2">
          {getHeaderText()}
        </h2>

        <button
          onClick={goToNext}
          className="flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:bg-[#3A3A3A] p-2 rounded-xl transition-colors"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Voltar para hoje */}
      <div className="flex justify-center">
        <button
          onClick={goToToday}
          className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E63946] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-[#FF6B35]/20"
        >
          <CalendarCheck size={16} />
          <span>Voltar para Hoje</span>
        </button>
      </div>

      {/* List or Empty State */}
      <div className="mt-2 flex flex-col gap-3">
        {list.length > 0 ? (
          list.map(tatuagem => (
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
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 my-4">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#999999] border border-[#3A3A3A]">
              <Inbox size={32} className="text-[#FF6B35]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5]">
                Nenhuma tatuagem agendada
              </h3>
              <p className="text-xs text-[#999999] mt-1">
                {viewMode === 'dia'
                  ? 'Não há agendamentos para este dia.'
                  : viewMode === 'semana'
                  ? 'Não há agendamentos para esta semana.'
                  : 'Não há agendamentos para este mês.'}
              </p>
            </div>
            <button
              onClick={() => navigate('add_tatuagem')}
              className="mt-2 inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E63946] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#FF6B35]/20"
            >
              + Novo Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
