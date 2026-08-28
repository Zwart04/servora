"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const router = useRouter();
  useEffect(() => { if (!user) router.replace("/login"); }, [user]);
  if (!user) return <div className="p-8 text-sm opacity-60">Loading...</div>;
  return <AppShell>{children}</AppShell>;
}
