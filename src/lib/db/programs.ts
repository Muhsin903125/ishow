import { createClient } from '@/lib/supabase/client';

export interface ProgramActivity {
  id: string;
  programId: string;
  day: string;
  exerciseId?: string;
  exerciseName: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
  sortOrder: number;
}

export interface Program {
  id: string;
  userId: string;
  trainerId?: string;
  weekNumber: number;
  title: string;
  description?: string;
  createdAt: string;
  activities?: ProgramActivity[];
}

function mapActivity(row: Record<string, unknown>): ProgramActivity {
  return {
    id: row.id as string,
    programId: row.program_id as string,
    day: row.day as string,
    exerciseId: (row.exercise_id as string) ?? undefined,
    exerciseName: row.exercise_name as string,
    sets: (row.sets as number) ?? undefined,
    reps: (row.reps as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function mapProgram(row: Record<string, unknown>, activities?: ProgramActivity[]): Program {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    trainerId: (row.trainer_id as string) ?? undefined,
    weekNumber: row.week_number as number,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    createdAt: row.created_at as string,
    activities: activities ?? [],
  };
}

export async function listPrograms(userId?: string): Promise<Program[]> {
  const supabase = createClient();
  let query = supabase
    .from('programs')
    .select('*, program_activities(*)')
    .order('week_number', { ascending: true });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => {
    const acts = ((row.program_activities as Record<string, unknown>[]) ?? []).map(mapActivity);
    return mapProgram(row, acts.sort((a, b) => a.sortOrder - b.sortOrder));
  });
}

export async function createProgram(
  payload: Omit<Program, 'id' | 'createdAt'>,
  activities: Omit<ProgramActivity, 'id' | 'programId'>[]
): Promise<Program | null> {
  const supabase = createClient();
  const { data: prog, error: progErr } = await supabase
    .from('programs')
    .insert({
      user_id: payload.userId,
      trainer_id: payload.trainerId,
      week_number: payload.weekNumber,
      title: payload.title,
      description: payload.description,
    })
    .select()
    .single();
  if (progErr || !prog) return null;

  if (activities.length > 0) {
    const { error: actErr } = await supabase.from('program_activities').insert(
      activities.map((a, i) => ({
        program_id: prog.id,
        day: a.day,
        exercise_id: a.exerciseId ?? null,
        exercise_name: a.exerciseName,
        sets: a.sets ?? null,
        reps: a.reps ?? null,
        duration: a.duration ?? null,
        notes: a.notes ?? null,
        sort_order: a.sortOrder ?? i,
      }))
    );
    if (actErr) console.error('Failed to insert activities:', actErr);
  }

  const programs = await listPrograms(payload.userId);
  return programs.find(p => p.id === prog.id) ?? mapProgram(prog);
}

export async function updateProgram(
  programId: string,
  updates: Partial<Pick<Program, 'title' | 'description' | 'weekNumber'>>,
  activities?: Omit<ProgramActivity, 'id' | 'programId'>[]
): Promise<Program | null> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.weekNumber !== undefined) dbUpdates.week_number = updates.weekNumber;

  if (Object.keys(dbUpdates).length > 0) {
    await supabase.from('programs').update(dbUpdates).eq('id', programId);
  }

  if (activities !== undefined) {
    await supabase.from('program_activities').delete().eq('program_id', programId);
    if (activities.length > 0) {
      await supabase.from('program_activities').insert(
        activities.map((a, i) => ({
          program_id: programId,
          day: a.day,
          exercise_id: a.exerciseId ?? null,
          exercise_name: a.exerciseName,
          sets: a.sets ?? null,
          reps: a.reps ?? null,
          duration: a.duration ?? null,
          notes: a.notes ?? null,
          sort_order: a.sortOrder ?? i,
        }))
      );
    }
  }

  const { data } = await supabase
    .from('programs')
    .select('*, program_activities(*)')
    .eq('id', programId)
    .single();
  if (!data) return null;
  const acts = ((data.program_activities as Record<string, unknown>[]) ?? []).map(mapActivity);
  return mapProgram(data as Record<string, unknown>, acts.sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function deleteProgram(programId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('programs').delete().eq('id', programId);
  return !error;
}

export async function duplicateProgramToNextWeek(programId: string): Promise<Program | null> {
  const supabase = createClient();
  const { data: src } = await supabase
    .from('programs')
    .select('*, program_activities(*)')
    .eq('id', programId)
    .single();
  if (!src) return null;

  const activities = ((src.program_activities as Record<string, unknown>[]) ?? []).map(mapActivity);
  return createProgram(
    {
      userId: src.user_id as string,
      trainerId: (src.trainer_id as string) ?? undefined,
      weekNumber: (src.week_number as number) + 1,
      title: `${src.title as string} (Week ${(src.week_number as number) + 1})`,
      description: src.description as string | undefined,
    },
    activities.map(a => ({
      day: a.day,
      exerciseId: a.exerciseId,
      exerciseName: a.exerciseName,
      sets: a.sets,
      reps: a.reps,
      duration: a.duration,
      notes: a.notes,
      sortOrder: a.sortOrder,
    }))
  );
}
