import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
  Mail,
  Phone,
  Target,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomers, type Profile } from "@/lib/db/profiles";
import { listAssessments, reviewAssessment, type Assessment } from "@/lib/db/assessments";
import { getPlan, type Plan } from "@/lib/db/plans";
import { listSessions, type TrainingSession } from "@/lib/db/sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TrainerClientDetailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const clientId = typeof router.query.id === "string" ? router.query.id : "";

  const [client, setClient] = useState<Profile | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [reviewing, setReviewing] = useState(false);

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
        const [customers, assessments, activePlan, clientSessions] = await Promise.all([
          listCustomers(),
          listAssessments(),
          getPlan(clientId),
          listSessions({ userId: clientId }),
        ]);

        const matchedClient = customers.find((item) => item.id === clientId) ?? null;
        const matchedAssessment = assessments.find((item) => item.userId === clientId) ?? null;

        setClient(matchedClient);
        setAssessment(matchedAssessment);
        setPlan(activePlan);
        setSessions(
          clientSessions.sort((a, b) => {
            const left = `${a.scheduledDate}T${a.scheduledTime}`;
            const right = `${b.scheduledDate}T${b.scheduledTime}`;
            return right.localeCompare(left);
          })
        );
      } catch (error) {
        console.error("Failed to load client detail:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    loadData();
  }, [clientId, loading, router, router.isReady, user]);

  const handleReviewAssessment = async () => {
    if (!assessment || !user) return;

    setReviewing(true);
    const reviewed = await reviewAssessment(
      assessment.id,
      assessment.trainerNotes ?? "Assessment reviewed by trainer.",
      "reviewed",
      user.id
    );
    if (reviewed) {
      setAssessment(reviewed);
    }
    setReviewing(false);
  };

  if (loading || !dataLoaded) {
    return (
      <DashboardLayout role="trainer">
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm text-muted-foreground font-medium">Loading client record...</p>
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
              <p className="text-sm text-muted-foreground">That client record no longer exists or you don&apos;t have access to it.</p>
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
        <div className="max-w-6xl mx-auto space-y-6">
          <Link href="/trainer/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to clients
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                    <p className="text-sm text-muted-foreground">Trainer-side client profile and operational history.</p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{client.email ?? "No email available"}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline">{client.customerStatus ?? "request"}</Badge>
                  <Button asChild>
                    <Link href={`/trainer/clients/${client.id}/assign-plan`}>
                      {plan ? "Update Plan" : "Assign Plan"}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                  Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-semibold capitalize">{assessment.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-semibold">{formatDate(assessment.submittedAt.slice(0, 10))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goals</p>
                        <p className="font-semibold">{assessment.goals.join(", ") || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-semibold">{assessment.experienceLevel ?? "Not specified"}</p>
                      </div>
                    </div>
                    {assessment.healthConditions && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Health notes</p>
                        <p className="text-sm font-medium">{assessment.healthConditions}</p>
                      </div>
                    )}
                    {assessment.status === "pending" && (
                      <Button onClick={handleReviewAssessment} disabled={reviewing}>
                        {reviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Mark as reviewed
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No assessment has been submitted yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Active Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan ? (
                  <>
                    <div>
                      <p className="text-xl font-semibold">{plan.name}</p>
                      {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-semibold capitalize">{plan.paymentFrequency}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly rate</p>
                        <p className="font-semibold">{plan.monthlyRate ? `AED ${plan.monthlyRate}` : "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start date</p>
                        <p className="font-semibold">{plan.startDate ? formatDate(plan.startDate) : "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">{plan.duration ?? "Not set"}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No plan has been assigned yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.scheduledDate)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.scheduledTime}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize w-fit">{session.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
