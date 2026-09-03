/**
 * Authentication service for Gustavo Tattoo Studio.
 * Handles local secure credentials, hashing, remember-me persistence, and session management.
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

export async function hashPassword(password: string): Promise<string> {
  const trimmed = password.trim();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(`gt_salt_${trimmed}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // Deterministic fallback hash
  let hash = 0;
  const salted = `gt_salt_${trimmed}`;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) - hash) + salted.charCodeAt(i);
    hash |= 0;
  }
  return 'gt_h_' + Math.abs(hash).toString(16);
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

  async getAccounts(): Promise<UserAccount[]> {
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
        });
        needsSave = true;
      }

      if (needsSave) {
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
      }

      return accounts;
    } catch {
      // Fallback in case of parsing error
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
        },
      ];
    }
  },

  async saveAccounts(accounts: UserAccount[]): Promise<void> {
    try {
      localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save accounts list to localStorage:', e);
    }
  },

  async getUsersList(): Promise<UserAccountSummary[]> {
    const accounts = await this.getAccounts();
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

    const accounts = await this.getAccounts();
    const target = accounts.find(a => a.username.toLowerCase() === cleanTarget);

    if (!target) {
      return { success: false, error: `Usuário "${targetUsername}" não foi encontrado.` };
    }

    const newHash = await hashPassword(cleanNew);
    target.passwordHash = newHash;
    await this.saveAccounts(accounts);

    // Sync legacy key if Gustavo
    if (cleanTarget === 'gustavo') {
      try {
        localStorage.setItem(AUTH_PASS_HASH_KEY, newHash);
      } catch {
        // ignore
      }
    }

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

    const accounts = await this.getAccounts();
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
    };

    accounts.push(newAccount);
    await this.saveAccounts(accounts);
    return { success: true };
  },

  async adminDeleteUser(targetUsername: string): Promise<{ success: boolean; error?: string }> {
    const cleanTarget = targetUsername.trim().toLowerCase();
    if (cleanTarget === 'caio') {
      return { success: false, error: 'A conta do desenvolvedor principal (Caio) não pode ser removida.' };
    }

    const accounts = await this.getAccounts();
    const updated = accounts.filter(a => a.username.toLowerCase() !== cleanTarget);
    if (updated.length === accounts.length) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    await this.saveAccounts(updated);
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

    const accounts = await this.getAccounts();
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

    // Update lastLogin for the matched account
    matchedAccount.lastLogin = new Date().toISOString();
    await this.saveAccounts(accounts);

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

    const accounts = await this.getAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

    const currentHash = await hashPassword(cleanCurrent);

    if (account) {
      if (currentHash !== account.passwordHash) {
        return { success: false, error: 'A senha atual informada está incorreta.' };
      }
      const newHash = await hashPassword(cleanNew);
      account.passwordHash = newHash;
      await this.saveAccounts(accounts);
      if (account.username.toLowerCase() === 'gustavo') {
        try {
          localStorage.setItem(AUTH_PASS_HASH_KEY, newHash);
        } catch {
          // ignore
        }
      }
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
      const defaultHash = await hashPassword(DEFAULT_CREDENTIALS.password);
      localStorage.setItem(AUTH_PASS_HASH_KEY, defaultHash);
      localStorage.setItem(AUTH_USER_KEY, DEFAULT_CREDENTIALS.username);
    } catch (e) {
      console.warn('Error resetting to default credentials:', e);
    }
  },
};
