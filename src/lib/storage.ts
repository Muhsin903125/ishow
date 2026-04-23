// Legacy localStorage helper kept only for archived `src/app_old` references.
// Active runtime flows must use Supabase-backed reads and same-origin API routes instead.
export function getItems<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
 
export function setItems<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function addItem<T extends { id: string }>(key: string, item: T): T {
  const items = getItems<T>(key);
  items.push(item);
  setItems(key, items);
  return item;
}

export function updateItem<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T | null {
  const items = getItems<T>(key);
  const index = items.findIndex((item) => (item as T & { id: string }).id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  setItems(key, items);
  return items[index];
}

export function deleteItem(key: string, id: string): void {
  const items = getItems<{ id: string }>(key);
  setItems(key, items.filter((item) => item.id !== id));
}

export function getItem<T extends { id: string }>(key: string, id: string): T | null {
  const items = getItems<T>(key);
  return items.find((item) => item.id === id) || null;
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  const keys = ['ishow_users', 'ishow_auth', 'ishow_assessments', 'ishow_plans', 'ishow_sessions', 'ishow_programs', 'ishow_payments', 'ishow_seeded'];
  keys.forEach((key) => localStorage.removeItem(key));
}
