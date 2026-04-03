import { getItems, setItems } from './storage';
import type { AuthUser, User } from './auth';

const USERS_KEY = 'ishow_users';
const ASSESSMENTS_KEY = 'ishow_assessments';
const PLANS_KEY = 'ishow_plans';
const SESSIONS_KEY = 'ishow_sessions';
const PROGRAMS_KEY = 'ishow_programs';
const PAYMENTS_KEY = 'ishow_payments';
const SEEDED_KEY = 'ishow_seeded';
const AUTH_KEY = 'ishow_auth';

const TRAINER_NAME = 'Mohammed Sufiyan';
const TRAINER_EMAIL = 'trainer@ishow.com';
const TRAINER_PASSWORD = 'trainer123';
const CUSTOMER_EMAIL = 'customer@ishow.com';
const CUSTOMER_PASSWORD = 'customer123';

export interface Assessment {
  id: string;
  userId: string;
  age: number;
  weight: string;
  height: string;
  gender: string;
  goals: string[];
  experienceLevel: string;
  healthConditions: string;
  daysPerWeek: number;
  preferredTimes: string;
  status: 'pending' | 'reviewed';
  submittedAt: string;
  reviewedAt?: string;
  trainerNotes?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  preferredLocation?: string;
  convertedToClientAt?: string;
}

export interface Plan {
  id: string;
  userId: string;
  name: string;
  description: string;
  monthlyRate: number;
  paymentFrequency: 'weekly' | 'monthly';
  goals: string[];
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
  trainerName: string;
  duration: string;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  trainerName: string;
}

export interface DayActivity {
  day: string;
  exercise: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
}

export interface Program {
  id: string;
  userId: string;
  weekNumber: number;
  title: string;
  description: string;
  activities: DayActivity[];
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  reference: string;
  description: string;
  dueDate: string;
}

function ensureRecords<T extends { id: string }>(
  existing: T[],
  defaults: T[],
  merge?: (current: T, fallback: T) => T
): T[] {
  const records = new Map(existing.map((item) => [item.id, item]));

  for (const fallback of defaults) {
    const current = records.get(fallback.id);
    records.set(fallback.id, current ? (merge ? merge(current, fallback) : current) : fallback);
  }

  return Array.from(records.values());
}

function syncStoredAuth(users: User[]): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return;

    const current = JSON.parse(raw) as AuthUser;
    const matchedUser = users.find((user) => user.id === current.id);
    if (!matchedUser) return;

    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        customerStatus: matchedUser.customerStatus,
      })
    );
  } catch {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function seedMockData(): void {
  if (typeof window === 'undefined') return;

  // Users
  const defaultUsers: User[] = [
    {
      id: 'user_trainer_1',
      name: TRAINER_NAME,
      email: TRAINER_EMAIL,
      password: TRAINER_PASSWORD,
      phone: '+1 (555) 001-0001',
      role: 'trainer',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'user_john_1',
      name: 'John Smith',
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASSWORD,
      phone: '+1 (555) 001-0002',
      role: 'customer',
      customerStatus: 'client',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: 'user_sarah_1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'demo123',
      phone: '+1 (555) 001-0003',
      role: 'customer',
      customerStatus: 'request',
      createdAt: '2024-02-20T00:00:00.000Z',
    },
    {
      id: 'user_marcus_1',
      name: 'Marcus Lee',
      email: 'marcus@example.com',
      password: 'demo123',
      phone: '+1 (555) 001-0004',
      role: 'customer',
      customerStatus: 'client',
      createdAt: '2024-03-08T00:00:00.000Z',
    },
    {
      id: 'user_priya_1',
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'demo123',
      phone: '+1 (555) 001-0005',
      role: 'customer',
      customerStatus: 'client',
      createdAt: '2024-03-24T00:00:00.000Z',
    },
    {
      id: 'user_aisha_1',
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      password: 'demo123',
      phone: '+1 (555) 001-0006',
      role: 'customer',
      customerStatus: 'client',
      createdAt: '2024-04-11T00:00:00.000Z',
    },
  ];

  // Assessments
  const defaultAssessments: Assessment[] = [
    {
      id: 'assessment_1',
      userId: 'user_john_1',
      age: 32,
      weight: '185 lbs',
      height: '5\'11"',
      gender: 'male',
      goals: ['muscle_gain', 'strength', 'endurance'],
      experienceLevel: 'intermediate',
      healthConditions: 'None',
      daysPerWeek: 5,
      preferredTimes: 'morning',
      status: 'reviewed',
      submittedAt: '2024-01-16T09:00:00.000Z',
      reviewedAt: '2024-01-17T14:00:00.000Z',
      trainerNotes: 'Great candidate for the Elite Performance Pack. Strong foundation, ready to push limits.',
      preferredDate: '2024-01-18',
      preferredTimeSlot: '08:00-10:00',
      preferredLocation: 'Downtown Gym Floor',
      convertedToClientAt: '2024-01-18T08:30:00.000Z',
    },
    {
      id: 'assessment_2',
      userId: 'user_sarah_1',
      age: 28,
      weight: '135 lbs',
      height: '5\'5"',
      gender: 'female',
      goals: ['weight_loss', 'toning', 'endurance'],
      experienceLevel: 'beginner',
      healthConditions: 'Mild lower back pain',
      daysPerWeek: 3,
      preferredTimes: 'evening',
      status: 'pending',
      submittedAt: '2024-02-21T10:00:00.000Z',
      preferredDate: '2024-02-23',
      preferredTimeSlot: '18:00-20:00',
      preferredLocation: 'Online consultation',
    },
    {
      id: 'assessment_3',
      userId: 'user_marcus_1',
      age: 35,
      weight: '202 lbs',
      height: '6\'1"',
      gender: 'male',
      goals: ['strength', 'mobility', 'body_recomposition'],
      experienceLevel: 'intermediate',
      healthConditions: 'Previous ankle sprain, fully rehabbed',
      daysPerWeek: 4,
      preferredTimes: 'morning',
      status: 'reviewed',
      submittedAt: '2024-03-09T09:30:00.000Z',
      reviewedAt: '2024-03-10T13:00:00.000Z',
      trainerNotes: 'Needs structured strength work with mobility support and controlled lower-body loading.',
      preferredDate: '2024-03-11',
      preferredTimeSlot: '07:00-09:00',
      preferredLocation: 'Performance Lab Studio',
      convertedToClientAt: '2024-03-11T09:00:00.000Z',
    },
    {
      id: 'assessment_4',
      userId: 'user_priya_1',
      age: 30,
      weight: '148 lbs',
      height: '5\'6"',
      gender: 'female',
      goals: ['weight_loss', 'endurance', 'consistency'],
      experienceLevel: 'beginner',
      healthConditions: 'No major issues',
      daysPerWeek: 4,
      preferredTimes: 'early_morning',
      status: 'reviewed',
      submittedAt: '2024-03-25T08:00:00.000Z',
      reviewedAt: '2024-03-26T11:30:00.000Z',
      trainerNotes: 'Responds well to simple structure. Keep conditioning progressive and sustainable.',
      preferredDate: '2024-03-27',
      preferredTimeSlot: '06:00-08:00',
      preferredLocation: 'Northside Strength Club',
      convertedToClientAt: '2024-03-28T10:00:00.000Z',
    },
    {
      id: 'assessment_5',
      userId: 'user_aisha_1',
      age: 27,
      weight: '158 lbs',
      height: '5\'7"',
      gender: 'female',
      goals: ['weight_loss', 'toning', 'strength'],
      experienceLevel: 'intermediate',
      healthConditions: 'Tight hips after long work hours',
      daysPerWeek: 5,
      preferredTimes: 'evening',
      status: 'reviewed',
      submittedAt: '2024-04-12T18:15:00.000Z',
      reviewedAt: '2024-04-13T10:00:00.000Z',
      trainerNotes: 'Good consistency potential. Needs balanced conditioning and strength progression.',
      preferredDate: '2024-04-15',
      preferredTimeSlot: '17:00-19:00',
      preferredLocation: 'Hybrid: gym + remote check-ins',
      convertedToClientAt: '2024-04-15T17:30:00.000Z',
    },
  ];

  // Plans
  const now = new Date();
  const monthDate = (offset: number) => {
    const value = new Date(now);
    value.setMonth(now.getMonth() + offset);
    return value.toISOString().split('T')[0];
  };

  const plans: Plan[] = [
    {
      id: 'plan_1',
      userId: 'user_john_1',
      name: 'Elite Performance Pack',
      description: 'A comprehensive high-intensity program designed to maximize muscle gain and athletic performance. Includes personalized nutrition guidance, weekly check-ins, and real-time form correction.',
      monthlyRate: 299,
      paymentFrequency: 'monthly',
      goals: ['Increase lean muscle mass by 10 lbs', 'Improve compound lift maxes by 20%', 'Enhance cardiovascular endurance', 'Optimize recovery protocols'],
      startDate: monthDate(-3),
      status: 'active',
      trainerName: TRAINER_NAME,
      duration: '6 months',
    },
    {
      id: 'plan_2',
      userId: 'user_sarah_1',
      name: 'Starter Reset Plan',
      description: 'A low-friction entry plan focused on routine, movement quality, and basic nutrition consistency.',
      monthlyRate: 129,
      paymentFrequency: 'monthly',
      goals: ['Train 3 times per week', 'Improve posture and confidence', 'Reduce lower back discomfort'],
      startDate: monthDate(0),
      status: 'pending',
      trainerName: TRAINER_NAME,
      duration: '8 weeks',
    },
    {
      id: 'plan_3',
      userId: 'user_marcus_1',
      name: 'Strength Rebuild Plan',
      description: 'A structured return-to-strength program with mobility primers, progressive loading, and recovery checkpoints.',
      monthlyRate: 239,
      paymentFrequency: 'monthly',
      goals: ['Rebuild lower body strength', 'Improve hinge mechanics', 'Restore weekly training rhythm'],
      startDate: monthDate(-2),
      status: 'active',
      trainerName: TRAINER_NAME,
      duration: '4 months',
    },
    {
      id: 'plan_4',
      userId: 'user_priya_1',
      name: 'Lifestyle Conditioning Plan',
      description: 'An accountability-driven conditioning plan designed to improve stamina, tighten nutrition habits, and reduce fatigue.',
      monthlyRate: 179,
      paymentFrequency: 'monthly',
      goals: ['Improve workday energy', 'Build cardio fitness', 'Lose 8 lbs sustainably'],
      startDate: monthDate(-1),
      status: 'active',
      trainerName: TRAINER_NAME,
      duration: '3 months',
    },
    {
      id: 'plan_5',
      userId: 'user_aisha_1',
      name: 'Fat Loss Accelerator',
      description: 'A higher-frequency transformation plan built around progressive training, conditioning, and simple nutrition discipline.',
      monthlyRate: 219,
      paymentFrequency: 'monthly',
      goals: ['Reduce body fat', 'Increase training consistency', 'Build visible upper-body definition'],
      startDate: monthDate(-2),
      status: 'active',
      trainerName: TRAINER_NAME,
      duration: '5 months',
    },
  ];

  // Sessions - relative to today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const d = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const sessions: Session[] = [
    {
      id: 'session_1',
      userId: 'user_john_1',
      title: 'Upper Body Strength',
      date: d(-14),
      time: '08:00',
      duration: 60,
      status: 'completed',
      notes: 'Great session! Hit new PR on bench press. Focus on form next time.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_2',
      userId: 'user_john_1',
      title: 'HIIT Cardio & Core',
      date: d(-10),
      time: '08:00',
      duration: 45,
      status: 'completed',
      notes: 'Excellent endurance improvements. Keep pushing the cardio intervals.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_3',
      userId: 'user_john_1',
      title: 'Lower Body Power',
      date: d(-5),
      time: '07:30',
      duration: 60,
      status: 'completed',
      notes: 'Solid squat mechanics. Add 10 lbs to deadlift next session.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_4',
      userId: 'user_john_1',
      title: 'Full Body Circuit Training',
      date: todayStr,
      time: '08:00',
      duration: 60,
      status: 'scheduled',
      notes: 'Focus on compound movements and metabolic conditioning',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_5',
      userId: 'user_john_1',
      title: 'Push Day - Chest & Shoulders',
      date: d(3),
      time: '08:00',
      duration: 60,
      status: 'scheduled',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_6',
      userId: 'user_john_1',
      title: 'Pull Day - Back & Biceps',
      date: d(7),
      time: '07:30',
      duration: 60,
      status: 'scheduled',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_7',
      userId: 'user_sarah_1',
      title: 'Starter Consultation Review',
      date: d(-3),
      time: '18:30',
      duration: 45,
      status: 'completed',
      notes: 'Reviewed movement confidence and planned a gradual 3-day split.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_8',
      userId: 'user_sarah_1',
      title: 'Mobility & Technique Session',
      date: d(2),
      time: '18:30',
      duration: 45,
      status: 'scheduled',
      notes: 'Focus on hinge pattern, core bracing, and low-back friendly progressions.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_9',
      userId: 'user_sarah_1',
      title: 'Habit Review Check-In',
      date: d(9),
      time: '18:00',
      duration: 30,
      status: 'scheduled',
      notes: 'Review step count, meals, and adherence before progressing volume.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_10',
      userId: 'user_marcus_1',
      title: 'Lower Body Rebuild',
      date: d(-6),
      time: '06:45',
      duration: 60,
      status: 'completed',
      notes: 'Good tempo control on trap bar deadlift and split squat variations.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_11',
      userId: 'user_marcus_1',
      title: 'Technique Check-In',
      date: d(1),
      time: '07:00',
      duration: 50,
      status: 'scheduled',
      notes: 'Video review for hinge mechanics and core tension before heavier work.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_12',
      userId: 'user_marcus_1',
      title: 'Posterior Chain Progression',
      date: d(5),
      time: '07:00',
      duration: 60,
      status: 'scheduled',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_13',
      userId: 'user_marcus_1',
      title: 'Recovery Mobility Reset',
      date: d(12),
      time: '07:30',
      duration: 40,
      status: 'cancelled',
      notes: 'Client requested reschedule due to travel.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_14',
      userId: 'user_priya_1',
      title: 'Conditioning Kickoff',
      date: d(-8),
      time: '06:30',
      duration: 50,
      status: 'completed',
      notes: 'Introduced treadmill intervals and machine circuit pacing.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_15',
      userId: 'user_priya_1',
      title: 'Interval Conditioning Build',
      date: d(4),
      time: '06:30',
      duration: 45,
      status: 'scheduled',
      notes: 'Progress work-to-rest ratio and reinforce post-session meal timing.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_16',
      userId: 'user_priya_1',
      title: 'Nutrition Review Check-In',
      date: d(10),
      time: '07:15',
      duration: 30,
      status: 'scheduled',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_17',
      userId: 'user_aisha_1',
      title: 'Body Recomposition Review',
      date: d(-12),
      time: '19:00',
      duration: 60,
      status: 'completed',
      notes: 'Improved work capacity and stronger pressing numbers this week.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_18',
      userId: 'user_aisha_1',
      title: 'Upper Body Density Session',
      date: d(-2),
      time: '19:00',
      duration: 55,
      status: 'completed',
      notes: 'Pushed density blocks well. Keep meal prep tight ahead of the next phase.',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_19',
      userId: 'user_aisha_1',
      title: 'Metabolic Circuit Block',
      date: d(3),
      time: '18:45',
      duration: 50,
      status: 'scheduled',
      trainerName: TRAINER_NAME,
    },
    {
      id: 'session_20',
      userId: 'user_aisha_1',
      title: 'Monthly Progress Audit',
      date: d(11),
      time: '18:30',
      duration: 40,
      status: 'scheduled',
      notes: 'Review check-in photos, training consistency, and calorie compliance.',
      trainerName: TRAINER_NAME,
    },
  ];

  // Programs
  const programs: Program[] = [
    {
      id: 'program_1',
      userId: 'user_john_1',
      weekNumber: 1,
      title: 'Foundation & Assessment Week',
      description: 'Establish baseline strength levels and movement patterns. Focus on form and technique before increasing intensity.',
      activities: [
        { day: 'Monday', exercise: 'Barbell Back Squat', sets: 4, reps: '8-10', notes: 'Focus on depth and form' },
        { day: 'Monday', exercise: 'Romanian Deadlift', sets: 3, reps: '10-12', notes: 'Keep back neutral' },
        { day: 'Monday', exercise: 'Walking Lunges', sets: 3, reps: '12 each leg' },
        { day: 'Tuesday', exercise: 'Bench Press', sets: 4, reps: '8-10', notes: 'Controlled descent' },
        { day: 'Tuesday', exercise: 'Incline Dumbbell Press', sets: 3, reps: '10-12' },
        { day: 'Tuesday', exercise: 'Cable Flyes', sets: 3, reps: '12-15' },
        { day: 'Wednesday', exercise: 'Active Recovery Run', duration: '30 min', notes: 'Easy pace, Zone 2' },
        { day: 'Wednesday', exercise: 'Foam Rolling & Stretching', duration: '20 min' },
        { day: 'Thursday', exercise: 'Pull-ups / Lat Pulldown', sets: 4, reps: '8-10' },
        { day: 'Thursday', exercise: 'Seated Cable Row', sets: 3, reps: '10-12' },
        { day: 'Thursday', exercise: 'Barbell Curl', sets: 3, reps: '10-12' },
        { day: 'Friday', exercise: 'Overhead Press', sets: 4, reps: '8-10' },
        { day: 'Friday', exercise: 'Lateral Raises', sets: 3, reps: '15-20' },
        { day: 'Friday', exercise: 'HIIT Finisher', duration: '15 min', notes: '30s on / 30s off' },
        { day: 'Saturday', exercise: 'Active Rest - Light Walk or Swim', duration: '45 min' },
        { day: 'Sunday', exercise: 'Full Rest Day', notes: 'Recovery and nutrition focus' },
      ],
      createdAt: '2024-01-18T00:00:00.000Z',
    },
    {
      id: 'program_2',
      userId: 'user_john_1',
      weekNumber: 2,
      title: 'Progressive Overload Phase',
      description: 'Increase weights across all major lifts by 5-10%. Introduce supersets to maximize workout density and metabolic response.',
      activities: [
        { day: 'Monday', exercise: 'Barbell Back Squat', sets: 5, reps: '5', notes: '+10 lbs from Week 1' },
        { day: 'Monday', exercise: 'Leg Press', sets: 4, reps: '10-12' },
        { day: 'Monday', exercise: 'Leg Curl', sets: 3, reps: '12-15' },
        { day: 'Tuesday', exercise: 'Bench Press', sets: 5, reps: '5', notes: '+5 lbs from Week 1' },
        { day: 'Tuesday', exercise: 'Weighted Dips', sets: 4, reps: '8-10' },
        { day: 'Tuesday', exercise: 'Push-ups Burnout', sets: 3, reps: 'Max' },
        { day: 'Wednesday', exercise: 'HIIT Cardio', duration: '35 min', notes: '40s on / 20s off' },
        { day: 'Thursday', exercise: 'Deadlift', sets: 5, reps: '5', notes: '+10 lbs from Week 1' },
        { day: 'Thursday', exercise: 'Single Arm Dumbbell Row', sets: 4, reps: '10 each' },
        { day: 'Thursday', exercise: 'Face Pulls', sets: 3, reps: '15-20' },
        { day: 'Friday', exercise: 'Military Press', sets: 4, reps: '6-8', notes: '+5 lbs' },
        { day: 'Friday', exercise: 'Arnold Press', sets: 3, reps: '10-12' },
        { day: 'Friday', exercise: 'Battle Ropes', duration: '10 min', notes: 'Finisher' },
        { day: 'Saturday', exercise: 'Mobility Work & Yoga', duration: '45 min' },
        { day: 'Sunday', exercise: 'Full Rest Day', notes: 'Sleep 8+ hours, hydrate well' },
      ],
      createdAt: '2024-01-25T00:00:00.000Z',
    },
    {
      id: 'program_3',
      userId: 'user_sarah_1',
      weekNumber: 1,
      title: 'Starter Reset Week',
      description: 'A low-impact entry week focused on movement confidence, core control, and walking consistency.',
      activities: [
        { day: 'Monday', exercise: 'Bodyweight Squat', sets: 3, reps: '12' },
        { day: 'Monday', exercise: 'Incline Push-up', sets: 3, reps: '10' },
        { day: 'Wednesday', exercise: 'Brisk Walk', duration: '30 min', notes: 'Conversation pace' },
        { day: 'Wednesday', exercise: 'Mobility Flow', duration: '15 min' },
        { day: 'Friday', exercise: 'Dumbbell Romanian Deadlift', sets: 3, reps: '12' },
        { day: 'Friday', exercise: 'Seated Cable Row', sets: 3, reps: '12' },
        { day: 'Saturday', exercise: 'Recovery Stretch', duration: '20 min' },
      ],
      createdAt: '2024-02-24T00:00:00.000Z',
    },
    {
      id: 'program_4',
      userId: 'user_marcus_1',
      weekNumber: 1,
      title: 'Movement Rebuild Week',
      description: 'Reintroduce heavier patterns with mobility prep, tempo work, and technical consistency.',
      activities: [
        { day: 'Monday', exercise: 'Trap Bar Deadlift', sets: 4, reps: '6' },
        { day: 'Monday', exercise: 'Goblet Split Squat', sets: 3, reps: '10 each leg' },
        { day: 'Tuesday', exercise: 'Bike Intervals', duration: '24 min', notes: '60s on / 90s off' },
        { day: 'Thursday', exercise: 'Bench Press', sets: 4, reps: '6-8' },
        { day: 'Thursday', exercise: 'Chest Supported Row', sets: 4, reps: '10' },
        { day: 'Saturday', exercise: 'Mobility Circuit', duration: '25 min' },
      ],
      createdAt: '2024-03-11T00:00:00.000Z',
    },
    {
      id: 'program_5',
      userId: 'user_marcus_1',
      weekNumber: 2,
      title: 'Strength Rebuild Progression',
      description: 'Progress lower-body strength while keeping hinge mechanics and ankle mobility under control.',
      activities: [
        { day: 'Monday', exercise: 'Trap Bar Deadlift', sets: 5, reps: '5', notes: '+10 lbs from week 1' },
        { day: 'Monday', exercise: 'Reverse Lunge', sets: 3, reps: '8 each leg' },
        { day: 'Wednesday', exercise: 'Sled Push', sets: 6, reps: '20 m' },
        { day: 'Thursday', exercise: 'Incline Bench Press', sets: 4, reps: '8' },
        { day: 'Thursday', exercise: 'Lat Pulldown', sets: 4, reps: '10' },
        { day: 'Saturday', exercise: 'Ankle + Hip Mobility', duration: '20 min' },
      ],
      createdAt: '2024-03-18T00:00:00.000Z',
    },
    {
      id: 'program_6',
      userId: 'user_priya_1',
      weekNumber: 1,
      title: 'Conditioning & Consistency Block',
      description: 'Build daily energy and cardio capacity with manageable strength work and sustainable conditioning.',
      activities: [
        { day: 'Monday', exercise: 'Incline Walk', duration: '25 min' },
        { day: 'Tuesday', exercise: 'Dumbbell Squat', sets: 3, reps: '12' },
        { day: 'Tuesday', exercise: 'Dumbbell Press', sets: 3, reps: '12' },
        { day: 'Thursday', exercise: 'Rowing Intervals', duration: '18 min', notes: '45s on / 75s off' },
        { day: 'Friday', exercise: 'Lat Pulldown', sets: 3, reps: '12' },
        { day: 'Friday', exercise: 'Kettlebell Deadlift', sets: 3, reps: '12' },
        { day: 'Sunday', exercise: 'Recovery Walk', duration: '35 min' },
      ],
      createdAt: '2024-03-28T00:00:00.000Z',
    },
    {
      id: 'program_7',
      userId: 'user_aisha_1',
      weekNumber: 1,
      title: 'Fat Loss Momentum Week',
      description: 'A higher-output week combining lifting density, conditioning, and recovery structure.',
      activities: [
        { day: 'Monday', exercise: 'Barbell Hip Thrust', sets: 4, reps: '10' },
        { day: 'Monday', exercise: 'Cable Row', sets: 4, reps: '12' },
        { day: 'Wednesday', exercise: 'Treadmill Intervals', duration: '22 min' },
        { day: 'Thursday', exercise: 'Dumbbell Shoulder Press', sets: 4, reps: '10' },
        { day: 'Thursday', exercise: 'Walking Lunge', sets: 3, reps: '12 each leg' },
        { day: 'Saturday', exercise: 'Full Body Circuit', duration: '30 min' },
        { day: 'Sunday', exercise: 'Mobility Reset', duration: '20 min' },
      ],
      createdAt: '2024-04-15T00:00:00.000Z',
    },
  ];

  // Payments
  const payments: Payment[] = [
    {
      id: 'payment_1',
      userId: 'user_john_1',
      amount: 299,
      date: monthDate(-3),
      status: 'paid',
      reference: 'PAY-2024-001',
      description: 'Elite Performance Pack - Month 1',
      dueDate: monthDate(-3),
    },
    {
      id: 'payment_2',
      userId: 'user_john_1',
      amount: 299,
      date: monthDate(-2),
      status: 'paid',
      reference: 'PAY-2024-002',
      description: 'Elite Performance Pack - Month 2',
      dueDate: monthDate(-2),
    },
    {
      id: 'payment_3',
      userId: 'user_john_1',
      amount: 299,
      date: monthDate(-1),
      status: 'paid',
      reference: 'PAY-2024-003',
      description: 'Elite Performance Pack - Month 3',
      dueDate: monthDate(-1),
    },
    {
      id: 'payment_4',
      userId: 'user_john_1',
      amount: 299,
      date: '',
      status: 'pending',
      reference: 'PAY-2024-004',
      description: 'Elite Performance Pack - Month 4',
      dueDate: monthDate(1),
    },
    {
      id: 'payment_5',
      userId: 'user_sarah_1',
      amount: 129,
      date: '',
      status: 'pending',
      reference: 'PAY-2024-005',
      description: 'Starter Reset Plan - Onboarding Invoice',
      dueDate: d(5),
    },
    {
      id: 'payment_6',
      userId: 'user_marcus_1',
      amount: 239,
      date: monthDate(-2),
      status: 'paid',
      reference: 'PAY-2024-006',
      description: 'Strength Rebuild Plan - Month 1',
      dueDate: monthDate(-2),
    },
    {
      id: 'payment_7',
      userId: 'user_marcus_1',
      amount: 239,
      date: monthDate(-1),
      status: 'paid',
      reference: 'PAY-2024-007',
      description: 'Strength Rebuild Plan - Month 2',
      dueDate: monthDate(-1),
    },
    {
      id: 'payment_8',
      userId: 'user_marcus_1',
      amount: 239,
      date: '',
      status: 'pending',
      reference: 'PAY-2024-008',
      description: 'Strength Rebuild Plan - Month 3',
      dueDate: d(6),
    },
    {
      id: 'payment_9',
      userId: 'user_priya_1',
      amount: 179,
      date: monthDate(-1),
      status: 'paid',
      reference: 'PAY-2024-009',
      description: 'Lifestyle Conditioning Plan - Month 1',
      dueDate: monthDate(-1),
    },
    {
      id: 'payment_10',
      userId: 'user_aisha_1',
      amount: 219,
      date: monthDate(-2),
      status: 'paid',
      reference: 'PAY-2024-010',
      description: 'Fat Loss Accelerator - Month 1',
      dueDate: monthDate(-2),
    },
    {
      id: 'payment_11',
      userId: 'user_aisha_1',
      amount: 219,
      date: '',
      status: 'overdue',
      reference: 'PAY-2024-011',
      description: 'Fat Loss Accelerator - Month 2',
      dueDate: d(-7),
    },
  ];

  const users = ensureRecords(getItems<User>(USERS_KEY), defaultUsers, (current, fallback) => ({
    ...current,
    ...fallback,
  }));

  const assessments = ensureRecords(getItems<Assessment>(ASSESSMENTS_KEY), defaultAssessments);

  const mergedPlans = ensureRecords(
    getItems<Plan>(PLANS_KEY).map((plan) => ({ ...plan, trainerName: TRAINER_NAME })),
    plans,
    (current) => ({ ...current, trainerName: TRAINER_NAME })
  );

  const mergedSessions = ensureRecords(
    getItems<Session>(SESSIONS_KEY).map((session) => ({ ...session, trainerName: TRAINER_NAME })),
    sessions,
    (current) => ({ ...current, trainerName: TRAINER_NAME })
  );

  const mergedPrograms = ensureRecords(getItems<Program>(PROGRAMS_KEY), programs);
  const mergedPayments = ensureRecords(getItems<Payment>(PAYMENTS_KEY), payments);

  setItems(USERS_KEY, users);
  setItems(ASSESSMENTS_KEY, assessments);
  setItems(PLANS_KEY, mergedPlans);
  setItems(SESSIONS_KEY, mergedSessions);
  setItems(PROGRAMS_KEY, mergedPrograms);
  setItems(PAYMENTS_KEY, mergedPayments);
  localStorage.setItem(SEEDED_KEY, 'true');
  syncStoredAuth(users);
}
