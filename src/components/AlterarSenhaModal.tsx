import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AlterarSenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlterarSenhaModal: React.FC<AlterarSenhaModalProps> = ({ isOpen, onClose }) => {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 4) {
      setError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setSuccess(false);
        }, 1500);
      } else {
        setError(res.error || 'Erro ao alterar senha.');
      }
    } catch {
      setError('Falha inesperada ao atualizar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#242424] border border-[#3A3A3A] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-[#F5F5F5]">
        <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF6B35]/20 text-[#FF6B35]">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold">Alterar Senha de Acesso</h3>
              <p className="text-xs text-[#999999]">Atualize sua credencial de segurança</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#333333] text-[#999999] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E63946]/15 border border-[#E63946]/40 text-[#FF6B6B] text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#4CAF50]/15 border border-[#4CAF50]/40 text-[#4CAF50] text-xs font-semibold">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>Senha alterada com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual"
                required
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3A3A3A] rounded-xl text-sm text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3A3A3A] rounded-xl text-sm text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3A3A3A] rounded-xl text-sm text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 text-xs text-[#999999] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showPasswords ? 'Ocultar senhas' : 'Exibir senhas'}</span>
            </button>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-[#3A3A3A]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#2A2A2A] hover:bg-[#333333] text-[#CCCCCC] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || success}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
