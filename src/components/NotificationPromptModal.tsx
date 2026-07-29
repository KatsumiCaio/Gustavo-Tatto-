import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Bell, Smartphone, ShieldCheck, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';

interface NotificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPromptModal: React.FC<NotificationPromptModalProps> = ({ isOpen, onClose }) => {
  const { permissaoNotificacaoState, solicitarPermissaoNotificacaoSistema, dispararNotificacaoTeste, dispararNotificacaoTesteComDelay } = useAgenda();
  const [success, setSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [delayTestActive, setDelayTestActive] = useState(false);

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

  const handleDelayTest = () => {
    dispararNotificacaoTesteComDelay(5);
    setDelayTestActive(true);
    setTimeout(() => setDelayTestActive(false), 6000);
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
            Receba lembretes automáticos dos agendamentos diretamente na barra de notificações do seu celular mesmo com o app minimizado.
          </p>
        </div>

        {/* Status Box */}
        {permissaoNotificacaoState === 'granted' || success ? (
          <div className="bg-[#25D366]/15 border border-[#25D366]/40 p-4 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-[#25D366] font-bold text-sm">
              <CheckCircle2 size={20} />
              <span>Notificações em Segundo Plano Ativadas!</span>
            </div>
            <p className="text-xs text-[#CCCCCC] leading-relaxed">
              O Service Worker já está registrado no seu aparelho para agendar os alertas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                onClick={handleTest}
                className="w-full sm:w-auto bg-[#25D366] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl hover:bg-[#1EBE5D] transition-all inline-flex items-center justify-center gap-1.5 shadow-md"
              >
                <Sparkles size={14} />
                <span>Teste Agora</span>
              </button>

              <button
                onClick={handleDelayTest}
                className="w-full sm:w-auto bg-[#FF6B35] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl hover:bg-[#E63946] transition-all inline-flex items-center justify-center gap-1.5 shadow-md"
              >
                <Smartphone size={14} />
                <span>Testar em 5s (Feche o App)</span>
              </button>
            </div>

            {testSent && (
              <p className="text-[11px] font-semibold text-[#25D366] pt-1 animate-fade-in">
                ✓ Notificação enviada! Verifique o topo do seu dispositivo.
              </p>
            )}

            {delayTestActive && (
              <div className="bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-xs font-bold p-2.5 rounded-xl animate-pulse text-center">
                ⏳ Notificação agendada! Minimized/Feche a janela agora. Chegará em 5 segundos!
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#1C1C1C] border border-[#3A3A3A] p-4 rounded-2xl space-y-2.5 text-xs text-[#CCCCCC]">
              <div className="flex items-center gap-2 text-[#FFB703] font-bold">
                <ShieldCheck size={16} />
                <span>Como funciona com o app fechado?</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-[#AAAAAA]">
                <li><strong className="text-[#F5F5F5]">Service Worker Ativo:</strong> Mantém o cronograma de alertas registrado no seu navegador/sistema.</li>
                <li><strong className="text-[#F5F5F5]">Para iOS / iPhone:</strong> Toque em "Compartilhar" &gt; "Adicionar à Tela de Início" para permitir notificações em 2º plano.</li>
                <li><strong className="text-[#F5F5F5]">Para Android:</strong> Clique em "Permitir" e mantenha a permissão de Notificação concedida.</li>
              </ul>
            </div>

            <button
              onClick={handleActivate}
              className="w-full bg-[#FF6B35] hover:bg-[#E63946] text-white text-sm font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-[#FF6B35]/25 flex items-center justify-center gap-2 group"
            >
              <Bell size={18} className="group-hover:scale-110 transition-transform" />
              <span>Permitir e Ativar no Celular</span>
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
