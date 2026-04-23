export function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    role: row.role as "trainer" | "customer" | "admin",
    customerStatus:
      (row.customer_status as "request" | "client" | undefined) ?? undefined,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export function mapAssessment(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    assignedTrainerId:
      (row.assigned_trainer_id as string) ??
      (row.assignedTrainerId as string) ??
      undefined,
    age: (row.age as number) ?? undefined,
    weight: (row.weight as string) ?? undefined,
    height: (row.height as string) ?? undefined,
    gender:
      ((row.gender as "male" | "female" | "prefer_not_to_say") ??
        (row.gender as "male" | "female" | "prefer_not_to_say")) ??
      undefined,
    bodyMeasurements:
      (row.body_measurements as Record<string, unknown>) ??
      (row.bodyMeasurements as Record<string, unknown>) ??
      {},
    goals: (row.goals as string[]) ?? [],
    experienceLevel:
      (row.experience_level as string) ??
      (row.experienceLevel as string) ??
      undefined,
    healthConditions:
      (row.health_conditions as string) ??
      (row.healthConditions as string) ??
      undefined,
    medicalHistory:
      (row.medical_history as Record<string, unknown>) ??
      (row.medicalHistory as Record<string, unknown>) ??
      {},
    daysPerWeek:
      (row.days_per_week as number) ?? (row.daysPerWeek as number) ?? undefined,
    preferredTimes:
      (row.preferred_times as string) ??
      (row.preferredTimes as string) ??
      undefined,
    preferredDate:
      (row.preferred_date as string) ??
      (row.preferredDate as string) ??
      undefined,
    preferredTimeSlot:
      (row.preferred_time_slot as string) ??
      (row.preferredTimeSlot as string) ??
      undefined,
    preferredLocationId:
      (row.preferred_location_id as string) ??
      (row.preferredLocationId as string) ??
      undefined,
    preferredLocation:
      (row.preferred_location as string) ??
      (row.preferredLocation as string) ??
      undefined,
    status:
      ((row.status as "pending" | "reviewed" | "rejected") ?? "pending") as
        | "pending"
        | "reviewed"
        | "rejected",
    trainerNotes:
      (row.trainer_notes as string) ??
      (row.trainerNotes as string) ??
      undefined,
    submittedAt:
      (row.submitted_at as string) ??
      (row.submittedAt as string) ??
      new Date().toISOString(),
    reviewedAt:
      (row.reviewed_at as string) ??
      (row.reviewedAt as string) ??
      undefined,
    convertedToClientAt:
      (row.converted_to_client_at as string) ??
      (row.convertedToClientAt as string) ??
      undefined,
  };
}

export function mapPlan(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    trainerId:
      (row.trainer_id as string) ?? (row.trainerId as string) ?? undefined,
    templateId:
      (row.template_id as string) ?? (row.templateId as string) ?? undefined,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    monthlyRate:
      (row.monthly_rate as number) ?? (row.monthlyRate as number) ?? undefined,
    paymentFrequency:
      ((row.payment_frequency as "weekly" | "monthly") ??
        (row.paymentFrequency as "weekly" | "monthly")) ?? "monthly",
    goals: (row.goals as string[]) ?? [],
    startDate:
      (row.start_date as string) ?? (row.startDate as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    status: row.status as "active" | "inactive" | "pending",
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export function mapSession(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    trainerId:
      (row.trainer_id as string) ?? (row.trainerId as string) ?? undefined,
    title: row.title as string,
    scheduledDate:
      (row.scheduled_date as string) ?? (row.scheduledDate as string),
    scheduledTime:
      (row.scheduled_time as string) ?? (row.scheduledTime as string),
    duration: ((row.duration as number) ?? 60) as number,
    status:
      ((row.status as "scheduled" | "completed" | "cancelled") ??
        "scheduled") as "scheduled" | "completed" | "cancelled",
    notes: (row.notes as string) ?? undefined,
    cancelReason:
      (row.cancel_reason as string) ?? (row.cancelReason as string) ?? undefined,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export function mapProgramActivity(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    programId: (row.program_id as string) ?? (row.programId as string),
    day: row.day as string,
    exerciseId:
      (row.exercise_id as string) ?? (row.exerciseId as string) ?? undefined,
    exerciseName:
      (row.exercise_name as string) ?? (row.exerciseName as string),
    sets: (row.sets as number) ?? undefined,
    reps: (row.reps as string) ?? undefined,
    duration: (row.duration as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    sortOrder:
      ((row.sort_order as number) ?? (row.sortOrder as number) ?? 0) as number,
  };
}

export function mapProgram(row: Record<string, unknown>) {
  const activities = (
    (row.program_activities as Record<string, unknown>[]) ?? []
  )
    .map(mapProgramActivity)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    trainerId:
      (row.trainer_id as string) ?? (row.trainerId as string) ?? undefined,
    weekNumber:
      ((row.week_number as number) ?? (row.weekNumber as number)) as number,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
    activities,
  };
}

export function mapPayment(row: Record<string, unknown>) {
  const paidAmount =
    ((row.paid_amount as number) ?? (row.paidAmount as number) ?? 0) as number;
  const amount = row.amount as number;

  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? (row.userId as string),
    planId: (row.plan_id as string) ?? (row.planId as string) ?? undefined,
    amount,
    paidAmount,
    balanceAmount:
      ((row.balance_amount as number) ??
        (row.balanceAmount as number) ??
        Math.max(amount - paidAmount, 0)) as number,
    paidDate:
      (row.paid_date as string) ?? (row.paidDate as string) ?? undefined,
    dueDate: (row.due_date as string) ?? (row.dueDate as string) ?? undefined,
    status: row.status as "paid" | "pending" | "overdue",
    reference: (row.reference as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    createdAt: (row.created_at as string) ?? (row.createdAt as string),
  };
}

export function mapExercise(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    category:
      (row.category as
        | "strength"
        | "cardio"
        | "mobility"
        | "flexibility"
        | "other") ?? undefined,
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

export function mapLandingTestimonial(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    location: (row.location as string | null) ?? null,
    result_label: (row.result_label as string | null) ?? null,
    quote: row.quote as string,
    rating: (row.rating as number) ?? 5,
    role: (row.role as string | null) ?? null,
  };
}
