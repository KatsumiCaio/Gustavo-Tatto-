import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tatuagem, Cliente, Anamnese, FlashArt, ScreenName, NavigationParams } from '../types';
import { StorageService } from '../services/storage';

interface AgendaContextType {
  tatuagens: Tatuagem[];
  clientes: Cliente[];
  anamneses: Anamnese[];
  flashes: FlashArt[];
  currentScreen: ScreenName;
  navParams: NavigationParams;
  navigate: (screen: ScreenName, params?: NavigationParams) => void;
  goBack: () => void;
  addTatuagem: (tatuagem: Omit<Tatuagem, 'id'>) => void;
  updateTatuagem: (id: string, updates: Partial<Tatuagem>) => void;
  deleteTatuagem: (id: string) => void;
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addAnamnese: (anamnese: Omit<Anamnese, 'id'>) => Anamnese;
  deleteAnamnese: (id: string) => void;
  addFlash: (flash: Omit<FlashArt, 'id'>) => void;
  updateFlash: (id: string, updates: Partial<FlashArt>) => void;
  deleteFlash: (id: string) => void;
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
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [flashes, setFlashes] = useState<FlashArt[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main');
  const [navParams, setNavParams] = useState<NavigationParams>({});
  const [history, setHistory] = useState<{ screen: ScreenName; params: NavigationParams }[]>([]);

  useEffect(() => {
    const initAndLoad = async () => {
      await StorageService.initStorage();
      loadAllData();
    };
    initAndLoad();
  }, []);

  const loadAllData = () => {
    const loadedTats = StorageService.getTatuagens();
    const loadedClis = StorageService.getClientes();
    const loadedAnams = StorageService.getAnamneses();
    const loadedFlashes = StorageService.getFlashes();
    setTatuagens(loadedTats);
    setClientes(loadedClis);
    setAnamneses(loadedAnams);
    setFlashes(loadedFlashes);
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
    const updated = [newTatuagem, ...tatuagens];
    setTatuagens(updated);
    StorageService.saveTatuagens(updated);
  };

  const updateTatuagem = (id: string, updates: Partial<Tatuagem>) => {
    const updated = tatuagens.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTatuagens(updated);
    StorageService.saveTatuagens(updated);
  };

  const deleteTatuagem = (id: string) => {
    const updated = tatuagens.filter(t => t.id !== id);
    setTatuagens(updated);
    StorageService.saveTatuagens(updated);
  };

  const addCliente = (clienteData: Omit<Cliente, 'id'>) => {
    const newCliente: Cliente = {
      ...clienteData,
      id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    const updated = [...clientes, newCliente];
    setClientes(updated);
    StorageService.saveClientes(updated);
  };

  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    const oldClient = clientes.find(c => c.id === id);
    const updatedClientes = clientes.map(c => (c.id === id ? { ...c, ...updates } : c));
    setClientes(updatedClientes);
    StorageService.saveClientes(updatedClientes);

    // If client name or phone changed, update associated tattoos
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
    }
  };

  const deleteCliente = (id: string) => {
    const updated = clientes.filter(c => c.id !== id);
    setClientes(updated);
    StorageService.saveClientes(updated);
  };

  const addAnamnese = (anamneseData: Omit<Anamnese, 'id'>): Anamnese => {
    const newAnamnese: Anamnese = {
      ...anamneseData,
      id: 'anam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    const updated = [newAnamnese, ...anamneses];
    setAnamneses(updated);
    StorageService.saveAnamneses(updated);
    return newAnamnese;
  };

  const deleteAnamnese = (id: string) => {
    const updated = anamneses.filter(a => a.id !== id);
    setAnamneses(updated);
    StorageService.saveAnamneses(updated);
  };

  const addFlash = (flashData: Omit<FlashArt, 'id'>) => {
    const newFlash: FlashArt = {
      ...flashData,
      id: 'flash_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    };
    const updated = [newFlash, ...flashes];
    setFlashes(updated);
    StorageService.saveFlashes(updated);
  };

  const updateFlash = (id: string, updates: Partial<FlashArt>) => {
    const updated = flashes.map(f => (f.id === id ? { ...f, ...updates } : f));
    setFlashes(updated);
    StorageService.saveFlashes(updated);
  };

  const deleteFlash = (id: string) => {
    const updated = flashes.filter(f => f.id !== id);
    setFlashes(updated);
    StorageService.saveFlashes(updated);
  };

  const clearAllData = () => {
    StorageService.clearAll();
    setTatuagens([]);
    setClientes([]);
    setAnamneses([]);
    setFlashes([]);
  };

  const reloadData = () => {
    loadAllData();
  };

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
        anamneses,
        flashes,
        currentScreen,
        navParams,
        navigate,
        goBack,
        addTatuagem,
        updateTatuagem,
        deleteTatuagem,
        addCliente,
        updateCliente,
        deleteCliente,
        addAnamnese,
        deleteAnamnese,
        addFlash,
        updateFlash,
        deleteFlash,
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
