"use client";

import { useApp } from "@/lib/store";
import { Sun, Moon, Globe, LayoutDashboard, Scissors, CalendarCheck, Users, Wallet, Star, BarChart3, Share2, MessageCircle, Settings as SettingsIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/services", key: "services", icon: Scissors },
  { href: "/bookings", key: "bookings", icon: CalendarCheck },
  { href: "/technicians", key: "technicians", icon: Users },
  { href: "/finance", key: "finance", icon: Wallet },
  { href: "/reviews", key: "reviews", icon: Star },
  { href: "/analytics", key: "analytics", icon: BarChart3 },
  { href: "/share", key: "share", icon: Share2 },
  { href: "/waha", key: "waha", icon: MessageCircle },
  { href: "/settings", key: "settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang, theme, toggleTheme, user, logout, data } = useApp();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-60 flex-col border-r bg-zinc-50 dark:bg-zinc-950 p-4 gap-1">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg mb-4 px-2">
          <span className="w-7 h-7 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 grid place-items-center text-sm">S</span>
          {t.appName}
        </Link>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                active ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon size={16} />
              {t[n.key as keyof typeof t]}
            </Link>
          );
        })}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <div className="md:hidden font-bold">{t.appName}</div>
          <div className="flex-1" />
          <button onClick={() => setLang(lang === "en" ? "id" : "en")} className="flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <Globe size={14} /> {lang === "en" ? "ID" : "EN"}
          </button>
          <button onClick={toggleTheme} className="ml-2 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="ml-3 text-sm hidden sm:block">{user?.name ?? data.businessName}</div>
          <button onClick={logout} className="ml-3 flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <LogOut size={14} /> {t.logout}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
