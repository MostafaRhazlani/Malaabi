"use client";

import { useRef, useState } from "react";
import { RiAddLine, RiCloseLine, RiUploadCloud2Line } from "@remixicon/react";
import { toast } from "sonner";
import type { CreateStadiumPayload } from "@/services/manager/apis";
import Dropdown from "@/components/ui/Dropdown";

const STADIUM_TYPE_OPTIONS = [
  { value: "FIVE_V_FIVE", label: "5 vs 5" },
  { value: "SEVEN_V_SEVEN", label: "7 vs 7" },
  { value: "EIGHT_V_EIGHT", label: "8 vs 8" },
  { value: "ELEVEN_V_ELEVEN", label: "11 vs 11" },
  { value: "INDOOR", label: "Indoor" },
];

const emptyForm: CreateStadiumPayload = {
  name: "",
  city: "",
  address: "",
  stadiumType: "FIVE_V_FIVE",
  latitude: undefined,
  longitude: undefined,
  priceFullMatch: 0,
  priceHalfMatch: 0,
};

interface Props {
  onCreate: (payload: CreateStadiumPayload, photos: File[]) => Promise<void>;
  onClose: () => void;
}

export default function CreateStadiumModal({ onCreate, onClose }: Props) {
  const [form, setForm] = useState<CreateStadiumPayload>(emptyForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addPhotos(incoming: File[]) {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    setPhotos((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...images.filter((f) => !names.has(f.name))].slice(0, 10);
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreate(form, photos);
      onClose();
    } catch {
      toast.error("Failed to create stadium");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-4">New Stadium</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(["name", "city", "address"] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs text-slate-400 mb-1 capitalize">{field}</label>
              <input
                required
                value={form[field] as string}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                placeholder={field}
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
              <label className="block text-xs text-slate-400 mb-1">Full Match Price ($)</label>
              <input
                type="number"
                min={0}
                value={form.priceFullMatch}
                onChange={(e) => setForm((f) => ({ ...f, priceFullMatch: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Half Match Price ($)</label>
              <input
                type="number"
                min={0}
                value={form.priceHalfMatch}
                onChange={(e) => setForm((f) => ({ ...f, priceHalfMatch: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
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
                placeholder="e.g. 33.5731"
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
                placeholder="e.g. -7.5898"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Photos <span className="text-slate-600">(optional)</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addPhotos(Array.from(e.dataTransfer.files)); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors ${dragOver
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/15 bg-white/3 hover:border-primary-500/50 hover:bg-white/5"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => { addPhotos(Array.from(e.target.files ?? [])); e.target.value = ""; }}
                className="hidden"
              />
              <RiUploadCloud2Line className={`w-7 h-7 transition-colors ${dragOver ? "text-primary-400" : "text-slate-500"}`} />
              <p className="text-sm text-slate-400 font-medium">
                {dragOver ? "Drop images here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-slate-600">JPEG, PNG, WebP — up to 10 images</p>
            </div>

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {photos.map((file, i) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                      <img src={url} onLoad={() => URL.revokeObjectURL(url)} alt={file.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RiCloseLine className="w-3 h-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 bg-primary-600/80 text-white text-[9px] font-semibold px-1 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  );
                })}
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-white/15 hover:border-primary-500/50 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <RiAddLine className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
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
              disabled={creating}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
