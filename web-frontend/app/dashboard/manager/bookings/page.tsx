"use client";

import { useEffect, useState } from "react";
import { RiCalendarLine } from "@remixicon/react";
import { ManagerService } from "@/services/manager/apis";
import type { ManagerBooking, BookingStatus } from "@/interfaces/manager.interface";

const STATUS_STYLES: Record<BookingStatus, string> = {
  CONFIRMED: "text-green-400 bg-green-500/10",
  PENDING: "text-yellow-400 bg-yellow-500/10",
  CANCELLED: "text-red-400 bg-red-500/10",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Pending", value: "PENDING" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<ManagerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    ManagerService.getBookings({ page, limit: 10, status: status || undefined })
      .then((res) => {
        setBookings(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, [page, status]);

  function handleFilterChange(val: string) {
    setStatus(val);
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-slate-400 text-sm mt-1">All bookings across your stadiums</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === f.value
                ? "bg-primary-600 text-white"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-slate-500">
          <RiCalendarLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-white/10">
                <th className="text-left px-6 py-3 font-medium">Player</th>
                <th className="text-left px-6 py-3 font-medium">Stadium</th>
                <th className="text-left px-6 py-3 font-medium">Scheduled</th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <p className="text-white font-medium">
                      {b.player.first_name} {b.player.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{b.player.email}</p>
                  </td>
                  <td className="px-6 py-3 text-slate-400">
                    <p>{b.stadium.name}</p>
                    <p className="text-xs text-slate-500">{b.stadium.city}</p>
                  </td>
                  <td className="px-6 py-3 text-slate-400 text-xs">
                    {b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.matchType === "FULL"
                          ? "text-purple-400 bg-purple-500/10"
                          : "text-cyan-400 bg-cyan-500/10"
                      }`}
                    >
                      {b.matchType === "FULL" ? "Full" : "Half"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-green-400 font-semibold">
                    ${b.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 text-sm transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 text-sm transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
