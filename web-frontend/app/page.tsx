"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../store/hooks";

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  MANAGER: "/dashboard/manager",
};

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    const redirect = ROLE_REDIRECT[user?.role?.toUpperCase() ?? ""];
    router.replace(redirect ?? "/login");
  }, [isLoading, isAuthenticated, user, router]);

  return null;
}
