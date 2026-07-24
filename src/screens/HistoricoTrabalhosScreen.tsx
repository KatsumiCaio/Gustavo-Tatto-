import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { TatuagemCard } from '../components/TatuagemCard';
import { EditTatuagemModal } from '../components/EditTatuagemModal';
import { ImageViewerModal } from '../components/ImageViewerModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Tatuagem } from '../types';
import { History, FileX, ArrowLeft } from 'lucide-react';

export const HistoricoTrabalhosScreen: React.FC = () => {
  const { navParams, tatuagens, deleteTatuagem, updateTatuagem, goBack } = useAgenda();
  const clienteNome = navParams.clienteNome;

  const [selectedTatuagem, setSelectedTatuagem] = useState<Tatuagem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingTatuagem, setDeletingTatuagem] = useState<Tatuagem | null>(null);

  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Filter tattoos for client if provided, sorted by date descending
  const list = (clienteNome
    ? tatuagens.filter(t => t.cliente.toLowerCase() === clienteNome.toLowerCase())
    : [...tatuagens]
  ).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleEdit = (tatuagem: Tatuagem) => {
    setSelectedTatuagem(tatuagem);
    setIsEditModalOpen(true);
  };

  const handlePressImage = (tatuagem: Tatuagem) => {
    const imgs = [tatuagem.imagemModelo, tatuagem.imagemFinal].filter(Boolean) as string[];
    if (imgs.length > 0) {
      setViewerImages(imgs);
      setIsViewerOpen(true);
    }
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
            {list.length} {list.length === 1 ? 'trabalho registrado' : 'trabalhos registrados'}
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

      {/* List */}
      <div className="space-y-4">
        {list.length > 0 ? (
          list.map(tatuagem => (
            <TatuagemCard
              key={tatuagem.id}
              tatuagem={tatuagem}
              onPressImage={handlePressImage}
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
              {clienteNome
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

      <ImageViewerModal
        visible={isViewerOpen}
        images={viewerImages}
        onClose={() => {
          setIsViewerOpen(false);
          setViewerImages([]);
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
