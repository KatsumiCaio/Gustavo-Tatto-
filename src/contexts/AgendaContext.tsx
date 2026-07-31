import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Tatuagem, Cliente, Notificacao, ScreenName, NavigationParams } from '../types';
import { StorageService } from '../services/storage';
import { SystemNotificationService } from '../utils/notificationSystem';

export function calcularDataHoraNotificacao(
  data: string,
  horario: string,
  opcao: string = 'mesmo_horario',
  dataCustom?: string,
  horarioCustom?: string
): { dataHoraIso: string; labelHorario: string } {
  if (opcao === 'personalizado' && dataCustom && horarioCustom) {
    const formattedDate = dataCustom.split('-').reverse().join('/');
    return {
      dataHoraIso: `${dataCustom} ${horarioCustom}`,
      labelHorario: `${formattedDate} às ${horarioCustom}h`,
    };
  }

  const [year, month, day] = (data || '').split('-').map(Number);
  const [hours, minutes] = (horario || '12:00').split(':').map(Number);
  const jobDate = new Date(year || 2026, (month || 1) - 1, day || 1, hours || 0, minutes || 0);

  let notifyDate = new Date(jobDate.getTime());
  let label = '';

  switch (opcao) {
    case '15min':
      notifyDate.setMinutes(notifyDate.getMinutes() - 15);
      label = '15 min antes';
      break;
    case '30min':
      notifyDate.setMinutes(notifyDate.getMinutes() - 30);
      label = '30 min antes';
      break;
    case '1hora':
      notifyDate.setHours(notifyDate.getHours() - 1);
      label = '1 hora antes';
      break;
    case '2horas':
      notifyDate.setHours(notifyDate.getHours() - 2);
      label = '2 horas antes';
      break;
    case '1dia':
      notifyDate.setDate(notifyDate.getDate() - 1);
      label = '1 dia antes';
      break;
    case 'mesmo_horario':
    default:
      label = 'No horário da sessão';
      break;
  }

  const yyyy = notifyDate.getFullYear();
  const mm = String(notifyDate.getMonth() + 1).padStart(2, '0');
  const dd = String(notifyDate.getDate()).padStart(2, '0');
  const hh = String(notifyDate.getHours()).padStart(2, '0');
  const min = String(notifyDate.getMinutes()).padStart(2, '0');

  return {
    dataHoraIso: `${yyyy}-${mm}-${dd} ${hh}:${min}`,
    labelHorario: `${label} (${dd}/${mm} às ${hh}:${min}h)`,
  };
}

interface AgendaContextType {
  tatuagens: Tatuagem[];
  clientes: Cliente[];
  notificacoes: Notificacao[];
  unreadNotificacoesCount: number;
  currentScreen: ScreenName;
  navParams: NavigationParams;
  permissaoNotificacaoState: 'granted' | 'denied' | 'default';
  solicitarPermissaoNotificacaoSistema: () => Promise<boolean>;
  dispararNotificacaoTeste: () => boolean;
  dispararNotificacaoTesteComDelay: (delaySegundos?: number) => boolean;
  navigate: (screen: ScreenName, params?: NavigationParams) => void;
  goBack: () => void;
  addTatuagem: (tatuagem: Omit<Tatuagem, 'id'>) => void;
  updateTatuagem: (id: string, updates: Partial<Tatuagem>) => void;
  deleteTatuagem: (id: string) => void;
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasNotificacoesLidas: () => void;
  deleteNotificacao: (id: string) => void;
  clearAllData: () => void;
  reloadData: () => void;
  getTatuagensForDate: (date: Date) => Tatuagem[];
  getTatuagensForWeek: (date: Date) => Tatuagem[];
  getTatuagensForMonth: (date: Date) => Tatuagem[];
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tatuagens, setTatuagens] = useState<Tatuagem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main');
  const [navParams, setNavParams] = useState<NavigationParams>({});
  const [history, setHistory] = useState<{ screen: ScreenName; params: NavigationParams }[]>([]);
  const [permissaoNotificacaoState, setPermissaoNotificacaoState] = useState<'granted' | 'denied' | 'default'>(
    SystemNotificationService.getPermissionState() as any
  );

  const firedNotifIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    StorageService.subscribeSync({
      onTatuagens: (tats) => setTatuagens(tats),
      onClientes: (clis) => setClientes(clis),
      onNotificacoes: (notifs) => setNotificacoes(notifs),
    });

    const initAndLoad = async () => {
      await StorageService.initStorage();
      loadAllData();
      setPermissaoNotificacaoState(SystemNotificationService.getPermissionState() as any);
    };
    initAndLoad();
  }, []);

  // Background interval check for system alerts on mobile/browser & Service Worker sync
  useEffect(() => {
    if (notificacoes.length > 0) {
      SystemNotificationService.syncScheduledWithServiceWorker(notificacoes);
    }

    const checkScheduledNotifications = () => {
      if (notificacoes.length === 0) return;

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const currentNowIso = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

      notificacoes.forEach(n => {
        if (!n.dataHoraNotificacao) return;

        // If notification time is reached or passed and not yet fired in system
        if (n.dataHoraNotificacao <= currentNowIso && !firedNotifIds.current.has(n.id)) {
          firedNotifIds.current.add(n.id);
          SystemNotificationService.sendNotification({
            title: `📅 Lembrete Tattoo: ${n.cliente}`,
            body: n.mensagem,
            tag: n.id,
          });
        }
      });
    };

    checkScheduledNotifications();
    const interval = setInterval(checkScheduledNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [notificacoes]);

  const solicitarPermissaoNotificacaoSistema = async (): Promise<boolean> => {
    const ok = await SystemNotificationService.requestPermission();
    setPermissaoNotificacaoState(SystemNotificationService.getPermissionState() as any);
    if (ok) {
      SystemNotificationService.sendNotification({
        title: '🔔 Notificações Ativadas!',
        body: 'Você receberá os lembretes das sessões de tatuagem diretamente na tela do seu celular.',
        tag: 'welcome-notif',
      });
    }
    return ok;
  };

  const dispararNotificacaoTeste = (): boolean => {
    return SystemNotificationService.sendNotification({
      title: '⚡ Teste de Notificação Instantânea',
      body: 'As notificações do sistema Gustavo Tattoo estão ativadas no seu dispositivo!',
      tag: 'test-notif-' + Date.now(),
    });
  };

  const dispararNotificacaoTesteComDelay = (delaySegundos: number = 5): boolean => {
    return SystemNotificationService.scheduleDelayedNotification({
      title: '🔔 Teste com App Fechado / Minimizado',
      body: 'As notificações do aplicativo Gustavo Tattoo funcionam em segundo plano no seu celular!',
      tag: 'test-delayed-notif-' + Date.now(),
    }, delaySegundos * 1000);
  };

  const loadAllData = () => {
    const loadedTats = StorageService.getTatuagens();
    const loadedClis = StorageService.getClientes();
    const loadedNotifs = StorageService.getNotificacoes();
    setTatuagens(loadedTats);
    setClientes(loadedClis);
    setNotificacoes(loadedNotifs);
  };

  const syncNotificationForTatuagem = (tatuagem: Tatuagem, currentNotifs: Notificacao[]): Notificacao[] => {
    // Remove existing notification for this tattoo
    const filtered = currentNotifs.filter(n => n.tatuagemId !== tatuagem.id);

    if (!tatuagem.notificacaoAtivar) {
      return filtered;
    }

    const { dataHoraIso, labelHorario } = calcularDataHoraNotificacao(
      tatuagem.data,
      tatuagem.horario,
      tatuagem.notificacaoOpcao || 'mesmo_horario',
      tatuagem.notificacaoDataPersonalizada,
      tatuagem.notificacaoHorarioPersonalizado
    );

    const formattedTattooDate = (tatuagem.data || '').split('-').reverse().join('/');

    const newNotif: Notificacao = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tatuagemId: tatuagem.id,
      cliente: tatuagem.cliente,
      descricao: tatuagem.descricao,
      dataTatuagem: tatuagem.data,
      horarioTatuagem: tatuagem.horario,
      dataHoraNotificacao: dataHoraIso,
      opcaoLembrete: labelHorario,
      mensagem: `Lembrete de agendamento: ${tatuagem.cliente} (${tatuagem.descricao}) marcado para ${formattedTattooDate} às ${tatuagem.horario}h.`,
      lida: false,
      criadaEm: new Date().toISOString(),
    };

    return [newNotif, ...filtered];
  };

  const navigate = (screen: ScreenName, params: NavigationParams = {}) => {
    setHistory(prev => [...prev, { screen: currentScreen, params: navParams }]);
    setCurrentScreen(screen);
    setNavParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory(prev => prev.slice(0, prev.length - 1));
      setCurrentScreen(last.screen);
      setNavParams(last.params);
    } else {
      setCurrentScreen('main');
      setNavParams({});
    }
  };

  const addTatuagem = (tatuagemData: Omit<Tatuagem, 'id'>) => {
    const newTatuagem: Tatuagem = {
      ...tatuagemData,
      id: 'tat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    const updatedTats = [newTatuagem, ...tatuagens];
    setTatuagens(updatedTats);
    StorageService.saveSingleTatuagem(newTatuagem);
    StorageService.saveTatuagens(updatedTats);

    // Sync notification
    const updatedNotifs = syncNotificationForTatuagem(newTatuagem, notificacoes);
    setNotificacoes(updatedNotifs);
    StorageService.saveNotificacoes(updatedNotifs);
  };

  const updateTatuagem = (id: string, updates: Partial<Tatuagem>) => {
    const updatedTats = tatuagens.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTatuagens(updatedTats);
    const targetTat = updatedTats.find(t => t.id === id);
    if (targetTat) {
      StorageService.saveSingleTatuagem(targetTat);
    }
    StorageService.saveTatuagens(updatedTats);

    if (targetTat) {
      const updatedNotifs = syncNotificationForTatuagem(targetTat, notificacoes);
      setNotificacoes(updatedNotifs);
      StorageService.saveNotificacoes(updatedNotifs);
    }
  };

  const deleteTatuagem = (id: string) => {
    const updatedTats = tatuagens.filter(t => t.id !== id);
    setTatuagens(updatedTats);
    StorageService.deleteSingleTatuagem(id);
    StorageService.saveTatuagens(updatedTats);

    const targetNotifs = notificacoes.filter(n => n.tatuagemId === id);
    targetNotifs.forEach(n => StorageService.deleteSingleNotificacao(n.id));
    const updatedNotifs = notificacoes.filter(n => n.tatuagemId !== id);
    setNotificacoes(updatedNotifs);
    StorageService.saveNotificacoes(updatedNotifs);
  };

  const addCliente = (clienteData: Omit<Cliente, 'id'>) => {
    const newCliente: Cliente = {
      ...clienteData,
      id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    const updated = [...clientes, newCliente];
    setClientes(updated);
    StorageService.saveSingleCliente(newCliente);
    StorageService.saveClientes(updated);
  };

  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    const oldClient = clientes.find(c => c.id === id);
    const updatedClientes = clientes.map(c => (c.id === id ? { ...c, ...updates } : c));
    setClientes(updatedClientes);
    const targetCli = updatedClientes.find(c => c.id === id);
    if (targetCli) {
      StorageService.saveSingleCliente(targetCli);
    }
    StorageService.saveClientes(updatedClientes);

    // If client name or phone changed, update associated tattoos & notificacoes
    if (oldClient && (updates.nome || updates.telefone)) {
      const oldNameLower = oldClient.nome.toLowerCase();
      const newName = updates.nome || oldClient.nome;
      const newPhone = updates.telefone || oldClient.telefone;

      const updatedTats = tatuagens.map(t => {
        if (t.cliente.toLowerCase() === oldNameLower) {
          return {
            ...t,
            cliente: newName,
            telefone: newPhone,
          };
        }
        return t;
      });
      setTatuagens(updatedTats);
      StorageService.saveTatuagens(updatedTats);

      const updatedNotifs = notificacoes.map(n => {
        if (n.cliente.toLowerCase() === oldNameLower) {
          return {
            ...n,
            cliente: newName,
          };
        }
        return n;
      });
      setNotificacoes(updatedNotifs);
      StorageService.saveNotificacoes(updatedNotifs);
    }
  };

  const deleteCliente = (id: string) => {
    const updated = clientes.filter(c => c.id !== id);
    setClientes(updated);
    StorageService.deleteSingleCliente(id);
    StorageService.saveClientes(updated);
  };

  const marcarNotificacaoLida = (id: string) => {
    const updated = notificacoes.map(n => (n.id === id ? { ...n, lida: true } : n));
    setNotificacoes(updated);
    StorageService.saveNotificacoes(updated);
  };

  const marcarTodasNotificacoesLidas = () => {
    const updated = notificacoes.map(n => ({ ...n, lida: true }));
    setNotificacoes(updated);
    StorageService.saveNotificacoes(updated);
  };

  const deleteNotificacao = (id: string) => {
    const updated = notificacoes.filter(n => n.id !== id);
    setNotificacoes(updated);
    StorageService.saveNotificacoes(updated);
  };

  const clearAllData = () => {
    StorageService.clearAll();
    setTatuagens([]);
    setClientes([]);
    setNotificacoes([]);
  };

  const reloadData = () => {
    loadAllData();
  };

  const unreadNotificacoesCount = notificacoes.filter(n => !n.lida).length;

  const getTatuagensForDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return tatuagens.filter(t => t.data === dateStr);
  };

  const getTatuagensForWeek = (date: Date) => {
    if (!date || isNaN(date.getTime())) return [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return tatuagens.filter(t => {
      const [y, m, d] = t.data.split('-').map(Number);
      if (!y || !m || !d) return false;
      const tDate = new Date(y, m - 1, d);
      return tDate >= startOfWeek && tDate <= endOfWeek;
    });
  };

  const getTatuagensForMonth = (date: Date) => {
    if (!date || isNaN(date.getTime())) return [];
    const year = date.getFullYear();
    const month = date.getMonth();

    return tatuagens.filter(t => {
      const [y, m] = t.data.split('-').map(Number);
      if (!y || !m) return false;
      return y === year && m - 1 === month;
    });
  };

  return (
    <AgendaContext.Provider
      value={{
        tatuagens,
        clientes,
        notificacoes,
        unreadNotificacoesCount,
        currentScreen,
        navParams,
        permissaoNotificacaoState,
        solicitarPermissaoNotificacaoSistema,
        dispararNotificacaoTeste,
        dispararNotificacaoTesteComDelay,
        navigate,
        goBack,
        addTatuagem,
        updateTatuagem,
        deleteTatuagem,
        addCliente,
        updateCliente,
        deleteCliente,
        marcarNotificacaoLida,
        marcarTodasNotificacoesLidas,
        deleteNotificacao,
        clearAllData,
        reloadData,
        getTatuagensForDate,
        getTatuagensForWeek,
        getTatuagensForMonth,
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda deve ser usado dentro de AgendaProvider');
  }
  return context;
};
