-- ============================================================
-- iShow — Sample Data Seed
-- Creates trainers, clients, assessments, exercises, meals,
-- active plans, programs, sessions, and payments.
--
-- NOTE: Profiles use fake auth.users rows. These users cannot
--       log in — they exist for display / testing only.
-- ============================================================

-- -----------------------------------------------
-- 0. MEAL SUGGESTIONS TABLE (new master table)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_suggestions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('breakfast','lunch','dinner','snack')),
  calories    INT,
  protein_g   NUMERIC(5,1),
  carbs_g     NUMERIC(5,1),
  fats_g      NUMERIC(5,1),
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.meal_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_suggestions_read" ON public.meal_suggestions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "meal_suggestions_trainer_admin_write" ON public.meal_suggestions
  FOR ALL USING (public.current_user_role() IN ('trainer', 'admin'));

-- -----------------------------------------------
-- 1. INSERT INTO auth.users (fake, display-only)
-- -----------------------------------------------
-- Password hash = bcrypt('Password1!') — won't be used for login
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES
  -- ADMIN
  ('00000000-0000-0000-0000-000000000000', '00000000-aaaa-aaaa-aaaa-000000000000', 'authenticated', 'authenticated',
   'admin@ishow.ae', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"iShow Admin","role":"admin"}', ''),
  -- TRAINERS
  ('00000000-0000-0000-0000-000000000000', '00000000-aaaa-aaaa-aaaa-000000000001', 'authenticated', 'authenticated',
   'ahmed.coach@ishow.ae', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Coach Ahmed","role":"trainer"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-aaaa-aaaa-aaaa-000000000002', 'authenticated', 'authenticated',
   'sarah.fit@ishow.ae', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Coach Sarah","role":"trainer"}', ''),
  -- CLIENTS (12)
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000011', 'authenticated', 'authenticated',
   'khalid@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Khalid Al-Rashid"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000012', 'authenticated', 'authenticated',
   'fatima.h@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Fatima Hassan"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000013', 'authenticated', 'authenticated',
   'omar.malik@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Omar Malik"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000014', 'authenticated', 'authenticated',
   'layla.noor@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Layla Noor"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000015', 'authenticated', 'authenticated',
   'yusuf.khan@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Yusuf Khan"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000016', 'authenticated', 'authenticated',
   'aisha.patel@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Aisha Patel"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000017', 'authenticated', 'authenticated',
   'hassan.ali@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Hassan Ali"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000018', 'authenticated', 'authenticated',
   'maryam.saeed@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Maryam Saeed"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000019', 'authenticated', 'authenticated',
   'tariq.fayed@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Tariq Al-Fayed"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000020', 'authenticated', 'authenticated',
   'nadia.jaber@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Nadia Jaber"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000021', 'authenticated', 'authenticated',
   'rami.haddad@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Rami Haddad"}', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-bbbb-bbbb-bbbb-000000000022', 'authenticated', 'authenticated',
   'sara.elamin@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZab',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Sara El-Amin"}', '')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 2. UPDATE PROFILES (created by trigger)
-- -----------------------------------------------
-- Admin
UPDATE public.profiles SET role = 'admin', name = 'iShow Admin', email = 'admin@ishow.ae'
WHERE id = '00000000-aaaa-aaaa-aaaa-000000000000';

-- Trainers
UPDATE public.profiles SET role = 'trainer', name = 'Coach Ahmed', email = 'ahmed.coach@ishow.ae', phone = '+971501234501'
WHERE id = '00000000-aaaa-aaaa-aaaa-000000000001';

UPDATE public.profiles SET role = 'trainer', name = 'Coach Sarah', email = 'sarah.fit@ishow.ae', phone = '+971501234502'
WHERE id = '00000000-aaaa-aaaa-aaaa-000000000002';

-- Active clients (customer_status = 'client')
UPDATE public.profiles SET name = 'Khalid Al-Rashid', email = 'khalid@example.com', phone = '+971551000001', customer_status = 'client'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000011';
UPDATE public.profiles SET name = 'Fatima Hassan', email = 'fatima.h@example.com', phone = '+971551000002', customer_status = 'client'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000012';
UPDATE public.profiles SET name = 'Omar Malik', email = 'omar.malik@example.com', phone = '+971551000003', customer_status = 'client'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000013';
UPDATE public.profiles SET name = 'Layla Noor', email = 'layla.noor@example.com', phone = '+971551000004', customer_status = 'client'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000014';
UPDATE public.profiles SET name = 'Yusuf Khan', email = 'yusuf.khan@example.com', phone = '+971551000005', customer_status = 'client'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000015';
UPDATE public.profiles SET name = 'Aisha Patel', email = 'aisha.patel@example.com', phone = '+971551000006', customer_status = 'client'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000016';

-- Request-only clients (pending assessment / not yet converted)
UPDATE public.profiles SET name = 'Hassan Ali', email = 'hassan.ali@example.com', phone = '+971551000007', customer_status = 'request'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000017';
UPDATE public.profiles SET name = 'Maryam Saeed', email = 'maryam.saeed@example.com', phone = '+971551000008', customer_status = 'request'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000018';
UPDATE public.profiles SET name = 'Tariq Al-Fayed', email = 'tariq.fayed@example.com', phone = '+971551000009', customer_status = 'request'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000019';
UPDATE public.profiles SET name = 'Nadia Jaber', email = 'nadia.jaber@example.com', phone = '+971551000010', customer_status = 'request'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000020';
UPDATE public.profiles SET name = 'Rami Haddad', email = 'rami.haddad@example.com', phone = '+971551000011', customer_status = 'request'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000021';
UPDATE public.profiles SET name = 'Sara El-Amin', email = 'sara.elamin@example.com', phone = '+971551000012', customer_status = 'request'
WHERE id = '00000000-bbbb-bbbb-bbbb-000000000022';

-- -----------------------------------------------
-- 3. ASSESSMENTS — reviewed (active clients)
-- -----------------------------------------------
INSERT INTO public.assessments (id, user_id, assigned_trainer_id, age, weight, height, gender, body_measurements, goals, experience_level, health_conditions, medical_history, days_per_week, preferred_time_slot, preferred_location, status, submitted_at, reviewed_at, converted_to_client_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   28, '82 kg', '178 cm', 'male', '{"chest":"102","waist":"84","hips":"98"}',
   ARRAY['Muscle Gain','Strength Training'], 'intermediate', NULL,
   '{"lowerBack":false,"knee":false,"shoulder":false}', 5, 'Morning', 'Dubai Sports City Gym',
   'reviewed', NOW() - INTERVAL '45 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),

  ('a0000000-0000-0000-0000-000000000002', '00000000-bbbb-bbbb-bbbb-000000000012', '00000000-aaaa-aaaa-aaaa-000000000001',
   34, '65 kg', '163 cm', 'female', '{"chest":"88","waist":"72","hips":"96"}',
   ARRAY['Weight Loss','Toning'], 'beginner', NULL,
   '{"lowerBack":false,"knee":true}', 4, 'Evening', 'JLT Fitness Hub',
   'reviewed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),

  ('a0000000-0000-0000-0000-000000000003', '00000000-bbbb-bbbb-bbbb-000000000013', '00000000-aaaa-aaaa-aaaa-000000000002',
   25, '75 kg', '180 cm', 'male', '{"chest":"95","waist":"80","hips":"93"}',
   ARRAY['Athletic Performance','Improved Endurance'], 'advanced', NULL,
   '{}', 6, 'Morning', 'Abu Dhabi Performance Centre',
   'reviewed', NOW() - INTERVAL '60 days', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),

  ('a0000000-0000-0000-0000-000000000004', '00000000-bbbb-bbbb-bbbb-000000000014', '00000000-aaaa-aaaa-aaaa-000000000002',
   30, '58 kg', '160 cm', 'female', '{"chest":"84","waist":"66","hips":"90"}',
   ARRAY['General Fitness','Flexibility & Mobility'], 'beginner', 'Mild asthma',
   '{"lowerBack":true}', 3, 'Afternoon', 'Jumeirah Beach Fitness Club',
   'reviewed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

  ('a0000000-0000-0000-0000-000000000005', '00000000-bbbb-bbbb-bbbb-000000000015', '00000000-aaaa-aaaa-aaaa-000000000001',
   40, '90 kg', '175 cm', 'male', '{"chest":"108","waist":"96","hips":"102"}',
   ARRAY['Weight Loss','Body Recomposition'], 'intermediate', 'Hypertension (managed)',
   '{"hypertension":true}', 4, 'Morning', 'Dubai Sports City Gym',
   'reviewed', NOW() - INTERVAL '35 days', NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),

  ('a0000000-0000-0000-0000-000000000006', '00000000-bbbb-bbbb-bbbb-000000000016', '00000000-aaaa-aaaa-aaaa-000000000002',
   27, '62 kg', '167 cm', 'female', '{"chest":"86","waist":"68","hips":"94"}',
   ARRAY['Muscle Gain','Strength Training'], 'intermediate', NULL,
   '{}', 5, 'Evening', 'Mirdif Community Gym',
   'reviewed', NOW() - INTERVAL '25 days', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 4. ASSESSMENTS — pending (request clients)
-- -----------------------------------------------
INSERT INTO public.assessments (id, user_id, age, weight, height, gender, body_measurements, goals, experience_level, health_conditions, medical_history, days_per_week, preferred_time_slot, preferred_location, status, submitted_at) VALUES
  ('a0000000-0000-0000-0000-000000000007', '00000000-bbbb-bbbb-bbbb-000000000017',
   32, '88 kg', '182 cm', 'male', '{"chest":"104","waist":"90"}',
   ARRAY['Weight Loss','General Fitness'], 'beginner', 'Lower back pain occasionally',
   '{"lowerBack":true}', 3, 'Morning', 'Dubai Sports City Gym',
   'pending', NOW() - INTERVAL '3 days'),

  ('a0000000-0000-0000-0000-000000000008', '00000000-bbbb-bbbb-bbbb-000000000018',
   26, '55 kg', '158 cm', 'female', '{"chest":"82","waist":"64","hips":"88"}',
   ARRAY['Toning','Flexibility & Mobility'], 'beginner', NULL,
   '{}', 4, 'Evening', 'JLT Fitness Hub',
   'pending', NOW() - INTERVAL '2 days'),

  ('a0000000-0000-0000-0000-000000000009', '00000000-bbbb-bbbb-bbbb-000000000019',
   45, '95 kg', '176 cm', 'male', '{"chest":"110","waist":"100"}',
   ARRAY['Weight Loss','Rehabilitation'], 'beginner', 'Type 2 Diabetes, knee issue',
   '{"diabetes":true,"knee":true}', 3, 'Morning', 'Abu Dhabi Performance Centre',
   'pending', NOW() - INTERVAL '1 day'),

  ('a0000000-0000-0000-0000-000000000010', '00000000-bbbb-bbbb-bbbb-000000000020',
   22, '60 kg', '170 cm', 'female', '{"chest":"80","waist":"65","hips":"92"}',
   ARRAY['Athletic Performance','Improved Endurance'], 'intermediate', NULL,
   '{}', 5, 'Afternoon', 'Jumeirah Beach Fitness Club',
   'pending', NOW() - INTERVAL '5 hours'),

  ('a0000000-0000-0000-0000-000000000011', '00000000-bbbb-bbbb-bbbb-000000000021',
   37, '78 kg', '174 cm', 'male', '{"chest":"99","waist":"86"}',
   ARRAY['Strength Training','Muscle Gain'], 'intermediate', 'Shoulder impingement (left)',
   '{"shoulder":true}', 4, 'Evening', 'Mirdif Community Gym',
   'pending', NOW() - INTERVAL '8 hours')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 5. MORE EXERCISES (to reach 20+)
-- -----------------------------------------------
INSERT INTO public.exercises (name, category, muscle_group, equipment, default_sets, default_reps, video_url) VALUES
  ('Cable Fly',              'strength',    'Chest',       'Cable',      3, '12-15',  'https://www.youtube.com/watch?v=Iwe6AmxVf7o'),
  ('Face Pull',              'strength',    'Rear Delts',  'Cable',      3, '15-20',  'https://www.youtube.com/watch?v=rep-qVOkqgk'),
  ('Hammer Curl',            'strength',    'Biceps',      'Dumbbell',   3, '10-12',  'https://www.youtube.com/watch?v=zC3nLlEvin4'),
  ('Skull Crushers',         'strength',    'Triceps',     'EZ Bar',     3, '10-12',  'https://www.youtube.com/watch?v=d_KZxkY_0cM'),
  ('Goblet Squat',           'strength',    'Legs',        'Dumbbell',   3, '12-15',  'https://www.youtube.com/watch?v=MeIiIdhvXT4'),
  ('Bulgarian Split Squat',  'strength',    'Legs',        'Dumbbell',   3, '10 each','https://www.youtube.com/watch?v=2C-uNgKwPLE'),
  ('Plank',                  'strength',    'Core',        'Bodyweight', 3, '45-60s', 'https://www.youtube.com/watch?v=ASdvN_XEl_c'),
  ('Russian Twist',          'strength',    'Core',        'Dumbbell',   3, '20',     'https://www.youtube.com/watch?v=wkD8rjkodUI'),
  ('Hanging Leg Raise',      'strength',    'Core',        'Bodyweight', 3, '12-15',  'https://www.youtube.com/watch?v=hdng3Nm1x_E'),
  ('Farmers Walk',           'strength',    'Full Body',   'Dumbbell',   3, '40m',    'https://www.youtube.com/watch?v=Fkzk_RqlYig'),
  ('Battle Ropes',           'cardio',      'Full Body',   'Rope',       NULL, NULL,  'https://www.youtube.com/watch?v=bNWgsrc_0Ck'),
  ('Box Jumps',              'cardio',      'Legs',        'Box',        3, '10',     'https://www.youtube.com/watch?v=NBY9-kTuHEk'),
  ('Mountain Climbers',      'cardio',      'Core',        'Bodyweight', 3, '30s',    'https://www.youtube.com/watch?v=nmwgirgXLYM'),
  ('Seated Row',             'strength',    'Back',        'Cable',      3, '10-12',  'https://www.youtube.com/watch?v=GZbfZ033f74'),
  ('Chest Supported Row',    'strength',    'Back',        'Dumbbell',   3, '10-12',  'https://www.youtube.com/watch?v=H75im3p3oz8'),
  ('Leg Extension',          'strength',    'Quadriceps',  'Machine',    3, '12-15',  'https://www.youtube.com/watch?v=YyvSfVjQeL0'),
  ('Glute Kickback',         'strength',    'Glutes',      'Cable',      3, '12-15',  'https://www.youtube.com/watch?v=uaBnEGLSk08'),
  ('Arnold Press',           'strength',    'Shoulders',   'Dumbbell',   3, '10-12',  'https://www.youtube.com/watch?v=6Z15_WdXmVw'),
  ('Preacher Curl',          'strength',    'Biceps',      'EZ Bar',     3, '10-12',  'https://www.youtube.com/watch?v=fIWP-FRFNU0'),
  ('Decline Bench Press',    'strength',    'Chest',       'Barbell',    3, '8-10',   'https://www.youtube.com/watch?v=LfyQBUKR8SE')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------
-- 6. MEAL SUGGESTIONS (20+)
-- -----------------------------------------------
INSERT INTO public.meal_suggestions (name, category, calories, protein_g, carbs_g, fats_g, description) VALUES
  -- Breakfast
  ('Egg White Omelette with Vegetables',    'breakfast', 280, 28, 12, 8,   '4 egg whites, spinach, bell peppers, onions, topped with feta cheese'),
  ('Overnight Oats with Berries',           'breakfast', 350, 14, 52, 10,  'Rolled oats soaked in almond milk with chia seeds, blueberries, and honey'),
  ('Greek Yogurt Parfait',                  'breakfast', 320, 22, 38, 8,   'Greek yogurt layered with granola, mixed berries, and a drizzle of honey'),
  ('Avocado Toast with Poached Eggs',       'breakfast', 420, 20, 35, 22,  'Whole grain toast, smashed avocado, 2 poached eggs, chili flakes'),
  ('Protein Pancakes',                      'breakfast', 380, 30, 40, 10,  'Oat flour pancakes with whey protein, topped with banana slices'),
  ('Shakshuka',                             'breakfast', 340, 18, 22, 18,  'Eggs poached in spiced tomato sauce with bell peppers and onions'),

  -- Lunch
  ('Grilled Chicken Quinoa Bowl',           'lunch',     520, 42, 48, 14,  'Grilled chicken breast, quinoa, roasted vegetables, tahini dressing'),
  ('Salmon Poke Bowl',                      'lunch',     480, 35, 50, 16,  'Fresh salmon, sushi rice, edamame, avocado, cucumber, soy-ginger sauce'),
  ('Turkey & Hummus Wrap',                  'lunch',     440, 32, 42, 14,  'Whole wheat wrap with sliced turkey, hummus, lettuce, tomato, cucumber'),
  ('Lentil Soup with Bread',               'lunch',     400, 22, 55, 8,   'Red lentil soup with cumin and lemon, served with whole grain bread'),
  ('Chicken Shawarma Plate',               'lunch',     550, 40, 45, 18,  'Marinated chicken, brown rice, garlic sauce, pickled turnips, salad'),
  ('Tuna Niçoise Salad',                   'lunch',     420, 38, 20, 22,  'Seared tuna, boiled eggs, green beans, olives, potatoes, vinaigrette'),

  -- Dinner
  ('Grilled Salmon with Sweet Potato',      'dinner',    500, 40, 38, 18,  'Herb-crusted salmon fillet with roasted sweet potato and steamed broccoli'),
  ('Lean Beef Stir-Fry',                    'dinner',    480, 38, 35, 16,  'Lean beef strips stir-fried with mixed vegetables and brown rice'),
  ('Baked Chicken Breast with Vegetables',  'dinner',    420, 42, 25, 12,  'Seasoned chicken breast with roasted zucchini, bell peppers, and asparagus'),
  ('Shrimp & Vegetable Curry',             'dinner',    440, 32, 40, 14,  'Shrimp in light coconut curry with spinach, served over basmati rice'),
  ('Grilled Lamb Kofta with Tabbouleh',    'dinner',    520, 36, 35, 22,  'Spiced lamb kofta, fresh tabbouleh salad, and a side of hummus'),
  ('Stuffed Bell Peppers',                 'dinner',    380, 28, 32, 14,  'Bell peppers stuffed with lean ground turkey, rice, tomatoes, and herbs'),

  -- Snacks
  ('Protein Shake with Banana',             'snack',     280, 30, 28, 6,   'Whey protein blended with banana, almond milk, and ice'),
  ('Mixed Nuts & Dried Fruit',              'snack',     220, 6,  18, 15,  'Almonds, walnuts, cashews with raisins and dried cranberries'),
  ('Hummus with Veggie Sticks',             'snack',     180, 6,  18, 10,  'Classic hummus with carrot, celery, and cucumber sticks'),
  ('Rice Cakes with Peanut Butter',         'snack',     200, 8,  22, 10,  'Brown rice cakes topped with natural peanut butter and honey'),
  ('Cottage Cheese & Pineapple',            'snack',     160, 18, 15, 2,   'Low-fat cottage cheese with fresh pineapple chunks'),
  ('Dark Chocolate & Almonds',              'snack',     210, 5,  16, 15,  '2 squares of 85% dark chocolate with a handful of almonds')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------
-- 7. PLANS for active clients
-- -----------------------------------------------
INSERT INTO public.plans (id, user_id, trainer_id, name, description, monthly_rate, payment_frequency, goals, start_date, duration, status) VALUES
  -- Khalid — Muscle Gain
  ('e0000000-0000-0000-0000-000000000001', '00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Elite Muscle Builder', 'High-volume hypertrophy program with progressive overload and nutrition tracking',
   1200.00, 'monthly', ARRAY['Muscle Gain','Strength Training'], CURRENT_DATE - 40, '3 months', 'active'),

  -- Fatima — Weight Loss
  ('e0000000-0000-0000-0000-000000000002', '00000000-bbbb-bbbb-bbbb-000000000012', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Lean & Tone Program', 'Calorie-deficit training plan with cardio and resistance mix',
   900.00, 'monthly', ARRAY['Weight Loss','Toning'], CURRENT_DATE - 27, '3 months', 'active'),

  -- Omar — Athletic Performance
  ('e0000000-0000-0000-0000-000000000003', '00000000-bbbb-bbbb-bbbb-000000000013', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Performance Edge', 'Sport-specific conditioning with power and endurance focus',
   1500.00, 'monthly', ARRAY['Athletic Performance','Improved Endurance'], CURRENT_DATE - 55, '6 months', 'active'),

  -- Layla — General Fitness
  ('e0000000-0000-0000-0000-000000000004', '00000000-bbbb-bbbb-bbbb-000000000014', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Starter Wellness Plan', 'Gentle introduction to fitness with flexibility and mobility focus',
   600.00, 'monthly', ARRAY['General Fitness','Flexibility & Mobility'], CURRENT_DATE - 18, '2 months', 'active'),

  -- Yusuf — Body Recomp
  ('e0000000-0000-0000-0000-000000000005', '00000000-bbbb-bbbb-bbbb-000000000015', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Body Recomposition Plan', 'Simultaneous fat loss and muscle gain with strategic nutrition',
   1100.00, 'monthly', ARRAY['Weight Loss','Body Recomposition'], CURRENT_DATE - 32, '4 months', 'active'),

  -- Aisha — Strength
  ('e0000000-0000-0000-0000-000000000006', '00000000-bbbb-bbbb-bbbb-000000000016', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Strength Foundation', 'Progressive strength program focusing on compound lifts',
   1000.00, 'weekly', ARRAY['Muscle Gain','Strength Training'], CURRENT_DATE - 22, '3 months', 'active')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 8. PROGRAMS & ACTIVITIES for active clients
-- -----------------------------------------------

-- === Khalid (Week 1 & 2) ===
INSERT INTO public.programs (id, user_id, trainer_id, week_number, title, description) VALUES
  ('cc000000-0000-0000-0000-000000000001', '00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   1, 'Foundation Phase', 'Build base strength and movement patterns'),
  ('cc000000-0000-0000-0000-000000000002', '00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   2, 'Volume Ramp-Up', 'Increase total volume across all compound lifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_activities (program_id, day, exercise_name, sets, reps, sort_order) VALUES
  -- Week 1
  ('cc000000-0000-0000-0000-000000000001', 'Monday',    'Bench Press',            4, '8-10',   1),
  ('cc000000-0000-0000-0000-000000000001', 'Monday',    'Incline Dumbbell Press',  3, '10-12',  2),
  ('cc000000-0000-0000-0000-000000000001', 'Monday',    'Tricep Pushdown',         3, '12-15',  3),
  ('cc000000-0000-0000-0000-000000000001', 'Wednesday', 'Barbell Back Squat',      4, '8-10',   1),
  ('cc000000-0000-0000-0000-000000000001', 'Wednesday', 'Romanian Deadlift',       3, '10-12',  2),
  ('cc000000-0000-0000-0000-000000000001', 'Wednesday', 'Leg Press',               4, '10-12',  3),
  ('cc000000-0000-0000-0000-000000000001', 'Wednesday', 'Calf Raises',             4, '15-20',  4),
  ('cc000000-0000-0000-0000-000000000001', 'Friday',    'Pull-Ups',                3, 'Max',    1),
  ('cc000000-0000-0000-0000-000000000001', 'Friday',    'Barbell Row',             4, '8-10',   2),
  ('cc000000-0000-0000-0000-000000000001', 'Friday',    'Overhead Press',          3, '8-10',   3),
  ('cc000000-0000-0000-0000-000000000001', 'Friday',    'Bicep Curls',             3, '12-15',  4),
  -- Week 2
  ('cc000000-0000-0000-0000-000000000002', 'Monday',    'Bench Press',            4, '6-8',    1),
  ('cc000000-0000-0000-0000-000000000002', 'Monday',    'Cable Fly',              3, '12-15',  2),
  ('cc000000-0000-0000-0000-000000000002', 'Monday',    'Dips',                   3, '10-12',  3),
  ('cc000000-0000-0000-0000-000000000002', 'Monday',    'Skull Crushers',         3, '10-12',  4),
  ('cc000000-0000-0000-0000-000000000002', 'Wednesday', 'Deadlift',               3, '5',      1),
  ('cc000000-0000-0000-0000-000000000002', 'Wednesday', 'Bulgarian Split Squat',  3, '10 each',2),
  ('cc000000-0000-0000-0000-000000000002', 'Wednesday', 'Leg Curl',               3, '12-15',  3),
  ('cc000000-0000-0000-0000-000000000002', 'Wednesday', 'Hip Thrust',             4, '10-12',  4),
  ('cc000000-0000-0000-0000-000000000002', 'Friday',    'Barbell Row',            4, '6-8',    1),
  ('cc000000-0000-0000-0000-000000000002', 'Friday',    'Seated Row',             3, '10-12',  2),
  ('cc000000-0000-0000-0000-000000000002', 'Friday',    'Arnold Press',           3, '10-12',  3),
  ('cc000000-0000-0000-0000-000000000002', 'Friday',    'Hammer Curl',            3, '10-12',  4),
  ('cc000000-0000-0000-0000-000000000002', 'Friday',    'Face Pull',              3, '15-20',  5);

-- === Fatima (Week 1) ===
INSERT INTO public.programs (id, user_id, trainer_id, week_number, title, description) VALUES
  ('cc000000-0000-0000-0000-000000000003', '00000000-bbbb-bbbb-bbbb-000000000012', '00000000-aaaa-aaaa-aaaa-000000000001',
   1, 'Lean Start', 'Full-body circuits with cardio finishers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_activities (program_id, day, exercise_name, sets, reps, sort_order) VALUES
  ('cc000000-0000-0000-0000-000000000003', 'Monday',    'Goblet Squat',           3, '12-15',  1),
  ('cc000000-0000-0000-0000-000000000003', 'Monday',    'Lunges',                 3, '10 each',2),
  ('cc000000-0000-0000-0000-000000000003', 'Monday',    'Plank',                  3, '45-60s', 3),
  ('cc000000-0000-0000-0000-000000000003', 'Monday',    'Treadmill Run',          1, '20 min', 4),
  ('cc000000-0000-0000-0000-000000000003', 'Wednesday', 'Incline Dumbbell Press', 3, '10-12',  1),
  ('cc000000-0000-0000-0000-000000000003', 'Wednesday', 'Lateral Raises',         3, '12-15',  2),
  ('cc000000-0000-0000-0000-000000000003', 'Wednesday', 'Glute Kickback',         3, '12-15',  3),
  ('cc000000-0000-0000-0000-000000000003', 'Wednesday', 'Jump Rope',              1, '15 min', 4),
  ('cc000000-0000-0000-0000-000000000003', 'Friday',    'Romanian Deadlift',      3, '10-12',  1),
  ('cc000000-0000-0000-0000-000000000003', 'Friday',    'Leg Extension',          3, '12-15',  2),
  ('cc000000-0000-0000-0000-000000000003', 'Friday',    'Russian Twist',          3, '20',     3),
  ('cc000000-0000-0000-0000-000000000003', 'Friday',    'HIIT Intervals',         1, '15 min', 4);

-- === Omar (Week 1 & 2) ===
INSERT INTO public.programs (id, user_id, trainer_id, week_number, title, description) VALUES
  ('cc000000-0000-0000-0000-000000000004', '00000000-bbbb-bbbb-bbbb-000000000013', '00000000-aaaa-aaaa-aaaa-000000000002',
   1, 'Power Base', 'Explosive power development and conditioning'),
  ('cc000000-0000-0000-0000-000000000005', '00000000-bbbb-bbbb-bbbb-000000000013', '00000000-aaaa-aaaa-aaaa-000000000002',
   2, 'Speed & Agility', 'Sport-specific speed drills with strength maintenance')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_activities (program_id, day, exercise_name, sets, reps, sort_order) VALUES
  ('cc000000-0000-0000-0000-000000000004', 'Monday',    'Deadlift',               4, '5',      1),
  ('cc000000-0000-0000-0000-000000000004', 'Monday',    'Box Jumps',              3, '10',     2),
  ('cc000000-0000-0000-0000-000000000004', 'Monday',    'Barbell Back Squat',     4, '6-8',    3),
  ('cc000000-0000-0000-0000-000000000004', 'Tuesday',   'Bench Press',            4, '6-8',    1),
  ('cc000000-0000-0000-0000-000000000004', 'Tuesday',   'Pull-Ups',              3, 'Max',    2),
  ('cc000000-0000-0000-0000-000000000004', 'Tuesday',   'Battle Ropes',          3, '30s',    3),
  ('cc000000-0000-0000-0000-000000000004', 'Thursday',  'Rowing Machine',        1, '20 min', 1),
  ('cc000000-0000-0000-0000-000000000004', 'Thursday',  'Mountain Climbers',     3, '30s',    2),
  ('cc000000-0000-0000-0000-000000000004', 'Thursday',  'Farmers Walk',          3, '40m',    3),
  ('cc000000-0000-0000-0000-000000000004', 'Saturday',  'HIIT Intervals',        1, '25 min', 1),
  ('cc000000-0000-0000-0000-000000000004', 'Saturday',  'Cycling',               1, '30 min', 2),
  -- Week 2
  ('cc000000-0000-0000-0000-000000000005', 'Monday',    'Barbell Back Squat',     4, '5',      1),
  ('cc000000-0000-0000-0000-000000000005', 'Monday',    'Box Jumps',              4, '8',      2),
  ('cc000000-0000-0000-0000-000000000005', 'Monday',    'Lunges',                 3, '10 each',3),
  ('cc000000-0000-0000-0000-000000000005', 'Wednesday', 'Overhead Press',         4, '6-8',    1),
  ('cc000000-0000-0000-0000-000000000005', 'Wednesday', 'Barbell Row',            4, '6-8',    2),
  ('cc000000-0000-0000-0000-000000000005', 'Wednesday', 'Hanging Leg Raise',      3, '12-15',  3),
  ('cc000000-0000-0000-0000-000000000005', 'Friday',    'Treadmill Run',          1, '30 min', 1),
  ('cc000000-0000-0000-0000-000000000005', 'Friday',    'Battle Ropes',           4, '30s',    2),
  ('cc000000-0000-0000-0000-000000000005', 'Friday',    'Mountain Climbers',      3, '45s',    3);

-- === Layla (Week 1) ===
INSERT INTO public.programs (id, user_id, trainer_id, week_number, title, description) VALUES
  ('cc000000-0000-0000-0000-000000000006', '00000000-bbbb-bbbb-bbbb-000000000014', '00000000-aaaa-aaaa-aaaa-000000000002',
   1, 'Gentle Movement', 'Low-impact mobility and bodyweight exercises')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_activities (program_id, day, exercise_name, sets, reps, sort_order) VALUES
  ('cc000000-0000-0000-0000-000000000006', 'Monday',    'Cat-Cow Stretch',        3, '10',     1),
  ('cc000000-0000-0000-0000-000000000006', 'Monday',    'Hip Flexor Stretch',     3, '30s each',2),
  ('cc000000-0000-0000-0000-000000000006', 'Monday',    'Goblet Squat',           3, '10',     3),
  ('cc000000-0000-0000-0000-000000000006', 'Wednesday', 'World''s Greatest Stretch', 3, '5 each', 1),
  ('cc000000-0000-0000-0000-000000000006', 'Wednesday', 'Hamstring Stretch',      3, '30s each',2),
  ('cc000000-0000-0000-0000-000000000006', 'Wednesday', 'Plank',                  3, '30s',    3),
  ('cc000000-0000-0000-0000-000000000006', 'Friday',    'Foam Rolling',           1, '15 min', 1),
  ('cc000000-0000-0000-0000-000000000006', 'Friday',    'Shoulder Mobility Drill',3, '10',     2),
  ('cc000000-0000-0000-0000-000000000006', 'Friday',    'Lunges',                 3, '8 each', 3);

-- === Yusuf (Week 1) ===
INSERT INTO public.programs (id, user_id, trainer_id, week_number, title, description) VALUES
  ('cc000000-0000-0000-0000-000000000007', '00000000-bbbb-bbbb-bbbb-000000000015', '00000000-aaaa-aaaa-aaaa-000000000001',
   1, 'Recomp Phase 1', 'High-protein strength training with moderate cardio')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_activities (program_id, day, exercise_name, sets, reps, sort_order) VALUES
  ('cc000000-0000-0000-0000-000000000007', 'Monday',    'Barbell Back Squat',     4, '8-10',   1),
  ('cc000000-0000-0000-0000-000000000007', 'Monday',    'Leg Press',              4, '10-12',  2),
  ('cc000000-0000-0000-0000-000000000007', 'Monday',    'Leg Curl',               3, '12-15',  3),
  ('cc000000-0000-0000-0000-000000000007', 'Monday',    'Calf Raises',            4, '15-20',  4),
  ('cc000000-0000-0000-0000-000000000007', 'Wednesday', 'Bench Press',            4, '8-10',   1),
  ('cc000000-0000-0000-0000-000000000007', 'Wednesday', 'Overhead Press',         3, '8-10',   2),
  ('cc000000-0000-0000-0000-000000000007', 'Wednesday', 'Lateral Raises',         3, '12-15',  3),
  ('cc000000-0000-0000-0000-000000000007', 'Wednesday', 'Tricep Pushdown',        3, '12-15',  4),
  ('cc000000-0000-0000-0000-000000000007', 'Friday',    'Deadlift',               3, '5',      1),
  ('cc000000-0000-0000-0000-000000000007', 'Friday',    'Pull-Ups',               3, 'Max',    2),
  ('cc000000-0000-0000-0000-000000000007', 'Friday',    'Barbell Row',            4, '8-10',   3),
  ('cc000000-0000-0000-0000-000000000007', 'Friday',    'Bicep Curls',            3, '12-15',  4),
  ('cc000000-0000-0000-0000-000000000007', 'Saturday',  'Treadmill Run',          1, '30 min', 1),
  ('cc000000-0000-0000-0000-000000000007', 'Saturday',  'Cycling',                1, '20 min', 2);

-- === Aisha (Week 1) ===
INSERT INTO public.programs (id, user_id, trainer_id, week_number, title, description) VALUES
  ('cc000000-0000-0000-0000-000000000008', '00000000-bbbb-bbbb-bbbb-000000000016', '00000000-aaaa-aaaa-aaaa-000000000002',
   1, 'Strength Foundations', 'Learn the big 3 lifts with proper form')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_activities (program_id, day, exercise_name, sets, reps, sort_order) VALUES
  ('cc000000-0000-0000-0000-000000000008', 'Monday',    'Barbell Back Squat',     4, '8-10',   1),
  ('cc000000-0000-0000-0000-000000000008', 'Monday',    'Romanian Deadlift',      3, '10-12',  2),
  ('cc000000-0000-0000-0000-000000000008', 'Monday',    'Hip Thrust',             4, '10-12',  3),
  ('cc000000-0000-0000-0000-000000000008', 'Wednesday', 'Bench Press',            4, '8-10',   1),
  ('cc000000-0000-0000-0000-000000000008', 'Wednesday', 'Overhead Press',         3, '8-10',   2),
  ('cc000000-0000-0000-0000-000000000008', 'Wednesday', 'Chest Supported Row',    3, '10-12',  3),
  ('cc000000-0000-0000-0000-000000000008', 'Wednesday', 'Face Pull',              3, '15-20',  4),
  ('cc000000-0000-0000-0000-000000000008', 'Friday',    'Deadlift',               3, '5',      1),
  ('cc000000-0000-0000-0000-000000000008', 'Friday',    'Bulgarian Split Squat',  3, '10 each',2),
  ('cc000000-0000-0000-0000-000000000008', 'Friday',    'Preacher Curl',          3, '10-12',  3),
  ('cc000000-0000-0000-0000-000000000008', 'Friday',    'Plank',                  3, '60s',    4),
  ('cc000000-0000-0000-0000-000000000008', 'Saturday',  'Treadmill Run',          1, '20 min', 1),
  ('cc000000-0000-0000-0000-000000000008', 'Saturday',  'Jump Rope',              1, '10 min', 2);

-- -----------------------------------------------
-- 9. SESSIONS for active clients
-- -----------------------------------------------
INSERT INTO public.sessions (user_id, trainer_id, title, scheduled_date, scheduled_time, duration, status, notes) VALUES
  -- Khalid
  ('00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Upper Body Focus', CURRENT_DATE - 7, '08:00', 60, 'completed', 'Great session. Increased bench by 5kg.'),
  ('00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Leg Day', CURRENT_DATE - 3, '08:00', 60, 'completed', 'Squat form improving. Added pause reps.'),
  ('00000000-bbbb-bbbb-bbbb-000000000011', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Pull Day', CURRENT_DATE + 2, '08:00', 60, 'scheduled', NULL),
  -- Fatima
  ('00000000-bbbb-bbbb-bbbb-000000000012', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Full Body Circuit', CURRENT_DATE - 5, '18:00', 45, 'completed', 'Completed all circuits. Reduced rest times.'),
  ('00000000-bbbb-bbbb-bbbb-000000000012', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Cardio & Core', CURRENT_DATE + 1, '18:00', 45, 'scheduled', NULL),
  -- Omar
  ('00000000-bbbb-bbbb-bbbb-000000000013', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Power Training', CURRENT_DATE - 4, '07:00', 75, 'completed', 'New deadlift PR: 160kg. Excellent explosiveness.'),
  ('00000000-bbbb-bbbb-bbbb-000000000013', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Conditioning Block', CURRENT_DATE + 3, '07:00', 60, 'scheduled', NULL),
  -- Layla
  ('00000000-bbbb-bbbb-bbbb-000000000014', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Mobility Session', CURRENT_DATE - 2, '14:00', 45, 'completed', 'Hip flexibility improving noticeably.'),
  ('00000000-bbbb-bbbb-bbbb-000000000014', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Flexibility & Core', CURRENT_DATE + 4, '14:00', 45, 'scheduled', NULL),
  -- Yusuf
  ('00000000-bbbb-bbbb-bbbb-000000000015', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Lower Body Strength', CURRENT_DATE - 6, '09:00', 60, 'completed', 'Squat depth is on point. Adding 5kg next week.'),
  ('00000000-bbbb-bbbb-bbbb-000000000015', '00000000-aaaa-aaaa-aaaa-000000000001',
   'Upper Body Strength', CURRENT_DATE + 1, '09:00', 60, 'scheduled', NULL),
  -- Aisha
  ('00000000-bbbb-bbbb-bbbb-000000000016', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Compound Lifts Intro', CURRENT_DATE - 8, '19:00', 60, 'completed', 'First session. Bench and squat technique taught.'),
  ('00000000-bbbb-bbbb-bbbb-000000000016', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Deadlift Day', CURRENT_DATE - 1, '19:00', 60, 'completed', 'Deadlift form solid at 40kg. Ready to progress.'),
  ('00000000-bbbb-bbbb-bbbb-000000000016', '00000000-aaaa-aaaa-aaaa-000000000002',
   'Full Body Strength', CURRENT_DATE + 5, '19:00', 60, 'scheduled', NULL);

-- -----------------------------------------------
-- 10. PAYMENTS for active clients
-- -----------------------------------------------
INSERT INTO public.payments (user_id, plan_id, amount, paid_date, due_date, status, description) VALUES
  -- Khalid — paid month 1
  ('00000000-bbbb-bbbb-bbbb-000000000011', 'e0000000-0000-0000-0000-000000000001', 1200.00, CURRENT_DATE - 40, CURRENT_DATE - 40, 'paid', 'Month 1 — Elite Muscle Builder'),
  ('00000000-bbbb-bbbb-bbbb-000000000011', 'e0000000-0000-0000-0000-000000000001', 1200.00, NULL, CURRENT_DATE + 20, 'pending', 'Month 2 — Elite Muscle Builder'),
  -- Fatima — paid month 1
  ('00000000-bbbb-bbbb-bbbb-000000000012', 'e0000000-0000-0000-0000-000000000002', 900.00, CURRENT_DATE - 27, CURRENT_DATE - 27, 'paid', 'Month 1 — Lean & Tone'),
  ('00000000-bbbb-bbbb-bbbb-000000000012', 'e0000000-0000-0000-0000-000000000002', 900.00, NULL, CURRENT_DATE + 3, 'pending', 'Month 2 — Lean & Tone'),
  -- Omar — paid months 1 & 2
  ('00000000-bbbb-bbbb-bbbb-000000000013', 'e0000000-0000-0000-0000-000000000003', 1500.00, CURRENT_DATE - 55, CURRENT_DATE - 55, 'paid', 'Month 1 — Performance Edge'),
  ('00000000-bbbb-bbbb-bbbb-000000000013', 'e0000000-0000-0000-0000-000000000003', 1500.00, CURRENT_DATE - 25, CURRENT_DATE - 25, 'paid', 'Month 2 — Performance Edge'),
  ('00000000-bbbb-bbbb-bbbb-000000000013', 'e0000000-0000-0000-0000-000000000003', 1500.00, NULL, CURRENT_DATE + 5, 'pending', 'Month 3 — Performance Edge'),
  -- Layla
  ('00000000-bbbb-bbbb-bbbb-000000000014', 'e0000000-0000-0000-0000-000000000004', 600.00, CURRENT_DATE - 18, CURRENT_DATE - 18, 'paid', 'Month 1 — Starter Wellness'),
  -- Yusuf
  ('00000000-bbbb-bbbb-bbbb-000000000015', 'e0000000-0000-0000-0000-000000000005', 1100.00, CURRENT_DATE - 32, CURRENT_DATE - 32, 'paid', 'Month 1 — Body Recomposition'),
  ('00000000-bbbb-bbbb-bbbb-000000000015', 'e0000000-0000-0000-0000-000000000005', 1100.00, NULL, CURRENT_DATE - 2, 'overdue', 'Month 2 — Body Recomposition'),
  -- Aisha — weekly payments
  ('00000000-bbbb-bbbb-bbbb-000000000016', 'e0000000-0000-0000-0000-000000000006', 230.95, CURRENT_DATE - 22, CURRENT_DATE - 22, 'paid', 'Week 1 — Strength Foundation'),
  ('00000000-bbbb-bbbb-bbbb-000000000016', 'e0000000-0000-0000-0000-000000000006', 230.95, CURRENT_DATE - 15, CURRENT_DATE - 15, 'paid', 'Week 2 — Strength Foundation'),
  ('00000000-bbbb-bbbb-bbbb-000000000016', 'e0000000-0000-0000-0000-000000000006', 230.95, CURRENT_DATE - 8, CURRENT_DATE - 8, 'paid', 'Week 3 — Strength Foundation'),
  ('00000000-bbbb-bbbb-bbbb-000000000016', 'e0000000-0000-0000-0000-000000000006', 230.95, NULL, CURRENT_DATE + 1, 'pending', 'Week 4 — Strength Foundation');
