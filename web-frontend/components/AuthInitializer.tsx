"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, setAuthLoading } from "@/store/slices/authSlice";
import { AuthService } from "@/services/auth/apis";

const AUTH_PAGES = ['/login'];

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated || AUTH_PAGES.includes(pathname)) {
      dispatch(setAuthLoading(false));
      return;
    }

    AuthService.getMe()
      .then(({ user }) => {
        dispatch(setUser(user));
      })
      .catch(() => {
        dispatch(setAuthLoading(false));
      });
  }, [isAuthenticated, pathname, dispatch]);

  return null;
}
