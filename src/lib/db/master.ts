import { createClient } from '@/lib/supabase/client';

// -----------------------------------------------
// Locations
// -----------------------------------------------
export interface Location {
  id: string;
  name: string;
  city?: string;
  isActive: boolean;
  sortOrder: number;
}

function mapLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as string,
    name: row.name as string,
    city: (row.city as string) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

export async function getLocations(activeOnly = true): Promise<Location[]> {
  const supabase = createClient();
  let query = supabase.from('locations').select('*').order('sort_order');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapLocation);
}

export async function upsertLocation(payload: Partial<Location> & { name: string }): Promise<Location | null> {
  const supabase = createClient();
  const row = { name: payload.name, city: payload.city ?? null, is_active: payload.isActive ?? true, sort_order: payload.sortOrder ?? 0 };
  const { data, error } = payload.id
    ? await supabase.from('locations').update(row).eq('id', payload.id).select().single()
    : await supabase.from('locations').insert(row).select().single();
  if (error || !data) return null;
  return mapLocation(data);
}

export async function deleteLocation(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('locations').delete().eq('id', id);
  return !error;
}

// -----------------------------------------------
// Goal Types
// -----------------------------------------------
export interface GoalType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

function mapGoalType(row: Record<string, unknown>): GoalType {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? undefined,
    icon: (row.icon as string) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

export async function getGoalTypes(activeOnly = true): Promise<GoalType[]> {
  const supabase = createClient();
  let query = supabase.from('goal_types').select('*').order('sort_order');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapGoalType);
}

export async function upsertGoalType(payload: Partial<GoalType> & { name: string; slug: string }): Promise<GoalType | null> {
  const supabase = createClient();
  const row = { name: payload.name, slug: payload.slug, description: payload.description ?? null, icon: payload.icon ?? null, is_active: payload.isActive ?? true, sort_order: payload.sortOrder ?? 0 };
  const { data, error } = payload.id
    ? await supabase.from('goal_types').update(row).eq('id', payload.id).select().single()
    : await supabase.from('goal_types').insert(row).select().single();
  if (error || !data) return null;
  return mapGoalType(data);
}

export async function deleteGoalType(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('goal_types').delete().eq('id', id);
  return !error;
}

// -----------------------------------------------
// Exercises
// -----------------------------------------------
export interface Exercise {
  id: string;
  name: string;
  category?: 'strength' | 'cardio' | 'mobility' | 'flexibility' | 'other';
  muscleGroup?: string;
  equipment?: string;
  description?: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultDuration?: string;
  videoUrl?: string;
  isActive: boolean;
}

function mapExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    name: row.name as string,
    category: (row.category as Exercise['category']) ?? undefined,
    muscleGroup: (row.muscle_group as string) ?? undefined,
    equipment: (row.equipment as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    defaultSets: (row.default_sets as number) ?? undefined,
    defaultReps: (row.default_reps as string) ?? undefined,
    defaultDuration: (row.default_duration as string) ?? undefined,
    videoUrl: (row.video_url as string) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
  };
}

export async function getExercises(activeOnly = true): Promise<Exercise[]> {
  const supabase = createClient();
  let query = supabase.from('exercises').select('*').order('name');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapExercise);
}

export async function upsertExercise(payload: Partial<Exercise> & { name: string }): Promise<Exercise | null> {
  const supabase = createClient();
  const row = {
    name: payload.name,
    category: payload.category ?? null,
    muscle_group: payload.muscleGroup ?? null,
    equipment: payload.equipment ?? null,
    description: payload.description ?? null,
    default_sets: payload.defaultSets ?? null,
    default_reps: payload.defaultReps ?? null,
    default_duration: payload.defaultDuration ?? null,
    video_url: payload.videoUrl ?? null,
    is_active: payload.isActive ?? true,
  };
  const { data, error } = payload.id
    ? await supabase.from('exercises').update(row).eq('id', payload.id).select().single()
    : await supabase.from('exercises').insert(row).select().single();
  if (error || !data) return null;
  return mapExercise(data);
}

const VIDEO_BUCKET = 'exercise-videos';

export async function uploadExerciseVideo(exerciseId: string, file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'mp4';
  const path = `${exerciseId}.${ext}`;
  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteExerciseVideo(videoUrl: string): Promise<boolean> {
  const supabase = createClient();
  const parts = videoUrl.split(`/${VIDEO_BUCKET}/`);
  if (parts.length < 2) return false;
  const { error } = await supabase.storage.from(VIDEO_BUCKET).remove([parts[1]]);
  return !error;
}

export async function deleteExercise(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  return !error;
}

// -----------------------------------------------
// Plan Templates
// -----------------------------------------------
export interface PlanTemplate {
  id: string;
  name: string;
  description?: string;
  monthlyRate?: number;
  paymentFrequency: 'weekly' | 'monthly';
  duration?: string;
  isActive: boolean;
  goals?: string[];
}

function mapTemplate(row: Record<string, unknown>): PlanTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    monthlyRate: (row.monthly_rate as number) ?? undefined,
    paymentFrequency: (row.payment_frequency as PlanTemplate['paymentFrequency']) ?? 'monthly',
    duration: (row.duration as string) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    goals: (row.goals as string[]) ?? [],
  };
}

export async function getPlanTemplates(activeOnly = true): Promise<PlanTemplate[]> {
  const supabase = createClient();
  let query = supabase.from('plan_templates').select('*').order('name');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapTemplate);
}

export async function upsertPlanTemplate(payload: Partial<PlanTemplate> & { name: string }): Promise<PlanTemplate | null> {
  const supabase = createClient();
  const row = {
    name: payload.name,
    description: payload.description ?? null,
    monthly_rate: payload.monthlyRate ?? null,
    payment_frequency: payload.paymentFrequency ?? 'monthly',
    duration: payload.duration ?? null,
    is_active: payload.isActive ?? true,
  };
  const { data, error } = payload.id
    ? await supabase.from('plan_templates').update(row).eq('id', payload.id).select().single()
    : await supabase.from('plan_templates').insert(row).select().single();
  if (error || !data) return null;
  return mapTemplate(data);
}

export async function deletePlanTemplate(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('plan_templates').delete().eq('id', id);
  return !error;
}
