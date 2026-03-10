"use client";

import { useEffect } from "react";
import {
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiBuilding2Line,
} from "@remixicon/react";
import {
  AdminService,
} from "@/services/admin/apis";
import type { UserRole } from "@/types/admin.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAdminStats,
  setAdminStatsError,
  setAdminStatsLoading,
} from "@/store/slices/adminStatsSlice";

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, status, error } = useAppSelector((state) => state.adminStats);

  useEffect(() => {
    // Fetch once per app session. A full page refresh resets store and fetches again.
    if (stats || status === "loading") {
      return;
    }

    dispatch(setAdminStatsLoading());

    AdminService.getStats()
      .then((data) => dispatch(setAdminStats(data)))
      .catch(() => dispatch(setAdminStatsError("Failed to load admin stats.")));
  }, [dispatch, stats, status]);

  const loading = (status === "idle" || status === "loading") && !stats;

  const userCountByRole = (role: UserRole) =>
    stats?.users.byRole[role] ?? 0;

  const statCards = stats
    ? [
        {
          label: "Total Revenue",
          value: `$${stats.revenue.confirmedTotalAmount.toLocaleString()}`,
          icon: RiMoneyDollarCircleLine,
          color: "text-green-400",
          bg: "bg-green-500/10",
        },
        {
          label: "Total Stadiums",
          value: stats.stadiums.total,
          icon: RiBuilding2Line,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          sub: `${stats.stadiums.pending} pending`,
        },
        {
          label: "Admins",
          value: userCountByRole("ADMIN"),
          icon: RiGroupLine,
          color: "text-red-400",
          bg: "bg-red-500/10",
        },
        {
          label: "Managers",
          value: userCountByRole("MANAGER"),
          icon: RiGroupLine,
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          label: "Guards",
          value: userCountByRole("GUARD"),
          icon: RiGroupLine,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
        },
        {
          label: "Players",
          value: userCountByRole("PLAYER"),
          icon: RiGroupLine,
          color: "text-primary-400",
          bg: "bg-primary-500/10",
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">A quick look at the platform&apos;s status</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <div>
                <p className="text-slate-400 text-sm">{label}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


