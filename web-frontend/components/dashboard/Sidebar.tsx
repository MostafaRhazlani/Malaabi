"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import ClientOnly from "@/components/ClientOnly";
import {
  RiDashboardLine,
  RiGroupLine,
  RiCalendarLine,
  RiBriefcaseLine,
  RiBuilding2Line,
} from "@remixicon/react";

const NAV_ITEMS: Record<
  string,
  { label: string; href: string; icon: React.ElementType }[]
> = {
  ADMIN: [
    { label: "Overview", href: "/dashboard/admin", icon: RiDashboardLine },
    { label: "Users", href: "/dashboard/admin/users", icon: RiGroupLine },
    { label: "Stadiums", href: "/dashboard/admin/stadiums", icon: RiBuilding2Line },
  ],
  MANAGER: [
    { label: "Overview", href: "/dashboard/manager", icon: RiDashboardLine },
    { label: "My Team", href: "/dashboard/manager/team", icon: RiGroupLine },
    { label: "Schedule", href: "/dashboard/manager/schedule", icon: RiCalendarLine },
    { label: "Reports", href: "/dashboard/manager/reports", icon: RiBriefcaseLine },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const role = user?.role?.toUpperCase() ?? "";
  const navItems = NAV_ITEMS[role] ?? [];

  return (
    <ClientOnly
      fallback={
        <aside className="w-64 shrink-0 flex flex-col h-full bg-slate-900 border-r border-white/10">
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/malaabi-logo.png" alt="Malaabi" width={32} height={32} />
              <span className="font-bold text-white text-lg">Malaabi</span>
            </Link>
          </div>
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto" />
          <div className="p-4 border-t border-white/10" />
        </aside>
      }
    >
      <aside className="w-64 shrink-0 flex flex-col h-full bg-slate-900 border-r border-white/10">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/malaabi-logo.png" alt="Malaabi" width={32} height={32} />
            <span className="font-bold text-white text-lg">Malaabi</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-600/20 text-primary-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-white font-medium truncate">{user?.email}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </ClientOnly>
  );
}
