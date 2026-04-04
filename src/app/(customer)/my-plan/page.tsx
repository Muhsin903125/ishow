"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getItems } from "@/lib/storage";
import type { Assessment, Plan } from "@/lib/mockData";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  Target,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function MyPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user) {
      if (user.role !== "customer") {
        router.push("/trainer/dashboard");
        return;
      }
      const plans = getItems<Plan>("ishow_plans");
      setPlan(plans.find((p) => p.userId === user.id && p.status === "active") ?? null);

      const assessments = getItems<Assessment>("ishow_assessments");
      setAssessment(assessments.find((a) => a.userId === user.id) ?? null);
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="w-full max-w-4xl p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">My Training Plan</h1>
          <p className="text-gray-500 mt-1">Your personalized fitness program</p>
        </div>

        {plan ? (
          <div className="space-y-6">
            {/* Plan Hero Card */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Active Plan
                  </div>
                  <h2 className="text-3xl font-black mb-2">{plan.name}</h2>
                  {plan.description && (
                    <p className="text-blue-200 leading-relaxed max-w-xl">{plan.description}</p>
                  )}
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur">
                  <p className="text-blue-200 text-sm">Monthly Rate</p>
                  <p className="text-3xl font-black">AED {plan.monthlyRate}</p>
                  <p className="text-blue-300 text-xs capitalize">{plan.paymentFrequency} billing</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Goals */}
              {plan.goals && plan.goals.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Training Goals</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{plan.goals.join(", ")}</p>
                </div>
              )}

              {/* Trainer Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">Your Trainer</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
                    {plan.trainerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{plan.trainerName}</p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Plan Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(plan.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-sm font-semibold">
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Billing</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {plan.paymentFrequency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Pricing</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Monthly Rate</span>
                    <span className="text-xl font-black text-gray-900">AED {plan.monthlyRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Payment Frequency</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {plan.paymentFrequency}
                    </span>
                  </div>
                  {plan.paymentFrequency === "weekly" && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Weekly Rate</span>
                      <span className="font-medium text-gray-900">
                        AED {(plan.monthlyRate / 4.33).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href="/payments"
                  className="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg text-purple-700 font-medium text-sm hover:bg-purple-100 transition-colors"
                >
                  View Payment History
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sessions"
                  className="flex items-center gap-2 bg-white border border-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  View Sessions
                </Link>
                <Link
                  href="/programs"
                  className="flex items-center gap-2 bg-white border border-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  View Programs
                </Link>
                <Link
                  href="/payments"
                  className="flex items-center gap-2 bg-white border border-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Payment History
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            {!assessment ? (
              <>
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Plan Yet</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start by completing your fitness assessment. Your trainer will then create a personalized plan for you.
                </p>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Coming Soon</h2>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Your assessment has been submitted. Your trainer is reviewing it and will assign your personalized plan soon.
                </p>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Assessment submitted — awaiting review
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
