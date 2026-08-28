"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Lang } from "./i18n";

export type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMin: number;
  active: boolean;
};

export type Booking = {
  id: string;
  customer: string;
  phone: string;
  serviceId: string;
  date: string; // ISO
  slot: string;
  zone: string;
  technicianId: string | null;
  status: "pending" | "scheduled" | "enroute" | "inprogress" | "done";
  amount: number;
  source: "meta" | "google" | "tiktok" | "direct";
  campaign: string;
  note: string;
};

export type Technician = {
  id: string;
  name: string;
  zone: string;
  rating: number;
  active: boolean;
};

export type Review = {
  id: string;
  customer: string;
  rating: number;
  text: string;
  serviceId: string;
  createdAt: string;
};

export type Journal = {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  source: string;
  note: string;
};

export type WahaState = {
  url: string;
  status: "connected" | "disconnected" | "qr" | "connecting";
  history: { phone: string; message: string; at: string }[];
};

export type AppData = {
  services: Service[];
  bookings: Booking[];
  technicians: Technician[];
  reviews: Review[];
  journal: Journal[];
  waha: WahaState;
  publicSlug: string;
  businessName: string;
};

export const DEFAULT_DATA: AppData = {
  businessName: "Servora Home Services",
  publicSlug: "demo",
  services: [
    { id: "s1", name: "Deep Cleaning", category: "Cleaning", price: 350000, durationMin: 180, active: true },
    { id: "s2", name: "AC Service", category: "Repair", price: 150000, durationMin: 60, active: true },
    { id: "s3", name: "Salon at Home", category: "Beauty", price: 200000, durationMin: 120, active: true },
    { id: "s4", name: "Massage Call", category: "Wellness", price: 250000, durationMin: 90, active: true },
    { id: "s5", name: "Pest Control", category: "Cleaning", price: 300000, durationMin: 120, active: true },
  ],
  technicians: [
    { id: "t1", name: "Budi", zone: "Jakarta Selatan", rating: 4.7, active: true },
    { id: "t2", name: "Siti", zone: "Jakarta Timur", rating: 4.9, active: true },
    { id: "t3", name: "Agus", zone: "Jakarta Barat", rating: 4.5, active: true },
  ],
  bookings: [],
  reviews: [
    { id: "r1", customer: "Ibu Rina", rating: 5, text: "Technician arrived on time and very professional.", serviceId: "s1", createdAt: "2026-08-20" },
    { id: "r2", customer: "Pak Joko", rating: 4, text: "AC jadi dingin lagi, recommended.", serviceId: "s2", createdAt: "2026-08-22" },
  ],
  journal: [],
  waha: { url: "http://localhost:3000", status: "disconnected", history: [] },
};

type Ctx = {
  data: AppData;
  setData: (updater: (d: AppData) => AppData) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  t: typeof import("./i18n").dict.en;
};

const AppContext = createContext<Ctx | null>(null);

const DATA_KEY = "servora_data";
const LANG_KEY = "servora_lang";
const THEME_KEY = "servora_theme";
const USER_KEY = "servora_user";
const USERS_KEY = "servora_users";

export function AppProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [data, setDataState] = useState<AppData>(DEFAULT_DATA);
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  // hydrate from localStorage on client only (mounted guard prevents hydration #418)
  useEffect(() => {
    setMounted(true);
    try {
      const d = localStorage.getItem(DATA_KEY);
      if (d) setDataState(JSON.parse(d));
      const l = localStorage.getItem(LANG_KEY) as Lang | null;
      if (l) setLangState(l);
      const th = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      if (th) setTheme(th);
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch {}
  }, [data, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
  }, [lang, mounted]);

  const setData = (updater: (d: AppData) => AppData) => setDataState((prev) => updater(prev));

  const t = (mounted ? require("./i18n").dict[lang] : require("./i18n").dict.en);

  const ctx: Ctx = {
    data,
    setData,
    lang,
    setLang: (l) => setLangState(l),
    theme,
    toggleTheme: () => setTheme((p) => (p === "light" ? "dark" : "light")),
    user,
    login: (email, password) => {
      try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        const found = users.find((u: any) => u.email === email && u.password === password);
        if (!found) return false;
        const u = { email: found.email, name: found.name };
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUser(u);
        return true;
      } catch { return false; }
    },
    register: (name, email, password) => {
      try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        if (users.find((u: any) => u.email === email)) return false;
        users.push({ name, email, password });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        const u = { email, name };
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUser(u);
        return true;
      } catch { return false; }
    },
    logout: () => {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    },
    t,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
