import { createClient } from '@/lib/supabase/client';

export interface Plan {
  id: string;
  userId: string;
  trainerId?: string;
  templateId?: string;
  name: string;
  description?: string;
  monthlyRate?: number;
  paymentFrequency: 'weekly' | 'monthly';
  goals: string[];
  startDate?: string;
  duration?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

function mapPlan(row: Record<string, unknown>): Plan {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: (row.trainer_id as string) ?? undefined,
    templateId: (row.template_id as string) ?? undefined,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    monthlyRate: (row.monthly_rate as number) ?? undefined,
    paymentFrequency: (row.payment_frequency as Plan['paymentFrequency']) ?? 'monthly',
    goals: (row.goals as string[]) ?? [],
    startDate: (row.start_date as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    status: row.status as Plan['status'],
    createdAt: row.created_at as string,
  };
}

export async function getActivePlan(userId: string): Promise<Plan | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return mapPlan(data);
}

export async function getPlan(userId: string): Promise<Plan | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return mapPlan(data);
}

export async function listAllPlans(): Promise<Plan[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapPlan);
}

export async function createPlan(
  payload: Omit<Plan, 'id' | 'createdAt'>
): Promise<Plan | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plans')
    .insert({
      user_id: payload.userId,
      trainer_id: payload.trainerId,
      template_id: payload.templateId,
      name: payload.name,
      description: payload.description,
      monthly_rate: payload.monthlyRate,
      payment_frequency: payload.paymentFrequency,
      goals: payload.goals,
      start_date: payload.startDate,
      duration: payload.duration,
      status: payload.status,
    })
    .select()
    .single();
  if (error || !data) return null;
  return mapPlan(data);
}

export async function updatePlan(
  planId: string,
  updates: Partial<Omit<Plan, 'id' | 'userId' | 'createdAt'>>
): Promise<Plan | null> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.monthlyRate !== undefined) dbUpdates.monthly_rate = updates.monthlyRate;
  if (updates.paymentFrequency !== undefined) dbUpdates.payment_frequency = updates.paymentFrequency;
  if (updates.goals !== undefined) dbUpdates.goals = updates.goals;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.trainerId !== undefined) dbUpdates.trainer_id = updates.trainerId;

  const { data, error } = await supabase
    .from('plans')
    .update(dbUpdates)
    .eq('id', planId)
    .select()
    .single();
  if (error || !data) return null;
  return mapPlan(data);
}

export async function deletePlan(planId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('plans').delete().eq('id', planId);
  return !error;
}
