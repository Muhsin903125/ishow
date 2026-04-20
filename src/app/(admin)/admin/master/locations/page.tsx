"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getLocations, upsertLocation, deleteLocation, type Location } from "@/lib/db/master";
import { ArrowLeft, MapPin, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Form = { id?: string; name: string; city: string; sortOrder: string };

function blankForm(): Form { return { name: "", city: "", sortOrder: "0" }; }
function fromLocation(l: Location): Form {
  return { id: l.id, name: l.name, city: l.city ?? "", sortOrder: String(l.sortOrder) };
}

export default function LocationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => setLocations(await getLocations(false));

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    const init = async () => {
      if (!loading && user) {
        if (user.role === 'customer') { router.push('/dashboard'); return; }
        await loadData();
      }
    };
    init();
  }, [loading, router, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) return null;

  const visible = showAll ? locations : locations.filter((l) => l.isActive);
  const role = user.role === "admin" ? "admin" : "trainer";

  function startEdit(l: Location) { setForm(fromLocation(l)); setEditing(true); setError(""); setSuccess(""); }
  function cancelEdit() { setForm(blankForm()); setEditing(false); setError(""); }
  function update(field: keyof Form, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    await upsertLocation({
      id: form.id,
      name: form.name.trim(),
      city: form.city.trim() || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: true,
    });
    setSuccess(form.id ? "Location updated." : "Location added.");
    cancelEdit();
    await loadData();
  }

  async function handleToggle(l: Location) {
    await upsertLocation({ ...l, isActive: !l.isActive });
    await loadData();
  }

  async function handleDelete(l: Location) {
    if (!window.confirm(`Delete "${l.name}"?`)) return;
    await deleteLocation(l.id);
    await loadData();
  }

  return (
    <DashboardLayout role={role}>
      <div className="w-full max-w-3xl p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href={role === "admin" ? "/admin/master" : "/trainer/master"} className="text-sm text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Locations</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Manage training venue options for the assessment form.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900">{editing ? "Edit Location" : "Add Location"}</h2>
            {editing && <button type="button" onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
              Name *
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Dubai Sports City Gym" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              City
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Dubai" className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
          </div>

          <label className="mt-4 block text-sm font-semibold text-gray-700 max-w-[160px]">
            Sort Order
            <input type="number" min="0" value={form.sortOrder} onChange={(e) => update("sortOrder", e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
          </label>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm font-medium text-green-600">{success}</p>}

          <div className="mt-4 flex gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800">
              <Save className="w-4 h-4" /> {editing ? "Save Changes" : "Add Location"}
            </button>
            {editing && <button type="button" onClick={cancelEdit} className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>}
          </div>
        </form>

        <div className="mb-4 flex justify-end">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="rounded" />
            Show inactive
          </label>
        </div>

        <div className="space-y-2">
          {visible.length === 0 && <p className="text-gray-400 text-center py-8">No locations yet.</p>}
          {visible.map((l) => (
            <div key={l.id} className={`rounded-2xl border ${l.isActive ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200 opacity-60"} p-4 flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{l.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.city ?? "—"} · Sort {l.sortOrder}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(l)} className={`text-xs font-bold px-3 py-1.5 rounded-full ${l.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                  {l.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => startEdit(l)} className="p-2 text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(l)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
