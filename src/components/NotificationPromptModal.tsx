import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Bell, Smartphone, ShieldCheck, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';

interface NotificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPromptModal: React.FC<NotificationPromptModalProps> = ({ isOpen, onClose }) => {
  const { permissaoNotificacaoState, solicitarPermissaoNotificacaoSistema, dispararNotificacaoTeste } = useAgenda();
  const [success, setSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    const granted = await solicitarPermissaoNotificacaoSistema();
    if (granted) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    }
  };

  const handleTest = () => {
    dispararNotificacaoTeste();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 text-[#F5F5F5]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#999999] hover:text-white p-1 rounded-full hover:bg-[#3A3A3A] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E63946] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#FF6B35]/30">
            <Bell size={32} className="animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-[#F5F5F5]">
            Ativar Notificações no Celular
          </h3>
          <p className="text-xs text-[#999999] max-w-xs mx-auto leading-relaxed">
            Receba lembretes automáticos dos agendamentos diretamente na barra de notificações do seu celular ou computador.
          </p>
        </div>

        {/* Status Box */}
        {permissaoNotificacaoState === 'granted' || success ? (
          <div className="bg-[#25D366]/15 border border-[#25D366]/40 p-4 rounded-2xl text-center space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-[#25D366] font-bold text-sm">
              <CheckCircle2 size={20} />
              <span>Notificações Ativadas com Sucesso!</span>
            </div>
            <p className="text-xs text-[#CCCCCC]">
              Seu dispositivo já está preparado para receber avisos de sessões e lembretes.
            </p>
            <button
              onClick={handleTest}
              className="mt-2 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1EBE5D] transition-all inline-flex items-center gap-1.5 shadow-md"
            >
              <Sparkles size={14} />
              <span>Enviar Notificação de Teste</span>
            </button>
            {testSent && (
              <p className="text-[11px] font-semibold text-[#25D366] pt-1">
                ✓ Notificação enviada! Verifique seu celular.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#1C1C1C] border border-[#3A3A3A] p-4 rounded-2xl space-y-2 text-xs text-[#CCCCCC]">
              <div className="flex items-center gap-2 text-[#FFB703] font-bold">
                <ShieldCheck size={16} />
                <span>Por que ativar?</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-[#AAAAAA]">
                <li>Avisos sonoros e popups no horário do lembrete.</li>
                <li>Evite atrasos com clientes e mantenha sua agenda pontual.</li>
                <li>Funciona direto no Android, iPhone, PC e Mac.</li>
              </ul>
            </div>

            <button
              onClick={handleActivate}
              className="w-full bg-[#FF6B35] hover:bg-[#E63946] text-white text-sm font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-[#FF6B35]/25 flex items-center justify-center gap-2 group"
            >
              <Bell size={18} className="group-hover:scale-110 transition-transform" />
              <span>Permitir e Ativar Notificações</span>
            </button>
          </div>
        )}

        {/* Bottom dismiss link */}
        <div className="text-center pt-1">
          <button
            onClick={onClose}
            className="text-xs text-[#888888] hover:text-[#CCCCCC] underline font-medium"
          >
            {permissaoNotificacaoState === 'granted' ? 'Fechar' : 'Agora não, ativar mais tarde'}
          </button>
        </div>
      </div>
    </div>
  );
};
