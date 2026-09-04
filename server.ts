import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'auth_accounts.json');
const STUDIO_DATA_FILE = path.join(DATA_DIR, 'studio_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string): string {
  const trimmed = (password || '').trim();
  const salted = `gt_salt_${trimmed}`;
  return crypto.createHash('sha256').update(salted).digest('hex');
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const currentHash = hashPassword(password);
  if (currentHash === storedHash) return true;

  // Legacy fallback
  if (storedHash.startsWith('gt_h_')) {
    let hash = 0;
    const salted = `gt_salt_${password.trim()}`;
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) - hash) + salted.charCodeAt(i);
      hash |= 0;
    }
    const legacyHash = 'gt_h_' + Math.abs(hash).toString(16);
    return legacyHash === storedHash;
  }
  return false;
}

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

function getDefaultAccounts(): UserAccount[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'user_caio',
      username: 'caio',
      displayName: 'Caio Katsumi',
      role: 'Desenvolvedor & Administrador',
      isAdmin: true,
      isDev: true,
      passwordHash: hashPassword('caio2026'),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user_gustavo',
      username: 'gustavo',
      displayName: 'Gustavo Tattoo',
      role: 'Tatuador & Administrador',
      isAdmin: false,
      isDev: false,
      passwordHash: hashPassword('tattoo2026'),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function loadAccounts(): UserAccount[] {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const content = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      const accounts = JSON.parse(content);
      if (Array.isArray(accounts) && accounts.length > 0) {
        return accounts;
      }
    }
  } catch (err) {
    console.error('Error reading auth_accounts.json:', err);
  }
  const defaults = getDefaultAccounts();
  saveAccounts(defaults);
  return defaults;
}

function saveAccounts(accounts: UserAccount[]): void {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing auth_accounts.json:', err);
  }
}

interface StudioData {
  clientes: any[];
  tatuagens: any[];
  notificacoes: any[];
  version: number;
  updatedAt: string;
}

function loadStudioData(): StudioData {
  try {
    if (fs.existsSync(STUDIO_DATA_FILE)) {
      const content = fs.readFileSync(STUDIO_DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      return {
        clientes: Array.isArray(data.clientes) ? data.clientes : [],
        tatuagens: Array.isArray(data.tatuagens) ? data.tatuagens : [],
        notificacoes: Array.isArray(data.notificacoes) ? data.notificacoes : [],
        version: typeof data.version === 'number' ? data.version : 1,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Error reading studio_data.json:', err);
  }
  const initial: StudioData = {
    clientes: [],
    tatuagens: [],
    notificacoes: [],
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  saveStudioData(initial);
  return initial;
}

function saveStudioData(data: StudioData): void {
  try {
    fs.writeFileSync(STUDIO_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing studio_data.json:', err);
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Accounts listing
app.get('/api/auth/accounts', (req, res) => {
  const accounts = loadAccounts();
  res.json({
    accounts: accounts.map(a => ({
      id: a.id,
      username: a.username,
      displayName: a.displayName,
      role: a.role,
      isAdmin: a.isAdmin,
      isDev: a.isDev,
      passwordHash: a.passwordHash,
      createdAt: a.createdAt,
      lastLogin: a.lastLogin,
      updatedAt: a.updatedAt,
    })),
  });
});

// Centralized authentication endpoint - verifies credentials against single authoritative source
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanUser || !cleanPass) {
    return res.status(400).json({ success: false, error: 'Usuário e senha são obrigatórios.' });
  }

  const accounts = loadAccounts();
  let matched = accounts.find(a => a.username.toLowerCase() === cleanUser);
  if (!matched && cleanUser === 'admin') {
    matched = accounts.find(a => a.username.toLowerCase() === 'gustavo') || accounts[0];
  }

  if (!matched || !verifyPassword(cleanPass, matched.passwordHash)) {
    return res.status(401).json({ success: false, error: 'Usuário ou senha incorretos.' });
  }

  // Update lastLogin
  matched.lastLogin = new Date().toISOString();
  saveAccounts(accounts);

  return res.json({
    success: true,
    user: {
      id: matched.id,
      username: matched.username,
      name: matched.displayName,
      role: matched.role,
      isAdmin: matched.isAdmin,
      isDev: matched.isDev,
      lastLogin: matched.lastLogin,
    },
  });
});

// Change password endpoint
app.post('/api/auth/change-password', (req, res) => {
  const { username, currentPassword, newPassword, adminOverride } = req.body || {};
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanCurrent = (currentPassword || '').trim();
  const cleanNew = (newPassword || '').trim();

  if (!cleanUser || !cleanNew) {
    return res.status(400).json({ success: false, error: 'Dados incompletos.' });
  }

  if (cleanNew.length < 4) {
    return res.status(400).json({ success: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' });
  }

  const accounts = loadAccounts();
  const matched = accounts.find(a => a.username.toLowerCase() === cleanUser);

  if (!matched) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
  }

  if (!adminOverride) {
    if (!cleanCurrent || !verifyPassword(cleanCurrent, matched.passwordHash)) {
      return res.status(401).json({ success: false, error: 'A senha atual informada está incorreta.' });
    }
  }

  matched.passwordHash = hashPassword(cleanNew);
  matched.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  console.log(`[AUTH] Senha alterada com sucesso para o usuário: ${cleanUser}`);
  return res.json({ success: true, message: 'Senha alterada com sucesso em todos os dispositivos.' });
});

// Admin change user password
app.post('/api/auth/admin-change-password', (req, res) => {
  const { targetUsername, newPassword } = req.body || {};
  const cleanTarget = (targetUsername || '').trim().toLowerCase();
  const cleanNew = (newPassword || '').trim();

  if (!cleanTarget || !cleanNew || cleanNew.length < 4) {
    return res.status(400).json({ success: false, error: 'Senha inválida ou usuário não informado.' });
  }

  const accounts = loadAccounts();
  const matched = accounts.find(a => a.username.toLowerCase() === cleanTarget);
  if (!matched) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
  }

  matched.passwordHash = hashPassword(cleanNew);
  matched.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  return res.json({ success: true, message: 'Senha atualizada com sucesso.' });
});

// Reset user to default password
app.post('/api/auth/reset-default', (req, res) => {
  const { username } = req.body || {};
  const cleanUser = (username || '').trim().toLowerCase();

  const accounts = loadAccounts();
  const matched = accounts.find(a => a.username.toLowerCase() === cleanUser);
  if (!matched) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
  }

  const defaultPass = cleanUser === 'caio' ? 'caio2026' : 'tattoo2026';
  matched.passwordHash = hashPassword(defaultPass);
  matched.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  return res.json({ success: true, message: 'Senha restaurada para o padrão.' });
});

// Create user
app.post('/api/auth/create-user', (req, res) => {
  const { username, displayName, role, password, isAdmin, isDev } = req.body || {};
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanUser || !cleanPass || cleanPass.length < 4) {
    return res.status(400).json({ success: false, error: 'Nome de usuário ou senha inválidos.' });
  }

  const accounts = loadAccounts();
  if (accounts.some(a => a.username.toLowerCase() === cleanUser)) {
    return res.status(409).json({ success: false, error: 'Já existe um usuário com este login.' });
  }

  const now = new Date().toISOString();
  const newUser: UserAccount = {
    id: `user_${cleanUser}_${Date.now()}`,
    username: cleanUser,
    displayName: (displayName || cleanUser).trim(),
    role: (role || 'Tatuador').trim(),
    isAdmin: !!isAdmin,
    isDev: !!isDev,
    passwordHash: hashPassword(cleanPass),
    createdAt: now,
    updatedAt: now,
  };

  accounts.push(newUser);
  saveAccounts(accounts);

  return res.json({ success: true, account: newUser });
});

// Delete user
app.post('/api/auth/delete-user', (req, res) => {
  const { username } = req.body || {};
  const cleanUser = (username || '').trim().toLowerCase();

  if (cleanUser === 'gustavo' || cleanUser === 'caio') {
    return res.status(403).json({ success: false, error: 'Não é permitido excluir as contas mestres.' });
  }

  const accounts = loadAccounts();
  const filtered = accounts.filter(a => a.username.toLowerCase() !== cleanUser);
  if (filtered.length === accounts.length) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
  }

  saveAccounts(filtered);
  return res.json({ success: true });
});

// Studio Data Sync endpoints (cross-device sync for appointments, clients, notifications)
app.get('/api/sync/all', (req, res) => {
  const data = loadStudioData();
  res.json(data);
});

app.post('/api/sync/all', (req, res) => {
  const { clientes, tatuagens, notificacoes } = req.body || {};
  const current = loadStudioData();

  const updated: StudioData = {
    clientes: Array.isArray(clientes) ? clientes : current.clientes,
    tatuagens: Array.isArray(tatuagens) ? tatuagens : current.tatuagens,
    notificacoes: Array.isArray(notificacoes) ? notificacoes : current.notificacoes,
    version: (current.version || 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  saveStudioData(updated);
  res.json({ success: true, version: updated.version, updatedAt: updated.updatedAt });
});

app.get('/api/sync/status', (req, res) => {
  const current = loadStudioData();
  res.json({
    version: current.version,
    updatedAt: current.updatedAt,
    clientesCount: current.clientes.length,
    tatuagensCount: current.tatuagens.length,
    notificacoesCount: current.notificacoes.length,
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Gustavo Tattoo Studio rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
