"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getItems, addItem } from "@/lib/storage";
import type { Assessment } from "@/lib/mockData";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";

const steps = [
  { id: 1, title: "Personal Info", subtitle: "Basic measurements" },
  { id: 2, title: "Fitness Goals", subtitle: "What you want to achieve" },
  { id: 3, title: "Current Status", subtitle: "Your fitness background" },
  { id: 4, title: "Availability", subtitle: "Schedule preferences" },
];

const fitnessGoals = [
  "Weight Loss",
  "Muscle Gain",
  "Improved Endurance",
  "Strength Training",
  "Athletic Performance",
  "General Fitness",
  "Rehabilitation",
  "Flexibility & Mobility",
];

const fitnessLevels = ["Beginner", "Intermediate", "Advanced", "Athlete"];

const availabilityOptions = [
  "Weekday Mornings",
  "Weekday Afternoons",
  "Weekday Evenings",
  "Weekends Only",
  "Flexible",
  "3x per week",
  "5x per week",
];

export default function AssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    currentFitnessLevel: "",
    healthConditions: "",
    availability: "",
    experience: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user) {
      const assessments = getItems<Assessment>("ishow_assessments");
      const existing = assessments.find((a) => a.userId === user.id);
      if (existing) {
        router.push("/dashboard");
      } else {
        setCheckingExisting(false);
      }
    }
  }, [authLoading, user, router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.weight && formData.height;
      case 2:
        return formData.fitnessGoal;
      case 3:
        return formData.currentFitnessLevel && formData.experience;
      case 4:
        return formData.availability;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newAssessment: Assessment = {
        id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user!.id,
        age: parseInt(formData.age),
        weight: formData.weight,
        height: formData.height,
        gender: "",
        goals: [formData.fitnessGoal],
        experienceLevel: formData.currentFitnessLevel,
        healthConditions: formData.healthConditions,
        daysPerWeek: 3,
        preferredTimes: formData.availability,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      addItem("ishow_assessments", newAssessment);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting || authLoading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Fitness Assessment</h1>
              <p className="text-gray-500 text-sm">Help us understand your fitness needs</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > step.id
                  ? "bg-green-500 text-white"
                  : currentStep === step.id
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all ${currentStep > step.id ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="font-bold text-gray-900 text-lg">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-500 text-sm">{steps[currentStep - 1].subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="e.g., 28"
                  min="13"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="e.g., 165"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Height (inches)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="e.g., 68"
                />
              </div>
            </div>
          )}

          {/* Step 2: Fitness Goals */}
          {currentStep === 2 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Select your primary fitness goal:</p>
              <div className="grid grid-cols-2 gap-3">
                {fitnessGoals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleChange("fitnessGoal", goal)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      formData.fitnessGoal === goal
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {formData.fitnessGoal === goal && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Current Status */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Current Fitness Level</p>
                <div className="grid grid-cols-2 gap-3">
                  {fitnessLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleChange("currentFitnessLevel", level)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.currentFitnessLevel === level
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Exercise Experience
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 resize-none"
                  rows={3}
                  placeholder="Describe your exercise history, any sports played, gym experience..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Health Conditions <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={formData.healthConditions}
                  onChange={(e) => handleChange("healthConditions", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 resize-none"
                  rows={2}
                  placeholder="Any injuries, medical conditions, or physical limitations..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">When are you available to train?</p>
              <div className="grid grid-cols-2 gap-3">
                {availabilityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("availability", option)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      formData.availability === option
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {formData.availability === option && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Assessment
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </DashboardLayout>
  );
}
