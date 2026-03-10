"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import { AuthService } from "@/services/auth/apis";
import { RiLogoutBoxLine } from "@remixicon/react";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(clearUser());
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-slate-900 border-b border-white/10">
      <p className="text-slate-400 text-sm">
        Welcome back,{" "}
        <span className="text-white font-medium">{user?.email}</span>
      </p>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        <RiLogoutBoxLine className="w-4 h-4" />
        Log Out
      </button>
    </header>
  );
}
