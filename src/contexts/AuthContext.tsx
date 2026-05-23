import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

const STORAGE_KEY = 'shop_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        // refresh from DB
        supabase.from('app_users').select('*').eq('id', u.id).single().then(({ data }) => {
          if (data) {
            setUser(data as AppUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        });
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Invalid email or password' };
    setUser(data as AppUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (existing) return { success: false, error: 'Email already registered' };
    const { data, error } = await supabase
      .from('app_users')
      .insert({ email: cleanEmail, password, name, role: 'customer' })
      .select('*')
      .single();
    if (error) return { success: false, error: error.message };
    setUser(data as AppUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Add to CRM
    try {
      await fetch('https://famous.ai/api/crm/6a102606978e06760a2ea96b/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name,
          source: 'registration',
          tags: ['customer', 'newsletter']
        })
      });
    } catch {}
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) return { success: false, error: 'Not logged in' };
    const { data: updated, error } = await supabase
      .from('app_users')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('*')
      .single();
    if (error) return { success: false, error: error.message };
    setUser(updated as AppUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { success: true };
  };

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from('app_users').select('*').eq('id', user.id).single();
    if (data) {
      setUser(data as AppUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
