"use client";

import { useState } from "react";
import { RiCloseLine, RiUserAddLine } from "@remixicon/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdminService } from "@/services/admin/apis";
import type { AdminUser } from "@/interfaces/users.interface";

interface CreateManagerModalProps {
  onClose: () => void;
  onCreated: (manager: AdminUser) => void;
}

export default function CreateManagerModal({ onClose, onCreated }: CreateManagerModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const manager = await AdminService.createManager({ firstName, lastName, email });
      onCreated(manager);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to create manager.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <RiUserAddLine className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Create Manager</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Credentials will be sent to the manager&apos;s email.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex gap-3">
            <Input
              label="First Name"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              minLength={2}
              autoFocus
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="manager@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-md border border-white/10 text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={loading} className="flex-1">
              Create Manager
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
