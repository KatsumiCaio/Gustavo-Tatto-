import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, Download, X, Check, Apple, HelpCircle, ArrowDown } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'iphone' | 'android'>('iphone');

  useEffect(() => {
    // Detect if running in standalone mode (already installed on iPhone or Android)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect browser PWA install prompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    if (isIOS) {
      setActiveTab('iphone');
    } else if (/android/.test(userAgent)) {
      setActiveTab('android');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 my-8 relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/40 flex items-center justify-center text-[#FF6B35] shadow-lg">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#F5F5F5]">Instalar App no Celular</h3>
              <p className="text-xs text-[#999999]">Instale como um aplicativo no seu iPhone ou Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1C1C1C] text-[#999999] hover:text-white hover:bg-[#3A3A3A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isInstalled ? (
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-5 rounded-2xl text-center space-y-2">
            <div className="w-12 h-12 bg-[#25D366] text-black rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check size={28} strokeWidth={3} />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F5]">Aplicativo já instalado!</h4>
            <p className="text-xs text-[#CCCCCC]">
              O Gustavo Tattoo Agenda já está rodando como um app nativo no seu dispositivo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs for iPhone / Android */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#1C1C1C] rounded-2xl border border-[#3A3A3A]">
              <button
                onClick={() => setActiveTab('iphone')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'iphone'
                    ? 'bg-[#FF6B35] text-white shadow-lg'
                    : 'text-[#999999] hover:text-white'
                }`}
              >
                <Apple size={16} />
                <span>iPhone / iOS</span>
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'android'
                    ? 'bg-[#FF6B35] text-white shadow-lg'
                    : 'text-[#999999] hover:text-white'
                }`}
              >
                <Smartphone size={16} />
                <span>Android / PC</span>
              </button>
            </div>

            {/* TAB 1: IPHONE INSTRUCTIONS */}
            {activeTab === 'iphone' && (
              <div className="space-y-4 bg-[#1C1C1C] border border-[#3A3A3A] p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
                  <Apple size={16} />
                  <span>Como instalar no Safari (iPhone / iPad)</span>
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 bg-[#2D2D2D] p-3 rounded-xl border border-[#3A3A3A]">
                    <div className="w-7 h-7 bg-[#FF6B35] text-white font-extrabold text-xs rounded-full flex items-center justify-center flex-shrink-0 shadow">
                      1
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-[#F5F5F5] font-bold">Toque no botão Compartilhar no Safari</p>
                      <p className="text-[#999999]">
                        Na barra inferior do navegador Safari no iPhone, toque no ícone de{' '}
                        <span className="inline-flex items-center gap-1 bg-[#3A3A3A] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                          <Share size={12} /> Compartilhar
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 bg-[#2D2D2D] p-3 rounded-xl border border-[#3A3A3A]">
                    <div className="w-7 h-7 bg-[#FF6B35] text-white font-extrabold text-xs rounded-full flex items-center justify-center flex-shrink-0 shadow">
                      2
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-[#F5F5F5] font-bold">Selecione "Adicionar à Tela de Início"</p>
                      <p className="text-[#999999]">
                        Role as opções para baixo e clique em{' '}
                        <span className="inline-flex items-center gap-1 bg-[#3A3A3A] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                          <PlusSquare size={12} /> Adicionar à Tela de Início
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 bg-[#2D2D2D] p-3 rounded-xl border border-[#3A3A3A]">
                    <div className="w-7 h-7 bg-[#25D366] text-black font-extrabold text-xs rounded-full flex items-center justify-center flex-shrink-0 shadow">
                      3
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-[#F5F5F5] font-bold">Confirme no canto superior direito</p>
                      <p className="text-[#999999]">
                        Toque em <strong>"Adicionar"</strong>. O ícone do app aparecerá na tela inicial do seu iPhone como um aplicativo nativo!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FFB703]/10 border border-[#FFB703]/30 rounded-xl text-[11px] text-[#FFB703] flex items-center gap-2">
                  <HelpCircle size={16} className="flex-shrink-0" />
                  <span>
                    Dica: Abra esta página usando o navegador <strong>Safari</strong> no seu iPhone para que a opção apareça.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: ANDROID / PC INSTRUCTIONS */}
            {activeTab === 'android' && (
              <div className="space-y-4 bg-[#1C1C1C] border border-[#3A3A3A] p-5 rounded-2xl">
                {deferredPrompt ? (
                  <div className="space-y-3 text-center">
                    <p className="text-xs text-[#CCCCCC]">
                      Seu navegador suporta instalação com 1 clique! Clique no botão abaixo:
                    </p>
                    <button
                      onClick={handleNativeInstall}
                      className="w-full bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      <span>Instalar Agora no Aparelho</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-[#2D2D2D] p-3 rounded-xl border border-[#3A3A3A]">
                      <div className="w-7 h-7 bg-[#FF6B35] text-white font-extrabold text-xs rounded-full flex items-center justify-center flex-shrink-0 shadow">
                        1
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-[#F5F5F5] font-bold">Toque nos 3 pontos (Menu do Chrome)</p>
                        <p className="text-[#999999]">No canto superior do navegador Chrome no seu Android ou computador.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#2D2D2D] p-3 rounded-xl border border-[#3A3A3A]">
                      <div className="w-7 h-7 bg-[#25D366] text-black font-extrabold text-xs rounded-full flex items-center justify-center flex-shrink-0 shadow">
                        2
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-[#F5F5F5] font-bold">Clique em "Instalar Aplicativo" ou "Adicionar à Tela Inicial"</p>
                        <p className="text-[#999999]">O aplicativo será instalado instantaneamente no seu celular.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-[#3A3A3A] pt-4">
          <button
            onClick={onClose}
            className="bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#F5F5F5] font-bold text-xs py-2.5 px-5 rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
