import { getItems, setItems } from './storage';
import type { User } from './auth';

const TRAINER_NAME = 'Mohammed Sufiyan';

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

function syncTrainerData(): void {
  const users = getItems<User>('ishow_users');
  if (users.length > 0) {
    setItems(
      'ishow_users',
      users.map((user) =>
        user.role === 'trainer' ? { ...user, name: TRAINER_NAME } : user
      )
    );
  }

  const plans = getItems<Plan>('ishow_plans');
  if (plans.length > 0) {
    setItems(
      'ishow_plans',
      plans.map((plan) => ({ ...plan, trainerName: TRAINER_NAME }))
    );
  }

  const sessions = getItems<Session>('ishow_sessions');
  if (sessions.length > 0) {
    setItems(
      'ishow_sessions',
      sessions.map((session) => ({ ...session, trainerName: TRAINER_NAME }))
    );
  }
}

export function seedMockData(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('ishow_seeded')) {
    syncTrainerData();
    return;
  }

  // Users
  const users: User[] = [
    {
      id: 'user_trainer_1',
      name: TRAINER_NAME,
      email: 'trainer@ishow.com',
      password: 'trainer123',
      phone: '+1 (555) 001-0001',
      role: 'trainer',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'user_john_1',
      name: 'John Smith',
      email: 'john@example.com',
      password: 'demo123',
      phone: '+1 (555) 001-0002',
      role: 'customer',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: 'user_sarah_1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'demo123',
      phone: '+1 (555) 001-0003',
      role: 'customer',
      createdAt: '2024-02-20T00:00:00.000Z',
    },
  ];

  // Assessments
  const assessments: Assessment[] = [
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
    },
  ];

  // Plans
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const plans: Plan[] = [
    {
      id: 'plan_1',
      userId: 'user_john_1',
      name: 'Elite Performance Pack',
      description: 'A comprehensive high-intensity program designed to maximize muscle gain and athletic performance. Includes personalized nutrition guidance, weekly check-ins, and real-time form correction.',
      monthlyRate: 299,
      paymentFrequency: 'monthly',
      goals: ['Increase lean muscle mass by 10 lbs', 'Improve compound lift maxes by 20%', 'Enhance cardiovascular endurance', 'Optimize recovery protocols'],
      startDate: threeMonthsAgo.toISOString().split('T')[0],
      status: 'active',
      trainerName: TRAINER_NAME,
      duration: '6 months',
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
  ];

  // Payments
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const payments: Payment[] = [
    {
      id: 'payment_1',
      userId: 'user_john_1',
      amount: 299,
      date: threeMonthsAgo.toISOString().split('T')[0],
      status: 'paid',
      reference: 'PAY-2024-001',
      description: 'Elite Performance Pack - Month 1',
      dueDate: threeMonthsAgo.toISOString().split('T')[0],
    },
    {
      id: 'payment_2',
      userId: 'user_john_1',
      amount: 299,
      date: (() => { const d = new Date(threeMonthsAgo); d.setMonth(d.getMonth() + 1); return d.toISOString().split('T')[0]; })(),
      status: 'paid',
      reference: 'PAY-2024-002',
      description: 'Elite Performance Pack - Month 2',
      dueDate: (() => { const d = new Date(threeMonthsAgo); d.setMonth(d.getMonth() + 1); return d.toISOString().split('T')[0]; })(),
    },
    {
      id: 'payment_3',
      userId: 'user_john_1',
      amount: 299,
      date: (() => { const d = new Date(threeMonthsAgo); d.setMonth(d.getMonth() + 2); return d.toISOString().split('T')[0]; })(),
      status: 'paid',
      reference: 'PAY-2024-003',
      description: 'Elite Performance Pack - Month 3',
      dueDate: (() => { const d = new Date(threeMonthsAgo); d.setMonth(d.getMonth() + 2); return d.toISOString().split('T')[0]; })(),
    },
    {
      id: 'payment_4',
      userId: 'user_john_1',
      amount: 299,
      date: '',
      status: 'pending',
      reference: 'PAY-2024-004',
      description: 'Elite Performance Pack - Month 4',
      dueDate: nextMonth.toISOString().split('T')[0],
    },
  ];

  setItems('ishow_users', users);
  setItems('ishow_assessments', assessments);
  setItems('ishow_plans', plans);
  setItems('ishow_sessions', sessions);
  setItems('ishow_programs', programs);
  setItems('ishow_payments', payments);
  localStorage.setItem('ishow_seeded', 'true');
  syncTrainerData();
}
