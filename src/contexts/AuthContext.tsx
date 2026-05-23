import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, setAuthErrorHandler } from '@/lib/api';

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  address: any;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AppUser>) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'shop_user';
const CART_KEY = 'ecom_cart';

function clearAllSessionData() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CART_KEY);
  setToken(null);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const performLogout = useCallback(() => {
    setUser(null);
    clearAllSessionData();
  }, []);

  useEffect(() => {
    setAuthErrorHandler(performLogout);
  }, [performLogout]);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    api.get<AppUser>('/auth/me').then(({ data, error }) => {
      if (data) {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      } else if (error) {
        performLogout();
      }
      setLoading(false);
    });
  }, [performLogout]);

  const login = async (email: string, password: string) => {
    clearAllSessionData();

    const { data, error } = await api.post<{ token: string; user: AppUser }>('/auth/login', { email, password });
    if (error || !data) return { success: false, error: error || 'Login failed' };
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    clearAllSessionData();

    const { data, error } = await api.post<{ token: string; user: AppUser }>('/auth/register', { email, password, name });
    if (error || !data) return { success: false, error: error || 'Registration failed' };
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return { success: true };
  };

  const logout = () => {
    performLogout();
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    const { data: updated, error } = await api.patch<AppUser>('/auth/me', data);
    if (error || !updated) return { success: false, error: error || 'Update failed' };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return { success: true };
  };

  const refresh = async () => {
    const { data } = await api.get<AppUser>('/auth/me');
    if (data) {
      setUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
