"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isLoading) return;
    if (user?.role?.toUpperCase() !== "MANAGER") {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role?.toUpperCase() !== "MANAGER") return null;

  return <>{children}</>;
}
