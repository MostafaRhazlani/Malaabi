"use client";

import { RiAlertLine, RiCloseLine, RiDeleteBinLine } from "@remixicon/react";
import type { AdminUser } from "@/interfaces/users.interface";

interface DeleteUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  loading = false,
}: DeleteUserModalProps) {
  const isManager = user.role === "MANAGER";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <RiDeleteBinLine className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-white font-semibold text-lg">Delete User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-slate-300 text-sm">
            You are about to delete{" "}
            <span className="text-white font-semibold">
              {user.first_name} {user.last_name}
            </span>{" "}
            <span className="text-slate-500">({user.email})</span>.
          </p>

          {isManager && (
            <div className="flex gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <RiAlertLine className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="text-yellow-300 font-semibold">Cascade Warning</p>
                <p className="text-yellow-200/80">
                  Deleting this Manager will also permanently delete:
                </p>
                <ul className="list-disc list-inside text-yellow-200/70 space-y-0.5 mt-1">
                  <li>All stadiums owned by this manager</li>
                  <li>All bookings on those stadiums</li>
                  <li>All guards will be unlinked from this manager</li>
                </ul>
              </div>
            </div>
          )}

          <p className="text-slate-500 text-xs">This action cannot be undone.</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
