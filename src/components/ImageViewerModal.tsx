import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export type ImageItem = string | { url: string; label?: string };

interface ImageViewerModalProps {
  visible: boolean;
  images: ImageItem[];
  onClose: () => void;
  initialIndex?: number;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  onClose,
  initialIndex = 0,
}) => {
  const [index, setIndex] = useState(initialIndex);

  React.useEffect(() => {
    if (initialIndex >= 0 && initialIndex < images.length) {
      setIndex(initialIndex);
    } else {
      setIndex(0);
    }
  }, [initialIndex, images]);

  if (!visible || !images || images.length === 0) return null;

  const currentItem = images[index] || images[0];
  const currentUrl = typeof currentItem === 'string' ? currentItem : currentItem.url;
  const currentLabel = typeof currentItem === 'string' ? undefined : currentItem.label;

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
          className="absolute -top-12 right-0 p-2 rounded-full bg-[#2A2A2A] text-white hover:bg-[#FF6B35] transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        {/* Main Image Container */}
        <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden border border-[#3A3A3A] bg-black shadow-2xl">
          <img
            src={currentUrl}
            alt={currentLabel || 'Visualização da Tatuagem'}
            className="max-h-[75vh] max-w-full object-contain"
          />

          {currentLabel && (
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-[#FF6B35]/40 text-[#F5F5F5] text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <span>{currentLabel}</span>
            </div>
          )}

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

        {/* Counter and Labels navigation */}
        <div className="flex flex-col items-center gap-2 mt-3">
          {images.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1">
              {images.map((item, idx) => {
                const url = typeof item === 'string' ? item : item.url;
                const label = typeof item === 'string' ? `Foto ${idx + 1}` : (item.label || `Foto ${idx + 1}`);
                return (
                  <button
                    key={idx}
                    onClick={() => setIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      index === idx
                        ? 'bg-[#FF6B35] text-white shadow-md'
                        : 'bg-[#2D2D2D] text-[#999999] hover:text-[#F5F5F5] border border-[#3A3A3A]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[11px] font-semibold text-[#888888]">
            {index + 1} de {images.length}
          </p>
        </div>
      </div>
    </div>
  );
};
