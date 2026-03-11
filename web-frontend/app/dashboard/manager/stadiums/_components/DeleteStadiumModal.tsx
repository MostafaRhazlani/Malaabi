"use client";

import { useState } from "react";
import { RiAlertLine } from "@remixicon/react";
import { toast } from "sonner";
import type { ManagerStadium } from "@/interfaces/manager.interface";

interface Props {
  stadium: ManagerStadium;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function DeleteStadiumModal({ stadium, onDelete, onClose }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(stadium.id);
      onClose();
    } catch {
      toast.error("Failed to delete stadium");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <RiAlertLine className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Delete Stadium</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">{stadium.name}</span>?
              This will also delete all its bookings and uploaded photos.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
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
  );
}
