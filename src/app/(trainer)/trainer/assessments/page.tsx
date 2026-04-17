"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listAssessments, reviewAssessment, type Assessment } from "@/lib/db/assessments";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Clock, ChevronDown, ChevronUp, CalendarDays, MapPin, Phone, Mail } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

type Filter = "all" | "pending" | "reviewed";

export default function TrainerAssessmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const loadData = async () => {
    const [a, c] = await Promise.all([listAssessments(), listCustomers()]);
    setAssessments(a);
    setCustomers(c);
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        if (user.role === 'admin') { router.push('/admin/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

  const pending = assessments.filter((a) => a.status === "pending").length;
  const reviewed = assessments.filter((a) => a.status === "reviewed").length;
  const filtered = filter === "all" ? assessments : assessments.filter((a) => a.status === filter);

  function clientName(userId: string) {
    return customers.find((c) => c.id === userId)?.name ?? "Unknown";
  }

  function clientInfo(userId: string) {
    return customers.find((c) => c.id === userId) ?? null;
  }

  async function markReviewed(id: string) {
    await reviewAssessment(id, notesText || '', 'reviewed');
    setEditingNotes(null);
    await loadData();
  }

  async function saveNotes(id: string) {
    const supabase = createClient();
    await supabase.from('assessments').update({ trainer_notes: notesText }).eq('id', id);
    setEditingNotes(null);
    await loadData();
  }

  return (
    <DashboardLayout role="TRAINER">
      <div className="w-full max-w-4xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Assessments</h1>
          <p className="text-gray-500 mt-1">Review client assessments and add trainer notes.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-gray-900">{assessments.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </div>
          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-orange-600">{pending}</p>
            <p className="text-xs text-orange-400 mt-0.5">Pending</p>
          </div>
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-black text-green-600">{reviewed}</p>
            <p className="text-xs text-green-500 mt-0.5">Reviewed</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "reviewed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors capitalize ${
                filter === f
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="text-gray-400 text-center py-10">No assessments to show.</p>
          )}

          {filtered.map((assessment) => {
            const expanded = expandedId === assessment.id;
            return (
              <div key={assessment.id} className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Row header — click to expand */}
                <button
                  onClick={() => setExpandedId(expanded ? null : assessment.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {clientName(assessment.userId).charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{clientName(assessment.userId)}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400">Submitted {formatDate(assessment.submittedAt)}</p>
                        {assessment.preferredDate && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(assessment.preferredDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {assessment.preferredTimeSlot && ` · ${assessment.preferredTimeSlot}`}
                          </span>
                        )}
                        {assessment.preferredLocation && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {assessment.preferredLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      assessment.status === "pending"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {assessment.status === "pending"
                        ? <Clock className="w-3 h-3" />
                        : <CheckCircle className="w-3 h-3" />}
                      {assessment.status === "pending" ? "Pending" : "Reviewed"}
                    </span>
                    {expanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5">

                    {/* Appointment + Contact highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Appointment */}
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Appointment Details</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-medium">
                              {assessment.preferredDate
                                ? new Date(assessment.preferredDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                                : <span className="text-gray-400">No date selected</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {assessment.preferredTimeSlot || <span className="text-gray-400">No time selected</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {assessment.preferredLocation || <span className="text-gray-400">No location selected</span>}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Client contact */}
                      {(() => {
                        const client = clientInfo(assessment.userId);
                        return (
                          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Client Contact</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{client?.email ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{client?.phone ?? "—"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Age", value: `${assessment.age} yrs` },
                        { label: "Gender", value: assessment.gender },
                        { label: "Weight", value: assessment.weight },
                        { label: "Height", value: assessment.height },
                        { label: "Experience", value: assessment.experienceLevel.replace("_", " ") },
                        { label: "Days / week", value: `${assessment.daysPerWeek} days` },
                        { label: "Preferred time", value: assessment.preferredTimes },
                        { label: "Health conditions", value: assessment.healthConditions || "None" },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Goals */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">Goals</p>
                      <div className="flex flex-wrap gap-2">
                        {assessment.goals.map((g) => (
                          <span key={g} className="rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 capitalize">
                            {g.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Trainer notes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">Trainer Notes</p>
                      {editingNotes === assessment.id ? (
                        <div>
                          <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            rows={3}
                            placeholder="Add notes for this client..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveNotes(assessment.id)}
                              className="text-xs text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg font-semibold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotes(assessment.id);
                            setNotesText(assessment.trainerNotes ?? "");
                          }}
                          className="min-h-[48px] rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 cursor-pointer hover:border-blue-400 hover:text-gray-700 transition-colors"
                        >
                          {assessment.trainerNotes || "Click to add notes..."}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {assessment.status === "pending" ? (
                      <button
                        onClick={() => markReviewed(assessment.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Reviewed
                      </button>
                    ) : (
                      assessment.reviewedAt && (
                        <p className="text-xs text-green-600 font-medium">
                          ✓ Reviewed on {formatDate(assessment.reviewedAt)}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
