import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  onClose,
}) => {
  const [index, setIndex] = useState(0);

  if (!visible || !images || images.length === 0) return null;

  const currentImage = images[index] || images[0];

  const prevImage = () => {
    setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-3xl w-full flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-[#2A2A2A] text-white hover:bg-[#FF6B35] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Main Image */}
        <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden border border-[#3A3A3A] bg-black shadow-2xl">
          <img
            src={currentImage}
            alt="Visualização da Tatuagem"
            className="max-h-[75vh] max-w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#FF6B35] transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#FF6B35] transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Counter */}
        {images.length > 1 && (
          <p className="text-xs font-semibold text-[#999999] mt-3 bg-[#2D2D2D] px-3 py-1 rounded-full border border-[#3A3A3A]">
            Imagem {index + 1} de {images.length}
          </p>
        )}
      </div>
    </div>
  );
};
