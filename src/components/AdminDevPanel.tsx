import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAgenda } from '../contexts/AgendaContext';
import { UserAccountSummary } from '../services/authService';
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  Database,
  Calendar,
  Clock,
  Code2,
  HardDrive,
  RefreshCw,
  Award
} from 'lucide-react';

export const AdminDevPanel: React.FC = () => {
  const { currentUser, getAllUsers, adminChangeUserPassword, adminCreateUser, adminDeleteUser } = useAuth();
  const { clientes, tatuagens, notificacoes } = useAgenda();

  const [usersList, setUsersList] = useState<UserAccountSummary[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'new_user'>('users');

  // Password change state
  const [selectedUser, setSelectedUser] = useState<UserAccountSummary | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New user state
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState('Tatuador');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Storage metrics
  const [storageEstimate, setStorageEstimate] = useState<{ localStorageKB: number; totalKeys: number }>({ localStorageKB: 0, totalKeys: 0 });

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const list = await getAllUsers();
      setUsersList(list);
    } catch {
      // ignore
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();

    // Calculate localStorage usage
    try {
      let totalLength = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalLength += (localStorage[key]?.length || 0) + key.length;
        }
      }
      const kb = Math.round((totalLength * 2) / 1024);
      setStorageEstimate({ localStorageKB: kb, totalKeys: Object.keys(localStorage).length });
    } catch {
      // ignore
    }
  }, []);

  const handleOpenChangePassword = (user: UserAccountSummary) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setFeedback(null);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFeedback(null);

    if (newPassword.length < 4) {
      setFeedback({ type: 'error', message: 'A nova senha deve possuir pelo menos 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A confirmação não coincide com a nova senha digitada.' });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await adminChangeUserPassword(selectedUser.username, newPassword);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Senha de @${selectedUser.username} (${selectedUser.displayName}) alterada e gravada com sucesso no banco de dados na nuvem (Firestore)! Já está válida em qualquer aparelho.`,
        });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setSelectedUser(null);
          setFeedback(null);
        }, 2000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao alterar senha.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha inesperada ao atualizar senha do usuário.' });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!newUsername.trim() || !newDisplayName.trim() || !newUserPassword.trim()) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    if (newUserPassword.length < 4) {
      setFeedback({ type: 'error', message: 'A senha inicial deve possuir no mínimo 4 caracteres.' });
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await adminCreateUser({
        username: newUsername,
        displayName: newDisplayName,
        role: newRole,
        password: newUserPassword,
        isDev: isNewUserAdmin,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Usuário @${newUsername.toLowerCase()} criado com sucesso!`,
        });
        setNewUsername('');
        setNewDisplayName('');
        setNewUserPassword('');
        setNewRole('Tatuador');
        setIsNewUserAdmin(false);
        await loadUsers();
        setTimeout(() => {
          setActiveTab('users');
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao criar usuário.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha inesperada ao criar novo usuário.' });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário @${username}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const res = await adminDeleteUser(username);
    if (res.success) {
      setFeedback({ type: 'success', message: `Usuário @${username} removido com sucesso.` });
      await loadUsers();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Não foi possível excluir o usuário.' });
    }
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return 'Nunca acessou';
    try {
      const date = new Date(iso);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return iso;
    }
  };

  const totalFaturado = tatuagens
    .filter(t => t.status === 'concluído')
    .reduce((acc, t) => acc + (t.valor || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-gradient-to-b from-[#1F1B2E] to-[#171520] border-2 border-[#8B5CF6]/40 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-6 text-[#F5F5F5] relative overflow-hidden">
      {/* Decorative developer ambient light */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#8B5CF6]/25 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 border border-[#A78BFA]/40 shrink-0">
            <Code2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Painel do Desenvolvedor • Caio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/30 text-[#C4B5FD] text-[10px] font-extrabold uppercase tracking-wider border border-[#8B5CF6]/50">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#B4A8D8] mt-0.5">
              Gestão mestre de usuários, redefinição de senhas e auditoria geral do sistema
            </p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          disabled={isLoadingUsers}
          className="self-start sm:self-auto py-2 px-3 rounded-xl bg-[#2A2342] hover:bg-[#382E59] text-[#C4B5FD] text-xs font-bold flex items-center gap-1.5 border border-[#8B5CF6]/30 transition-all cursor-pointer"
          title="Recarregar dados de usuários"
        >
          <RefreshCw size={13} className={isLoadingUsers ? 'animate-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Global Feedback notification */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-[#4CAF50]/15 border-[#4CAF50]/40 text-[#4CAF50]'
              : 'bg-[#E63946]/15 border-[#E63946]/40 text-[#FF6B6B]'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#352C52] pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
              : 'bg-[#231E36] text-[#A699CC] hover:text-white hover:bg-[#2D2645]'
          }`}
        >
          <Users size={15} />
          <span>Usuários do Sistema ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
              : 'bg-[#231E36] text-[#A699CC] hover:text-white hover:bg-[#2D2645]'
          }`}
        >
          <Activity size={15} />
          <span>Informações do Sistema & Banco</span>
        </button>

        <button
          onClick={() => setActiveTab('new_user')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'new_user'
              ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
              : 'bg-[#231E36] text-[#A699CC] hover:text-white hover:bg-[#2D2645]'
          }`}
        >
          <UserPlus size={15} />
          <span>+ Novo Usuário</span>
        </button>
      </div>

      {/* TAB 1: USERS LIST & PASSWORD MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-[#A78BFA]" />
              Contas com Acesso ao Gustavo Tattoo Studio
            </h3>
            <span className="text-[11px] text-[#A699CC]">
              Como desenvolvedor, você pode alterar a senha de qualquer conta sem precisar da senha anterior.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {usersList.map((user) => {
              const isCurrentUser = user.username.toLowerCase() === currentUser?.username.toLowerCase();
              const isDevUser = user.isDev;

              return (
                <div
                  key={user.id || user.username}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDevUser
                      ? 'bg-[#261E3D] border-[#8B5CF6]/50 shadow-md'
                      : 'bg-[#1E192E] border-[#382E59] hover:border-[#4E4078]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black border ${
                          isDevUser
                            ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white border-[#A78BFA]/50 shadow-md'
                            : 'bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] text-white border-[#FF6B35]/40'
                        }`}
                      >
                        {user.displayName.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-white">{user.displayName}</span>
                          <span className="text-xs font-mono font-bold text-[#A78BFA]">@{user.username}</span>

                          {isDevUser ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8B5CF6]/30 text-[#D8B4FE] text-[10px] font-extrabold border border-[#8B5CF6]/40">
                              <Award size={10} /> Desenvolvedor Master
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF9E79] text-[10px] font-extrabold border border-[#FF6B35]/30">
                              Tatuador
                            </span>
                          )}

                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] text-[10px] font-bold border border-[#4CAF50]/30">
                              Você está conectado
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#A699CC]">
                          {user.role} • Cadastrado em: {formatDateTime(user.createdAt)}
                        </p>

                        <p className="text-[11px] text-[#8678AA] flex items-center gap-1">
                          <Clock size={11} />
                          <span>Último Acesso: <strong>{formatDateTime(user.lastLogin)}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenChangePassword(user)}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D71F8] hover:to-[#8B5CF6] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/20 transition-all cursor-pointer"
                        title={`Redefinir senha de ${user.displayName}`}
                      >
                        <KeyRound size={13} />
                        <span>Mudar Senha</span>
                      </button>

                      {!isDevUser && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.username)}
                          className="p-2 rounded-xl bg-[#E63946]/15 hover:bg-[#E63946]/25 text-[#FF6B6B] border border-[#E63946]/30 transition-all cursor-pointer"
                          title={`Excluir usuário @${user.username}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* IN-PLACE PASSWORD CHANGER MODAL / DRAWER FOR THE SELECTED USER */}
                  {selectedUser?.username === user.username && (
                    <div className="mt-4 pt-4 border-t border-[#3E3361] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#D8B4FE] flex items-center gap-1.5">
                          <Lock size={13} className="text-[#A78BFA]" />
                          Redefinir Senha de: <strong>{user.displayName} (@{user.username})</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(null)}
                          className="text-[11px] text-[#A699CC] hover:text-white underline cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>

                      <form onSubmit={handleSavePassword} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider">
                              Nova Senha
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Digite a nova senha"
                                required
                                minLength={4}
                                className="w-full pl-3 pr-10 py-2.5 bg-[#14111E] border border-[#4C3E75] rounded-xl text-xs text-white placeholder-[#786C9C] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#786C9C] hover:text-white"
                              >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider">
                              Confirmar Nova Senha
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repita a nova senha"
                              required
                              minLength={4}
                              className="w-full px-3 py-2.5 bg-[#14111E] border border-[#4C3E75] rounded-xl text-xs text-white placeholder-[#786C9C] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="py-2 px-3 rounded-xl bg-[#231E36] hover:bg-[#2C2545] text-[#A699CC] text-xs font-semibold"
                          >
                            Fechar
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmittingPassword}
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#9D71F8] hover:to-[#7C3AED] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/30 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingPassword ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Salvando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={14} />
                                <span>Confirmar Nova Senha</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM DIAGNOSTICS & INFORMATION */}
      {activeTab === 'system' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Clientes */}
            <div className="p-4 rounded-2xl bg-[#201B33] border border-[#3C325E] space-y-1">
              <span className="text-[11px] font-bold text-[#A699CC] uppercase tracking-wider flex items-center gap-1.5">
                <Users size={13} className="text-[#8B5CF6]" /> Total Clientes
              </span>
              <p className="text-2xl font-black text-white">{clientes.length}</p>
              <p className="text-[10px] text-[#8678AA]">Cadastros completos com WhatsApp</p>
            </div>

            {/* Tatuagens */}
            <div className="p-4 rounded-2xl bg-[#201B33] border border-[#3C325E] space-y-1">
              <span className="text-[11px] font-bold text-[#A699CC] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-[#FF6B35]" /> Sessões & Tattoos
              </span>
              <p className="text-2xl font-black text-white">{tatuagens.length}</p>
              <p className="text-[10px] text-[#8678AA]">
                {tatuagens.filter(t => t.status === 'concluído').length} concluídas • {tatuagens.filter(t => t.status === 'agendado').length} agendadas
              </p>
            </div>

            {/* Faturamento */}
            <div className="p-4 rounded-2xl bg-[#201B33] border border-[#3C325E] space-y-1">
              <span className="text-[11px] font-bold text-[#A699CC] uppercase tracking-wider flex items-center gap-1.5">
                <Award size={13} className="text-[#4CAF50]" /> Faturamento Total
              </span>
              <p className="text-2xl font-black text-[#4CAF50]">{formatCurrency(totalFaturado)}</p>
              <p className="text-[10px] text-[#8678AA]">Soma de sessões finalizadas</p>
            </div>

            {/* Armazenamento */}
            <div className="p-4 rounded-2xl bg-[#201B33] border border-[#3C325E] space-y-1">
              <span className="text-[11px] font-bold text-[#A699CC] uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive size={13} className="text-[#38BDF8]" /> Armazenamento
              </span>
              <p className="text-2xl font-black text-white">~{storageEstimate.localStorageKB} KB</p>
              <p className="text-[10px] text-[#8678AA]">{storageEstimate.totalKeys} chaves locais salvas</p>
            </div>
          </div>

          {/* Technical Environment & Security Details */}
          <div className="p-4 rounded-2xl bg-[#1A1629] border border-[#3A3059] space-y-3">
            <h4 className="text-xs font-bold text-[#C4B5FD] uppercase tracking-wider flex items-center gap-2">
              <Database size={15} className="text-[#A78BFA]" />
              Informações Técnicas & Arquitetura de Dados
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between">
                <span className="text-[#A699CC]">Autenticação Ativa:</span>
                <strong className="text-white">Caio (Desenvolvedor)</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between">
                <span className="text-[#A699CC]">Criptografia / Hashing:</span>
                <strong className="text-white">SHA-256 com Salt dinâmico</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between">
                <span className="text-[#A699CC]">Proteção Força Bruta:</span>
                <strong className="text-[#4CAF50]">Ativa (Máx. 5 tentativas)</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between">
                <span className="text-[#A699CC]">Armazenamento de Fotos:</span>
                <strong className="text-white">IndexedDB (alta resolução)</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between">
                <span className="text-[#A699CC]">Notificações no Sistema:</span>
                <strong className="text-white">{notificacoes.length} registradas</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between">
                <span className="text-[#A699CC]">Segurança Firestore:</span>
                <strong className="text-[#4CAF50]">Hardened (Restrito a auth)</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#231E38] text-[#D8B4FE] flex items-center justify-between sm:col-span-2">
                <span className="text-[#A699CC]">Persistência de Senhas:</span>
                <strong className="text-[#4CAF50] flex items-center gap-1">
                  <Database size={12} />
                  Nuvem (Firestore / auth_accounts) + Sincronização em Tempo Real
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE NEW USER */}
      {activeTab === 'new_user' && (
        <div className="p-4 rounded-2xl bg-[#1D182E] border border-[#382E59] space-y-4 animate-fadeIn">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus size={16} className="text-[#A78BFA]" />
              Cadastrar Novo Membro ou Tatuador
            </h3>
            <p className="text-xs text-[#A699CC]">
              Crie uma conta de acesso para um tatuador convidado, assistente ou sócio do estúdio.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Ex: Lucas Silva"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#14111E] border border-[#4C3E75] rounded-xl text-xs text-white placeholder-[#786C9C] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
                  Nome de Usuário (Login)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#786C9C] text-xs font-mono font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="lucas"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#14111E] border border-[#4C3E75] rounded-xl text-xs text-white placeholder-[#786C9C] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
                  Cargo / Especialidade
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Ex: Tatuador Blackwork"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#14111E] border border-[#4C3E75] rounded-xl text-xs text-white placeholder-[#786C9C] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
                  Senha Inicial
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 4 dígitos"
                  required
                  minLength={4}
                  className="w-full px-3.5 py-2.5 bg-[#14111E] border border-[#4C3E75] rounded-xl text-xs text-white placeholder-[#786C9C] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#14111E] border border-[#382E59]">
              <input
                type="checkbox"
                id="isNewUserAdmin"
                checked={isNewUserAdmin}
                onChange={(e) => setIsNewUserAdmin(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1A1629] border-[#4C3E75] text-[#8B5CF6] focus:ring-0 cursor-pointer accent-[#8B5CF6]"
              />
              <label htmlFor="isNewUserAdmin" className="text-xs text-[#CCCCCC] cursor-pointer">
                Conceder privilégios de Administrador ao usuário
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="py-2.5 px-4 rounded-xl bg-[#231E36] hover:bg-[#2C2545] text-[#A699CC] text-xs font-semibold"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isCreatingUser}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#9D71F8] hover:to-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/30 cursor-pointer disabled:opacity-50"
              >
                {isCreatingUser ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Cadastrar Usuário</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
