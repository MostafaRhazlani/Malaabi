import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ManagerService } from "@/services/manager/apis";
import {
  setManagerStatsLoading,
  setManagerStats,
  setManagerStatsError,
  clearManagerStats,
} from "@/store/slices/managerStatsSlice";

export function useManagerStats() {
  const dispatch = useAppDispatch();
  const { stats, status, error } = useAppSelector((s) => s.managerStats);

  useEffect(() => {
    if (status !== "idle") return;
    dispatch(setManagerStatsLoading());
    ManagerService.getStats()
      .then((data) => dispatch(setManagerStats(data)))
      .catch(() => dispatch(setManagerStatsError("Failed to load stats.")));
  }, [dispatch, status]);

  const invalidate = useCallback(() => {
    dispatch(clearManagerStats());
  }, [dispatch]);

  return {
    stats,
    loading: (status === "idle" || status === "loading") && !stats,
    error,
    invalidate,
  };
}
