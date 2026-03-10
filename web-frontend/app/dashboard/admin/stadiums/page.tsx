"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RiBuilding2Line,
  RiSearchLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiEyeLine,
} from "@remixicon/react";
import { AdminService } from "@/services/admin/apis";
import type { AdminStadium, StadiumsQueryParams } from "@/interfaces/stadiums.interface";
import type { StadiumStatus } from "@/types/admin.types";
import DataTable, { Column } from "@/components/ui/DataTable";
import Dropdown, { DropdownOption } from "@/components/ui/Dropdown";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAdminStadiumsLoading,
  setAdminStadiums,
  setAdminStadiumsError,
  updateAdminStadiumStatus,
  removeAdminStadium,
} from "@/store/slices/adminStadiumsSlice";
import StadiumDetailsModal from "@/components/dashboard/StadiumDetailsModal";

const STATUS_OPTIONS: DropdownOption<StadiumStatus | "">[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

const STATUS_ACTION_OPTIONS: DropdownOption<StadiumStatus>[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

const STATUS_COLORS: Record<StadiumStatus, string> = {
  PENDING: "text-orange-400 bg-orange-500/10",
  ACTIVE: "text-green-400 bg-green-500/10",
  SUSPENDED: "text-red-400 bg-red-500/10",
};

const LIMIT = 10;

export default function AdminStadiumsPage() {
  const dispatch = useAppDispatch();
  const { stadiums, total, totalPages, status: storeStatus, error } = useAppSelector(
    (state) => state.adminStadiums
  );
  const loading = storeStatus === 'idle' || storeStatus === 'loading';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StadiumStatus | "">("");
  const [selectedStadium, setSelectedStadium] = useState<AdminStadium | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStadiums = useCallback((params: StadiumsQueryParams) => {
    dispatch(setAdminStadiumsLoading());
    AdminService.getStadiums(params)
      .then((res) => {
        dispatch(setAdminStadiums({ stadiums: res.data, total: res.total, totalPages: res.totalPages }));
      })
      .catch(() => dispatch(setAdminStadiumsError("Failed to load stadiums.")));
  }, [dispatch]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStadiums({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: status || undefined,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [page, search, status, fetchStadiums]);

  const handleStatusChange = async (stadium: AdminStadium, newStatus: StadiumStatus) => {
    await AdminService.updateStadiumStatus(stadium.id, newStatus);
    dispatch(updateAdminStadiumStatus({ id: stadium.id, status: newStatus }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this stadium permanently?")) return;
    await AdminService.deleteStadium(id);
    dispatch(removeAdminStadium(id));
  };

  const columns: Column<AdminStadium>[] = [
    {
      header: "Stadium",
      accessor: (s) => (
        <div>
          <p className="text-white font-medium">{s.name}</p>
          <p className="text-xs text-slate-500">{s.address}</p>
        </div>
      ),
    },
    {
      header: "City",
      accessor: (s) => (
        <span className="text-slate-300 text-sm">{s.city}</span>
      ),
    },
    {
      header: "Manager",
      accessor: (s) => (
        <div>
          <p className="text-slate-300 text-sm">
            {s.manager.first_name} {s.manager.last_name}
          </p>
          <p className="text-xs text-slate-500">{s.manager.email}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (s) => (
        <Dropdown
          options={STATUS_ACTION_OPTIONS}
          value={s.status}
          onChange={(newStatus) => handleStatusChange(s, newStatus)}
          renderTrigger={(selected) => (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center gap-1 ${STATUS_COLORS[s.status]}`}
            >
              {selected?.label ?? s.status}
            </span>
          )}
        />
      ),
    },
    {
      header: "Added",
      accessor: (s) => (
        <span className="text-slate-400 text-sm">
          {new Date(s.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStadium(s)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RiEyeLine className="w-3.5 h-3.5" />
            View
          </button>
          {s.status === "PENDING" && (
            <button
              onClick={() => handleStatusChange(s, "ACTIVE")}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors"
            >
              <RiCheckLine className="w-3.5 h-3.5" />
              Approve
            </button>
          )}
          <button
            onClick={() => handleDelete(s.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <RiDeleteBinLine className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {selectedStadium && (
        <StadiumDetailsModal
          stadium={selectedStadium}
          onClose={() => setSelectedStadium(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Stadiums</h1>
        <p className="text-slate-400 text-sm mt-1">
          {total} stadium{total !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or city…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 text-white rounded-md py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none placeholder:text-slate-500"
          />
        </div>

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
          title="All Stadiums"
          icon={RiBuilding2Line}
          columns={columns}
          rows={stadiums}
          getRowKey={(s) => s.id}
          emptyMessage="No stadiums match your filters."
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
    </>
  );
}
