"use client";

import { useAppSelector } from "@/store/hooks";
import {
  RiBriefcaseLine,
  RiGroupLine,
  RiCalendarLine,
  RiBarChartLine,
} from "@remixicon/react";

const stats = [
  { label: "My Team", value: "—", icon: RiGroupLine },
  { label: "Scheduled", value: "—", icon: RiCalendarLine },
  { label: "Reports", value: "—", icon: RiBarChartLine },
  { label: "Role", value: "Manager", icon: RiBriefcaseLine },
];

export default function ManagerDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Role badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600/20 border border-primary-600/40 text-primary-400 text-sm font-medium mb-8">
        <RiBriefcaseLine className="w-4 h-4" />
        {user?.role}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-600/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-slate-400 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-slate-400">
        <RiBarChartLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Dashboard content coming soon</p>
        <p className="text-sm mt-1">This is a placeholder for the Manager panel.</p>
      </div>
    </div>
  );
}
