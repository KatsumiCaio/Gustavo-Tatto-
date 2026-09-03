import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storage';
import { formatValor } from '../utils/privacy';
import { Trash2, History, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, DollarSign, Calendar, CheckCircle, XCircle, Sun, Moon, Palette, Eye, EyeOff, Shield, UserCheck, KeyRound, LogOut, Lock, Code2, Award } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlterarSenhaModal } from '../components/AlterarSenhaModal';
import { AdminDevPanel } from '../components/AdminDevPanel';

export const SettingsScreen: React.FC = () => {
  const { tatuagens, clientes, clearAllData, reloadData, navigate, theme, toggleTheme, modoPrivacidade, toggleModoPrivacidade } = useAgenda();
  const { currentUser, logout, autoLockMinutes, setAutoLockMinutes } = useAuth();

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isAlterarSenhaOpen, setIsAlterarSenhaOpen] = useState(false);

  const stats = {
    total: tatuagens.length,
    agendadas: tatuagens.filter(t => t.status === 'agendado').length,
    concluidas: tatuagens.filter(t => t.status === 'concluído').length,
    canceladas: tatuagens.filter(t => t.status === 'cancelado').length,
  };

  const faturamentoConcluido = tatuagens
    .filter(t => t.status === 'concluído')
    .reduce((acc, t) => acc + (t.valor || 0), 0);

  const handleClearAll = () => {
    setIsConfirmClearOpen(true);
  };

  const handleConfirmClearAll = () => {
    clearAllData();
    setIsConfirmClearOpen(false);
    setFeedbackType('success');
    setFeedbackMsg('Todos os dados foram apagados com sucesso.');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      clientes,
      tatuagens,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gustavo_tattoo_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackType('success');
    setFeedbackMsg('Backup seguro baixado com sucesso!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && typeof parsed === 'object') {
          // Sanitize imported clientes
          if (Array.isArray(parsed.clientes)) {
            const cleanClientes = parsed.clientes.map((c: any) => ({
              id: String(c.id || Math.random().toString(36).substring(2)),
              nome: String(c.nome || '').trim().slice(0, 100),
              telefone: String(c.telefone || '').trim().slice(0, 30),
              instagram: c.instagram ? String(c.instagram).trim().slice(0, 50) : '',
              observacoes: c.observacoes ? String(c.observacoes).trim().slice(0, 500) : '',
              dataCadastro: c.dataCadastro || new Date().toISOString(),
            }));
            StorageService.saveClientes(cleanClientes);
          }

          // Sanitize imported tatuagens
          if (Array.isArray(parsed.tatuagens)) {
            const cleanTatuagens = parsed.tatuagens.map((t: any) => ({
              id: String(t.id || Math.random().toString(36).substring(2)),
              clienteId: String(t.clienteId || ''),
              descricao: String(t.descricao || '').trim().slice(0, 300),
              estilo: String(t.estilo || '').slice(0, 50),
              localCorpo: String(t.localCorpo || '').slice(0, 50),
              valor: typeof t.valor === 'number' ? Math.max(0, t.valor) : 0,
              data: t.data || new Date().toISOString().split('T')[0],
              horario: t.horario || '14:00',
              duracaoMinutos: typeof t.duracaoMinutos === 'number' ? t.duracaoMinutos : 120,
              status: ['agendado', 'concluído', 'cancelado'].includes(t.status) ? t.status : 'agendado',
              fotosReferencia: Array.isArray(t.fotosReferencia) ? t.fotosReferencia.slice(0, 10) : [],
              fotosResultado: Array.isArray(t.fotosResultado) ? t.fotosResultado.slice(0, 10) : [],
              observacoes: t.observacoes ? String(t.observacoes).slice(0, 500) : '',
            }));
            StorageService.saveTatuagens(cleanTatuagens);
          }
          
          reloadData();
          setFeedbackType('success');
          setFeedbackMsg('Dados restaurados com validação de segurança com sucesso!');
          setTimeout(() => setFeedbackMsg(''), 4000);
        } else {
          setFeedbackType('error');
          setFeedbackMsg('Estrutura de backup inválida ou não reconhecida.');
          setTimeout(() => setFeedbackMsg(''), 4000);
        }
      } catch (err) {
        setFeedbackType('error');
        setFeedbackMsg('Erro ao processar o arquivo de backup. Formato JSON inválido.');
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in ${
          feedbackType === 'error'
            ? 'bg-[#E63946]/15 border-[#E63946]/40 text-[#FF6B6B]'
            : 'bg-[#4CAF50]/15 border-[#4CAF50]/30 text-[#4CAF50]'
        }`}>
          {feedbackType === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Studio Header Brand */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-3xl shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-[#FF6B35]/20 border border-[#FF6B35]/40 shrink-0">
            GT
          </div>
          <div>
            <h1 className="text-xl font-black text-[#F5F5F5] leading-tight">Gustavo Tattoo Studio</h1>
            <p className="text-xs text-[#999999] mt-0.5">Sistema de Agenda & Gestão de Estúdio</p>
            <a
              href="https://instagram.com/gustavotomaz_tattoo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:underline mt-1"
            >
              @gustavotomaz_tattoo
            </a>
          </div>
        </div>
      </div>

      {/* Theme / Appearance Card */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-3">
          <Palette size={20} className="text-[#FF6B35]" />
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5]">Aparência do Aplicativo</h2>
            <p className="text-xs text-[#999999]">Escolha entre o Modo Escuro (Dark) e Modo Claro (Light)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              theme === 'dark'
                ? 'bg-[#1C1C1C] border-[#FF6B35] text-[#FF6B35] shadow-md shadow-[#FF6B35]/10'
                : 'bg-[#2A2A2A] border-[#3A3A3A] text-[#999999] hover:text-[#F5F5F5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#2D2D2D] text-[#FFB703]">
                <Moon size={22} />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold">Modo Escuro</span>
                <span className="text-[11px] opacity-75">Design Studio Dark</span>
              </div>
            </div>
            {theme === 'dark' && <CheckCircle size={20} className="text-[#FF6B35] shrink-0" />}
          </button>

          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              theme === 'light'
                ? 'bg-[#F4F5F7] border-[#FF6B35] text-[#FF6B35] shadow-md'
                : 'bg-[#2A2A2A] border-[#3A3A3A] text-[#999999] hover:text-[#F5F5F5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#E2E8F0] text-[#FF6B35]">
                <Sun size={22} />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold">Modo Claro</span>
                <span className="text-[11px] opacity-75">Design Clean Light</span>
              </div>
            </div>
            {theme === 'light' && <CheckCircle size={20} className="text-[#FF6B35] shrink-0" />}
          </button>
        </div>
      </div>

      {/* Privacy Mode Card */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-3">
          <Shield size={20} className="text-[#4CAF50]" />
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5]">Modo de Privacidade e Proteção</h2>
            <p className="text-xs text-[#999999]">Oculte valores faturados, telefones e nomes de clientes na tela</p>
          </div>
        </div>

        <button
          onClick={toggleModoPrivacidade}
          className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            modoPrivacidade
              ? 'bg-[#4CAF50]/15 border-[#4CAF50] text-[#4CAF50] shadow-lg shadow-[#4CAF50]/10'
              : 'bg-[#2A2A2A] border-[#3A3A3A] text-[#F5F5F5] hover:border-[#4CAF50]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${modoPrivacidade ? 'bg-[#4CAF50] text-white' : 'bg-[#1C1C1C] text-[#999999]'}`}>
              {modoPrivacidade ? <EyeOff size={22} /> : <Eye size={22} />}
            </div>
            <div className="text-left">
              <span className="block text-sm font-extrabold">
                {modoPrivacidade ? 'Modo de Privacidade ATIVADO' : 'Modo de Privacidade DESATIVADO'}
              </span>
              <span className="text-xs opacity-80">
                {modoPrivacidade
                  ? 'Valores faturados e dados pessoais dos clientes estão mascarados com •••••'
                  : 'Clique para ocultar dados sigilosos e proteger informações na tela'}
              </span>
            </div>
          </div>
          <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            modoPrivacidade ? 'bg-[#4CAF50] text-white' : 'bg-[#1C1C1C] text-[#999999]'
          }`}>
            {modoPrivacidade ? 'Ativo' : 'Inativo'}
          </span>
        </button>
      </div>

      {/* Developer Admin Panel (Exclusively visible when authenticated as Developer Caio) */}
      {currentUser?.isDev && (
        <div className="space-y-2">
          <AdminDevPanel />
        </div>
      )}

      {/* Security & Access Management Card */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className={currentUser?.isDev ? "text-[#8B5CF6]" : "text-[#FF6B35]"} />
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5]">Segurança & Conta de Acesso</h2>
              <p className="text-xs text-[#999999]">Controle da tela de login e credenciais do estúdio</p>
            </div>
          </div>
          {currentUser?.isDev ? (
            <span className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C4B5FD] text-[11px] font-extrabold flex items-center gap-1">
              <Code2 size={12} /> Desenvolvedor Master
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF9E79] text-[11px] font-extrabold">
              Tatuador
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#222222] border border-[#333333]">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm border ${
              currentUser?.isDev 
                ? 'bg-[#8B5CF6]/20 text-[#C4B5FD] border-[#8B5CF6]/40 shadow-md shadow-[#8B5CF6]/20'
                : 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30'
            }`}>
              {currentUser?.isDev ? <Code2 size={22} /> : <UserCheck size={22} />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <span>{currentUser?.name || 'Gustavo'}</span>
                {currentUser?.isDev && (
                  <span className="text-[10px] bg-[#8B5CF6]/30 text-[#D8B4FE] px-1.5 py-0.5 rounded font-mono font-bold">
                    @{currentUser.username}
                  </span>
                )}
              </p>
              <p className="text-xs text-[#999999]">
                {currentUser?.role || 'Tatuador & Administrador'} • <span className="text-[#4CAF50] font-semibold">Sessão Autenticada</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAlterarSenhaOpen(true)}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-[#2A2A2A] hover:bg-[#333333] text-[#F5F5F5] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#3A3A3A] transition-all cursor-pointer"
            >
              <KeyRound size={14} className="text-[#FFB703]" />
              <span>Alterar Minha Senha</span>
            </button>

            <button
              onClick={() => logout()}
              className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-[#E63946]/15 hover:bg-[#E63946]/25 text-[#FF6B6B] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#E63946]/40 transition-all cursor-pointer"
              title="Encerrar sessão e voltar para a tela de login"
            >
              <LogOut size={14} />
              <span>Bloquear / Sair</span>
            </button>
          </div>
        </div>

        {/* Quick Developer Access notice when logged in as Gustavo */}
        {!currentUser?.isDev && (
          <div className="p-3.5 rounded-2xl bg-[#1E1B29] border border-[#8B5CF6]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#D8B4FE] flex items-center gap-1.5">
                <Code2 size={14} className="text-[#A78BFA]" />
                Perfil de Desenvolvedor (Caio)
              </span>
              <p className="text-[11px] text-[#A699CC]">
                Para mudar senhas de usuários e acessar informações técnicas do sistema, acesse com a conta do desenvolvedor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => logout('Acesse com o usuário Caio para utilizar as ferramentas de desenvolvedor.')}
              className="py-1.5 px-3 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#D8B4FE] text-xs font-bold border border-[#8B5CF6]/40 transition-all cursor-pointer shrink-0"
            >
              Entrar como Desenvolvedor
            </button>
          </div>
        )}

        {/* Auto-Lock Configuration */}
        <div className="p-4 rounded-2xl bg-[#222222] border border-[#333333] space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                <Lock size={14} className="text-[#FF6B35]" />
                Bloqueio Automático por Inatividade
              </span>
              <p className="text-[11px] text-[#888888]">
                Protege contra olhares curiosos no estúdio se o aparelho for deixado sobre a bancada
              </p>
            </div>
            <span className="text-xs font-black text-[#FFB703] bg-[#2A2A2A] px-2.5 py-1 rounded-lg border border-[#3A3A3A]">
              {autoLockMinutes > 0 ? `${autoLockMinutes} min` : 'Desativado'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[5, 15, 30, 0].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setAutoLockMinutes(mins)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  autoLockMinutes === mins
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-[#FF6B35]/20'
                    : 'bg-[#181818] text-[#888888] border-[#333333] hover:text-[#F5F5F5] hover:border-[#555555]'
                }`}
              >
                {mins === 0 ? 'Nunca' : `${mins} min`}
              </button>
            ))}
          </div>
        </div>

        {/* Anti-Data Leak Diagnostic Audit */}
        <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#333333] space-y-2.5">
          <p className="text-xs font-bold text-[#4CAF50] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#4CAF50]" />
            Auditoria de Segurança contra Vazamento de Dados
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#222222] text-[#CCCCCC]">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
              <span>Regras Firestore: <strong>Acesso restrito autenticado</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#222222] text-[#CCCCCC]">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
              <span>Proteção Força Bruta: <strong>Máx. 5 tentativas</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#222222] text-[#CCCCCC]">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
              <span>Bloqueio de Sessão: <strong>{autoLockMinutes > 0 ? `${autoLockMinutes} min ocioso` : 'Manual'}</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#222222] text-[#CCCCCC]">
              <span className={`w-2 h-2 rounded-full ${modoPrivacidade ? 'bg-[#4CAF50]' : 'bg-[#FFB703]'}`} />
              <span>Máscara de Tela: <strong>{modoPrivacidade ? 'Ativada (•••••)' : 'Disponível no topo'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2 border-l-4 border-[#FF6B35] pl-3">
          📊 Resumo Geral
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl border-t-4 border-t-[#FFB703] shadow-lg text-center">
            <span className="text-2xl mb-1 block">📋</span>
            <span className="text-2xl font-black text-[#F5F5F5]">{stats.total}</span>
            <p className="text-xs font-semibold text-[#999999] mt-0.5">Total de Trabalhos</p>
          </div>

          <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl border-t-4 border-t-[#FF6B35] shadow-lg text-center">
            <span className="text-2xl mb-1 block">📅</span>
            <span className="text-2xl font-black text-[#F5F5F5]">{stats.agendadas}</span>
            <p className="text-xs font-semibold text-[#999999] mt-0.5">Agendadas</p>
          </div>

          <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl border-t-4 border-t-[#4CAF50] shadow-lg text-center">
            <span className="text-2xl mb-1 block">✅</span>
            <span className="text-2xl font-black text-[#4CAF50]">{stats.concluidas}</span>
            <p className="text-xs font-semibold text-[#999999] mt-0.5">Concluídas</p>
          </div>

          <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl border-t-4 border-t-[#E63946] shadow-lg text-center">
            <span className="text-2xl mb-1 block">❌</span>
            <span className="text-2xl font-black text-[#E63946]">{stats.canceladas}</span>
            <p className="text-xs font-semibold text-[#999999] mt-0.5">Canceladas</p>
          </div>
        </div>
      </div>

      {/* Faturamento Card */}
      <div>
        <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2 border-l-4 border-[#FFB703] pl-3">
          💰 Faturamento
        </h2>

        <div 
          onClick={() => navigate('faturamento')}
          className="bg-[#2D2D2D] border border-[#3A3A3A] border-l-8 border-l-[#FFB703] hover:border-[#FFB703] p-6 rounded-3xl shadow-xl flex items-center justify-between cursor-pointer transition-all hover:bg-[#333333]"
        >
          <div>
            <p className="text-xs font-bold text-[#999999] uppercase tracking-wider">
              Faturamento Concluído
            </p>
            <p className="text-3xl font-black text-[#FFB703] mt-1">
              {formatValor(faturamentoConcluido, modoPrivacidade)}
            </p>
            <p className="text-xs text-[#FF6B35] font-bold mt-2 flex items-center gap-1">
              Ver detalhamento mês a mês →
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#FFB703]/10 border border-[#FFB703]/30 flex items-center justify-center text-3xl shrink-0">
            💵
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2 border-l-4 border-[#FF6B35] pl-3">
          ⚙️ Ações e Histórico
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('historico_trabalhos')}
            className="bg-[#2D2D2D] hover:bg-[#333333] border border-[#3A3A3A] p-5 rounded-2xl text-left shadow-lg transition-all flex items-center gap-4 group"
          >
            <div className="p-3 rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] group-hover:scale-110 transition-transform">
              <History size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F5F5F5]">Histórico de Trabalhos</p>
              <p className="text-xs text-[#999999] mt-0.5">Visualize e gerencie todos os trabalhos cadastrados</p>
            </div>
          </button>

          <button
            onClick={handleClearAll}
            className="bg-[#2D2D2D] hover:bg-[#E63946]/10 border border-[#3A3A3A] hover:border-[#E63946] p-5 rounded-2xl text-left shadow-lg transition-all flex items-center gap-4 group"
          >
            <div className="p-3 rounded-xl bg-[#E63946]/10 text-[#E63946] group-hover:scale-110 transition-transform">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#E63946]">Limpar Todos os Dados</p>
              <p className="text-xs text-[#999999] mt-0.5">Apaga todos os registros de tatuagens e clientes</p>
            </div>
          </button>
        </div>
      </div>

      {/* Backup and Sync */}
      <div>
        <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2 border-l-4 border-[#FF6B35] pl-3">
          🔁 Backup e Restauração Local
        </h2>

        <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-6 rounded-3xl shadow-xl space-y-4">
          <p className="text-xs text-[#999999]">
            Exporte uma cópia completa dos seus agendamentos e clientes em arquivo JSON para guardar com segurança ou transferir para outro navegador.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E63946] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Download size={16} /> Baixar Arquivo de Backup (.json)
            </button>

            <label className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F5F5F5] border border-[#3A3A3A] font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all">
              <Upload size={16} className="text-[#FFB703]" /> Restaurar de Backup (.json)
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-6 rounded-3xl shadow-xl text-center space-y-2">
        <h3 className="text-base font-bold text-[#F5F5F5]">Gustavo Tattoo - Agenda</h3>
        <p className="text-xs font-semibold text-[#FF6B35]">Versão 1.0.0 (Web Edition)</p>
        <p className="text-xs text-[#999999] max-w-md mx-auto">
          Aplicação desenvolvida sob medida para tatuadores profissionais gerenciarem agenda, clientes e acompanhamento de sessões com agilidade.
        </p>
      </div>

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Apagar Todos os Dados"
        message="Você tem certeza que deseja apagar TODOS os dados e clientes do sistema? Esta ação é irreversível."
        confirmText="Apagar Tudo"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsConfirmClearOpen(false)}
      />

      <AlterarSenhaModal
        isOpen={isAlterarSenhaOpen}
        onClose={() => setIsAlterarSenhaOpen(false)}
      />
    </div>
  );
};
