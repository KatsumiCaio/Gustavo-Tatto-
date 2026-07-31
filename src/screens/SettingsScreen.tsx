import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { StorageService } from '../services/storage';
import { Trash2, History, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, DollarSign, Calendar, CheckCircle, XCircle, Sun, Moon, Palette } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const SettingsScreen: React.FC = () => {
  const { tatuagens, clientes, clearAllData, reloadData, navigate, theme, toggleTheme } = useAgenda();

  const [syncKey, setSyncKey] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const stats = {
    total: tatuagens.length,
    agendadas: tatuagens.filter(t => t.status === 'agendado').length,
    concluidas: tatuagens.filter(t => t.status === 'concluído').length,
    canceladas: tatuagens.filter(t => t.status === 'cancelado').length,
  };

  const faturamentoConcluido = tatuagens
    .filter(t => t.status === 'concluído')
    .reduce((acc, t) => acc + (t.valor || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleClearAll = () => {
    setIsConfirmClearOpen(true);
  };

  const handleConfirmClearAll = () => {
    clearAllData();
    setIsConfirmClearOpen(false);
    setFeedbackMsg('Todos os dados foram apagados com sucesso.');
    setTimeout(() => setFeedbackMsg(''), 3000);
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
    setFeedbackMsg('Backup baixado com sucesso!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.clientes)) StorageService.saveClientes(parsed.clientes);
          if (Array.isArray(parsed.tatuagens)) StorageService.saveTatuagens(parsed.tatuagens);
          
          reloadData();
          setFeedbackMsg('Todos os dados e backups foram restaurados com sucesso!');
          setTimeout(() => setFeedbackMsg(''), 3000);
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 text-[#4CAF50] text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} />
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

        <div className="bg-[#2D2D2D] border border-[#3A3A3A] border-l-8 border-l-[#FFB703] p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#999999] uppercase tracking-wider">
              Faturamento Concluído
            </p>
            <p className="text-3xl font-black text-[#FFB703] mt-1">
              {formatCurrency(faturamentoConcluido)}
            </p>
            <p className="text-xs text-[#999999] mt-1 italic">
              Baseado em {stats.concluidas} tatuagens com status concluído
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#FFB703]/10 border border-[#FFB703]/30 flex items-center justify-center text-3xl">
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
    </div>
  );
};
