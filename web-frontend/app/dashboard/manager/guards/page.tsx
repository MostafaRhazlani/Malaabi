"use client";

import { useEffect, useState } from "react";
import { RiGroupLine, RiAddLine, RiBuilding2Line, RiDeleteBinLine, RiAlertLine } from "@remixicon/react";
import { toast } from "sonner";
import { ManagerService, CreateGuardPayload } from "@/services/manager/apis";
import type { ManagerGuard, ManagerStadium } from "@/interfaces/manager.interface";
import Dropdown from "@/components/ui/Dropdown";

const emptyForm: CreateGuardPayload = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function ManagerGuardsPage() {
  const [guards, setGuards] = useState<ManagerGuard[]>([]);
  const [stadiums, setStadiums] = useState<ManagerStadium[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateGuardPayload>(emptyForm);
  const [creating, setCreating] = useState(false);

  const [assigning, setAssigning] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagerGuard | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([ManagerService.getGuards(), ManagerService.getStadiums()])
      .then(([g, s]) => { setGuards(g); setStadiums(s); })
      .catch(() => toast.error("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const guard = await ManagerService.createGuard(form);
      setGuards((prev) => [{ ...guard, assignedStadium: null }, ...prev]);
      setShowCreate(false);
      setForm(emptyForm);
      toast.success("Guard created successfully");
    } catch {
      toast.error("Failed to create guard.");
    } finally {
      setCreating(false);
    }
  }

  async function handleAssign(guardId: string, stadiumId: string | null) {
    setAssigning(guardId);
    try {
      await ManagerService.assignGuard(guardId, { stadiumId });
      setGuards((prev) =>
        prev.map((g) => {
          if (g.id !== guardId) return g;
          const stadium = stadiums.find((s) => s.id === stadiumId) ?? null;
          return {
            ...g,
            assignedStadium: stadium
              ? { id: stadium.id, name: stadium.name, city: stadium.city }
              : null,
          };
        })
      );
    } catch {
      toast.error("Failed to assign guard.");
    } finally {
      setAssigning(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ManagerService.deleteGuard(deleteTarget.id);
      setGuards((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      toast.success("Guard deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete guard.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Guards</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your stadium security staff</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          Add Guard
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : guards.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-slate-500">
          <RiGroupLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No guards yet. Add your first one!</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-visible">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-white/10">
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Assigned Stadium</th>
                <th className="text-left px-6 py-3 font-medium">Assign To</th>
                <th className="text-left px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guards.map((guard) => (
                <tr key={guard.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-white font-medium">
                    {guard.first_name} {guard.last_name}
                  </td>
                  <td className="px-6 py-3 text-slate-400">{guard.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        guard.status === "ACTIVE"
                          ? "text-green-400 bg-green-500/10"
                          : "text-red-400 bg-red-500/10"
                      }`}
                    >
                      {guard.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400">
                    {guard.assignedStadium ? (
                      <span className="flex items-center gap-1.5">
                        <RiBuilding2Line className="w-3.5 h-3.5 text-blue-400" />
                        {guard.assignedStadium.name}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {assigning === guard.id ? (
                      <span className="text-xs text-slate-500">Assigning…</span>
                    ) : (
                      <Dropdown
                        options={[
                          { label: "Unassigned", value: "" },
                          ...stadiums.map((s) => ({ label: s.name, value: s.id })),
                        ]}
                        value={guard.assignedStadium?.id ?? ""}
                        onChange={(val) => handleAssign(guard.id, val || null)}
                      />
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => setDeleteTarget(guard)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete guard"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Guard Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-white mb-4">Add Guard</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">First Name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  placeholder="guard@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setForm(emptyForm); }}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? "Creating…" : "Add Guard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guard Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <RiAlertLine className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Delete Guard</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">
                    {deleteTarget.first_name} {deleteTarget.last_name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
