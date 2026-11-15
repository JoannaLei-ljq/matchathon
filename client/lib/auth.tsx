'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, getToken, setToken } from './api';
import type { User } from './types';

type Status = 'loading' | 'authed' | 'guest';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  school?: string;
  skills?: string[];
  interests?: string[];
}

interface AuthContextValue {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setStatus('guest');
      return;
    }
    try {
      const { user } = await api<{ user: User }>('/auth/me');
      setUser(user);
      setStatus('authed');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setToken(null);
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    // Restore the session from a stored token once, on first load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token } = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(token);
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { token } = await api<{ token: string }>('/auth/register', { method: 'POST', body: input });
      setToken(token);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout, refresh }),
    [status, user, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
