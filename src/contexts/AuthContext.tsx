'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'customer' | 'admin';
  customerStatus?: 'request' | 'client';
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({ error: null }),
  loginWithGoogle: async () => ({ error: null }),
  logout: async () => {},
  register: async () => ({ error: null }),
  sendPasswordResetEmail: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

const DEMO_STORAGE_KEY = 'ishow_demo_auth';
const DEMO_COOKIE_KEY = 'ishow_demo_auth';
const DEMO_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true' &&
  process.env.NODE_ENV !== 'production';

function setDemoCookie(enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.cookie = enabled
    ? `${DEMO_COOKIE_KEY}=1; path=/; max-age=604800; samesite=lax`
    : `${DEMO_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

async function fetchProfile(supabaseUser: User): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, customer_status')
    .eq('id', supabaseUser.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: supabaseUser.email ?? '',
    role: data.role as AuthUser['role'],
    customerStatus: data.customer_status ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        if (session?.user) {
          localStorage.removeItem(DEMO_STORAGE_KEY);
          setDemoCookie(false);
          const profile = await fetchProfile(session.user);
          if (mounted) setUser(profile);
        } else {
          const savedDemoUser = DEMO_AUTH_ENABLED
            ? localStorage.getItem(DEMO_STORAGE_KEY)
            : null;
          if (DEMO_AUTH_ENABLED && savedDemoUser) {
            try {
              setDemoCookie(true);
              setUser(JSON.parse(savedDemoUser) as AuthUser);
            } catch {
              localStorage.removeItem(DEMO_STORAGE_KEY);
              setDemoCookie(false);
            }
          } else {
            setDemoCookie(false);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem(DEMO_STORAGE_KEY);
          setDemoCookie(false);
          setUser(null);
          setLoading(false);
        } else if (session?.user) {
          localStorage.removeItem(DEMO_STORAGE_KEY);
          setDemoCookie(false);
          // If we have a session but no user yet, or it's a new sign in
          setLoading(true);
          const profile = await fetchProfile(session.user);
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        } else {
          setDemoCookie(false);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const demoUsers: Record<string, { id: string; role: 'admin' | 'trainer' | 'customer'; name: string }> = {
      'admin@ishow.ae': { id: '00000000-aaaa-aaaa-aaaa-000000000000', role: 'admin', name: 'Admin' },
      'trainer@ishow.ae': { id: '00000000-bbbb-bbbb-bbbb-000000000000', role: 'trainer', name: 'Trainer' },
      'client@ishow.ae': { id: '00000000-cccc-cccc-cccc-000000000000', role: 'customer', name: 'Client' },
    };

    if (DEMO_AUTH_ENABLED && demoUsers[email] && password === 'ishow2024') {
      console.log("Demo login detected for:", email);
      const demoUser: AuthUser = {
        id: demoUsers[email].id,
        name: demoUsers[email].name,
        email: email,
        role: demoUsers[email].role,
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
      setDemoCookie(true);
      setSession(null);
      setUser(demoUser);
      setLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setDemoCookie(false);
      setUser(null);
      setSession(null);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          name: data.name,
          phone: data.phone ?? null,
          role: 'customer',
        },
      },
    });

    if (error) return { error: error.message };
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setDemoCookie(false);
    return { error: null, needsConfirmation: true };
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        loginWithGoogle,
        logout,
        register,
        sendPasswordResetEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function isDemoAuthEnabled() {
  return DEMO_AUTH_ENABLED;
}
