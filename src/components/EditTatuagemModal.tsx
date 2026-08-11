import React, { useState, useEffect } from 'react';
import { Tatuagem, Cliente } from '../types';
import { useAgenda } from '../contexts/AgendaContext';
import { X, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface EditTatuagemModalProps {
  visible: boolean;
  tatuagem: Tatuagem | null;
  onClose: () => void;
}

export const EditTatuagemModal: React.FC<EditTatuagemModalProps> = ({
  visible,
  tatuagem,
  onClose,
}) => {
  const { clientes, updateTatuagem, deleteTatuagem } = useAgenda();

  const [cliente, setCliente] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('10:00');
  const [local, setLocal] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<'agendado' | 'concluído' | 'cancelado'>('agendado');
  const [observacoes, setObservacoes] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (tatuagem) {
      setCliente(tatuagem.cliente || '');
      setDescricao(tatuagem.descricao || '');
      setData(tatuagem.data || '');
      setHorario(tatuagem.horario || '10:00');
      setLocal(tatuagem.local || '');
      setValor(tatuagem.valor ? String(tatuagem.valor) : '');
      setStatus(tatuagem.status || 'agendado');
      setObservacoes(tatuagem.observacoes || '');
    }
  }, [tatuagem]);

  if (!visible || !tatuagem) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTatuagem(tatuagem.id, {
      cliente,
      descricao,
      data,
      horario,
      local,
      valor: parseFloat(valor) || 0,
      status,
      observacoes,
    });
    onClose();
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteTatuagem(tatuagem.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#3A3A3A] bg-[#2A2A2A]">
          <h3 className="text-lg font-bold text-[#F5F5F5]">
            Editar Agendamento
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#999999] hover:text-white hover:bg-[#3A3A3A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1.5">
              Status do Trabalho
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('agendado')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'agendado'
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-[#1C1C1C] text-[#999999] border-[#3A3A3A] hover:text-white'
                }`}
              >
                Agendado
              </button>
              <button
                type="button"
                onClick={() => setStatus('concluído')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'concluído'
                    ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                    : 'bg-[#1C1C1C] text-[#999999] border-[#3A3A3A] hover:text-white'
                }`}
              >
                Concluído
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelado')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'cancelado'
                    ? 'bg-[#E63946] text-white border-[#E63946]'
                    : 'bg-[#1C1C1C] text-[#999999] border-[#3A3A3A] hover:text-white'
                }`}
              >
                Cancelado
              </button>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1">
              Cliente
            </label>
            <input
              type="text"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
              required
            />
          </div>

          {/* Descricao */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1">
              Descrição da Tatuagem
            </label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
              required
            />
          </div>

          {/* Data & Horario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Horário
              </label>
              <input
                type="time"
                value={horario}
                onChange={e => setHorario(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                required
              />
            </div>
          </div>

          {/* Local no corpo & Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Local no corpo
              </label>
              <input
                type="text"
                value={local}
                onChange={e => setLocal(e.target.value)}
                placeholder="Ex: Antebraço"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1">
              Observações
            </label>
            <input
              type="text"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Notas adicionais"
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#3A3A3A]">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946] hover:text-white transition-colors text-xs font-bold"
            >
              <Trash2 size={16} />
              <span>Excluir</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#1C1C1C] text-[#999999] hover:text-white transition-colors text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E63946] text-white transition-colors text-xs font-bold shadow-lg shadow-[#FF6B35]/20"
              >
                <Save size={16} />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Excluir Agendamento"
        message={`Tem certeza de que deseja excluir o agendamento de "${tatuagem.cliente}"? Esta ação é irreversível.`}
        confirmText="Excluir Agendamento"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};
