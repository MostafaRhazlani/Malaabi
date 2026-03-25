import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ManagerService, CreateStadiumPayload, UpdatePricesPayload } from "@/services/manager/apis";
import {
  setManagerStadiumsLoading,
  setManagerStadiums,
  setManagerStadiumsError,
  addManagerStadium,
  updateManagerStadium,
  removeManagerStadium,
} from "@/store/slices/managerStadiumsSlice";
import { clearManagerStats } from "@/store/slices/managerStatsSlice";
import type { ManagerStadium } from "@/interfaces/manager.interface";

export function useManagerStadiums() {
  const dispatch = useAppDispatch();
  const { stadiums, status, error } = useAppSelector((s) => s.managerStadiums);

  useEffect(() => {
    if (status !== "idle") return;
    dispatch(setManagerStadiumsLoading());
    ManagerService.getStadiums()
      .then((data) => dispatch(setManagerStadiums(data)))
      .catch(() => dispatch(setManagerStadiumsError("Failed to load stadiums.")));
  }, [dispatch, status]);

  const invalidateStats = useCallback(() => {
    dispatch(clearManagerStats());
  }, [dispatch]);

  const createStadium = useCallback(
    async (payload: CreateStadiumPayload, photos: File[]) => {
      const created = await ManagerService.createStadium(payload);
      let finalStadium = created;
      if (photos.length > 0) {
        const result = await ManagerService.uploadStadiumPhotos(created.id, photos);
        finalStadium = { ...created, images: result.images };
      }
      dispatch(addManagerStadium(finalStadium));
      invalidateStats();
      toast.success("Stadium created successfully");
    },
    [dispatch, invalidateStats],
  );

  const editPrices = useCallback(
    async (stadium: ManagerStadium, payload: UpdatePricesPayload) => {
      await ManagerService.updateStadiumPrices(stadium.id, payload);
      dispatch(
        updateManagerStadium({
          ...stadium,
          priceFullMatch: payload.priceFullMatch ?? stadium.priceFullMatch,
          priceHalfMatch: payload.priceHalfMatch ?? stadium.priceHalfMatch,
        }),
      );
      toast.success("Prices updated");
    },
    [dispatch],
  );

  const updateStadium = useCallback(
    async (stadium: ManagerStadium, payload: Partial<CreateStadiumPayload>) => {
      await ManagerService.updateStadium(stadium.id, payload);
      dispatch(
        updateManagerStadium({
          ...stadium,
          ...payload,
        } as ManagerStadium),
      );
      toast.success("Stadium information updated");
    },
    [dispatch],
  );

  const uploadPhotos = useCallback(
    async (stadium: ManagerStadium, files: File[]) => {
      const result = await ManagerService.uploadStadiumPhotos(stadium.id, files);
      const updated = { ...stadium, images: result.images };
      dispatch(updateManagerStadium(updated));
      toast.success("Photos uploaded");
      return updated;
    },
    [dispatch],
  );

  const deletePhoto = useCallback(
    async (stadium: ManagerStadium, url: string) => {
      const result = await ManagerService.deleteStadiumPhoto(stadium.id, url);
      const updated = { ...stadium, images: result.images };
      dispatch(updateManagerStadium(updated));
      return updated;
    },
    [dispatch],
  );

  const deleteStadium = useCallback(
    async (id: string) => {
      await ManagerService.deleteStadium(id);
      dispatch(removeManagerStadium(id));
      invalidateStats();
      toast.success("Stadium deleted");
    },
    [dispatch, invalidateStats],
  );

  return {
    stadiums,
    loading: status === "loading",
    error,
    createStadium,
    editPrices,
    updateStadium,
    uploadPhotos,
    deletePhoto,
    deleteStadium,
  };
}
