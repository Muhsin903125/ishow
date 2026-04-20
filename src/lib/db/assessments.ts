import { createClient } from '@/lib/supabase/client';
import { createNotification } from './notifications';

export interface BodyMeasurements {
  chest?: string;
  waist?: string;
  hips?: string;
  arms?: string;
}

export interface MedicalHistory {
  lowerBack?: boolean;
  knee?: boolean;
  shoulder?: boolean;
  heart?: boolean;
  diabetes?: boolean;
  hypertension?: boolean;
  other?: string;
}

export interface Assessment {
  id: string;
  userId: string;
  assignedTrainerId?: string;
  age?: number;
  weight?: string;
  height?: string;
  gender?: 'male' | 'female' | 'prefer_not_to_say';
  bodyMeasurements: BodyMeasurements;
  goals: string[];
  experienceLevel?: string;
  healthConditions?: string;
  medicalHistory: MedicalHistory;
  daysPerWeek?: number;
  preferredTimes?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  preferredLocationId?: string;
  preferredLocation?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  trainerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  convertedToClientAt?: string;
}

function mapAssessment(row: Record<string, unknown>): Assessment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    assignedTrainerId: (row.assigned_trainer_id as string) ?? undefined,
    age: (row.age as number) ?? undefined,
    weight: (row.weight as string) ?? undefined,
    height: (row.height as string) ?? undefined,
    gender: (row.gender as Assessment['gender']) ?? undefined,
    bodyMeasurements: (row.body_measurements as BodyMeasurements) ?? {},
    goals: (row.goals as string[]) ?? [],
    experienceLevel: (row.experience_level as string) ?? undefined,
    healthConditions: (row.health_conditions as string) ?? undefined,
    medicalHistory: (row.medical_history as MedicalHistory) ?? {},
    daysPerWeek: (row.days_per_week as number) ?? undefined,
    preferredTimes: (row.preferred_times as string) ?? undefined,
    preferredDate: (row.preferred_date as string) ?? undefined,
    preferredTimeSlot: (row.preferred_time_slot as string) ?? undefined,
    preferredLocationId: (row.preferred_location_id as string) ?? undefined,
    preferredLocation: (row.preferred_location as string) ?? undefined,
    status: row.status as Assessment['status'],
    trainerNotes: (row.trainer_notes as string) ?? undefined,
    submittedAt: row.submitted_at as string,
    reviewedAt: (row.reviewed_at as string) ?? undefined,
    convertedToClientAt: (row.converted_to_client_at as string) ?? undefined,
  };
}

export async function getAssessment(userId: string): Promise<Assessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return mapAssessment(data);
}

export async function listAssessments(status?: Assessment['status']): Promise<Assessment[]> {
  const supabase = createClient();
  let query = supabase.from('assessments').select('*').order('submitted_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapAssessment);
}

export async function submitAssessment(
  userId: string,
  payload: Omit<Assessment, 'id' | 'userId' | 'status' | 'submittedAt' | 'reviewedAt' | 'convertedToClientAt'>
): Promise<Assessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      age: payload.age,
      weight: payload.weight,
      height: payload.height,
      gender: payload.gender,
      body_measurements: payload.bodyMeasurements,
      goals: payload.goals,
      experience_level: payload.experienceLevel,
      health_conditions: payload.healthConditions,
      medical_history: payload.medicalHistory,
      days_per_week: payload.daysPerWeek,
      preferred_times: payload.preferredTimes,
      preferred_date: payload.preferredDate,
      preferred_time_slot: payload.preferredTimeSlot,
      preferred_location_id: payload.preferredLocationId,
      preferred_location: payload.preferredLocation,
      status: 'pending',
    })
    .select()
    .single();
  if (error || !data) return null;
  return mapAssessment(data);
}

export async function reviewAssessment(
  assessmentId: string,
  trainerNotes: string,
  status: 'reviewed' | 'rejected' = 'reviewed',
  assignedTrainerId?: string
): Promise<Assessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('assessments')
    .update({
      status,
      trainer_notes: trainerNotes,
      reviewed_at: new Date().toISOString(),
      converted_to_client_at: status === 'reviewed' ? new Date().toISOString() : null,
      assigned_trainer_id: assignedTrainerId ?? null,
    })
    .eq('id', assessmentId)
    .select()
    .single();
  if (error || !data) return null;

  // RT2: Notification
  await createNotification({
    userId: data.user_id,
    type: 'assessment_reviewed',
    title: 'Assessment Reviewed',
    body: 'Your fitness assessment has been reviewed. Your trainer will be in touch soon.',
    href: '/dashboard',
  });

  return mapAssessment(data);
}
