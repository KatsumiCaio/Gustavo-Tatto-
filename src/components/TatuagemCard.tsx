import React from 'react';
import { Tatuagem } from '../types';
import { useAgenda } from '../contexts/AgendaContext';
import { Clock, MapPin, DollarSign, Phone, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Image as ImageIcon, MessageSquare } from 'lucide-react';

interface TatuagemCardProps {
  tatuagem: Tatuagem;
  onPressImage?: (tatuagem: Tatuagem) => void;
  onEdit?: (tatuagem: Tatuagem) => void;
  onDelete?: (tatuagem: Tatuagem) => void;
  onStatusChange?: (id: string, newStatus: 'agendado' | 'concluído' | 'cancelado') => void;
}

export const TatuagemCard: React.FC<TatuagemCardProps> = ({
  tatuagem,
  onPressImage,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { navigate } = useAgenda();
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getReminderWhatsAppUrl = () => {
    if (!tatuagem.telefone) return '#';
    const cleanPhone = tatuagem.telefone.replace(/\D/g, '');
    const formattedPhone = (cleanPhone.length === 10 || cleanPhone.length === 11) ? `55${cleanPhone}` : cleanPhone;
    
    const dateStr = formatDateDisplay(tatuagem.data);
    const message = `Olá ${tatuagem.cliente}! Tudo bem? Passando para confirmar sua sessão de tatuagem agendada para o dia ${dateStr} às ${tatuagem.horario} no estúdio. Podemos confirmar a sua presença? 🎨✨`;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const getStatusBadge = () => {
    switch (tatuagem.status) {
      case 'concluído':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30">
            <CheckCircle2 size={12} /> Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30">
            <XCircle size={12} /> Cancelado
          </span>
        );
      case 'agendado':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
            <AlertCircle size={12} /> Agendado
          </span>
        );
    }
  };

  return (
    <div className="bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] rounded-2xl p-4 sm:p-5 shadow-lg transition-all flex flex-col gap-3">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 border-b border-[#3A3A3A] pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-snug">
            {tatuagem.cliente}
          </h3>
          <p className="text-xs text-[#999999] flex items-center gap-1.5 mt-0.5">
            <Clock size={13} className="text-[#FF6B35]" />
            <span className="font-semibold text-white">{tatuagem.horario}</span> • {formatDateDisplay(tatuagem.data)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Description & Body location */}
      <div>
        <p className="text-sm text-[#F5F5F5] font-medium leading-relaxed">
          {tatuagem.descricao}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#999999]">
          {tatuagem.local && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[#FFB703]" />
              <span>{tatuagem.local}</span>
            </span>
          )}
          {tatuagem.telefone && (
            <div className="flex items-center gap-2">
              <a
                href={`tel:${tatuagem.telefone.replace(/\D/g, '')}`}
                className="flex items-center gap-1 text-[#FF6B35] hover:underline"
              >
                <Phone size={12} />
                <span>{tatuagem.telefone}</span>
              </a>
              <a
                href={`https://wa.me/${tatuagem.telefone.replace(/\D/g, '').length === 11 || tatuagem.telefone.replace(/\D/g, '').length === 10 ? '55' + tatuagem.telefone.replace(/\D/g, '') : tatuagem.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${tatuagem.cliente}! Sobre o seu agendamento de tatuagem para o dia ${formatDateDisplay(tatuagem.data)} às ${tatuagem.horario}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2 py-0.5 rounded-lg border border-[#25D366]/30 transition-colors"
                title="Conversar no WhatsApp"
              >
                <MessageSquare size={11} />
                <span>WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Value, Images Preview & Quick Reminder */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#3A3A3A]">
            <DollarSign size={14} className="text-[#FFB703]" />
            <span className="text-sm font-bold text-[#FFB703]">
              {formatCurrency(tatuagem.valor)}
            </span>
          </div>

          {/* Thumbnail preview button */}
          {(tatuagem.imagemModelo || tatuagem.imagemFinal) && (
            <button
              onClick={() => onPressImage && onPressImage(tatuagem)}
              className="flex items-center gap-1.5 text-xs text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 px-3 py-1.5 rounded-xl font-medium transition-colors"
            >
              <ImageIcon size={14} />
              <span>Ver Imagem</span>
            </button>
          )}
        </div>

        {/* WhatsApp Reminder Button */}
        <div className="flex items-center gap-1.5">
          {tatuagem.telefone && (
            <a
              href={getReminderWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow-md active:scale-95"
              title="Enviar mensagem de confirmação de agendamento no WhatsApp"
            >
              <MessageSquare size={14} />
              <span>Enviar Lembrete</span>
            </a>
          )}
        </div>
      </div>

      {/* Observações */}
      {tatuagem.observacoes && (
        <p className="text-xs text-[#999999] bg-[#1C1C1C]/50 p-2.5 rounded-xl border border-[#3A3A3A]/50 italic">
          "{tatuagem.observacoes}"
        </p>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between gap-2 border-t border-[#3A3A3A] pt-3 mt-1">
        {/* Status quick select */}
        {onStatusChange && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#999999] mr-1 hidden sm:inline">Status:</span>
            <button
              onClick={() => onStatusChange(tatuagem.id, 'agendado')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                tatuagem.status === 'agendado'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[#1C1C1C] text-[#999999] hover:text-white'
              }`}
            >
              Agendado
            </button>
            <button
              onClick={() => onStatusChange(tatuagem.id, 'concluído')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                tatuagem.status === 'concluído'
                  ? 'bg-[#4CAF50] text-white'
                  : 'bg-[#1C1C1C] text-[#999999] hover:text-white'
              }`}
            >
              Concluído
            </button>
            <button
              onClick={() => onStatusChange(tatuagem.id, 'cancelado')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                tatuagem.status === 'cancelado'
                  ? 'bg-[#E63946] text-white'
                  : 'bg-[#1C1C1C] text-[#999999] hover:text-white'
              }`}
            >
              Cancelado
            </button>
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1 ml-auto">
          {onEdit && (
            <button
              onClick={() => onEdit(tatuagem)}
              className="p-2 rounded-lg text-[#999999] hover:text-[#FF6B35] hover:bg-[#1C1C1C] transition-colors"
              title="Editar Tatuagem"
            >
              <Edit2 size={16} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(tatuagem)}
              className="p-2 rounded-lg text-[#999999] hover:text-[#E63946] hover:bg-[#1C1C1C] transition-colors"
              title="Excluir Tatuagem"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
