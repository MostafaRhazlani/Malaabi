"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CreateStadiumPayload } from "@/services/manager/apis";
import type { ManagerStadium } from "@/interfaces/manager.interface";
import Dropdown from "@/components/ui/Dropdown";

const STADIUM_TYPE_OPTIONS = [
  { value: "FIVE_V_FIVE", label: "5 vs 5" },
  { value: "SEVEN_V_SEVEN", label: "7 vs 7" },
  { value: "EIGHT_V_EIGHT", label: "8 vs 8" },
  { value: "ELEVEN_V_ELEVEN", label: "11 vs 11" },
  { value: "INDOOR", label: "Indoor" },
];

interface Props {
  stadium: ManagerStadium;
  onSave: (stadium: ManagerStadium, payload: Partial<CreateStadiumPayload>) => Promise<void>;
  onClose: () => void;
}

export default function UpdateStadiumModal({ stadium, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<CreateStadiumPayload>>({
    name: stadium.name,
    city: stadium.city,
    address: stadium.address,
    stadiumType: stadium.stadiumType,
    latitude: stadium.latitude,
    longitude: stadium.longitude,
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
      toast.error("Failed to update stadium information");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-4">Edit Stadium Info</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(["name", "city", "address"] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs text-slate-400 mb-1 capitalize">{field}</label>
              <input
                required
                value={(form[field] as string) ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Stadium Type</label>
            <Dropdown
              fullWidth
              options={STADIUM_TYPE_OPTIONS}
              value={(form.stadiumType ?? "FIVE_V_FIVE") as string}
              onChange={(val) => setForm((f) => ({ ...f, stadiumType: val }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
