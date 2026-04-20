import { createClient } from "@/lib/supabase/client";

export interface Measurement {
  id: string;
  userId: string;
  recordedAt: string;
  weightKg?: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  notes?: string;
  createdAt: string;
}

function mapMeasurement(row: Record<string, unknown>): Measurement {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    recordedAt: row.recorded_at as string,
    weightKg: (row.weight_kg as number) ?? undefined,
    bodyFatPct: (row.body_fat_pct as number) ?? undefined,
    chestCm: (row.chest_cm as number) ?? undefined,
    waistCm: (row.waist_cm as number) ?? undefined,
    hipsCm: (row.hips_cm as number) ?? undefined,
    armsCm: (row.arms_cm as number) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function listMeasurements(userId: string): Promise<Measurement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("measurements")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });
  if (error || !data) return [];
  return data.map(mapMeasurement);
}

export async function addMeasurement(
  userId: string,
  input: Omit<Measurement, "id" | "userId" | "createdAt">
): Promise<Measurement | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("measurements")
    .insert({
      user_id: userId,
      recorded_at: input.recordedAt,
      weight_kg: input.weightKg ?? null,
      body_fat_pct: input.bodyFatPct ?? null,
      chest_cm: input.chestCm ?? null,
      waist_cm: input.waistCm ?? null,
      hips_cm: input.hipsCm ?? null,
      arms_cm: input.armsCm ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return mapMeasurement(data);
}
