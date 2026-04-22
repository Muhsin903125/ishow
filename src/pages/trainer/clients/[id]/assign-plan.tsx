import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, CheckCircle, Loader2, Target } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomers, updateProfile, type Profile } from "@/lib/db/profiles";
import { createPlan, getPlan, updatePlan, type Plan } from "@/lib/db/plans";
import { getPlanTemplates, type PlanTemplate } from "@/lib/db/master";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PlanFormState = {
  templateId: string;
  name: string;
  description: string;
  monthlyRate: string;
  paymentFrequency: "weekly" | "monthly";
  goals: string;
  startDate: string;
  duration: string;
};

function buildInitialForm(existingPlan: Plan | null): PlanFormState {
  return {
    templateId: existingPlan?.templateId ?? "",
    name: existingPlan?.name ?? "",
    description: existingPlan?.description ?? "",
    monthlyRate: existingPlan?.monthlyRate ? String(existingPlan.monthlyRate) : "",
    paymentFrequency: existingPlan?.paymentFrequency ?? "monthly",
    goals: existingPlan?.goals.join(", ") ?? "",
    startDate: existingPlan?.startDate ?? new Date().toISOString().split("T")[0],
    duration: existingPlan?.duration ?? "3 months",
  };
}

export default function AssignPlanPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const clientId = typeof router.query.id === "string" ? router.query.id : "";

  const [client, setClient] = useState<Profile | null>(null);
  const [existingPlan, setExistingPlan] = useState<Plan | null>(null);
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [form, setForm] = useState<PlanFormState>(buildInitialForm(null));
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady || loading || !clientId) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "customer") {
      router.replace("/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        const [customers, currentPlan, availableTemplates] = await Promise.all([
          listCustomers(),
          getPlan(clientId),
          getPlanTemplates(),
        ]);

        const matchedClient = customers.find((item) => item.id === clientId) ?? null;
        setClient(matchedClient);
        setExistingPlan(currentPlan);
        setTemplates(availableTemplates);
        setForm(buildInitialForm(currentPlan));
      } catch (loadError) {
        console.error("Failed to load plan setup:", loadError);
      } finally {
        setDataLoaded(true);
      }
    };

    loadData();
  }, [clientId, loading, router, router.isReady, user]);

  const applyTemplate = (templateId: string) => {
    setForm((prev) => ({ ...prev, templateId }));

    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    setForm((prev) => ({
      ...prev,
      templateId,
      name: template.name,
      description: template.description ?? "",
      monthlyRate: template.monthlyRate ? String(template.monthlyRate) : prev.monthlyRate,
      paymentFrequency: template.paymentFrequency,
      goals: (template.goals ?? []).join(", "),
      duration: template.duration ?? prev.duration,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !client) return;

    if (!form.name.trim()) {
      setError("Plan name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const goals = form.goals
      .split(",")
      .map((goal) => goal.trim())
      .filter(Boolean);

    try {
      const savedPlan = existingPlan
        ? await updatePlan(existingPlan.id, {
            templateId: form.templateId || undefined,
            trainerId: user.id,
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
            paymentFrequency: form.paymentFrequency,
            goals,
            startDate: form.startDate,
            duration: form.duration,
            status: "active",
          })
        : await createPlan({
            userId: client.id,
            trainerId: user.id,
            templateId: form.templateId || undefined,
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
            paymentFrequency: form.paymentFrequency,
            goals,
            startDate: form.startDate,
            duration: form.duration,
            status: "active",
          });

      if (!savedPlan) {
        setError("We couldn't save this plan. Please try again.");
        setSaving(false);
        return;
      }

      await updateProfile(client.id, { customerStatus: "client" });
      setSaved(true);
      window.setTimeout(() => {
        router.push(`/trainer/clients/${client.id}`);
      }, 1200);
    } catch (saveError) {
      console.error("Failed to save plan:", saveError);
      setError("We couldn't save this plan. Please try again.");
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm text-muted-foreground font-medium">Loading plan setup...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout role="trainer">
        <div className="min-h-screen bg-muted/20 flex items-center justify-center px-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <h1 className="text-2xl font-bold">Client not found</h1>
              <Button asChild>
                <Link href="/trainer/clients">Back to clients</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="min-h-screen bg-muted/20 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link href={`/trainer/clients/${client.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to {client.name}
          </Link>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{existingPlan ? "Update Plan" : "Assign Plan"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure the active coaching plan for {client.name}.</p>
          </div>

          {saved ? (
            <Card>
              <CardContent className="pt-10 pb-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Plan saved</h2>
                <p className="text-sm text-muted-foreground">We&apos;re taking you back to the client profile now.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="templateId">Plan template</Label>
                      <select
                        id="templateId"
                        value={form.templateId}
                        onChange={(e) => applyTemplate(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                      >
                        <option value="">Start from scratch</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Plan name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Elite Performance Pack"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the coaching approach and expected outcomes."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRate">Monthly rate</Label>
                      <Input
                        id="monthlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.monthlyRate}
                        onChange={(e) => setForm((prev) => ({ ...prev, monthlyRate: e.target.value }))}
                        placeholder="1200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentFrequency">Payment frequency</Label>
                      <select
                        id="paymentFrequency"
                        value={form.paymentFrequency}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            paymentFrequency: e.target.value as "weekly" | "monthly",
                          }))
                        }
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={form.duration}
                        onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                        placeholder="3 months"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals</Label>
                    <Input
                      id="goals"
                      value={form.goals}
                      onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                      placeholder="Fat loss, strength, consistency"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple goals with commas.</p>
                  </div>

                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                      {existingPlan ? "Update Plan" : "Assign Plan"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push(`/trainer/clients/${client.id}`)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
