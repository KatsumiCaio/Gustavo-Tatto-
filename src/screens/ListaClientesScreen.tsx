import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { maskNomeCliente, maskTelefone, maskInstagram, maskObservacoes } from '../utils/privacy';
import { Search, UserPlus, ChevronRight, Phone, Instagram, History, Edit2, Trash2, X, Save, MessageSquare } from 'lucide-react';
import { Cliente } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export const ListaClientesScreen: React.FC = () => {
  const { clientes, tatuagens, navigate, updateCliente, deleteCliente, modoPrivacidade } = useAgenda();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');

  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredClientes = clientes.filter(c => {
    const rawTerm = searchTerm.trim();
    if (!rawTerm) return true;

    const term = normalizeStr(rawTerm);
    const digitsOnly = rawTerm.replace(/\D/g, '');

    const matchNome = normalizeStr(c.nome).includes(term);
    const matchTelefone =
      normalizeStr(c.telefone).includes(term) ||
      (digitsOnly.length > 0 && c.telefone.replace(/\D/g, '').includes(digitsOnly));
    const matchInstagram = c.instagram ? normalizeStr(c.instagram).includes(term) : false;

    return matchNome || matchTelefone || matchInstagram;
  });

  const getClientTattooCount = (nome: string) => {
    return tatuagens.filter(t => t.cliente.toLowerCase() === nome.toLowerCase()).length;
  };

  const handleOpenEdit = (cliente: Cliente, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCliente(cliente);
    setEditNome(cliente.nome);
    setEditTelefone(cliente.telefone);
    setEditInstagram(cliente.instagram || '');
    setEditObservacoes(cliente.observacoes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCliente || !editNome.trim() || !editTelefone.trim()) return;

    updateCliente(editingCliente.id, {
      nome: editNome.trim(),
      telefone: editTelefone.trim(),
      instagram: editInstagram.trim() || undefined,
      observacoes: editObservacoes.trim() || undefined,
    });

    setEditingCliente(null);
  };

  const handleDelete = (cliente: Cliente, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCliente(cliente);
  };

  const handleConfirmDelete = () => {
    if (deletingCliente) {
      deleteCliente(deletingCliente.id);
      setDeletingCliente(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">Gestão de Clientes</h2>
        <p className="text-xs text-[#999999] mt-1">
          Gerencie o cadastro de clientes e acesse o histórico individual de trabalhos.
        </p>
      </div>

      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3.5 text-[#999999]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nome, número ou @instagram..."
            className="w-full bg-[#2D2D2D] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#F5F5F5] focus:outline-none shadow-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('cadastro_cliente')}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] px-4 py-3 rounded-2xl transition-colors shadow-lg whitespace-nowrap"
          >
            <UserPlus size={16} />
            <span>Novo Cliente</span>
          </button>

          <button
            onClick={() => navigate('historico_trabalhos')}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 px-3.5 py-3 rounded-2xl transition-colors whitespace-nowrap"
            title="Ver Histórico Geral"
          >
            <History size={16} />
            <span className="hidden sm:inline">Histórico Geral</span>
          </button>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => {
            const count = getClientTattooCount(cliente.nome);
            const cleanPhone = cliente.telefone.replace(/\D/g, '');
            const waPhone = cleanPhone.length === 11 || cleanPhone.length === 10 ? '55' + cleanPhone : cleanPhone;

            return (
              <div
                key={cliente.id}
                onClick={() => navigate('historico_trabalhos', { clienteNome: cliente.nome })}
                className="bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] hover:border-[#FF6B35] rounded-2xl p-4 sm:p-5 shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1C] border border-[#3A3A3A] flex items-center justify-center text-[#FF6B35] font-bold text-lg group-hover:scale-105 transition-transform flex-shrink-0">
                    {modoPrivacidade ? '?' : cliente.nome.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FF6B35] transition-colors">
                      {maskNomeCliente(cliente.nome, modoPrivacidade)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#999999] mt-1">
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {maskTelefone(cliente.telefone, modoPrivacidade)}
                      </span>
                      {cliente.instagram && (
                        <span className="flex items-center gap-1 text-[#FFB703]">
                          <Instagram size={12} /> {maskInstagram(cliente.instagram, modoPrivacidade)}
                        </span>
                      )}
                    </div>
                    {cliente.observacoes && (
                      <p className="text-xs text-[#888888] mt-1 line-clamp-1 italic">
                        "{maskObservacoes(cliente.observacoes, modoPrivacidade)}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-[#3A3A3A] pt-2 sm:pt-0">
                  <div className="flex items-center gap-2">
                    {/* WhatsApp button */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-2 rounded-xl text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </a>
                    )}

                    <span className="text-xs font-bold bg-[#1C1C1C] text-[#FF6B35] border border-[#3A3A3A] px-2.5 py-1 rounded-full whitespace-nowrap">
                      {count} {count === 1 ? 'trabalho' : 'trabalhos'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleOpenEdit(cliente, e)}
                      className="p-2 rounded-xl text-[#999999] hover:text-[#FF6B35] hover:bg-[#1C1C1C] transition-colors"
                      title="Editar Cliente"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={e => handleDelete(cliente, e)}
                      className="p-2 rounded-xl text-[#999999] hover:text-[#E63946] hover:bg-[#1C1C1C] transition-colors"
                      title="Excluir Cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-[#999999] group-hover:text-[#FF6B35] transition-colors ml-1" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-[#999999]">Nenhum cliente encontrado.</p>
            <button
              onClick={() => navigate('cadastro_cliente')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 px-4 py-2 rounded-xl transition-colors"
            >
              <UserPlus size={14} />
              <span>Cadastrar Novo Cliente</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal for Editing Client */}
      {editingCliente && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
              <h3 className="text-lg font-bold text-[#F5F5F5]">Editar Cliente</h3>
              <button
                onClick={() => setEditingCliente(null)}
                className="p-1 rounded-lg text-[#999999] hover:text-white hover:bg-[#1C1C1C]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  required
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-3 text-sm text-[#F5F5F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  value={editTelefone}
                  onChange={e => setEditTelefone(e.target.value)}
                  required
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-3 text-sm text-[#F5F5F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={editInstagram}
                  onChange={e => setEditInstagram(e.target.value)}
                  placeholder="@usuario"
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-3 text-sm text-[#F5F5F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Observações
                </label>
                <textarea
                  value={editObservacoes}
                  onChange={e => setEditObservacoes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-3 text-sm text-[#F5F5F5] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#3A3A3A] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCliente(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#999999] hover:bg-[#1C1C1C] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] transition-colors shadow-lg"
                >
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingCliente}
        title="Excluir Cliente"
        message={deletingCliente ? `Tem certeza que deseja excluir o cliente "${deletingCliente.nome}"? Esta ação removerá o cadastro do cliente.` : ''}
        confirmText="Excluir Cliente"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCliente(null)}
      />
    </div>
  );
};
