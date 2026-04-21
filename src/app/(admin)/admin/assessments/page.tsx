"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listAssessments, reviewAssessment, type Assessment } from "@/lib/db/assessments";
import { listCustomers, listTrainers, updateProfile, type Profile } from "@/lib/db/profiles";
import { listSessions, createSession, updateSession, type TrainingSession } from "@/lib/db/sessions";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/email/notify";
import {
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CalendarDays, 
  MapPin,
  Mail, 
  Phone, 
  UserCheck, 
  Calendar, 
  Pencil, 
  X, 
  Loader2, 
  RefreshCw,
  Activity,
  Target,
  Zap,
  Shield,
  ArrowRight,
  ClipboardList
} from "lucide-react";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtLong(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

type Filter = "all" | "pending" | "reviewed";

type ScheduleForm = {
  title: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
};

function blankSchedule(a: Assessment, clientName: string): ScheduleForm {
  return {
    title: `Syllabus Induction – ${clientName}`,
    date: a.preferredDate ?? "",
    time: a.preferredTimeSlot ?? "",
    duration: "60",
    notes: "",
  };
}

const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM",
];

export default function AdminAssessmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Session scheduling
  const [schedulingId, setSchedulingId] = useState<string | null>(null); // assessmentId
  const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({ title: "", date: "", time: "", duration: "60", notes: "" });
  const [savingSession, setSavingSession] = useState(false);
  const [sessionError, setSessionError] = useState("");

  // Actions
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Trainer assignment
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [assignedTrainerId, setAssignedTrainerId] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const [a, c, s, t] = await Promise.all([listAssessments(), listCustomers(), listSessions(), listTrainers()]);
      setAssessments(a);
      setCustomers(c);
      setSessions(s);
      setTrainers(t);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== 'admin') { router.replace('/trainer/dashboard'); return; }
    loadData();
  }, [loading, router, user]);

  if (loading || !dataLoaded || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="p-8 max-w-full animate-pulse space-y-10">
           <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
           <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-[2rem]" />)}
           </div>
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-2xl" />)}
           </div>
        </div>
      </DashboardLayout>
    );
  }

  const customerById = Object.fromEntries(customers.map(c => [c.id, c]));
  const sessionByUserId: Record<string, TrainingSession[]> = {};
  for (const s of sessions) {
    if (!sessionByUserId[s.userId]) sessionByUserId[s.userId] = [];
    sessionByUserId[s.userId].push(s);
  }

  const pending = assessments.filter(a => a.status === "pending").length;
  const reviewed = assessments.filter(a => a.status === "reviewed").length;
  const filtered = filter === "all" ? assessments : assessments.filter(a => a.status === filter);

  function openSchedule(assessment: Assessment, existingSession?: TrainingSession) {
    const name = customerById[assessment.userId]?.name ?? "Asset";
    if (existingSession) {
      setRescheduleSessionId(existingSession.id);
      setScheduleForm({
        title: existingSession.title,
        date: existingSession.scheduledDate,
        time: existingSession.scheduledTime,
        duration: String(existingSession.duration),
        notes: existingSession.notes ?? "",
      });
    } else {
      setRescheduleSessionId(null);
      setScheduleForm(blankSchedule(assessment, name));
    }
    setSchedulingId(assessment.id);
    setSessionError("");
  }

  function closeSchedule() {
    setSchedulingId(null);
    setRescheduleSessionId(null);
    setSessionError("");
  }

  async function handleSaveSession(assessment: Assessment) {
    if (!scheduleForm.date || !scheduleForm.time || !scheduleForm.title) {
      setSessionError("Identity mismatch: Identifier, timestamp, and temporal coordinates required.");
      return;
    }
    setSavingSession(true);
    setSessionError("");
    try {
      const client = customerById[assessment.userId];
      const emailData = {
        name: client?.name ?? 'there',
        title: scheduleForm.title,
        date: new Date(scheduleForm.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        time: scheduleForm.time,
        duration: scheduleForm.duration,
        notes: scheduleForm.notes || undefined,
        location: assessment.preferredLocation,
      };

      if (rescheduleSessionId) {
        const existing = sessions.find(s => s.id === rescheduleSessionId);
        await updateSession(rescheduleSessionId, {
          title: scheduleForm.title,
          scheduledDate: scheduleForm.date,
          scheduledTime: scheduleForm.time,
          duration: parseInt(scheduleForm.duration) || 60,
          notes: scheduleForm.notes || undefined,
        });
        if (client?.email) {
          notify('session-rescheduled', client.email, {
            ...emailData,
            oldDate: existing ? new Date(existing.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
            oldTime: existing?.scheduledTime,
          });
        }
      } else {
        await createSession({
          userId: assessment.userId,
          trainerId: user!.id,
          title: scheduleForm.title,
          scheduledDate: scheduleForm.date,
          scheduledTime: scheduleForm.time,
          duration: parseInt(scheduleForm.duration) || 60,
          status: "scheduled",
          notes: scheduleForm.notes || undefined,
        });
        if (client?.email) notify('session-scheduled', client.email, emailData);
      }
      closeSchedule();
      await loadData();
    } catch {
      setSessionError("Communications failure. Deployment aborted. Retry system link.");
    } finally {
      setSavingSession(false);
    }
  }

  async function handleSaveNotes(assessmentId: string) {
    setSavingNotes(true);
    const supabase = createClient();
    await supabase.from("assessments").update({ trainer_notes: notesText }).eq("id", assessmentId);
    setSavingNotes(false);
    setEditingNotesId(null);
    await loadData();
  }

  async function handleMarkReviewed(assessmentId: string) {
    const a = assessments.find(x => x.id === assessmentId);
    const trainerId = assignedTrainerId[assessmentId];
    await reviewAssessment(assessmentId, a?.trainerNotes ?? "", "reviewed", trainerId || undefined);
    const client = customerById[a?.userId ?? ''];
    if (client?.email) {
      notify('assessment-reviewed', client.email, {
        name: client.name,
        notes: a?.trainerNotes || undefined,
      });
    }
    await loadData();
  }

  async function handleConvert(customerId: string, assessmentId: string) {
    setConvertingId(customerId);
    const a = assessments.find(x => x.id === assessmentId);
    const trainerId = assignedTrainerId[assessmentId];
    await Promise.all([
      updateProfile(customerId, { customerStatus: "client" }),
      reviewAssessment(assessmentId, a?.trainerNotes ?? "", "reviewed", trainerId || undefined),
    ]);
    const client = customerById[customerId];
    if (client?.email) {
      notify('assessment-reviewed', client.email, {
        name: client.name,
        notes: a?.trainerNotes || undefined,
      });
    }
    setConvertingId(null);
    await loadData();
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8 text-white">
        <div className="max-w-full">

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6 italic">
              <ClipboardList className="w-3 h-3 fill-orange-500" /> Assessment Queue Active
            </div>
            <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">
               Assay <span className="text-orange-500">Logistics</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl">Reviewing kinetic profiles, scheduling syllabus inductions, and authorizing sector access.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Manifest Total", value: assessments.length, icon: Activity, color: "text-zinc-400" },
              { label: "Pending Review", value: pending, icon: Clock, color: "text-orange-500" },
              { label: "Validated Nodes", value: reviewed, icon: CheckCircle, color: "text-emerald-500" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <stat.icon className="w-12 h-12" />
                </div>
                <p className={`text-3xl font-black italic ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            {(["all", "pending", "reviewed"] as Filter[]).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic border ${
                  filter === f
                    ? "bg-white text-zinc-950 border-white shadow-xl shadow-white/5"
                    : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Manifest List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[3rem] py-32 text-center"
                >
                   <Shield className="w-12 h-12 mx-auto mb-4 text-zinc-800 opacity-20" />
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.5em] italic">Queue Synchronized · No Assets Found</p>
                </motion.div>
              ) : filtered.map((assessment, aIdx) => {
                const expanded = expandedId === assessment.id;
                const client = customerById[assessment.userId];
                const name = client?.name ?? "IDENTIFIER UNKNOWN";
                const userSessions = sessionByUserId[assessment.userId] ?? [];
                const scheduledSession = userSessions.find(s => s.status === "scheduled");
                const isSchedulingThis = schedulingId === assessment.id;
                const isConverted = client?.customerStatus === "client";

                return (
                  <motion.div 
                    layout
                    key={assessment.id} 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: aIdx * 0.02 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl relative"
                  >
                    <button
                      onClick={() => setExpandedId(expanded ? null : assessment.id)}
                      className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8 text-left hover:bg-zinc-950/40 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-black text-xl italic shrink-0 group-hover:bg-orange-500 group-hover:border-transparent transition-all shadow-inner">
                           {name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white text-xl uppercase italic tracking-tighter leading-none mb-2">{name}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                             <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                               <Clock className="w-3 h-3" /> Logged {fmt(assessment.submittedAt)}
                             </span>
                             {assessment.preferredDate && (
                               <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                 <CalendarDays className="w-3 h-3" /> 
                                 {new Date(assessment.preferredDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                 {" · "}{assessment.preferredTimeSlot}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center">
                         {isConverted && (
                            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                               <UserCheck size={12} /> Authorized Asset
                            </div>
                         )}
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic border flex items-center gap-2 ${
                            assessment.status === "pending"
                              ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                              : "bg-zinc-800 border-zinc-700 text-zinc-500"
                          }`}>
                            {assessment.status === "pending" ? <Activity className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {assessment.status === "pending" ? "Awaiting Assay" : "Assay Validated"}
                         </div>
                         <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl group-hover:text-white transition-colors">
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-zinc-800/50 bg-zinc-950/20"
                        >
                          <div className="p-8 md:p-10 space-y-12">
                             
                             {/* Logistics Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Contact/Location */}
                                <div className="space-y-6">
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Deployment Logistics</p>
                                   <div className="grid grid-cols-1 gap-4">
                                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between group/item hover:border-zinc-700 transition-colors">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                               <Mail size={16} />
                                            </div>
                                            <div>
                                               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Communications Link</p>
                                               <p className="text-sm font-black text-white italic uppercase tracking-tight">{client?.email ?? "N/A"}</p>
                                            </div>
                                         </div>
                                         <ArrowRight className="w-4 h-4 text-zinc-800 group-hover/item:text-blue-500 transition-colors" />
                                      </div>
                                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between group/item hover:border-zinc-700 transition-colors">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                                               <MapPin size={16} />
                                            </div>
                                            <div>
                                               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Combat Vector (Location)</p>
                                               <p className="text-sm font-black text-white italic uppercase tracking-tight">{assessment.preferredLocation ?? "FIELD OP"}</p>
                                            </div>
                                         </div>
                                         <ArrowRight className="w-4 h-4 text-zinc-800 group-hover/item:text-orange-500 transition-colors" />
                                      </div>
                                   </div>
                                </div>

                                {/* Kinetic Status */}
                                <div className="space-y-6">
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Kinetic Analysis</p>
                                   <div className="grid grid-cols-2 gap-3">
                                      {[
                                        { label: "Temporal Age", value: assessment.age ? `${assessment.age} CY` : "—" },
                                        { label: "Mass Status", value: assessment.weight ?? "—" },
                                        { label: "Kinetic Range", value: assessment.experienceLevel ?? "—" },
                                        { label: "Op Frequency", value: assessment.daysPerWeek ? `${assessment.daysPerWeek}x/W` : "—" },
                                      ].map(m => (
                                        <div key={m.label} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                                           <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 italic">{m.label}</p>
                                           <p className="text-xs font-black text-zinc-200 italic uppercase">{m.value}</p>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             </div>

                             {/* Goals & Health */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic mb-6">Strategic Objectives</p>
                                   <div className="flex flex-wrap gap-2">
                                      {assessment.goals.map(g => (
                                        <span key={g} className="bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl italic">
                                          {g.replace(/_/g, " ")}
                                        </span>
                                      ))}
                                      {assessment.goals.length === 0 && <p className="text-zinc-800 text-[10px] font-black uppercase tracking-widest italic">No objectives logged</p>}
                                   </div>
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic mb-6">Vital Disclaimers / Injuries</p>
                                   <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-widest italic">{assessment.healthConditions || "CLEARED FOR DEPLOYMENT"}</p>
                                </div>
                             </div>

                             {/* Assigned Handler */}
                             <div className="pt-10 border-t border-zinc-800/50">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic mb-8">Asset Command Transfer</p>
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                   <div className="w-full md:w-auto">
                                      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-4 italic">Handler Designation</p>
                                      <div className="relative">
                                        <select
                                          value={assignedTrainerId[assessment.id] ?? assessment.assignedTrainerId ?? ""}
                                          onChange={e => setAssignedTrainerId(prev => ({ ...prev, [assessment.id]: e.target.value }))}
                                          className="w-full md:w-80 bg-zinc-900 border border-zinc-800 rounded-3xl px-8 py-5 text-xs font-black text-white uppercase tracking-widest italic focus:border-zinc-600 outline-none appearance-none cursor-pointer"
                                        >
                                          <option value="">— NO HANDLER ASSIGNED —</option>
                                          {trainers.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
                                        </select>
                                        <UserCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 pointer-events-none" />
                                      </div>
                                   </div>
                                   
                                   <div className="flex-1 space-y-4">
                                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-4 italic">Operational Overlay (Notes)</p>
                                      {editingNotesId === assessment.id ? (
                                        <div className="space-y-4">
                                          <textarea
                                            value={notesText}
                                            onChange={e => setNotesText(e.target.value)}
                                            rows={3}
                                            placeholder="ENTER OVERLAY OVERRIDE..."
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] px-8 py-6 text-xs text-white font-black uppercase tracking-widest outline-none focus:border-orange-500/50 resize-none transition italic placeholder:text-zinc-800"
                                          />
                                          <div className="flex gap-4">
                                            <button onClick={() => handleSaveNotes(assessment.id)} disabled={savingNotes} className="bg-orange-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-orange-400 transition-all">
                                              {savingNotes ? "Syncing..." : "Update Feedback"}
                                            </button>
                                            <button onClick={() => setEditingNotesId(null)} className="bg-zinc-900 text-zinc-600 border border-zinc-800 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:text-white transition-all">Abort Override</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div
                                          onClick={() => { setEditingNotesId(assessment.id); setNotesText(assessment.trainerNotes ?? ""); }}
                                          className="group/note min-h-[80px] bg-zinc-950 border border-dashed border-zinc-800 rounded-[2rem] px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic flex items-center gap-6 cursor-pointer hover:border-zinc-600 transition-all"
                                        >
                                          <Pencil className="w-5 h-5 text-zinc-800 group-hover/note:text-orange-500 transition-colors shrink-0" />
                                          {assessment.trainerNotes || "INITIALIZE OVERLAY DATA..."}
                                        </div>
                                      )}
                                   </div>
                                </div>
                             </div>

                             {/* Induction Protocols (Scheduling) */}
                             <div className="pt-10 border-t border-zinc-800/50">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic mb-8">Induction Protocol (Scheduling)</p>
                                
                                {scheduledSession ? (
                                   <div className="bg-zinc-900 border border-orange-500/20 bg-orange-500/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group/sess">
                                      <div className="flex items-center gap-8">
                                         <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-xl shadow-orange-950/20">
                                            <Calendar size={28} />
                                         </div>
                                         <div>
                                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{scheduledSession.title}</h4>
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] italic flex items-center gap-3">
                                               Scheduled: {new Date(scheduledSession.scheduledDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                               {" · "}{scheduledSession.scheduledTime} · {scheduledSession.duration}m
                                            </p>
                                         </div>
                                      </div>
                                      {!isSchedulingThis && (
                                         <button 
                                           onClick={() => openSchedule(assessment, scheduledSession)}
                                           className="bg-zinc-950 border border-zinc-800 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-zinc-500 hover:text-white hover:border-white transition-all flex items-center gap-3"
                                         >
                                            <RefreshCw size={14} /> Adjust Schedule
                                         </button>
                                      )}
                                   </div>
                                ) : !isSchedulingThis && (
                                   <button 
                                     onClick={() => openSchedule(assessment)}
                                     className="w-full bg-zinc-900/50 border border-dashed border-zinc-800 py-12 rounded-[2.5rem] flex flex-col items-center justify-center group hover:border-blue-500/50 transition-all"
                                   >
                                      <Calendar className="w-10 h-10 text-zinc-800 group-hover:text-blue-500 transition-all mb-4" />
                                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic group-hover:text-white transition-colors">Initialize Induction Protocol</p>
                                   </button>
                                )}

                                {/* Schedule Form */}
                                {isSchedulingThis && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-zinc-900 border border-blue-500/20 rounded-[2.5rem] p-10 space-y-10"
                                  >
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-900/40">
                                            <Calendar size={24} />
                                          </div>
                                          <div>
                                             <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Induction Parameter Link</h4>
                                             <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic mt-1">Establishing temporal coordinates</p>
                                          </div>
                                       </div>
                                       <button onClick={closeSchedule} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-colors">
                                          <X size={20} />
                                       </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                       <div className="md:col-span-12">
                                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Protocol Identifier</label>
                                          <input 
                                             type="text" 
                                             value={scheduleForm.title}
                                             onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))}
                                             className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest outline-none focus:border-blue-500 transition-all italic"
                                          />
                                       </div>
                                       <div className="md:col-span-6">
                                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Deployment Date</label>
                                          <input 
                                             type="date" 
                                             value={scheduleForm.date}
                                             min={new Date().toISOString().split("T")[0]}
                                             onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                                             className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest outline-none focus:border-blue-500 transition-all italic"
                                          />
                                       </div>
                                       <div className="md:col-span-6">
                                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Deployment Span (Minutes)</label>
                                          <input 
                                             type="number" 
                                             value={scheduleForm.duration} 
                                             min="15" 
                                             step="15"
                                             onChange={e => setScheduleForm(f => ({ ...f, duration: e.target.value }))}
                                             className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest outline-none focus:border-blue-500 transition-all italic"
                                          />
                                       </div>
                                       <div className="md:col-span-12">
                                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Deployment Window (Time)</label>
                                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                             {TIME_SLOTS.map(slot => (
                                               <button 
                                                 key={slot} 
                                                 type="button"
                                                 onClick={() => setScheduleForm(f => ({ ...f, time: slot }))}
                                                 className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic border ${
                                                   scheduleForm.time === slot
                                                     ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                                                     : "bg-zinc-950 border-zinc-800 text-zinc-700 hover:text-white"
                                                 }`}
                                               >
                                                  {slot}
                                               </button>
                                             ))}
                                          </div>
                                       </div>
                                       <div className="md:col-span-12">
                                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">Dispatch Memo</label>
                                          <input 
                                             type="text" 
                                             value={scheduleForm.notes} 
                                             placeholder="Logistics memo..."
                                             onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
                                             className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest outline-none focus:border-blue-500 transition-all italic placeholder:text-zinc-900"
                                          />
                                       </div>
                                    </div>

                                    {sessionError && (
                                       <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">
                                          <Shield size={16} /> {sessionError}
                                       </div>
                                    )}

                                    <div className="flex gap-4">
                                       <button 
                                         onClick={() => handleSaveSession(assessment)} 
                                         disabled={savingSession}
                                         className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-4 italic shadow-2xl shadow-blue-900/20"
                                       >
                                          {savingSession ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                                          {rescheduleSessionId ? "Confirm Reschedule" : "Confirm Protocol"}
                                       </button>
                                       <button onClick={closeSchedule} className="bg-zinc-950 text-zinc-600 border border-zinc-800 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all italic">Discard Changes</button>
                                    </div>
                                  </motion.div>
                                )}
                             </div>

                             {/* Commander Final Control */}
                             <div className="pt-10 border-t border-zinc-800/50 flex flex-wrap gap-4 items-center">
                                {assessment.status === "pending" && (
                                  <button 
                                    onClick={() => handleMarkReviewed(assessment.id)}
                                    className="bg-zinc-100 text-zinc-950 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-4 italic"
                                  >
                                     <CheckCircle size={16} /> Mark Assay Validated
                                  </button>
                                )}
                                
                                {!isConverted && (
                                  <button 
                                    onClick={() => handleConvert(assessment.userId, assessment.id)}
                                    disabled={convertingId === assessment.userId}
                                    className="bg-orange-500 text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-400 transition-all flex items-center gap-4 italic shadow-2xl shadow-orange-900/20"
                                  >
                                     {convertingId === assessment.userId ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                     Initialize Sector Access
                                  </button>
                                )}

                                {isConverted && (
                                  <div className="px-10 py-5 bg-zinc-950 border border-emerald-500/20 text-emerald-500 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4">
                                     <UserCheck size={16} /> Asset Fully Converted
                                  </div>
                                )}

                                {assessment.reviewedAt && (
                                   <div className="ml-auto text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">
                                      VALIDATED BY CMD: {new Date(assessment.reviewedAt).toLocaleTimeString()} · {fmt(assessment.reviewedAt)}
                                   </div>
                                )}
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
