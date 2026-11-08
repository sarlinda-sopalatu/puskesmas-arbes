import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useData } from '@/lib/data';
import type { User } from '@/lib/types';

const SESSION_KEY = 'arbes.session.username';

type LoginResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users } = useData();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(SESSION_KEY)
      .then((stored) => {
        if (mounted && stored) setUsername(stored);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const user = useMemo(() => {
    if (!username) return null;
    return users.find((u) => u.username === username && u.active) ?? null;
  }, [users, username]);

  const login = useCallback(
    async (rawUsername: string, password: string): Promise<LoginResult> => {
      const input = rawUsername.trim().toLowerCase();
      const found = users.find((u) => u.username.toLowerCase() === input);
      if (!found) {
        return { ok: false, error: 'Username tidak ditemukan.' };
      }
      if (!found.active) {
        return { ok: false, error: 'Akun dinonaktifkan. Hubungi administrator.' };
      }
      if (found.password !== password) {
        return { ok: false, error: 'Password salah. Silakan coba lagi.' };
      }
      setUsername(found.username);
      await AsyncStorage.setItem(SESSION_KEY, found.username);
      return { ok: true };
    },
    [users],
  );

  const logout = useCallback(async () => {
    setUsername(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}
