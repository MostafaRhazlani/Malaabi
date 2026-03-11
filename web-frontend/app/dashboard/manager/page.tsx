"use client";

import {
  RiMoneyDollarCircleLine,
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiPieChartLine,
  RiBarChartLine,
} from "@remixicon/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useManagerStats } from "@/hooks/useManagerStats";
import ClientOnly from "@/components/ClientOnly";

const MATCH_TYPE_COLORS = ["#7c3aed", "#06b6d4"];

export default function ManagerDashboard() {
  const { stats, loading, error } = useManagerStats();

  const statCards = stats
    ? [
        {
          label: "Total Revenue",
          value: `$${stats.totalRevenue.toLocaleString()}`,
          icon: RiMoneyDollarCircleLine,
          color: "text-green-400",
          bg: "bg-green-500/10",
        },
        {
          label: "My Stadiums",
          value: stats.totalStadiums,
          icon: RiBuilding2Line,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          label: "Total Bookings",
          value: stats.totalBookings,
          icon: RiCalendarCheckLine,
          color: "text-primary-400",
          bg: "bg-primary-500/10",
        },
      ]
    : [];

  const pieData = stats
    ? [
        { name: "Full Match", value: stats.matchTypeDistribution.FULL },
        { name: "Half Match", value: stats.matchTypeDistribution.HALF },
      ]
    : [];

  const weeklyData = stats?.weeklyIncome ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your stadiums and bookings</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match Type Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <RiPieChartLine className="w-5 h-5 text-primary-400" />
              <h2 className="text-sm font-semibold text-white">Match Type Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={MATCH_TYPE_COLORS[index % MATCH_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: MATCH_TYPE_COLORS[i] }}
                  />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Income Trend */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <RiBarChartLine className="w-5 h-5 text-primary-400" />
              <h2 className="text-sm font-semibold text-white">Weekly Income Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#f8fafc" }}
                  itemStyle={{ color: "#94a3b8" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: "#7c3aed", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      {!loading && !error && stats && stats.upcomingBookings.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
            <RiCalendarCheckLine className="w-5 h-5 text-primary-400" />
            <h2 className="text-sm font-semibold text-white">Upcoming Bookings</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-white/5">
                <th className="text-left px-6 py-3 font-medium">Player</th>
                <th className="text-left px-6 py-3 font-medium">Stadium</th>
                <th className="text-left px-6 py-3 font-medium">Scheduled</th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-right px-6 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcomingBookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-white">
                    {b.player.first_name} {b.player.last_name}
                  </td>
                  <td className="px-6 py-3 text-slate-400">{b.stadium.name}</td>
                  <td className="px-6 py-3 text-slate-400">
                    <ClientOnly fallback={<span className="text-slate-600">—</span>}>
                      {b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : "—"}
                    </ClientOnly>
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
                  <td className="px-6 py-3 text-right text-green-400 font-semibold">
                    ${b.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && stats && stats.upcomingBookings.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-slate-500 text-sm">
          No upcoming bookings found.
        </div>
      )}
    </div>
  );
}
