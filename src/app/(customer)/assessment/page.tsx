"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getItems, addItem } from "@/lib/storage";
import type { Assessment } from "@/lib/mockData";
import { Dumbbell, CheckCircle, Loader2, ClipboardList, Clock } from "lucide-react";

const daysMap: Record<string, number> = { "2-3": 2, "4-5": 4, "6-7": 6 };

export default function AssessmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState<Assessment | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [formData, setFormData] = useState({
    goal: "",
    experienceLevel: "",
    daysPerWeek: "",
    healthConditions: "",
    preferredTime: "",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "customer") { router.push("/trainer/dashboard"); return; }
      const assessments = getItems<Assessment>("ishow_assessments");
      const existing = assessments.find((a) => a.userId === user.id) ?? null;
      setExistingAssessment(existing);
      setDataLoaded(true);
    }
  }, [user, loading, router]);

  const canSubmit =
    formData.goal !== "" &&
    formData.experienceLevel !== "" &&
    formData.daysPerWeek !== "" &&
    formData.preferredTime !== "";

  const handleSubmit = () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);

    const newAssessment: Assessment = {
      id: `assessment_${Date.now()}`,
      userId: user.id,
      goals: [formData.goal],
      experienceLevel: formData.experienceLevel,
      healthConditions: formData.healthConditions || "None",
      daysPerWeek: daysMap[formData.daysPerWeek] ?? 3,
      preferredTimes: formData.preferredTime,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    addItem("ishow_assessments", newAssessment);
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Already has assessment — show status
  if (existingAssessment && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">iShow<span className="text-orange-400">Fitness</span></span>
          </Link>

          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            {existingAssessment.status === "reviewed" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Assessment Reviewed!</h2>
                <p className="text-gray-600 mb-6">
                  Your trainer has reviewed your assessment and created a personalized plan.
                </p>
                {existingAssessment.trainerNotes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Trainer&apos;s Notes:</p>
                    <p className="text-blue-700 text-sm italic">&ldquo;{existingAssessment.trainerNotes}&rdquo;</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-left mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">Goal</p>
                    <p className="text-sm text-gray-900 font-semibold mt-0.5 capitalize">
                      {existingAssessment.goals[0]?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">Experience</p>
                    <p className="text-sm text-gray-900 font-semibold mt-0.5 capitalize">
                      {existingAssessment.experienceLevel}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">Days / Week</p>
                    <p className="text-sm text-gray-900 font-semibold mt-0.5">
                      {existingAssessment.daysPerWeek} days
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">Training Time</p>
                    <p className="text-sm text-gray-900 font-semibold mt-0.5 capitalize">
                      {existingAssessment.preferredTimes}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Under Review</h2>
                <p className="text-gray-600 mb-4">
                  Your trainer is reviewing your assessment and will reach out with your personalized plan shortly.
                </p>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Status:</span> Pending Trainer Review
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Submitted on {new Date(existingAssessment.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
            <Link
              href="/dashboard"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-600 mb-2">
            Your trainer will review it and build your personalized plan.
          </p>
          <p className="text-sm text-gray-400">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  // Main form — onboarding style, no sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">iShow<span className="text-orange-400">Fitness</span></span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-green-400 text-sm font-medium">Account Created</span>
          </div>
          <div className="flex-1 h-0.5 bg-blue-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Assessment</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-slate-400 text-xs font-bold">3</span>
            </div>
            <span className="text-slate-400 text-sm">Get Plan</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-7">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Quick Fitness Assessment</h1>
            <p className="text-gray-500 text-sm mt-1">Takes 2 minutes — helps your trainer build your plan</p>
          </div>

          {/* Q1: Goal */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">What is your primary goal?</p>
            <div className="space-y-2">
              {[
                { value: "weight_loss", label: "Weight Loss" },
                { value: "muscle_gain", label: "Muscle Gain" },
                { value: "general_fitness", label: "General Fitness" },
                { value: "athletic_performance", label: "Athletic Performance" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, goal: opt.value }))}
                  className={`w-full p-3.5 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-3 ${
                    formData.goal === opt.value
                      ? "border-blue-700 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    formData.goal === opt.value ? "border-blue-700" : "border-gray-300"
                  }`}>
                    {formData.goal === opt.value && <div className="w-2 h-2 rounded-full bg-blue-700" />}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Experience */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">What is your current experience level?</p>
            <div className="grid grid-cols-3 gap-3">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, experienceLevel: level }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                    formData.experienceLevel === level
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Days per week */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">How many days per week can you train?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "2-3", label: "2–3 days" },
                { value: "4-5", label: "4–5 days" },
                { value: "6-7", label: "6–7 days" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, daysPerWeek: opt.value }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                    formData.daysPerWeek === opt.value
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q4: Preferred time */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">When do you prefer to train?</p>
            <div className="grid grid-cols-3 gap-3">
              {["morning", "afternoon", "evening"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, preferredTime: time }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                    formData.preferredTime === time
                      ? "border-blue-700 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Q5: Health conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Any injuries or health conditions?{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.healthConditions}
              onChange={(e) => setFormData((p) => ({ ...p, healthConditions: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 resize-none text-sm"
              rows={2}
              placeholder="e.g. lower back pain, knee injury — or leave blank"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-base hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Assessment
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            You can always update your details when you meet your trainer in person.
          </p>
        </div>
      </div>
    </div>
  );
}
