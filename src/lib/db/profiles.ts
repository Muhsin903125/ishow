import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'trainer' | 'customer' | 'admin';
  customerStatus?: 'request' | 'client';
  avatarUrl?: string;
  createdAt: string;
}

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    role: row.role as Profile['role'],
    customerStatus: (row.customer_status as Profile['customerStatus']) ?? undefined,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'phone' | 'avatarUrl' | 'customerStatus'>>
): Promise<Profile | null> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.customerStatus !== undefined) dbUpdates.customer_status = updates.customerStatus;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function listCustomers(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('name');
  if (error || !data) return [];
  return data.map(mapProfile);
}

export async function listTrainers(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'trainer')
    .order('name');
  if (error || !data) return [];
  return data.map(mapProfile);
}

export async function deleteProfile(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  return !error;
}
