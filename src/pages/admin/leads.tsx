"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadDraft,
  type LeadStatus,
} from "@/lib/leads";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  CheckCircle2,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react";

type LeadsPayload = {
  ok: true;
  leads: Lead[];
  summary: Record<string, number>;
};

type LeadPayload = { ok: true; lead: Lead } | { error: string };

const EMPTY_FORM: LeadDraft = {
  name: "",
  email: null,
  phone: null,
  source: null,
  status: "new",
  notes: null,
};

const STATUS_BADGE_CLASS: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-amber-100 text-amber-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700",
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFormState(lead: Lead): LeadDraft {
  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    notes: lead.notes,
  };
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export default function AdminLeadsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  });
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [form, setForm] = useState<LeadDraft>(EMPTY_FORM);

  const loadLeads = async () => {
    setFetching(true);

    try {
      const response = await fetch("/api/admin/leads");
      const payload = await readJson<LeadsPayload | { error: string }>(response);

      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to load leads.");
      }

      setLeads(payload.leads);
      setSummary(payload.summary);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load leads.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/trainer/dashboard");
      return;
    }

    queueMicrotask(() => {
      void loadLeads();
    });
  }, [loading, router, user]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter = statusFilter === "all" || lead.status === statusFilter;
      const haystack = [
        lead.name,
        lead.email ?? "",
        lead.phone ?? "",
        lead.source ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesFilter && haystack.includes(searchQuery.toLowerCase());
    });
  }, [leads, searchQuery, statusFilter]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `/api/admin/leads/${editingId}` : "/api/admin/leads",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lead: form }),
        }
      );

      const payload = await readJson<LeadPayload>(response);

      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to save lead.");
      }

      toast.success(editingId ? "Lead updated." : "Lead created.");
      resetForm();
      await loadLeads();
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    setRowBusyId(leadId);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead: { status } }),
      });

      const payload = await readJson<LeadPayload>(response);
      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to update lead status.");
      }

      setLeads((current) => current.map((lead) => (lead.id === payload.lead.id ? payload.lead : lead)));
      toast.success("Lead status updated.");
      await loadLeads();
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update lead status.");
    } finally {
      setRowBusyId(null);
    }
  };

  const handleDelete = async (leadId: string) => {
    const confirmed = window.confirm("Delete this lead? This action cannot be undone.");
    if (!confirmed) return;

    setRowBusyId(leadId);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });

      const payload = await readJson<{ ok?: true; error?: string }>(response);
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to delete lead.");
      }

      toast.success("Lead deleted.");
      if (editingId === leadId) resetForm();
      await loadLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete lead.");
    } finally {
      setRowBusyId(null);
    }
  };

  const handleConvert = async (leadId: string) => {
    setRowBusyId(leadId);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
      });

      const payload = await readJson<
        | {
            ok: true;
            lead: Lead;
            profile: { name: string };
          }
        | { error: string }
      >(response);

      if (!response.ok || !("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to convert lead.");
      }

      toast.success(`Lead converted and ${payload.profile.name} is now marked as a client.`);
      await loadLeads();
    } catch (error) {
      console.error("Error converting lead:", error);
      toast.error(error instanceof Error ? error.message : "Failed to convert lead.");
    } finally {
      setRowBusyId(null);
    }
  };

  if (loading || fetching || !user) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen bg-muted/20 p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="h-24 rounded-[2rem] bg-white" />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-32 rounded-[1.75rem] bg-white" />
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
              <div className="h-[520px] rounded-[1.75rem] bg-white" />
              <div className="h-[520px] rounded-[1.75rem] bg-white" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-muted/20 p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_58%,#f8fafc_100%)] p-6 shadow-[0_24px_60px_rgba(16,185,129,0.08)] md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Lead management
                </Badge>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                    Capture, qualify, and convert inbound leads
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                    Admins can manage the full lead pipeline here. Conversion promotes an existing
                    customer account into a client when the lead email matches a customer profile.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Total leads", value: summary.total, icon: Users },
                  { label: "New", value: summary.new, icon: Plus },
                  { label: "Qualified", value: summary.qualified, icon: CheckCircle2 },
                  { label: "Converted", value: summary.converted, icon: UserRoundPlus },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {label}
                      </p>
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-950">{value ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
            <Card className="rounded-[1.75rem] border border-border/80 bg-white/95 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle>{editingId ? "Edit lead" : "Create lead"}</CardTitle>
                <CardDescription>
                  Store contact details, pipeline status, and follow-up notes from the admin portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Lead name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </label>
                  <Input
                    value={form.email ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value || null }))
                    }
                    placeholder="name@example.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Phone
                  </label>
                  <Input
                    value={form.phone ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value || null }))
                    }
                    placeholder="+971 ..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Source
                  </label>
                  <Input
                    value={form.source ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, source: event.target.value || null }))
                    }
                    placeholder="Google, Instagram, referral..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as LeadStatus,
                      }))
                    }
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none"
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {LEAD_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Notes
                  </label>
                  <Textarea
                    value={form.notes ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value || null }))
                    }
                    placeholder="Context, objections, next follow-up..."
                    className="min-h-32"
                  />
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
                  Conversion only works when this lead email already belongs to a customer account in
                  `profiles`. If there is no matching account yet, the API will stop the conversion and
                  tell the admin what is missing.
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {editingId ? "Save lead" : "Create lead"}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="rounded-xl">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border border-border/80 bg-white/95 shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Lead pipeline</CardTitle>
                    <CardDescription>
                      Update statuses inline, refine details, and convert matched accounts into clients.
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search leads"
                        className="w-full pl-9 sm:w-64"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value as LeadStatus | "all")
                        }
                        className="flex h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-xs outline-none sm:w-48"
                      >
                        <option value="all">All statuses</option>
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {LEAD_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLeads.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                    <Users className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                    <p className="text-lg font-semibold text-slate-900">No leads found</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Try a different filter or add your first lead from the form.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Matched account</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => {
                        const convertingBlocked = !lead.profileMatch || lead.status === "converted";
                        return (
                          <TableRow key={lead.id}>
                            <TableCell className="align-top">
                              <div className="space-y-1">
                                <p className="font-semibold text-slate-950">{lead.name}</p>
                                {lead.notes ? (
                                  <p className="max-w-xs whitespace-normal text-xs text-slate-500">
                                    {lead.notes}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-400">No notes yet.</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="space-y-1 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{lead.email ?? "No email"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{lead.phone ?? "No phone"}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="align-top text-sm text-slate-600">
                              {lead.source ?? "Direct"}
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="space-y-2">
                                <Badge className={STATUS_BADGE_CLASS[lead.status]}>
                                  {LEAD_STATUS_LABELS[lead.status]}
                                </Badge>
                                <select
                                  value={lead.status}
                                  onChange={(event) =>
                                    handleStatusChange(lead.id, event.target.value as LeadStatus)
                                  }
                                  disabled={rowBusyId === lead.id}
                                  className="flex h-9 w-36 rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none"
                                >
                                  {LEAD_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {LEAD_STATUS_LABELS[status]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              {lead.profileMatch ? (
                                <div className="space-y-1">
                                  <p className="font-medium text-slate-950">{lead.profileMatch.name}</p>
                                  <p className="text-xs text-slate-500">{lead.profileMatch.email}</p>
                                  <Badge
                                    className={
                                      lead.profileMatch.customerStatus === "client"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-700"
                                    }
                                  >
                                    {lead.profileMatch.customerStatus === "client"
                                      ? "Already client"
                                      : "Customer account found"}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-slate-500">No matching account</p>
                                  <p className="max-w-44 whitespace-normal text-xs text-slate-400">
                                    Conversion will unlock after the customer signs up with the same email.
                                  </p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="align-top text-sm text-slate-600">
                              <div>{formatDate(lead.createdAt)}</div>
                              <div className="text-xs text-slate-400">
                                Converted: {formatDate(lead.convertedAt)}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => {
                                    setEditingId(lead.id);
                                    setForm(toFormState(lead));
                                  }}
                                  disabled={rowBusyId === lead.id}
                                >
                                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                  onClick={() => handleConvert(lead.id)}
                                  disabled={convertingBlocked || rowBusyId === lead.id}
                                  title={
                                    convertingBlocked
                                      ? "Matching customer account required before conversion."
                                      : "Convert to client"
                                  }
                                >
                                  <UserRoundPlus className="mr-2 h-4 w-4" />
                                  Convert
                                </Button>
                                <Button
                                  variant="outline"
                                  className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                  onClick={() => handleDelete(lead.id)}
                                  disabled={rowBusyId === lead.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
