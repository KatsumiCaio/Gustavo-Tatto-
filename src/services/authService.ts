import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, getDoc } from 'firebase/firestore';

/**
 * Authentication service for Gustavo Tattoo Studio.
 * Handles local secure credentials, hashing, remember-me persistence, session management,
 * and Cloud Firestore synchronization across multiple devices.
 */

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  role: string;
  isAdmin: boolean;
  isDev: boolean;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
  updatedAt?: string;
}

export interface UserAccountSummary {
  id: string;
  username: string;
  displayName: string;
  role: string;
  isAdmin: boolean;
  isDev: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  lastLogin: string;
  isAdmin: boolean;
  isDev: boolean;
}

const AUTH_ACCOUNTS_KEY = 'gt_auth_accounts_v2';
const AUTH_USER_KEY = 'gt_auth_user_v1';
const AUTH_PASS_HASH_KEY = 'gt_auth_pass_hash_v1';
const AUTH_SESSION_KEY = 'gt_auth_session_v1';
const AUTH_REMEMBER_KEY = 'gt_auth_remember_v1';
const AUTH_ATTEMPTS_KEY = 'gt_auth_attempts_v1';
const AUTH_LOCKOUT_UNTIL_KEY = 'gt_auth_lockout_until_v1';
const AUTH_LOGOUT_REASON_KEY = 'gt_auth_logout_reason_v1';

const MAX_FAILED_ATTEMPTS = 5;
const INITIAL_LOCKOUT_SECONDS = 30;

// Default initial developer credentials
export const DEV_CREDENTIALS = {
  username: 'caio',
  password: '310319',
  name: 'Caio',
  role: 'Desenvolvedor & Administrador Master',
};

// Default initial studio credentials
export const DEFAULT_CREDENTIALS = {
  username: 'gustavo',
  password: 'tattoo2026',
  name: 'Gustavo',
  role: 'Tatuador & Administrador',
};

/**
 * Pure JavaScript standard SHA-256 implementation (FIPS 180-4).
 * Guarantees 100% identical 64-character hex digests across ALL browsers,
 * mobile devices, Android, iOS, HTTP, and HTTPS environments.
 */
function pureSha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = candidate * candidate; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }
  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      const t1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ((hash[4] & hash[5]) ^ (~hash[4] & hash[6])) + k[i] + w[i]) | 0;
      const t2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]))) | 0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + t1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (t1 + t2) | 0;
    }
    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (let i = 0; i < 8; i++) {
    for (let i2 = 3; i2 >= 0; i2--) {
      const b = (hash[i] >> (i2 * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export async function hashPassword(password: string): Promise<string> {
  const trimmed = password.trim();
  const salted = `gt_salt_${trimmed}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback to pureSha256
    }
  }
  return pureSha256(salted);
}

/**
 * Verifies if candidate password matches stored hash.
 * Supports standard SHA-256 and legacy fallback.
 */
export async function verifyPasswordHash(password: string, storedHash: string): Promise<boolean> {
  const cleanInput = (password || '').trim();
  if (!cleanInput || !storedHash) return false;

  const currentSha = await hashPassword(cleanInput);
  if (currentSha === storedHash) return true;

  // Legacy fallback check (in case device had old 32-bit integer hash)
  if (storedHash.startsWith('gt_h_')) {
    let hash = 0;
    const salted = `gt_salt_${cleanInput}`;
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) - hash) + salted.charCodeAt(i);
      hash |= 0;
    }
    const legacyHash = 'gt_h_' + Math.abs(hash).toString(16);
    return legacyHash === storedHash;
  }

  return false;
}

export async function isDefaultPasswordHash(username: string, hash: string): Promise<boolean> {
  const clean = (username || '').toLowerCase();
  if (clean === 'caio') {
    const defaultDevHash = await hashPassword(DEV_CREDENTIALS.password);
    return hash === defaultDevHash;
  }
  if (clean === 'gustavo') {
    const defaultGustavoHash = await hashPassword(DEFAULT_CREDENTIALS.password);
    return hash === defaultGustavoHash;
  }
  return false;
}

export const AuthService = {
  getLockoutRemainingSeconds(): number {
    try {
      const lockoutUntil = parseInt(localStorage.getItem(AUTH_LOCKOUT_UNTIL_KEY) || '0', 10);
      const now = Date.now();
      if (lockoutUntil > now) {
        return Math.ceil((lockoutUntil - now) / 1000);
      }
      return 0;
    } catch {
      return 0;
    }
  },

  getFailedAttempts(): number {
    try {
      return parseInt(localStorage.getItem(AUTH_ATTEMPTS_KEY) || '0', 10);
    } catch {
      return 0;
    }
  },

  recordFailedAttempt(): { remaining: number; lockoutSeconds: number } {
    try {
      const current = this.getFailedAttempts() + 1;
      localStorage.setItem(AUTH_ATTEMPTS_KEY, String(current));

      if (current >= MAX_FAILED_ATTEMPTS) {
        // Calculate progressive lockout time (30s, 60s, 120s...)
        const multiplier = Math.min(current - MAX_FAILED_ATTEMPTS + 1, 4);
        const lockoutSeconds = INITIAL_LOCKOUT_SECONDS * multiplier;
        const lockoutUntil = Date.now() + (lockoutSeconds * 1000);
        localStorage.setItem(AUTH_LOCKOUT_UNTIL_KEY, String(lockoutUntil));
        return { remaining: 0, lockoutSeconds };
      }

      return { remaining: MAX_FAILED_ATTEMPTS - current, lockoutSeconds: 0 };
    } catch {
      return { remaining: 0, lockoutSeconds: 30 };
    }
  },

  resetFailedAttempts(): void {
    try {
      localStorage.removeItem(AUTH_ATTEMPTS_KEY);
      localStorage.removeItem(AUTH_LOCKOUT_UNTIL_KEY);
    } catch {
      // ignore
    }
  },

  setLogoutReason(reason: string): void {
    try {
      sessionStorage.setItem(AUTH_LOGOUT_REASON_KEY, reason);
    } catch {
      // ignore
    }
  },

  getAndClearLogoutReason(): string | null {
    try {
      const reason = sessionStorage.getItem(AUTH_LOGOUT_REASON_KEY);
      if (reason) {
        sessionStorage.removeItem(AUTH_LOGOUT_REASON_KEY);
        return reason;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Helper to save a single user account to Cloud Firestore
  async saveAccountToCloud(account: UserAccount): Promise<void> {
    try {
      const cleanUser = (account.username || '').toLowerCase().trim();
      if (!cleanUser) return;
      const docRef = doc(db, 'auth_accounts', cleanUser);
      const dataToSave = {
        id: account.id || `user_${cleanUser}`,
        username: cleanUser,
        displayName: account.displayName || cleanUser,
        role: account.role || 'Tatuador',
        isAdmin: !!account.isAdmin,
        isDev: !!account.isDev,
        passwordHash: account.passwordHash,
        createdAt: account.createdAt || new Date().toISOString(),
        lastLogin: account.lastLogin || new Date().toISOString(),
        updatedAt: account.updatedAt || new Date().toISOString(),
      };
      await setDoc(docRef, dataToSave, { merge: true });
    } catch (e) {
      console.warn('Failed to save account to Cloud Firestore:', e);
    }
  },

  // Helper to delete an account from Cloud Firestore
  async deleteAccountFromCloud(targetUsername: string): Promise<void> {
    try {
      const cleanUser = (targetUsername || '').toLowerCase().trim();
      if (!cleanUser) return;
      const docRef = doc(db, 'auth_accounts', cleanUser);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Failed to delete account from Cloud Firestore:', e);
    }
  },

  // Seed remote Firestore collection from local accounts or initial defaults
  async seedRemoteFromLocal(): Promise<void> {
    try {
      const localAccounts = await this.getLocalAccounts();
      for (const acc of localAccounts) {
        await this.saveAccountToCloud(acc);
      }
    } catch (e) {
      console.warn('Error seeding remote accounts:', e);
    }
  },

  // Primary cross-device synchronization via Backend Server API
  async syncServerAccounts(): Promise<UserAccount[] | null> {
    try {
      const resp = await fetch('/api/auth/accounts', { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.accounts) && data.accounts.length > 0) {
          const serverAccounts: UserAccount[] = data.accounts;
          localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(serverAccounts));
          const gustavo = serverAccounts.find(a => a.username.toLowerCase() === 'gustavo');
          if (gustavo) {
            localStorage.setItem(AUTH_PASS_HASH_KEY, gustavo.passwordHash);
          }
          return serverAccounts;
        }
      }
    } catch {
      // Backend server unavailable or offline fallback
    }
    return null;
  },

  // Fetch accounts from Server first, then Cloud Firestore, with local cache fallback
  async syncRemoteAccounts(): Promise<UserAccount[]> {
    // 1. Primary: sync with backend server
    try {
      const serverAccs = await this.syncServerAccounts();
      if (serverAccs && serverAccs.length > 0) {
        return serverAccs;
      }
    } catch {
      // ignore
    }

    // 2. Secondary: sync with Cloud Firestore
    try {
      const queryPromise = getDocs(collection(db, 'auth_accounts'));
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const snap: any = await Promise.race([queryPromise, timeoutPromise]);

      if (snap && snap.docs) {
        if (!snap.empty) {
          const remoteAccounts: UserAccount[] = [];
          snap.forEach((d: any) => {
            const data = d.data();
            if (data && data.username && data.passwordHash) {
              remoteAccounts.push({
                id: data.id || `user_${data.username.toLowerCase()}`,
                username: data.username.toLowerCase(),
                displayName: data.displayName || data.username,
                role: data.role || 'Tatuador',
                isAdmin: !!data.isAdmin,
                isDev: !!data.isDev,
                passwordHash: data.passwordHash,
                createdAt: data.createdAt || new Date().toISOString(),
                lastLogin: data.lastLogin,
                updatedAt: data.updatedAt,
              });
            }
          });

          // Check if local device has accounts or custom password hashes to preserve/upload
          const rawLocal = localStorage.getItem(AUTH_ACCOUNTS_KEY);
          const localAccounts: UserAccount[] = rawLocal ? JSON.parse(rawLocal) : [];

          for (const localAcc of localAccounts) {
            const clean = localAcc.username.toLowerCase();
            const remoteAcc = remoteAccounts.find(r => r.username === clean);
            if (!remoteAcc) {
              remoteAccounts.push(localAcc);
              this.saveAccountToCloud(localAcc).catch(() => {});
            } else {
              // If local hash is custom and remote hash was default, promote local to cloud
              const isLocalDefault = await isDefaultPasswordHash(clean, localAcc.passwordHash);
              const isRemoteDefault = await isDefaultPasswordHash(clean, remoteAcc.passwordHash);
              if (!isLocalDefault && isRemoteDefault) {
                remoteAcc.passwordHash = localAcc.passwordHash;
                remoteAcc.updatedAt = new Date().toISOString();
                this.saveAccountToCloud(remoteAcc).catch(() => {});
              }
            }
          }

          // Ensure Developer (Caio) exists
          const caio = remoteAccounts.find(a => a.username === 'caio');
          if (!caio) {
            const caioHash = await hashPassword(DEV_CREDENTIALS.password);
            const caioAcc: UserAccount = {
              id: 'user_caio',
              username: 'caio',
              displayName: DEV_CREDENTIALS.name,
              role: DEV_CREDENTIALS.role,
              isAdmin: true,
              isDev: true,
              passwordHash: caioHash,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            remoteAccounts.unshift(caioAcc);
            this.saveAccountToCloud(caioAcc).catch(() => {});
          }

          // Ensure Studio (Gustavo) exists
          const gustavo = remoteAccounts.find(a => a.username === 'gustavo');
          if (!gustavo) {
            const storedHash = localStorage.getItem(AUTH_PASS_HASH_KEY);
            const gustavoHash = storedHash || await hashPassword(DEFAULT_CREDENTIALS.password);
            const gustavoAcc: UserAccount = {
              id: 'user_gustavo',
              username: 'gustavo',
              displayName: DEFAULT_CREDENTIALS.name,
              role: DEFAULT_CREDENTIALS.role,
              isAdmin: false,
              isDev: false,
              passwordHash: gustavoHash,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            remoteAccounts.push(gustavoAcc);
            this.saveAccountToCloud(gustavoAcc).catch(() => {});
          }

          localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(remoteAccounts));
          const gustavoFinal = remoteAccounts.find(a => a.username === 'gustavo');
          if (gustavoFinal) {
            localStorage.setItem(AUTH_PASS_HASH_KEY, gustavoFinal.passwordHash);
          }

          return remoteAccounts;
        } else {
          // Firestore is empty: seed it with local accounts so other devices receive them
          await this.seedRemoteFromLocal();
        }
      }
    } catch (e) {
      console.warn('Could not sync remote accounts from Firestore:', e);
    }

    return await this.getLocalAccounts();
  },

  // Real-time listener to keep accounts and passwords in sync across devices
  initAuthListener(): () => void {
    // 1. Trigger initial server sync
    this.syncServerAccounts().catch(() => {});

    // 2. Poll server every 10 seconds for seamless cross-device synchronization
    const serverPollInterval = setInterval(() => {
      this.syncServerAccounts().catch(() => {});
    }, 10000);

    // 3. Immediately refresh whenever tab/app comes to foreground or focus
    const onWindowFocus = () => {
      this.syncServerAccounts().catch(() => {});
    };
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onWindowFocus);

    // 4. Firestore real-time snapshot listener
    let firestoreUnsub = () => {};
    try {
      firestoreUnsub = onSnapshot(
        collection(db, 'auth_accounts'),
        async (snapshot) => {
          if (!snapshot.empty) {
            const remoteAccounts: UserAccount[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              if (data && data.username && data.passwordHash) {
                remoteAccounts.push({
                  id: data.id || `user_${data.username.toLowerCase()}`,
                  username: data.username.toLowerCase(),
                  displayName: data.displayName || data.username,
                  role: data.role || 'Tatuador',
                  isAdmin: !!data.isAdmin,
                  isDev: !!data.isDev,
                  passwordHash: data.passwordHash,
                  createdAt: data.createdAt || new Date().toISOString(),
                  lastLogin: data.lastLogin,
                  updatedAt: data.updatedAt,
                });
              }
            });

            if (remoteAccounts.length > 0) {
              localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(remoteAccounts));
              const gustavo = remoteAccounts.find(a => a.username === 'gustavo');
              if (gustavo) {
                localStorage.setItem(AUTH_PASS_HASH_KEY, gustavo.passwordHash);
              }
            }
          } else {
            this.seedRemoteFromLocal().catch(() => {});
          }
        },
        (error) => {
          console.warn('auth_accounts snapshot listener notice:', error);
        }
      );
    } catch (e) {
      console.warn('Could not attach auth_accounts snapshot listener:', e);
    }

    return () => {
      clearInterval(serverPollInterval);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onWindowFocus);
      firestoreUnsub();
    };
  },

  // Local-only account reader with automatic default creation
  async getLocalAccounts(): Promise<UserAccount[]> {
    try {
      const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
      let accounts: UserAccount[] = raw ? JSON.parse(raw) : [];

      let needsSave = false;

      // Ensure Developer account (Caio) exists
      const caioIndex = accounts.findIndex(a => a.username.toLowerCase() === 'caio');
      if (caioIndex === -1) {
        const caioHash = await hashPassword(DEV_CREDENTIALS.password);
        accounts.unshift({
          id: 'user_caio',
          username: 'caio',
          displayName: DEV_CREDENTIALS.name,
          role: DEV_CREDENTIALS.role,
          isAdmin: true,
          isDev: true,
          passwordHash: caioHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        needsSave = true;
      }

      // Ensure default Studio account (Gustavo) exists
      const gustavoIndex = accounts.findIndex(a => a.username.toLowerCase() === 'gustavo');
      if (gustavoIndex === -1) {
        const storedGustavoHash = localStorage.getItem(AUTH_PASS_HASH_KEY) || await hashPassword(DEFAULT_CREDENTIALS.password);
        accounts.push({
          id: 'user_gustavo',
          username: 'gustavo',
          displayName: DEFAULT_CREDENTIALS.name,
          role: DEFAULT_CREDENTIALS.role,
          isAdmin: false,
          isDev: false,
          passwordHash: storedGustavoHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        needsSave = true;
      }

      if (needsSave) {
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
      }

      return accounts;
    } catch {
      const caioHash = await hashPassword(DEV_CREDENTIALS.password);
      const gustavoHash = await hashPassword(DEFAULT_CREDENTIALS.password);
      return [
        {
          id: 'user_caio',
          username: 'caio',
          displayName: DEV_CREDENTIALS.name,
          role: DEV_CREDENTIALS.role,
          isAdmin: true,
          isDev: true,
          passwordHash: caioHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'user_gustavo',
          username: 'gustavo',
          displayName: DEFAULT_CREDENTIALS.name,
          role: DEFAULT_CREDENTIALS.role,
          isAdmin: false,
          isDev: false,
          passwordHash: gustavoHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getAccounts(): Promise<UserAccount[]> {
    // Return local immediately for instant UI, but trigger remote sync
    const local = await this.getLocalAccounts();
    // Background sync to ensure freshest data without blocking UI render
    this.syncRemoteAccounts().catch(() => {});
    return local;
  },

  async saveAccounts(accounts: UserAccount[]): Promise<void> {
    try {
      localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save accounts list to localStorage:', e);
    }
  },

  async getUsersList(): Promise<UserAccountSummary[]> {
    // Pull freshest accounts from Cloud if possible
    let accounts: UserAccount[];
    try {
      accounts = await this.syncRemoteAccounts();
    } catch {
      accounts = await this.getAccounts();
    }

    return accounts.map(a => ({
      id: a.id,
      username: a.username,
      displayName: a.displayName,
      role: a.role,
      isAdmin: a.isAdmin,
      isDev: a.isDev,
      createdAt: a.createdAt,
      lastLogin: a.lastLogin,
    }));
  },

  async adminChangeUserPassword(targetUsername: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const cleanTarget = targetUsername.trim().toLowerCase();
    const cleanNew = newPassword.trim();

    if (!cleanNew || cleanNew.length < 4) {
      return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }

    // 1. Persist to server API first
    try {
      await fetch('/api/auth/admin-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername: cleanTarget, newPassword: cleanNew }),
      });
    } catch (e) {
      console.warn('Server admin change password offline notice:', e);
    }

    // Refresh from remote first to ensure working with current state
    const accounts = await this.syncRemoteAccounts();
    const target = accounts.find(a => a.username.toLowerCase() === cleanTarget);

    if (!target) {
      return { success: false, error: `Usuário "${targetUsername}" não foi encontrado.` };
    }

    const newHash = await hashPassword(cleanNew);
    target.passwordHash = newHash;
    target.updatedAt = new Date().toISOString();

    // 2. Save locally
    await this.saveAccounts(accounts);

    // 3. Sync legacy key if Gustavo
    if (cleanTarget === 'gustavo') {
      try {
        localStorage.setItem(AUTH_PASS_HASH_KEY, newHash);
      } catch {
        // ignore
      }
    }

    // 4. Persist directly to Cloud Firestore so all other devices receive the update
    await this.saveAccountToCloud(target);

    return { success: true };
  },

  async adminCreateUser(data: { username: string; displayName: string; role: string; password: string; isDev?: boolean }): Promise<{ success: boolean; error?: string }> {
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const cleanDisplayName = data.displayName.trim();
    const cleanRole = data.role.trim();
    const cleanPassword = data.password.trim();

    if (!cleanUsername || !cleanDisplayName || !cleanPassword) {
      return { success: false, error: 'Preencha o nome, usuário e senha para cadastrar.' };
    }

    if (cleanUsername.length < 3) {
      return { success: false, error: 'O nome de usuário deve ter no mínimo 3 caracteres.' };
    }

    if (cleanPassword.length < 4) {
      return { success: false, error: 'A senha deve ter no mínimo 4 caracteres.' };
    }

    // 1. Persist to server API first
    try {
      await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          displayName: cleanDisplayName,
          role: cleanRole,
          password: cleanPassword,
          isAdmin: !!data.isDev,
          isDev: !!data.isDev,
        }),
      });
    } catch (e) {
      console.warn('Server create user offline notice:', e);
    }

    const accounts = await this.syncRemoteAccounts();
    if (accounts.some(a => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `O nome de usuário "@${cleanUsername}" já está em uso.` };
    }

    const passwordHash = await hashPassword(cleanPassword);
    const newAccount: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      displayName: cleanDisplayName,
      role: cleanRole || 'Tatuador',
      isAdmin: !!data.isDev,
      isDev: !!data.isDev,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    await this.saveAccounts(accounts);

    // Save to Firestore
    await this.saveAccountToCloud(newAccount);

    return { success: true };
  },

  async adminDeleteUser(targetUsername: string): Promise<{ success: boolean; error?: string }> {
    const cleanTarget = targetUsername.trim().toLowerCase();
    if (cleanTarget === 'caio') {
      return { success: false, error: 'A conta do desenvolvedor principal (Caio) não pode ser removida.' };
    }

    // 1. Delete on server API first
    try {
      await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanTarget }),
      });
    } catch (e) {
      console.warn('Server delete user offline notice:', e);
    }

    const accounts = await this.syncRemoteAccounts();
    const updated = accounts.filter(a => a.username.toLowerCase() !== cleanTarget);
    if (updated.length === accounts.length) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    await this.saveAccounts(updated);

    // Delete from Firestore
    await this.deleteAccountFromCloud(cleanTarget);

    return { success: true };
  },

  async getStoredHash(): Promise<string> {
    try {
      const stored = localStorage.getItem(AUTH_PASS_HASH_KEY);
      if (stored) return stored;
      // Initialize with default password hash
      const defaultHash = await hashPassword(DEFAULT_CREDENTIALS.password);
      localStorage.setItem(AUTH_PASS_HASH_KEY, defaultHash);
      return defaultHash;
    } catch {
      return await hashPassword(DEFAULT_CREDENTIALS.password);
    }
  },

  getStoredUsername(): string {
    try {
      return localStorage.getItem(AUTH_USER_KEY) || DEFAULT_CREDENTIALS.username;
    } catch {
      return DEFAULT_CREDENTIALS.username;
    }
  },

  isRemembered(): boolean {
    try {
      return localStorage.getItem(AUTH_REMEMBER_KEY) === 'true';
    } catch {
      return false;
    }
  },

  checkActiveSession(): AuthUser | null {
    try {
      const sessionRaw = sessionStorage.getItem(AUTH_SESSION_KEY) || 
        (this.isRemembered() ? localStorage.getItem(AUTH_SESSION_KEY) : null);
      
      if (!sessionRaw) return null;
      const user = JSON.parse(sessionRaw) as AuthUser;
      return user;
    } catch {
      return null;
    }
  },

  async login(usernameInput: string, passwordInput: string, rememberMe = true): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const lockoutSec = this.getLockoutRemainingSeconds();
    if (lockoutSec > 0) {
      return {
        success: false,
        error: `Acesso temporariamente bloqueado por excesso de tentativas incorretas. Aguarde ${lockoutSec} segundos para tentar novamente.`,
      };
    }

    const cleanUser = (usernameInput || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Preencha o usuário e a senha para entrar.' };
    }

    // 1. Primary: authenticate against authoritative central server
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success && data.user) {
          this.resetFailedAttempts();
          const authUser: AuthUser = data.user;
          const serialized = JSON.stringify(authUser);
          try {
            sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
            if (rememberMe) {
              localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
              localStorage.setItem(AUTH_SESSION_KEY, serialized);
            } else {
              localStorage.removeItem(AUTH_REMEMBER_KEY);
              localStorage.removeItem(AUTH_SESSION_KEY);
            }
          } catch (e) {
            console.warn('Could not persist session storage:', e);
          }

          // Refresh local cache in background
          this.syncServerAccounts().catch(() => {});
          return { success: true, user: authUser };
        }
      } else if (resp.status === 401 || resp.status === 400) {
        const data = await resp.json().catch(() => ({}));
        const { remaining, lockoutSeconds } = this.recordFailedAttempt();
        if (lockoutSeconds > 0) {
          return {
            success: false,
            error: `Muitas tentativas incorretas. Por segurança, o acesso foi bloqueado por ${lockoutSeconds} segundos.`,
          };
        }
        return {
          success: false,
          error: data.error || `Usuário ou senha incorretos. Tentativas restantes: ${remaining}.`,
        };
      }
    } catch {
      // Backend offline: proceed to local/cloud fallback below
    }

    // 2. Offline / local fallback
    let accounts: UserAccount[];
    try {
      accounts = await this.syncRemoteAccounts();
    } catch {
      accounts = await this.getAccounts();
    }

    const inputHash = await hashPassword(cleanPass);

    // Match by exact username or alias
    let matchedAccount = accounts.find(a => a.username.toLowerCase() === cleanUser);
    if (!matchedAccount && cleanUser === 'admin') {
      matchedAccount = accounts.find(a => a.username.toLowerCase() === 'gustavo') || accounts[0];
    }

    const isMatch = matchedAccount ? (inputHash === matchedAccount.passwordHash) : false;

    if (!matchedAccount || !isMatch) {
      const { remaining, lockoutSeconds } = this.recordFailedAttempt();
      if (lockoutSeconds > 0) {
        return {
          success: false,
          error: `Muitas tentativas incorretas. Por segurança, o acesso foi bloqueado por ${lockoutSeconds} segundos.`,
        };
      }
      return {
        success: false,
        error: `Usuário ou senha incorretos. Tentativas restantes: ${remaining}.`,
      };
    }

    // Success: reset failed attempts
    this.resetFailedAttempts();

    // Update lastLogin for the matched account locally and in Cloud Firestore
    matchedAccount.lastLogin = new Date().toISOString();
    await this.saveAccounts(accounts);
    this.saveAccountToCloud(matchedAccount).catch(() => {});

    const authUser: AuthUser = {
      id: matchedAccount.id,
      username: matchedAccount.username,
      name: matchedAccount.displayName,
      role: matchedAccount.role,
      lastLogin: matchedAccount.lastLogin,
      isAdmin: matchedAccount.isAdmin,
      isDev: matchedAccount.isDev,
    };

    const serialized = JSON.stringify(authUser);
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
      if (rememberMe) {
        localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
        localStorage.setItem(AUTH_SESSION_KEY, serialized);
      } else {
        localStorage.removeItem(AUTH_REMEMBER_KEY);
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Could not persist session storage:', e);
    }

    return { success: true, user: authUser };
  },

  logout(): void {
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_REMEMBER_KEY);
    } catch (e) {
      console.warn('Error during logout:', e);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (!cleanCurrent || !cleanNew) {
      return { success: false, error: 'Informe a senha atual e a nova senha.' };
    }

    if (cleanNew.length < 4) {
      return { success: false, error: 'A nova senha deve possuir pelo menos 4 caracteres.' };
    }

    const activeUser = this.checkActiveSession();
    const username = activeUser?.username || 'gustavo';

    // 1. Primary: update on central server so all other devices receive this password change
    try {
      const resp = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword: cleanCurrent,
          newPassword: cleanNew,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        return { success: false, error: data.error || 'A senha atual informada está incorreta.' };
      }
    } catch (e) {
      console.warn('Server change password offline fallback:', e);
    }

    const accounts = await this.syncRemoteAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

    const currentHash = await hashPassword(cleanCurrent);

    if (account) {
      const newHash = await hashPassword(cleanNew);
      account.passwordHash = newHash;
      account.updatedAt = new Date().toISOString();

      await this.saveAccounts(accounts);
      if (account.username.toLowerCase() === 'gustavo') {
        try {
          localStorage.setItem(AUTH_PASS_HASH_KEY, newHash);
        } catch {
          // ignore
        }
      }

      // Persist to Cloud Firestore so the new password is valid on any device
      await this.saveAccountToCloud(account);

      return { success: true };
    }

    const storedHash = await this.getStoredHash();
    if (currentHash !== storedHash) {
      return { success: false, error: 'A senha atual informada está incorreta.' };
    }

    const newHash = await hashPassword(cleanNew);
    try {
      localStorage.setItem(AUTH_PASS_HASH_KEY, newHash);
    } catch {
      return { success: false, error: 'Falha ao salvar nova senha no armazenamento local.' };
    }

    return { success: true };
  },

  async resetToDefault(): Promise<void> {
    try {
      // 1. Reset on central server
      try {
        await fetch('/api/auth/reset-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'gustavo' }),
        });
      } catch (e) {
        console.warn('Server reset default offline notice:', e);
      }

      const defaultHash = await hashPassword(DEFAULT_CREDENTIALS.password);
      localStorage.setItem(AUTH_PASS_HASH_KEY, defaultHash);
      localStorage.setItem(AUTH_USER_KEY, DEFAULT_CREDENTIALS.username);

      const accounts = await this.syncRemoteAccounts();
      const gustavo = accounts.find(a => a.username.toLowerCase() === 'gustavo');
      if (gustavo) {
        gustavo.passwordHash = defaultHash;
        gustavo.updatedAt = new Date().toISOString();
        await this.saveAccounts(accounts);
        await this.saveAccountToCloud(gustavo);
      }
    } catch (e) {
      console.warn('Error resetting to default credentials:', e);
    }
  },
};
