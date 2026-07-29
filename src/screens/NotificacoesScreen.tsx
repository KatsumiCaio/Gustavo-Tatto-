import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Bell, Clock, Calendar, CheckCircle2, Trash2, ArrowLeft, CheckCheck, Sparkles, AlertCircle, Smartphone, Send, ShieldCheck } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const NotificacoesScreen: React.FC = () => {
  const {
    notificacoes,
    unreadNotificacoesCount,
    permissaoNotificacaoState,
    solicitarPermissaoNotificacaoSistema,
    dispararNotificacaoTeste,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    deleteNotificacao,
    navigate,
    goBack,
  } = useAgenda();

  const [filter, setFilter] = useState<'todas' | 'nao_lidas'>('todas');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testSentMsg, setTestSentMsg] = useState(false);

  const handleTestNotification = () => {
    const ok = dispararNotificacaoTeste();
    setTestSentMsg(true);
    setTimeout(() => setTestSentMsg(false), 4000);
  };

  const filteredNotifs = notificacoes.filter(n => {
    if (filter === 'nao_lidas') return !n.lida;
    return true;
  }).sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteNotificacao(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
              Lembretes & Notificações
              {unreadNotificacoesCount > 0 && (
                <span className="bg-[#E63946] text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {unreadNotificacoesCount} nova{unreadNotificacoesCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <p className="text-xs text-[#999999]">
              Notificações de agendamentos e lembretes configurados
            </p>
          </div>
        </div>

        {notificacoes.length > 0 && (
          <button
            onClick={marcarTodasNotificacoesLidas}
            disabled={unreadNotificacoesCount === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
              unreadNotificacoesCount > 0
                ? 'bg-[#1C1C1C] text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                : 'bg-[#1C1C1C] text-[#666666] border border-[#3A3A3A] cursor-not-allowed'
            }`}
          >
            <CheckCheck size={16} />
            <span>Marcar todas como lidas</span>
          </button>
        )}
      </div>

      {/* Smartphone Push Notifications Banner */}
      <div className="bg-gradient-to-r from-[#1E2522] to-[#2B221E] border border-[#FF6B35]/30 p-4 rounded-2xl shadow-md space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F5F5F5]">
                  Notificações do Sistema no Celular
                </h3>
                {permissaoNotificacaoState === 'granted' ? (
                  <span className="bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Ativadas no Celular
                  </span>
                ) : (
                  <span className="bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} /> Permissão Pendente
                  </span>
                )}
              </div>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                As notificações são entregues pelo <strong>Service Worker</strong> direto no seu celular/computador, mesmo com o aplicativo <strong>em segundo plano</strong> ou tela bloqueada.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {permissaoNotificacaoState !== 'granted' ? (
              <button
                onClick={solicitarPermissaoNotificacaoSistema}
                className="bg-[#FF6B35] hover:bg-[#E63946] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#FF6B35]/20 flex items-center gap-1.5"
              >
                <Bell size={15} />
                <span>Ativar no Celular</span>
              </button>
            ) : (
              <button
                onClick={handleTestNotification}
                className="bg-[#1C1C1C] hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Testar Notificação</span>
              </button>
            )}
          </div>
        </div>

        {testSentMsg && (
          <div className="text-xs font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 p-2.5 rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} />
            <span>Notificação enviada! Verifique a barra de notificações do seu aparelho/navegador.</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-3">
        <button
          onClick={() => setFilter('todas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'todas'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'bg-[#2D2D2D] text-[#999999] hover:text-white border border-[#3A3A3A]'
          }`}
        >
          Todas ({notificacoes.length})
        </button>
        <button
          onClick={() => setFilter('nao_lidas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'nao_lidas'
              ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
              : 'bg-[#2D2D2D] text-[#999999] hover:text-white border border-[#3A3A3A]'
          }`}
        >
          <span>Não Lidas</span>
          {unreadNotificacoesCount > 0 && (
            <span className="bg-[#E63946] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {unreadNotificacoesCount}
            </span>
          )}
        </button>
      </div>

      {/* List of Notifications */}
      <div className="space-y-3">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map(notif => {
            const formattedTattooDate = (notif.dataTatuagem || '').split('-').reverse().join('/');
            
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all shadow-md relative overflow-hidden ${
                  !notif.lida
                    ? 'bg-[#2A2421] border-[#FF6B35]/50 shadow-[#FF6B35]/5'
                    : 'bg-[#2D2D2D] border-[#3A3A3A] opacity-85'
                }`}
              >
                {!notif.lida && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#FF6B35]" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        !notif.lida
                          ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                          : 'bg-[#1C1C1C] text-[#888888]'
                      }`}
                    >
                      <Bell size={18} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#F5F5F5]">
                          {notif.cliente}
                        </span>
                        {!notif.lida ? (
                          <span className="bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Novo Lembrete
                          </span>
                        ) : (
                          <span className="bg-[#1C1C1C] text-[#888888] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Lida
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#CCCCCC] leading-relaxed">
                        {notif.mensagem}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#999999] pt-1">
                        <span className="flex items-center gap-1 font-medium text-[#FFB703]">
                          <Clock size={12} />
                          Lembrete: {notif.opcaoLembrete}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Sessão: {formattedTattooDate} às {notif.horarioTatuagem}h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.lida && (
                      <button
                        onClick={() => marcarNotificacaoLida(notif.id)}
                        className="p-1.5 rounded-lg text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                        title="Marcar como lida"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(notif.id)}
                      className="p-1.5 rounded-lg text-[#999999] hover:text-[#E63946] hover:bg-[#1C1C1C] transition-colors"
                      title="Excluir notificação"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Bottom link to view job */}
                <div className="mt-3 pt-2 border-t border-[#3A3A3A]/60 flex items-center justify-between text-xs">
                  <span className="text-[#777777] text-[10px]">
                    Criada em: {new Date(notif.criadaEm).toLocaleString('pt-BR')}
                  </span>
                  <button
                    onClick={() => {
                      if (!notif.lida) marcarNotificacaoLida(notif.id);
                      navigate('historico_trabalhos', { clienteNome: notif.cliente });
                    }}
                    className="text-[#FF6B35] font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    Ver no histórico / agenda &rarr;
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1C1C] text-[#888888] flex items-center justify-center mx-auto">
              <Bell size={28} />
            </div>
            <h3 className="text-sm font-bold text-[#F5F5F5]">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-xs text-[#999999] max-w-sm mx-auto">
              {filter === 'nao_lidas'
                ? 'Você não possui notificações pendentes para leitura.'
                : 'Configure lembretes ao agendar novos trabalhos para receber notificações.'}
            </p>
            <button
              onClick={() => navigate('add_tatuagem')}
              className="mt-2 bg-[#FF6B35] hover:bg-[#E63946] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>+ Agendar Tatuagem com Lembrete</span>
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Notificação"
        message="Tem certeza que deseja apagar este lembrete de notificação?"
      />
    </div>
  );
};
