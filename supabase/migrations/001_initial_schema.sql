-- ============================================================
-- iShow Transformation Platform — Initial Schema
-- Run this in Supabase SQL Editor (in order)
-- ============================================================

-- -----------------------------------------------
-- PROFILES (extends auth.users)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('trainer', 'customer', 'admin')),
  customer_status TEXT DEFAULT 'request'
                  CHECK (customer_status IN ('request', 'client')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- MASTER: LOCATIONS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- MASTER: GOAL TYPES
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.goal_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0
);

-- -----------------------------------------------
-- MASTER: EXERCISE LIBRARY
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  category         TEXT CHECK (category IN ('strength', 'cardio', 'mobility', 'flexibility', 'other')),
  muscle_group     TEXT,
  equipment        TEXT,
  description      TEXT,
  default_sets     INT,
  default_reps     TEXT,
  default_duration TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- MASTER: PLAN TEMPLATES
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.plan_templates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  description        TEXT,
  monthly_rate       NUMERIC(10, 2),
  payment_frequency  TEXT NOT NULL DEFAULT 'monthly'
                       CHECK (payment_frequency IN ('weekly', 'monthly')),
  duration           TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plan_template_goals (
  template_id   UUID NOT NULL REFERENCES public.plan_templates(id) ON DELETE CASCADE,
  goal_type_id  UUID NOT NULL REFERENCES public.goal_types(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, goal_type_id)
);

-- -----------------------------------------------
-- ASSESSMENTS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_trainer_id   UUID REFERENCES public.profiles(id),
  age                   INT,
  weight                TEXT,
  height                TEXT,
  gender                TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  body_measurements     JSONB NOT NULL DEFAULT '{}',   -- {chest, waist, hips, arms}
  goals                 TEXT[] NOT NULL DEFAULT '{}',
  experience_level      TEXT,
  health_conditions     TEXT,
  medical_history       JSONB NOT NULL DEFAULT '{}',   -- structured checkboxes
  days_per_week         INT,
  preferred_times       TEXT,
  preferred_date        DATE,
  preferred_time_slot   TEXT,
  preferred_location_id UUID REFERENCES public.locations(id),
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'reviewed', 'rejected')),
  trainer_notes         TEXT,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at           TIMESTAMPTZ,
  converted_to_client_at TIMESTAMPTZ
);

-- -----------------------------------------------
-- PLANS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainer_id        UUID REFERENCES public.profiles(id),
  template_id       UUID REFERENCES public.plan_templates(id),
  name              TEXT NOT NULL,
  description       TEXT,
  monthly_rate      NUMERIC(10, 2),
  payment_frequency TEXT NOT NULL DEFAULT 'monthly'
                      CHECK (payment_frequency IN ('weekly', 'monthly')),
  goals             TEXT[] NOT NULL DEFAULT '{}',
  start_date        DATE,
  duration          TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('active', 'inactive', 'pending')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- SESSIONS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainer_id      UUID REFERENCES public.profiles(id),
  title           TEXT NOT NULL,
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL,
  duration        INT NOT NULL DEFAULT 60,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- PROGRAMS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.programs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainer_id   UUID REFERENCES public.profiles(id),
  week_number  INT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- PROGRAM ACTIVITIES (normalized)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.program_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  day           TEXT NOT NULL,
  exercise_id   UUID REFERENCES public.exercises(id),
  exercise_name TEXT NOT NULL,
  sets          INT,
  reps          TEXT,
  duration      TEXT,
  notes         TEXT,
  sort_order    INT NOT NULL DEFAULT 0
);

-- -----------------------------------------------
-- PAYMENTS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id     UUID REFERENCES public.plans(id),
  amount      NUMERIC(10, 2) NOT NULL,
  paid_date   DATE,
  due_date    DATE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('paid', 'pending', 'overdue')),
  reference   TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- UPDATED_AT trigger for profiles
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
