"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "../services/auth/apis";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser } from "../store/slices/authSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await AuthService.getMe();
        dispatch(setUser(data.user));
      } catch {
        router.push("/login");
      }
    };

    fetchUser();
  }, [dispatch, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-primary-600 mb-6">Malaabi Dashboard</h1>

      <div className="bg-white/5 border border-white/10 p-8 rounded-xl max-w-md w-full text-center space-y-6">
        <p className="text-lg font-medium">Welcome back!</p>
        <p className="text-sm text-slate-400">Email: {user?.email}</p>
        <p className="text-sm text-slate-400">Role: {user?.role}</p>

      </div>
    </div>
  );
}
