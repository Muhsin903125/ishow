import { getItems, setItems, addItem } from './storage';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'trainer' | 'customer';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'customer';
}

const USERS_KEY = 'ishow_users';
const AUTH_KEY = 'ishow_auth';

export function login(email: string, password: string): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const users = getItems<User>(USERS_KEY);
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return null;
  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  return authUser;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const users = getItems<User>(USERS_KEY);
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) return null;

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  addItem<User>(USERS_KEY, newUser);

  const authUser: AuthUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  return authUser;
}
