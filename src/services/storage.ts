import { Tatuagem, Cliente, Notificacao } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';

const TATUAGENS_KEY = 'tatuagens_data';
const CLIENTES_KEY = 'clientes_data';
const NOTIFICACOES_KEY = 'notificacoes_data';
const DELETED_NOTIFS_KEY = 'deleted_notificacoes_ids';
const INITIALIZED_KEY = 'app_initialized_v2';

const DB_NAME = 'GustavoTattooDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_store';

const sampleClientes: Cliente[] = [];

const sampleTatuagens: Tatuagem[] = [];

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
      const val = obj[key];
      // Strip undefined, null, and empty strings to optimize Firestore storage space
      if (val !== undefined && val !== null && val !== '') {
        cleaned[key] = sanitizeForFirestore(val);
      } else if (val === false || val === 0) {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }
  return obj;
}

function isNotificacaoOld(n: Notificacao): boolean {
  if (!n) return false;
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

  const refDateStr = n.criadaEm || n.dataHoraNotificacao;
  if (!refDateStr) return false;

  const refTime = new Date(refDateStr).getTime();
  if (isNaN(refTime)) return false;

  const ageMs = now - refTime;
  if (n.lida && ageMs > THIRTY_DAYS_MS) {
    return true;
  }
  if (ageMs > SIXTY_DAYS_MS) {
    return true;
  }
  return false;
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

  getDeletedNotificacaoIds(): string[] {
    try {
      const raw = localStorage.getItem(DELETED_NOTIFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading deleted notificacoes IDs:', e);
    }
    return [];
  },

  addDeletedNotificacaoId(id: string): void {
    try {
      const ids = this.getDeletedNotificacaoIds();
      if (!ids.includes(id)) {
        const updated = [...ids, id];
        localStorage.setItem(DELETED_NOTIFS_KEY, JSON.stringify(updated));
        saveIDB(DELETED_NOTIFS_KEY, updated);
      }
    } catch (e) {
      console.error('Error saving deleted notificacao ID:', e);
    }
  },

  async restoreFromIDB(): Promise<void> {
    try {
      const idbClis = await getIDB(CLIENTES_KEY);
      if (idbClis && Array.isArray(idbClis) && idbClis.length > 0) {
        const currentClis = this.getClientes();
        if (currentClis.length === 0) {
          localStorage.setItem(CLIENTES_KEY, JSON.stringify(idbClis));
        }
      }
      const idbTats = await getIDB(TATUAGENS_KEY);
      if (idbTats && Array.isArray(idbTats) && idbTats.length > 0) {
        const currentTats = this.getTatuagens();
        if (currentTats.length === 0) {
          localStorage.setItem(TATUAGENS_KEY, JSON.stringify(idbTats));
        }
      }

      const idbDeleted = await getIDB(DELETED_NOTIFS_KEY);
      if (idbDeleted && Array.isArray(idbDeleted) && idbDeleted.length > 0) {
        const currentDeleted = this.getDeletedNotificacaoIds();
        const mergedDeleted = Array.from(new Set([...currentDeleted, ...idbDeleted]));
        localStorage.setItem(DELETED_NOTIFS_KEY, JSON.stringify(mergedDeleted));
      }

      const deletedSet = new Set(this.getDeletedNotificacaoIds());
      const idbNotifs = await getIDB(NOTIFICACOES_KEY);
      if (idbNotifs && Array.isArray(idbNotifs)) {
        const cleanIdbNotifs = idbNotifs.filter((n: Notificacao) => !deletedSet.has(n.id));
        const currentNotifs = this.getNotificacoes();
        if (currentNotifs.length === 0 && cleanIdbNotifs.length > 0) {
          localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(cleanIdbNotifs));
        }
      }
    } catch (e) {
      console.warn('Error restoring from IndexedDB:', e);
    }
  },

  async initStorage(): Promise<void> {
    try {
      await this.restoreFromIDB();

      onSnapshot(
        collection(db, 'clientes'),
        (snapshot) => {
          const items: Cliente[] = [];
          snapshot.forEach((docSnap) => items.push(docSnap.data() as Cliente));
          if (items.length > 0) {
            localStorage.setItem(CLIENTES_KEY, JSON.stringify(items));
            saveIDB(CLIENTES_KEY, items);
            if (syncCallbacks.onClientes) syncCallbacks.onClientes(items);
          } else {
            const localClis = this.getClientes();
            if (localClis.length > 0) {
              this.saveClientes(localClis);
            } else if (snapshot.metadata.fromCache === false) {
              localStorage.setItem(CLIENTES_KEY, JSON.stringify([]));
              saveIDB(CLIENTES_KEY, []);
              if (syncCallbacks.onClientes) syncCallbacks.onClientes([]);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'clientes');
        }
      );

      onSnapshot(
        collection(db, 'tatuagens'),
        (snapshot) => {
          const items: Tatuagem[] = [];
          snapshot.forEach((docSnap) => items.push(docSnap.data() as Tatuagem));
          if (items.length > 0) {
            localStorage.setItem(TATUAGENS_KEY, JSON.stringify(items));
            saveIDB(TATUAGENS_KEY, items);
            if (syncCallbacks.onTatuagens) syncCallbacks.onTatuagens(items);
          } else {
            const localTats = this.getTatuagens();
            if (localTats.length > 0) {
              this.saveTatuagens(localTats);
            } else if (snapshot.metadata.fromCache === false) {
              localStorage.setItem(TATUAGENS_KEY, JSON.stringify([]));
              saveIDB(TATUAGENS_KEY, []);
              if (syncCallbacks.onTatuagens) syncCallbacks.onTatuagens([]);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'tatuagens');
        }
      );

      onSnapshot(
        collection(db, 'notificacoes'),
        (snapshot) => {
          const items: Notificacao[] = [];
          const deletedSet = new Set(this.getDeletedNotificacaoIds());

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Notificacao;
            if (data && data.id) {
              if (deletedSet.has(data.id) || isNotificacaoOld(data)) {
                this.addDeletedNotificacaoId(data.id);
                deleteDoc(doc(db, 'notificacoes', data.id)).catch(() => {});
              } else {
                items.push(data);
              }
            }
          });

          localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(items));
          saveIDB(NOTIFICACOES_KEY, items);
          if (syncCallbacks.onNotificacoes) syncCallbacks.onNotificacoes(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'notificacoes');
        }
      );

      localStorage.setItem(INITIALIZED_KEY, 'true');
      saveIDB(INITIALIZED_KEY, 'true');
    } catch (e) {
      console.warn('Firebase Firestore init fallback to local:', e);
    }
  },

  async saveSingleCliente(cliente: Cliente): Promise<void> {
    try {
      setDoc(doc(db, 'clientes', cliente.id), sanitizeForFirestore(cliente)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `clientes/${cliente.id}`);
      });
    } catch (err) {
      console.warn('Firestore saveSingleCliente error:', err);
    }
  },

  async deleteSingleCliente(id: string): Promise<void> {
    try {
      deleteDoc(doc(db, 'clientes', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `clientes/${id}`);
      });
    } catch (err) {
      console.warn('Firestore deleteSingleCliente error:', err);
    }
  },

  async saveSingleTatuagem(tatuagem: Tatuagem): Promise<void> {
    try {
      setDoc(doc(db, 'tatuagens', tatuagem.id), sanitizeForFirestore(tatuagem)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `tatuagens/${tatuagem.id}`);
      });
    } catch (err) {
      console.warn('Firestore saveSingleTatuagem error:', err);
    }
  },

  async deleteSingleTatuagem(id: string): Promise<void> {
    try {
      deleteDoc(doc(db, 'tatuagens', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `tatuagens/${id}`);
      });
    } catch (err) {
      console.warn('Firestore deleteSingleTatuagem error:', err);
    }
  },

  async saveSingleNotificacao(notificacao: Notificacao): Promise<void> {
    try {
      setDoc(doc(db, 'notificacoes', notificacao.id), sanitizeForFirestore(notificacao)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `notificacoes/${notificacao.id}`);
      });
    } catch (err) {
      console.warn('Firestore saveSingleNotificacao error:', err);
    }
  },

  async deleteSingleNotificacao(id: string): Promise<void> {
    this.addDeletedNotificacaoId(id);

    const current = this.getNotificacoes().filter(n => n.id !== id);
    localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(current));
    await saveIDB(NOTIFICACOES_KEY, current);

    try {
      deleteDoc(doc(db, 'notificacoes', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, `notificacoes/${id}`);
      });
    } catch (err) {
      console.warn('Firestore deleteSingleNotificacao error:', err);
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

    // Direct Firestore sync without blocking getDocs call
    try {
      if (clientes.length === 0) return;
      const batch = writeBatch(db);
      clientes.forEach((c) => {
        batch.set(doc(db, 'clientes', c.id), sanitizeForFirestore(c));
      });
      batch.commit().catch((err) => {
        console.warn('Firestore clientes batch write warning:', err);
      });
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

    // Direct Firestore sync without blocking getDocs call
    try {
      if (tatuagens.length === 0) return;
      const batch = writeBatch(db);
      tatuagens.forEach((t) => {
        batch.set(doc(db, 'tatuagens', t.id), sanitizeForFirestore(t));
      });
      batch.commit().catch((err) => {
        console.warn('Firestore tatuagens batch write warning:', err);
      });
    } catch (err) {
      console.warn('Firestore tatuagens save warning:', err);
    }
  },

  getNotificacoes(): Notificacao[] {
    try {
      const data = localStorage.getItem(NOTIFICACOES_KEY);
      if (data) {
        const parsed: Notificacao[] = JSON.parse(data);
        const deletedIds = new Set(this.getDeletedNotificacaoIds());
        return parsed.filter(n => n && n.id && !deletedIds.has(n.id) && !isNotificacaoOld(n));
      }
    } catch (e) {
      console.error('Error reading notificacoes:', e);
    }
    return [];
  },

  async saveNotificacoes(notificacoes: Notificacao[]): Promise<void> {
    const deletedSet = new Set(this.getDeletedNotificacaoIds());
    const cleanNotifs = (notificacoes || []).filter(n => n && n.id && !deletedSet.has(n.id) && !isNotificacaoOld(n));

    try {
      localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(cleanNotifs));
      await saveIDB(NOTIFICACOES_KEY, cleanNotifs);
    } catch (e) {
      console.error('Error saving notificacoes locally:', e);
    }

    // Direct Firestore sync without blocking getDocs call
    try {
      if (cleanNotifs.length === 0) return;
      const batch = writeBatch(db);
      cleanNotifs.forEach((n) => {
        batch.set(doc(db, 'notificacoes', n.id), sanitizeForFirestore(n));
      });
      batch.commit().catch((err) => {
        console.warn('Firestore notificacoes batch write warning:', err);
      });
    } catch (err) {
      console.warn('Firestore notificacoes save warning:', err);
    }
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem(CLIENTES_KEY);
    localStorage.removeItem(TATUAGENS_KEY);
    localStorage.removeItem(NOTIFICACOES_KEY);
    localStorage.removeItem(DELETED_NOTIFS_KEY);
    await saveIDB(CLIENTES_KEY, []);
    await saveIDB(TATUAGENS_KEY, []);
    await saveIDB(NOTIFICACOES_KEY, []);
    await saveIDB(DELETED_NOTIFS_KEY, []);

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
