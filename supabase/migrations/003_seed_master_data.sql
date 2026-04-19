-- ============================================================
-- iShow — Seed Master Data
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- LOCATIONS
INSERT INTO public.locations (name, city, sort_order) VALUES
  ('Dubai Sports City Gym',        'Dubai',     1),
  ('Abu Dhabi Performance Centre', 'Abu Dhabi', 2),
  ('JLT Fitness Hub',              'Dubai',     3),
  ('Jumeirah Beach Fitness Club',  'Dubai',     4),
  ('Mirdif Community Gym',         'Dubai',     5),
  ('Other / Online',               NULL,        6)
ON CONFLICT DO NOTHING;

-- GOAL TYPES
INSERT INTO public.goal_types (name, slug, sort_order) VALUES
  ('Weight Loss',            'weight_loss',          1),
  ('Muscle Gain',            'muscle_gain',          2),
  ('Strength Training',      'strength',             3),
  ('Improved Endurance',     'endurance',            4),
  ('Flexibility & Mobility', 'flexibility',          5),
  ('Athletic Performance',   'athletic_performance', 6),
  ('General Fitness',        'general_fitness',      7),
  ('Rehabilitation',         'rehabilitation',       8),
  ('Body Recomposition',     'body_recomposition',   9),
  ('Toning',                 'toning',               10)
ON CONFLICT (slug) DO NOTHING;

-- EXERCISE LIBRARY (common exercises)
INSERT INTO public.exercises (name, category, muscle_group, equipment, default_sets, default_reps) VALUES
  -- Strength — Upper Body
  ('Bench Press',            'strength', 'Chest',         'Barbell',    4,    '8-10'),
  ('Incline Dumbbell Press', 'strength', 'Chest',         'Dumbbell',   3,    '10-12'),
  ('Pull-Ups',               'strength', 'Back',          'Bodyweight', 3,    'Max'),
  ('Barbell Row',            'strength', 'Back',          'Barbell',    4,    '8-10'),
  ('Overhead Press',         'strength', 'Shoulders',     'Barbell',    3,    '8-10'),
  ('Lateral Raises',         'strength', 'Shoulders',     'Dumbbell',   3,    '12-15'),
  ('Bicep Curls',            'strength', 'Biceps',        'Dumbbell',   3,    '12-15'),
  ('Tricep Pushdown',        'strength', 'Triceps',       'Cable',      3,    '12-15'),
  ('Dips',                   'strength', 'Chest/Triceps', 'Bodyweight', 3,    '10-12'),
  -- Strength — Lower Body
  ('Barbell Back Squat',     'strength', 'Legs',          'Barbell',    4,    '8-10'),
  ('Romanian Deadlift',      'strength', 'Hamstrings',    'Barbell',    3,    '10-12'),
  ('Deadlift',               'strength', 'Full Body',     'Barbell',    3,    '5'),
  ('Leg Press',              'strength', 'Legs',          'Machine',    4,    '10-12'),
  ('Leg Curl',               'strength', 'Hamstrings',    'Machine',    3,    '12-15'),
  ('Calf Raises',            'strength', 'Calves',        'Machine',    4,    '15-20'),
  ('Lunges',                 'strength', 'Legs',          'Dumbbell',   3,    '10 each'),
  ('Hip Thrust',             'strength', 'Glutes',        'Barbell',    4,    '10-12'),
  -- Cardio
  ('Treadmill Run',          'cardio',   NULL,            'Treadmill',  NULL, NULL),
  ('HIIT Intervals',         'cardio',   NULL,            'Treadmill',  NULL, NULL),
  ('Rowing Machine',         'cardio',   NULL,            'Rower',      NULL, NULL),
  ('Jump Rope',              'cardio',   NULL,            'Rope',       NULL, NULL),
  ('Cycling',                'cardio',   NULL,            'Bike',       NULL, NULL),
  -- Mobility / Flexibility
  ('Cat-Cow Stretch',        'mobility', 'Spine',         'Bodyweight', NULL, NULL),
  ('Hip Flexor Stretch',     'flexibility', 'Hips',       'Bodyweight', NULL, NULL),
  ('Hamstring Stretch',      'flexibility', 'Hamstrings', 'Bodyweight', NULL, NULL),
  ('Shoulder Mobility Drill','mobility', 'Shoulders',     'Bodyweight', NULL, NULL),
  ('Foam Rolling',           'mobility', 'Full Body',     'Foam Roller',NULL, NULL),
  ('World''s Greatest Stretch','mobility','Full Body',    'Bodyweight', NULL, NULL)
ON CONFLICT DO NOTHING;
