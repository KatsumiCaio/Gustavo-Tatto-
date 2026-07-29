import { Tatuagem, Cliente, Notificacao } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';

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

// Helper to interact with IndexedDB as local fallback
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
  const dbInst = await openIDB();
  if (!dbInst) return;
  try {
    const tx = dbInst.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
  } catch (e) {
    console.error('IndexedDB save error:', e);
  }
}

async function getIDB(key: string): Promise<any> {
  const dbInst = await openIDB();
  if (!dbInst) return null;
  return new Promise((resolve) => {
    try {
      const tx = dbInst.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function sanitizeForFirestore(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

// Callbacks for real-time Firebase syncing to React state
type SyncCallback = {
  onTatuagens?: (tats: Tatuagem[]) => void;
  onClientes?: (clis: Cliente[]) => void;
  onNotificacoes?: (notifs: Notificacao[]) => void;
};

let syncCallbacks: SyncCallback = {};

export const StorageService = {
  subscribeSync(callbacks: SyncCallback) {
    syncCallbacks = callbacks;
  },

  async initStorage(): Promise<void> {
    try {
      // Setup Firestore real-time listeners for all collections
      onSnapshot(collection(db, 'clientes'), (snapshot) => {
        const items: Cliente[] = [];
        snapshot.forEach((docSnap) => items.push(docSnap.data() as Cliente));
        if (items.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem(CLIENTES_KEY, JSON.stringify(items));
          saveIDB(CLIENTES_KEY, items);
          if (syncCallbacks.onClientes) syncCallbacks.onClientes(items);
        }
      });

      onSnapshot(collection(db, 'tatuagens'), (snapshot) => {
        const items: Tatuagem[] = [];
        snapshot.forEach((docSnap) => items.push(docSnap.data() as Tatuagem));
        if (items.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem(TATUAGENS_KEY, JSON.stringify(items));
          saveIDB(TATUAGENS_KEY, items);
          if (syncCallbacks.onTatuagens) syncCallbacks.onTatuagens(items);
        }
      });

      onSnapshot(collection(db, 'notificacoes'), (snapshot) => {
        const items: Notificacao[] = [];
        snapshot.forEach((docSnap) => items.push(docSnap.data() as Notificacao));
        if (items.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(items));
          saveIDB(NOTIFICACOES_KEY, items);
          if (syncCallbacks.onNotificacoes) syncCallbacks.onNotificacoes(items);
        }
      });

      // Check if Firestore has existing data or needs initial seed
      const clientesSnap = await getDocs(collection(db, 'clientes'));
      if (clientesSnap.empty) {
        // Seed Firestore with initial sample data
        const batch = writeBatch(db);
        sampleClientes.forEach((c) => {
          batch.set(doc(db, 'clientes', c.id), sanitizeForFirestore(c));
        });
        sampleTatuagens.forEach((t) => {
          batch.set(doc(db, 'tatuagens', t.id), sanitizeForFirestore(t));
        });
        await batch.commit();
      }

      localStorage.setItem(INITIALIZED_KEY, 'true');
      saveIDB(INITIALIZED_KEY, 'true');
    } catch (e) {
      console.warn('Firebase Firestore init fallback to local:', e);
      // Fallback local restoration
      const isInit = localStorage.getItem(INITIALIZED_KEY) || (await getIDB(INITIALIZED_KEY));
      if (!isInit) {
        this.saveClientes(sampleClientes);
        this.saveTatuagens(sampleTatuagens);
      }
    }
  },

  getClientes(): Cliente[] {
    try {
      const data = localStorage.getItem(CLIENTES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading clientes:', e);
    }
    return [];
  },

  async saveClientes(clientes: Cliente[]): Promise<void> {
    try {
      localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
      saveIDB(CLIENTES_KEY, clientes);
    } catch (e) {
      console.error('Error saving clientes locally:', e);
    }

    // Sync to Firestore
    try {
      const snapshot = await getDocs(collection(db, 'clientes'));
      const existingIds = new Set(snapshot.docs.map((d) => d.id));
      const currentIds = new Set(clientes.map((c) => c.id));

      const batch = writeBatch(db);
      clientes.forEach((c) => {
        batch.set(doc(db, 'clientes', c.id), sanitizeForFirestore(c));
      });
      existingIds.forEach((id) => {
        if (!currentIds.has(id)) {
          batch.delete(doc(db, 'clientes', id));
        }
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore clientes save warning:', err);
    }
  },

  getTatuagens(): Tatuagem[] {
    try {
      const data = localStorage.getItem(TATUAGENS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading tatuagens:', e);
    }
    return [];
  },

  async saveTatuagens(tatuagens: Tatuagem[]): Promise<void> {
    try {
      localStorage.setItem(TATUAGENS_KEY, JSON.stringify(tatuagens));
      saveIDB(TATUAGENS_KEY, tatuagens);
    } catch (e) {
      console.error('Error saving tatuagens locally:', e);
    }

    // Sync to Firestore
    try {
      const snapshot = await getDocs(collection(db, 'tatuagens'));
      const existingIds = new Set(snapshot.docs.map((d) => d.id));
      const currentIds = new Set(tatuagens.map((t) => t.id));

      const batch = writeBatch(db);
      tatuagens.forEach((t) => {
        batch.set(doc(db, 'tatuagens', t.id), sanitizeForFirestore(t));
      });
      existingIds.forEach((id) => {
        if (!currentIds.has(id)) {
          batch.delete(doc(db, 'tatuagens', id));
        }
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore tatuagens save warning:', err);
    }
  },

  getNotificacoes(): Notificacao[] {
    try {
      const data = localStorage.getItem(NOTIFICACOES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading notificacoes:', e);
    }
    return [];
  },

  async saveNotificacoes(notificacoes: Notificacao[]): Promise<void> {
    try {
      localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(notificacoes));
      saveIDB(NOTIFICACOES_KEY, notificacoes);
    } catch (e) {
      console.error('Error saving notificacoes locally:', e);
    }

    // Sync to Firestore
    try {
      const snapshot = await getDocs(collection(db, 'notificacoes'));
      const existingIds = new Set(snapshot.docs.map((d) => d.id));
      const currentIds = new Set(notificacoes.map((n) => n.id));

      const batch = writeBatch(db);
      notificacoes.forEach((n) => {
        batch.set(doc(db, 'notificacoes', n.id), sanitizeForFirestore(n));
      });
      existingIds.forEach((id) => {
        if (!currentIds.has(id)) {
          batch.delete(doc(db, 'notificacoes', id));
        }
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore notificacoes save warning:', err);
    }
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem(CLIENTES_KEY);
    localStorage.removeItem(TATUAGENS_KEY);
    localStorage.removeItem(NOTIFICACOES_KEY);
    saveIDB(CLIENTES_KEY, []);
    saveIDB(TATUAGENS_KEY, []);
    saveIDB(NOTIFICACOES_KEY, []);

    try {
      const batch = writeBatch(db);
      const cSnap = await getDocs(collection(db, 'clientes'));
      cSnap.forEach((d) => batch.delete(d.ref));
      const tSnap = await getDocs(collection(db, 'tatuagens'));
      tSnap.forEach((d) => batch.delete(d.ref));
      const nSnap = await getDocs(collection(db, 'notificacoes'));
      nSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.warn('Firestore clearAll warning:', err);
    }
  },
};
