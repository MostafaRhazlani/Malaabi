"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RiGroupLine, RiSearchLine } from "@remixicon/react";
import { AdminService } from "@/services/admin/apis";
import type { AdminUser, UsersQueryParams } from "@/interfaces/users.interface";
import type { UserRole, UserStatus } from "@/types/admin.types";
import DataTable, { Column } from "@/components/ui/DataTable";
import Dropdown, { DropdownOption } from "@/components/ui/Dropdown";

const ROLE_OPTIONS: DropdownOption<UserRole | "">[] = [
  { label: "All Roles", value: "" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Guard", value: "GUARD" },
  { label: "Player", value: "PLAYER" },
];

const STATUS_OPTIONS: DropdownOption<UserStatus | "">[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Banned", value: "BANNED" },
];

const STATUS_ACTION_OPTIONS: DropdownOption<UserStatus>[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Banned", value: "BANNED" },
];

const STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: "text-green-400 bg-green-500/10",
  SUSPENDED: "text-yellow-400 bg-yellow-500/10",
  BANNED: "text-red-400 bg-red-500/10",
};

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "text-red-400 bg-red-500/10",
  MANAGER: "text-purple-400 bg-purple-500/10",
  GUARD: "text-yellow-400 bg-yellow-500/10",
  PLAYER: "text-blue-400 bg-blue-500/10",
};

const LIMIT = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback((params: UsersQueryParams) => {
    setLoading(true);
    setError(null);
    AdminService.getUsers(params)
      .then((res) => {
        setUsers(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers({
        page,
        limit: LIMIT,
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [page, search, role, status, fetchUsers]);

  const handleStatusChange = async (user: AdminUser, newStatus: UserStatus) => {
    await AdminService.updateUserStatus(user.id, newStatus);
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
  };

  const columns: Column<AdminUser>[] = [
    {
      header: "User",
      accessor: (u) => (
        <div>
          <p className="text-white font-medium">{u.first_name} {u.last_name}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (u) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
          {u.role}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (u) => (
        <Dropdown
          options={STATUS_ACTION_OPTIONS}
          value={u.status}
          onChange={(newStatus) => handleStatusChange(u, newStatus)}
          renderTrigger={(selected) => (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center gap-1 ${STATUS_COLORS[u.status]}`}>
              {selected?.label ?? u.status}
            </span>
          )}
        />
      ),
    },
    {
      header: "Joined",
      accessor: (u) => (
        <span className="text-slate-400 text-sm">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          {total} user{total !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 text-white rounded-md py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none placeholder:text-slate-500"
          />
        </div>

        <Dropdown
          options={ROLE_OPTIONS}
          value={role}
          onChange={(v) => { setRole(v); setPage(1); }}
          placeholder="All Roles"
        />

        <Dropdown
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          placeholder="All Statuses"
        />
      </div>

      {/* Table */}
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <DataTable
          title="All Users"
          icon={RiGroupLine}
          columns={columns}
          rows={users}
          getRowKey={(u) => u.id}
          emptyMessage="No users match your filters."
        />
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
