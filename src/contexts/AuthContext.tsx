import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AuthService, AuthUser, UserAccountSummary, DEFAULT_CREDENTIALS, DEV_CREDENTIALS } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  isLoading: boolean;
  logoutReason: string | null;
  autoLockMinutes: number;
  setAutoLockMinutes: (min: number) => void;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: (reason?: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetToDefaultPassword: () => Promise<void>;
  defaultCredentials: typeof DEFAULT_CREDENTIALS;
  devCredentials: typeof DEV_CREDENTIALS;
  getLockoutSeconds: () => number;
  getAllUsers: () => Promise<UserAccountSummary[]>;
  adminChangeUserPassword: (targetUsername: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  adminCreateUser: (data: { username: string; displayName: string; role: string; password: string; isDev?: boolean }) => Promise<{ success: boolean; error?: string }>;
  adminDeleteUser: (targetUsername: string) => Promise<{ success: boolean; error?: string }>;
}

const AUTOLOCK_MINUTES_KEY = 'gt_autolock_minutes_v1';
const DEFAULT_AUTOLOCK_MINUTES = 15;

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  isLoading: true,
  logoutReason: null,
  autoLockMinutes: DEFAULT_AUTOLOCK_MINUTES,
  setAutoLockMinutes: () => {},
  login: async () => ({ success: false }),
  logout: () => {},
  changePassword: async () => ({ success: false }),
  resetToDefaultPassword: async () => {},
  defaultCredentials: DEFAULT_CREDENTIALS,
  devCredentials: DEV_CREDENTIALS,
  getLockoutSeconds: () => 0,
  getAllUsers: async () => [],
  adminChangeUserPassword: async () => ({ success: false }),
  adminCreateUser: async () => ({ success: false }),
  adminDeleteUser: async () => ({ success: false }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);
  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(AUTOLOCK_MINUTES_KEY);
      return saved ? parseInt(saved, 10) : DEFAULT_AUTOLOCK_MINUTES;
    } catch {
      return DEFAULT_AUTOLOCK_MINUTES;
    }
  });

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const setAutoLockMinutes = (min: number) => {
    setAutoLockMinutesState(min);
    try {
      localStorage.setItem(AUTOLOCK_MINUTES_KEY, String(min));
    } catch {
      // ignore
    }
  };

  const logout = useCallback((reason?: string) => {
    AuthService.logout();
    if (reason) {
      AuthService.setLogoutReason(reason);
      setLogoutReason(reason);
    } else {
      setLogoutReason(null);
    }
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    // Check if there is an active session
    const existingSession = AuthService.checkActiveSession();
    if (existingSession) {
      setCurrentUser(existingSession);
    }
    const savedReason = AuthService.getAndClearLogoutReason();
    if (savedReason) {
      setLogoutReason(savedReason);
    }
    setIsLoading(false);
  }, []);

  // Inactivity auto-lock monitor
  useEffect(() => {
    if (!currentUser || autoLockMinutes <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }));

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const maxIdleMs = autoLockMinutes * 60 * 1000;
      if (now - lastActivityRef.current >= maxIdleMs) {
        logout('Sessão bloqueada automaticamente por inatividade para proteger os dados dos clientes.');
      }
    }, 15000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach(evt => window.removeEventListener(evt, updateActivity));
    };
  }, [currentUser, autoLockMinutes, logout]);

  const login = async (username: string, password: string, rememberMe = true) => {
    const res = await AuthService.login(username, password, rememberMe);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setLogoutReason(null);
      lastActivityRef.current = Date.now();
    }
    return { success: res.success, error: res.error };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await AuthService.changePassword(currentPassword, newPassword);
  };

  const resetToDefaultPassword = async () => {
    await AuthService.resetToDefault();
  };

  const getLockoutSeconds = () => {
    return AuthService.getLockoutRemainingSeconds();
  };

  const getAllUsers = async () => {
    return await AuthService.getUsersList();
  };

  const adminChangeUserPassword = async (targetUsername: string, newPassword: string) => {
    return await AuthService.adminChangeUserPassword(targetUsername, newPassword);
  };

  const adminCreateUser = async (data: { username: string; displayName: string; role: string; password: string; isDev?: boolean }) => {
    return await AuthService.adminCreateUser(data);
  };

  const adminDeleteUser = async (targetUsername: string) => {
    return await AuthService.adminDeleteUser(targetUsername);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!currentUser,
        currentUser,
        isLoading,
        logoutReason,
        autoLockMinutes,
        setAutoLockMinutes,
        login,
        logout,
        changePassword,
        resetToDefaultPassword,
        defaultCredentials: DEFAULT_CREDENTIALS,
        devCredentials: DEV_CREDENTIALS,
        getLockoutSeconds,
        getAllUsers,
        adminChangeUserPassword,
        adminCreateUser,
        adminDeleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
