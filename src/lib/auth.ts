import { getItems, addItem } from './storage';

export type CustomerStatus = 'request' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'trainer' | 'customer';
  customerStatus?: CustomerStatus;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'customer';
  customerStatus?: CustomerStatus;
}

const USERS_KEY = 'ishow_users';
const AUTH_KEY = 'ishow_auth';

const DEMO_ALIASES = [
  {
    userId: 'user_trainer_1',
    emails: ['trainer@ishow.com'],
    passwords: ['trainer123'],
  },
  {
    userId: 'user_john_1',
    emails: ['customer@ishow.com', 'john@example.com'],
    passwords: ['customer123', 'demo123'],
  },
];

function findUserByDemoAlias(users: User[], email: string, password: string): User | null {
  const alias = DEMO_ALIASES.find(
    (item) => item.emails.includes(email) && item.passwords.includes(password)
  );

  if (!alias) return null;
  return users.find((user) => user.id === alias.userId) ?? null;
}

export function login(email: string, password: string): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const normalizedEmail = email.trim().toLowerCase();
  const users = getItems<User>(USERS_KEY);
  const user =
    users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    ) ?? findUserByDemoAlias(users, normalizedEmail, password);
  if (!user) return null;
  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerStatus: user.customerStatus,
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
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedName = data.name.trim();
  const normalizedPhone = data.phone?.trim() || undefined;
  const users = getItems<User>(USERS_KEY);
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) return null;

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: normalizedName,
    email: normalizedEmail,
    password: data.password,
    phone: normalizedPhone,
    role: 'customer',
    customerStatus: 'request',
    createdAt: new Date().toISOString(),
  };

  addItem<User>(USERS_KEY, newUser);

  const authUser: AuthUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    customerStatus: newUser.customerStatus,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  return authUser;
}
