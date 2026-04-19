-- ============================================================
-- iShow — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_types         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_template_goals ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------
-- Helper function: get current user role
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------
-- PROFILES
-- -----------------------------------------------
-- Users can read/update their own profile
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Trainers and admins can read all profiles
CREATE POLICY "profiles_trainer_admin_read" ON public.profiles
  FOR SELECT USING (public.current_user_role() IN ('trainer', 'admin'));

-- Admins can update any profile (e.g. change role)
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.current_user_role() = 'admin');

-- -----------------------------------------------
-- ASSESSMENTS
-- -----------------------------------------------
CREATE POLICY "assessments_own" ON public.assessments
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "assessments_trainer_admin" ON public.assessments
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- PLANS
-- -----------------------------------------------
CREATE POLICY "plans_own" ON public.plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "plans_trainer_admin" ON public.plans
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- SESSIONS
-- -----------------------------------------------
CREATE POLICY "sessions_own" ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_trainer_admin" ON public.sessions
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- PROGRAMS
-- -----------------------------------------------
CREATE POLICY "programs_own" ON public.programs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "programs_trainer_admin" ON public.programs
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- PROGRAM ACTIVITIES
-- -----------------------------------------------
CREATE POLICY "activities_via_program_own" ON public.program_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "activities_trainer_admin" ON public.program_activities
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- PAYMENTS
-- -----------------------------------------------
CREATE POLICY "payments_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "payments_trainer_admin" ON public.payments
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- MASTER TABLES — read for all authenticated users
-- -----------------------------------------------
CREATE POLICY "locations_read" ON public.locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "locations_trainer_admin_write" ON public.locations
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

CREATE POLICY "goal_types_read" ON public.goal_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "goal_types_trainer_admin_write" ON public.goal_types
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

CREATE POLICY "exercises_read" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "exercises_trainer_admin_write" ON public.exercises
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

CREATE POLICY "plan_templates_read" ON public.plan_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "plan_templates_trainer_admin_write" ON public.plan_templates
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

CREATE POLICY "plan_template_goals_read" ON public.plan_template_goals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "plan_template_goals_trainer_admin_write" ON public.plan_template_goals
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));
