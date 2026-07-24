import React, { useState } from 'react';
import { ViewSelector } from '../components/ViewSelector';
import { EditTatuagemModal } from '../components/EditTatuagemModal';
import { ImageViewerModal } from '../components/ImageViewerModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Tatuagem } from '../types';
import { useAgenda } from '../contexts/AgendaContext';

export const AgendaScreen: React.FC = () => {
  const { deleteTatuagem } = useAgenda();
  const [selectedTatuagem, setSelectedTatuagem] = useState<Tatuagem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingTatuagem, setDeletingTatuagem] = useState<Tatuagem | null>(null);

  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <ViewSelector
        onPressImage={handlePressImage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
        title="Excluir Agendamento"
        message={deletingTatuagem ? `Tem certeza que deseja excluir o agendamento de "${deletingTatuagem.cliente}"? Esta ação não pode ser desfeita.` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTatuagem(null)}
      />
    </div>
  );
};
