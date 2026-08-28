"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function Home() {
  const { user } = useApp();
  const router = useRouter();
  useEffect(() => { router.replace(user ? "/dashboard" : "/login"); }, [user]);
  return <div className="p-8 text-sm opacity-60">Servora…</div>;
}
