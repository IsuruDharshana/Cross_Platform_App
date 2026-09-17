import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';
import type { AuthSession, User } from '@/types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'USER' | 'ORGANIZER', phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
  updateProfile: (changes: { name?: string; phone?: string }) => Promise<User>;
}

const STORAGE_KEY = 'eventhub_session';

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  loading: true,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  refresh: async () => null,
  updateProfile: async () => ({ id: '', name: '', email: '', role: 'USER' }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = async (session: AuthSession | null) => {
    if (session) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setToken(session.token);
      setUser(session.user);
      return;
    }

    await AsyncStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setLoading(false);
          return;
        }

        const session: AuthSession = JSON.parse(raw) as AuthSession;
        setToken(session.token);
        setUser(session.user);
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await saveSession({ token: result.token, user: result.user });
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'USER' | 'ORGANIZER' = 'USER',
    phone?: string,
  ) => {
    const result = await apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phone }),
    });

    await saveSession({ token: result.token, user: result.user });
  };

  const logout = async () => {
    await saveSession(null);
  };

  const refresh = async (): Promise<User | null> => {
    if (!token) {
      return null;
    }

    try {
      const result = await apiFetch<{ user: User }>('/auth/me', { method: 'GET' }, token);
      setUser(result.user);
      return result.user;
    } catch {
      await saveSession(null);
      return null;
    }
  };

  const updateProfile = async (changes: { name?: string; phone?: string }) => {
    if (!token) {
      throw new Error('You need to sign in to update your profile.');
    }

    const result = await apiFetch<{ user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(changes),
    }, token);

    await saveSession({ token, user: result.user });
    return result.user;
  };

  const value: AuthContextValue = { token, user, loading, login, register, logout, refresh, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
