'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as authLogin, logout as authLogout, getCurrentUser, register as authRegister, AuthUser } from '@/lib/auth';
import { seedMockData } from '@/lib/mockData';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: () => {},
  register: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedMockData();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    const result = authLogin(email, password);
    if (result) setUser(result);
    return result;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }): Promise<AuthUser | null> => {
    const result = authRegister(data);
    if (result) setUser(result);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
