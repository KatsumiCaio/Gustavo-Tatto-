import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { TatuagemCard } from '../components/TatuagemCard';
import { EditTatuagemModal } from '../components/EditTatuagemModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Tatuagem } from '../types';
import { History, FileX, ArrowLeft, Search, X } from 'lucide-react';

export const HistoricoTrabalhosScreen: React.FC = () => {
  const { navParams, tatuagens, clientes, deleteTatuagem, updateTatuagem, goBack } = useAgenda();
  const clienteNome = navParams.clienteNome;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTatuagem, setSelectedTatuagem] = useState<Tatuagem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingTatuagem, setDeletingTatuagem] = useState<Tatuagem | null>(null);

  // Filter tattoos for client if provided, sorted by date descending
  const list = (clienteNome
    ? tatuagens.filter(t => t.cliente.toLowerCase() === clienteNome.toLowerCase())
    : [...tatuagens]
  ).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Search filter by client name, phone, or instagram
  const filteredList = list.filter(t => {
    const rawTerm = searchTerm.trim();
    if (!rawTerm) return true;

    const term = normalizeStr(rawTerm);
    const digitsOnly = rawTerm.replace(/\D/g, '');

    // Match client name
    const matchCliente = normalizeStr(t.cliente).includes(term);

    // Match phone (from tattoo or matched client record)
    const matchTelefone = t.telefone
      ? (normalizeStr(t.telefone).includes(term) ||
         (digitsOnly.length > 0 && t.telefone.replace(/\D/g, '').includes(digitsOnly)))
      : false;

    // Match instagram handle from clients context
    const clientObj = clientes.find(
      c => normalizeStr(c.nome) === normalizeStr(t.cliente) || (t.telefone && c.telefone === t.telefone)
    );
    const matchInstagram = clientObj?.instagram
      ? normalizeStr(clientObj.instagram).includes(term)
      : false;

    // Match description
    const matchDesc = t.descricao ? normalizeStr(t.descricao).includes(term) : false;

    return matchCliente || matchTelefone || matchInstagram || matchDesc;
  });

  const handleEdit = (tatuagem: Tatuagem) => {
    setSelectedTatuagem(tatuagem);
    setIsEditModalOpen(true);
  };

  const handleDelete = (tatuagem: Tatuagem) => {
    setDeletingTatuagem(tatuagem);
  };

  const handleConfirmDelete = () => {
    if (deletingTatuagem) {
      deleteTatuagem(deletingTatuagem.id);
      setDeletingTatuagem(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'agendado' | 'concluído' | 'cancelado') => {
    updateTatuagem(id, { status: newStatus });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F5F5]">
            {clienteNome ? `Histórico: ${clienteNome}` : 'Histórico Geral de Trabalhos'}
          </h2>
          <p className="text-xs text-[#999999] mt-0.5">
            {filteredList.length} {filteredList.length === 1 ? 'trabalho encontrado' : 'trabalhos encontrados'}
            {list.length !== filteredList.length ? ` (de ${list.length} no total)` : ''}
          </p>
        </div>

        {clienteNome && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#999999] bg-[#1C1C1C] hover:text-white px-3.5 py-2 rounded-xl border border-[#3A3A3A] transition-colors"
          >
            <ArrowLeft size={14} /> Todos os Clientes
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-3 rounded-2xl shadow-lg">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 text-[#999999]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome do cliente, número ou @instagram..."
            className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#F5F5F5] focus:outline-none placeholder:text-[#888888]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 p-1 text-[#999999] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredList.length > 0 ? (
          filteredList.map(tatuagem => (
            <TatuagemCard
              key={tatuagem.id}
              tatuagem={tatuagem}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#999999] border border-[#3A3A3A]">
              <FileX size={32} />
            </div>
            <h3 className="text-base font-bold text-[#F5F5F5]">
              Nenhum trabalho encontrado
            </h3>
            <p className="text-xs text-[#999999] max-w-sm">
              {searchTerm
                ? `Nenhum trabalho corresponde à busca por "${searchTerm}".`
                : clienteNome
                ? `Este cliente (${clienteNome}) ainda não possui trabalhos registrados.`
                : 'Ainda não há trabalhos ou agendamentos cadastrados no sistema.'}
            </p>
          </div>
        )}
      </div>

      <EditTatuagemModal
        visible={isEditModalOpen}
        tatuagem={selectedTatuagem}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTatuagem(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deletingTatuagem}
        title="Excluir Trabalho"
        message={deletingTatuagem ? `Deseja realmente excluir este trabalho de "${deletingTatuagem.cliente}" do histórico?` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTatuagem(null)}
      />
    </div>
  );
};
