"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Sun, Moon, Globe } from "lucide-react";

export default function RegisterPage() {
  const { t, lang, setLang, theme, toggleTheme, register, user } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 4) {
      setErr(lang === "en" ? "Fill all fields (password min 4 chars)" : "Isi semua field (kata sandi min 4 karakter)");
      return;
    }
    const ok = register(name.trim(), email.trim(), password);
    if (!ok) setErr(lang === "en" ? "Email already registered" : "Email sudah terdaftar");
    else router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setLang(lang === "en" ? "id" : "en")} className="text-sm px-2 py-1 rounded border flex items-center gap-1">
          <Globe size={14} /> {lang === "en" ? "ID" : "EN"}
        </button>
        <button onClick={toggleTheme} className="p-1 rounded border">{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button>
      </div>
      <form onSubmit={submit} className="w-full max-w-sm border rounded-xl p-6 space-y-4 bg-white dark:bg-zinc-900">
        <h1 className="text-xl font-bold">{t.register}</h1>
        <input className="w-full border rounded px-3 py-2 text-sm" placeholder={t.name} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2 text-sm" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2 text-sm" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded px-3 py-2 text-sm font-medium">{t.register}</button>
        <p className="text-sm text-center opacity-70">
          {t.login}? <Link href="/login" className="underline">{t.login}</Link>
        </p>
      </form>
    </div>
  );
}
