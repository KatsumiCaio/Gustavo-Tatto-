import { Tatuagem, Cliente, Notificacao } from '../types';

const TATUAGENS_KEY = 'tatuagens_data';
const CLIENTES_KEY = 'clientes_data';
const NOTIFICACOES_KEY = 'notificacoes_data';
const INITIALIZED_KEY = 'app_initialized_v2';

const DB_NAME = 'GustavoTattooDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_store';

const sampleClientes: Cliente[] = [
  {
    id: 'c1',
    nome: 'Carlos Eduardo Santos',
    telefone: '(11) 98765-4321',
    instagram: '@carlostattoo',
  },
  {
    id: 'c2',
    nome: 'Mariana Oliveira',
    telefone: '(11) 97123-8899',
    instagram: '@mari_oli',
  },
  {
    id: 'c3',
    nome: 'Lucas Gabriel Costa',
    telefone: '(11) 99887-1122',
    instagram: '@lucascosta_fit',
  },
];

const today = new Date().toISOString().split('T')[0];

const sampleTatuagens: Tatuagem[] = [
  {
    id: 't1',
    cliente: 'Carlos Eduardo Santos',
    descricao: 'Leão em Blackwork no antebraço com hachuras e sombras intensas',
    data: today,
    horario: '14:00',
    local: 'Antebraço direito',
    valor: 850,
    status: 'agendado',
    telefone: '(11) 98765-4321',
    observacoes: 'Cliente prefere agulha 3RL para detalhes finos.',
  },
  {
    id: 't2',
    cliente: 'Mariana Oliveira',
    descricao: 'Ramos de Peônias em Fine Line com toques de pontilhismo suave',
    data: today,
    horario: '17:30',
    local: 'Costela esquerda',
    valor: 600,
    status: 'agendado',
    telefone: '(11) 97123-8899',
    observacoes: 'Sessão única, pele sensível.',
  },
  {
    id: 't3',
    cliente: 'Lucas Gabriel Costa',
    descricao: 'Fechamento de costas - Dragão Oriental Neotradicional',
    data: '2026-07-20',
    horario: '10:00',
    local: 'Costas completas',
    valor: 1500,
    status: 'concluído',
    telefone: '(11) 99887-1122',
    observacoes: 'Sessão 1 de 3 finalizada com sucesso.',
  },
];

// Helper to interact with IndexedDB as a persistent backup store
function openIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveIDB(key: string, value: any): Promise<void> {
  const db = await openIDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
  } catch (e) {
    console.error('IndexedDB save error:', e);
  }
}

async function getIDB(key: string): Promise<any> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export const StorageService = {
  // Sync initialization (seeds sample data ONLY on very first launch)
  async initStorage(): Promise<void> {
    try {
      const isInit = localStorage.getItem(INITIALIZED_KEY) || (await getIDB(INITIALIZED_KEY));
      if (!isInit) {
        // Very first launch ever: seed sample data
        this.saveClientes(sampleClientes);
        this.saveTatuagens(sampleTatuagens);
        localStorage.setItem(INITIALIZED_KEY, 'true');
        saveIDB(INITIALIZED_KEY, 'true');
        return;
      }

      // If already initialized, restore from IndexedDB if LocalStorage was lost
      const keys = [CLIENTES_KEY, TATUAGENS_KEY, NOTIFICACOES_KEY];
      for (const k of keys) {
        const lsData = localStorage.getItem(k);
        if (lsData === null) {
          const idbData = await getIDB(k);
          if (idbData !== null && idbData !== undefined) {
            try {
              localStorage.setItem(k, JSON.stringify(idbData));
            } catch (e) {
              console.warn('LocalStorage copy failed (using IDB):', e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Storage init error:', e);
    }
  },

  getClientes(): Cliente[] {
    try {
      const data = localStorage.getItem(CLIENTES_KEY);
      if (data === null || data === undefined) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading clientes:', e);
      return [];
    }
  },

  saveClientes(clientes: Cliente[]): void {
    try {
      localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
      localStorage.setItem(INITIALIZED_KEY, 'true');
    } catch (e) {
      console.error('Error saving clientes to localStorage:', e);
    }
    saveIDB(CLIENTES_KEY, clientes);
    saveIDB(INITIALIZED_KEY, 'true');
  },

  getTatuagens(): Tatuagem[] {
    try {
      const data = localStorage.getItem(TATUAGENS_KEY);
      if (data === null || data === undefined) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading tatuagens:', e);
      return [];
    }
  },

  saveTatuagens(tatuagens: Tatuagem[]): void {
    try {
      localStorage.setItem(TATUAGENS_KEY, JSON.stringify(tatuagens));
      localStorage.setItem(INITIALIZED_KEY, 'true');
    } catch (e) {
      console.error('Error saving tatuagens to localStorage:', e);
    }
    saveIDB(TATUAGENS_KEY, tatuagens);
    saveIDB(INITIALIZED_KEY, 'true');
  },

  getNotificacoes(): Notificacao[] {
    try {
      const data = localStorage.getItem(NOTIFICACOES_KEY);
      if (data === null || data === undefined) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading notificacoes:', e);
      return [];
    }
  },

  saveNotificacoes(notificacoes: Notificacao[]): void {
    try {
      localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(notificacoes));
      localStorage.setItem(INITIALIZED_KEY, 'true');
    } catch (e) {
      console.error('Error saving notificacoes to localStorage:', e);
    }
    saveIDB(NOTIFICACOES_KEY, notificacoes);
    saveIDB(INITIALIZED_KEY, 'true');
  },

  clearAll(): void {
    this.saveClientes([]);
    this.saveTatuagens([]);
    this.saveNotificacoes([]);
    try {
      localStorage.setItem(INITIALIZED_KEY, 'true');
    } catch (e) {
      console.error('Error setting initialized key:', e);
    }
    saveIDB(INITIALIZED_KEY, 'true');
  },
};
