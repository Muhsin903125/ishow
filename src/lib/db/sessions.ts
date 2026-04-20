import { createClient } from '@/lib/supabase/client';
import { createNotification } from './notifications';

export interface TrainingSession {
  id: string;
  userId: string;
  trainerId?: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

function mapSession(row: Record<string, unknown>): TrainingSession {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: (row.trainer_id as string) ?? undefined,
    title: row.title as string,
    scheduledDate: row.scheduled_date as string,
    scheduledTime: row.scheduled_time as string,
    duration: (row.duration as number) ?? 60,
    status: row.status as TrainingSession['status'],
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function listSessions(filters?: { userId?: string; trainerId?: string; status?: string }): Promise<TrainingSession[]> {
  const supabase = createClient();
  let query = supabase
    .from('sessions')
    .select('*')
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });
  if (filters?.userId) query = query.eq('user_id', filters.userId);
  if (filters?.trainerId) query = query.eq('trainer_id', filters.trainerId);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapSession);
}

export async function createSession(
  payload: Omit<TrainingSession, 'id' | 'createdAt'>
): Promise<TrainingSession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: payload.userId,
      trainer_id: payload.trainerId,
      title: payload.title,
      scheduled_date: payload.scheduledDate,
      scheduled_time: payload.scheduledTime,
      duration: payload.duration,
      status: payload.status,
      notes: payload.notes,
    })
    .select()
    .single();
  if (error || !data) return null;

  // RT2: Notification
  await createNotification({
    userId: payload.userId,
    type: 'session_booked',
    title: 'Session Scheduled',
    body: `Your session "${payload.title}" is scheduled for ${new Date(payload.scheduledDate + "T00:00:00").toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${payload.scheduledTime}.`,
    href: '/sessions',
  });

  return mapSession(data);
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<TrainingSession, 'id' | 'userId' | 'createdAt'>>
): Promise<TrainingSession | null> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
  if (updates.scheduledTime !== undefined) dbUpdates.scheduled_time = updates.scheduledTime;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.trainerId !== undefined) dbUpdates.trainer_id = updates.trainerId;

  const { data, error } = await supabase
    .from('sessions')
    .update(dbUpdates)
    .eq('id', sessionId)
    .select()
    .single();
  if (error || !data) return null;
  return mapSession(data);
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
  return !error;
}
