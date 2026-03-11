"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UpdatePricesPayload } from "@/services/manager/apis";
import type { ManagerStadium } from "@/interfaces/manager.interface";

interface Props {
  stadium: ManagerStadium;
  onSave: (stadium: ManagerStadium, payload: UpdatePricesPayload) => Promise<void>;
  onClose: () => void;
}

export default function EditPricesModal({ stadium, onSave, onClose }: Props) {
  const [form, setForm] = useState<UpdatePricesPayload>({
    priceFullMatch: stadium.priceFullMatch,
    priceHalfMatch: stadium.priceHalfMatch,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(stadium, form);
      onClose();
    } catch {
      toast.error("Failed to update prices");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-white mb-1">Edit Prices</h2>
        <p className="text-slate-400 text-sm mb-4">{stadium.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Full Match Price ($)</label>
            <input
              type="number"
              min={0}
              value={form.priceFullMatch ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, priceFullMatch: Number(e.target.value) }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Half Match Price ($)</label>
            <input
              type="number"
              min={0}
              value={form.priceHalfMatch ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, priceHalfMatch: Number(e.target.value) }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
