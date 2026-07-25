import { Tatuagem, Cliente, Anamnese, FlashArt } from '../types';

const TATUAGENS_KEY = 'tatuagens_data';
const CLIENTES_KEY = 'clientes_data';
const ANAMNESES_KEY = 'anamneses_data';
const FLASHES_KEY = 'flashes_data';

const DB_NAME = 'GustavoTattooDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_store';

const sampleClientes: Cliente[] = [
  {
    id: 'c1',
    nome: 'Carlos Eduardo Santos',
    telefone: '(11) 98765-4321',
    email: 'carlos.edu@gmail.com',
    instagram: '@carlostattoo',
  },
  {
    id: 'c2',
    nome: 'Mariana Oliveira',
    telefone: '(11) 97123-8899',
    email: 'mari.oliveira@outlook.com',
    instagram: '@mari_oli',
  },
  {
    id: 'c3',
    nome: 'Lucas Gabriel Costa',
    telefone: '(11) 99887-1122',
    email: 'lucas.costa@tech.com',
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

const sampleFlashes: FlashArt[] = [
  {
    id: 'f1',
    titulo: 'Cobra Imperial & Adaga',
    estilo: 'Blackwork',
    tamanhoCm: '12 x 7 cm',
    preco: 450,
    status: 'disponivel',
    imagem: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=600&q=80',
    descricao: 'Desenho exclusivo em blackwork pesado com detalhes pontilhados e sombras marcantes.',
  },
  {
    id: 'f2',
    titulo: 'Rosa Botânica Minimalista',
    estilo: 'Fine Line',
    tamanhoCm: '8 x 4 cm',
    preco: 300,
    status: 'disponivel',
    imagem: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=600&q=80',
    descricao: 'Linhas extra finas e delicadas com sombreamento suave.',
  },
  {
    id: 'f3',
    titulo: 'Tigre Oriental Neotrad',
    estilo: 'Neotradicional',
    tamanhoCm: '16 x 10 cm',
    preco: 800,
    status: 'reservado',
    clienteReservado: 'Mariana Oliveira',
    imagem: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80',
    descricao: 'Composição oriental cheia de movimento e contraste elevado.',
  },
  {
    id: 'f4',
    titulo: 'Crânio Barco Pirata',
    estilo: 'Old School',
    tamanhoCm: '10 x 10 cm',
    preco: 500,
    status: 'disponivel',
    imagem: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80',
    descricao: 'Estilo tradicional americano com traço firme e preto sólido.',
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
  // Sync initialization (e.g. restore from IDB if LocalStorage was cleared)
  async initStorage(): Promise<void> {
    try {
      const keys = [CLIENTES_KEY, TATUAGENS_KEY, ANAMNESES_KEY, FLASHES_KEY];
      for (const k of keys) {
        const lsData = localStorage.getItem(k);
        if (!lsData) {
          const idbData = await getIDB(k);
          if (idbData) {
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
      if (!data) {
        this.saveClientes(sampleClientes);
        return sampleClientes;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading clientes:', e);
      return sampleClientes;
    }
  },

  saveClientes(clientes: Cliente[]): void {
    try {
      localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
    } catch (e) {
      console.error('Error saving clientes to localStorage:', e);
    }
    saveIDB(CLIENTES_KEY, clientes);
  },

  getTatuagens(): Tatuagem[] {
    try {
      const data = localStorage.getItem(TATUAGENS_KEY);
      if (!data) {
        this.saveTatuagens(sampleTatuagens);
        return sampleTatuagens;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading tatuagens:', e);
      return sampleTatuagens;
    }
  },

  saveTatuagens(tatuagens: Tatuagem[]): void {
    try {
      localStorage.setItem(TATUAGENS_KEY, JSON.stringify(tatuagens));
    } catch (e) {
      console.error('Error saving tatuagens to localStorage:', e);
    }
    saveIDB(TATUAGENS_KEY, tatuagens);
  },

  getAnamneses(): Anamnese[] {
    try {
      const data = localStorage.getItem(ANAMNESES_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading anamneses:', e);
      return [];
    }
  },

  saveAnamneses(anamneses: Anamnese[]): void {
    try {
      localStorage.setItem(ANAMNESES_KEY, JSON.stringify(anamneses));
    } catch (e) {
      console.error('Error saving anamneses to localStorage:', e);
    }
    saveIDB(ANAMNESES_KEY, anamneses);
  },

  getFlashes(): FlashArt[] {
    try {
      const data = localStorage.getItem(FLASHES_KEY);
      if (!data) {
        this.saveFlashes(sampleFlashes);
        return sampleFlashes;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading flashes:', e);
      return sampleFlashes;
    }
  },

  saveFlashes(flashes: FlashArt[]): void {
    try {
      localStorage.setItem(FLASHES_KEY, JSON.stringify(flashes));
    } catch (e) {
      console.error('Error saving flashes to localStorage:', e);
    }
    saveIDB(FLASHES_KEY, flashes);
  },

  clearAll(): void {
    try {
      localStorage.removeItem(TATUAGENS_KEY);
      localStorage.removeItem(CLIENTES_KEY);
      localStorage.removeItem(ANAMNESES_KEY);
      localStorage.removeItem(FLASHES_KEY);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    saveIDB(TATUAGENS_KEY, null);
    saveIDB(CLIENTES_KEY, null);
    saveIDB(ANAMNESES_KEY, null);
    saveIDB(FLASHES_KEY, null);
  },
};
