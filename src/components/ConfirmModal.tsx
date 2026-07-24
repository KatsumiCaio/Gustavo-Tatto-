import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-[#FF6B35]/10 text-[#FF6B35]'}`}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5]">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#999999] hover:text-white hover:bg-[#1C1C1C]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#999999] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2 border-t border-[#3A3A3A] pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#999999] hover:text-white hover:bg-[#1C1C1C] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
              isDanger
                ? 'bg-[#E63946] hover:bg-[#c12a36]'
                : 'bg-[#FF6B35] hover:bg-[#E63946]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
