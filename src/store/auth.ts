import { create } from 'zustand';
import type { User, UserRole, AuthResponse } from '@shared/index';

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  login: (phone: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'wedding_auth';

const loadFromStorage = (): Partial<AuthState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return {};
};

const saveToStorage = (data: Partial<AuthState>) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* empty */ }
};

export const useAuth = create<AuthState>((set) => {
  const stored = loadFromStorage();
  return {
    user: stored.user ?? null,
    token: stored.token ?? null,
    permissions: stored.permissions ?? [],

    login: async (phone, password, role) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role }),
      });
      const json = await res.json();
      if (json.success) {
        const data = json.data as AuthResponse;
        const state = { user: data.user, token: data.token, permissions: data.permissions };
        saveToStorage(state);
        set(state);
        return true;
      }
      return false;
    },

    logout: () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* empty */ }
      set({ user: null, token: null, permissions: [] });
    },
  };
});

export const apiFetch = async <T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const { user, token } = useAuth.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (user) {
    headers['X-User-Role'] = user.role;
    headers['X-User-Id'] = user.id;
  }
  const res = await fetch(path, { ...options, headers });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || '请求失败');
  return json.data as T;
};
