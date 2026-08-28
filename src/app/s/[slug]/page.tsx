"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { DEFAULT_DATA } from "@/lib/store";
import { Sun, Moon, Globe, Scissors, Star, MapPin, CalendarCheck, MessageCircle } from "lucide-react";
import { track } from "@/components/AnalyticsProvider";

export default function PublicCatalog() {
  const params = useParams<{ slug: string }>();
  const { t, lang, setLang, theme, toggleTheme, data } = useApp();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ customer: "", phone: "", serviceId: "", date: "", slot: "09:00", zone: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { setMounted(true); track("PublicCatalogView", { slug: params.slug }); }, [params.slug]);

  const safe = data.publicSlug === params.slug ? data : DEFAULT_DATA;
  const tl = mounted ? (lang === "id" ? require("@/lib/i18n").dict.id : require("@/lib/i18n").dict.en) : require("@/lib/i18n").dict.en;

  function book(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer.trim() || !form.serviceId) { setMsg("Isi nama layanan dan pelanggan"); return; }
    const svc = safe.services.find((s) => s.id === form.serviceId);
    const txt = `Halo ${safe.businessName}, saya ${form.customer} ingin booking ${svc?.name} pada ${form.date} ${form.slot}. Zona: ${form.zone}`;
    const waPhone = (form.phone.replace(/\D/g, "") || "6281234567890");
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(txt)}`, "_blank");
    track("BookingRequested", { service: form.serviceId });
    setMsg("Permintaan dikirim via WhatsApp");
    setForm({ customer: "", phone: "", serviceId: "", date: "", slot: "09:00", zone: "" });
  }

  return (
    <div className="min-h-screen">
      <header className="h-14 border-b flex items-center justify-between px-4" style={{ background: "linear-gradient(90deg,#0f172a,#1e293b)" }}>
        <div className="flex items-center gap-2 text-white font-bold">
          <Scissors size={18} className="text-sky-400" /> {safe.businessName}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === "en" ? "id" : "en")} className="text-white text-sm px-2 py-1 rounded border border-white/30 flex items-center gap-1"><Globe size={14} /> {lang === "en" ? "ID" : "EN"}</button>
          <button onClick={toggleTheme} className="text-white p-1 rounded border border-white/30">{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button>
        </div>
      </header>

      <section className="p-6 text-center" style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white" }}>
        <h1 className="text-3xl font-bold">{safe.businessName}</h1>
        <p className="opacity-90 mt-1">Local services, booked in minutes</p>
      </section>

      <main className="max-w-3xl mx-auto p-4 grid md:grid-cols-2 gap-4">
        <section>
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Scissors size={16} /> {tl.services}</h2>
          <div className="space-y-2">
            {safe.services.map((s) => (
              <div key={s.id} className="border rounded-lg p-3">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs opacity-60">{s.category} · {s.durationMin}m</div>
                <div className="font-semibold mt-1">Rp{s.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-semibold mb-2 flex items-center gap-2"><CalendarCheck size={16} /> {tl.bookNow}</h2>
          <form onSubmit={book} className="border rounded-lg p-3 space-y-2">
            <input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder={tl.customer} className="w-full border rounded px-3 py-2 text-sm" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={tl.phone} className="w-full border rounded px-3 py-2 text-sm" />
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">{tl.services}…</option>
              {safe.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="flex-1 border rounded px-3 py-2 text-sm" />
              <input type="time" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            </div>
            <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder={tl.zone} className="w-full border rounded px-3 py-2 text-sm" />
            <button className="w-full bg-sky-600 text-white rounded px-3 py-2 text-sm font-medium flex items-center justify-center gap-2"><MessageCircle size={14} /> {tl.bookNow}</button>
            {msg && <p className="text-xs opacity-70">{msg}</p>}
          </form>
          <h2 className="font-semibold mb-2 mt-4 flex items-center gap-2"><Star size={16} /> {tl.reviews}</h2>
          <div className="space-y-2">
            {safe.reviews.map((r) => (
              <div key={r.id} className="border rounded-lg p-3 text-sm">
                <div className="flex items-center gap-1"><Star size={12} className="text-amber-500" /> {r.rating}/5</div>
                <p className="opacity-80">"{r.text}"</p>
                <div className="text-xs opacity-60">— {r.customer}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="text-center text-xs opacity-50 p-4">Powered by Servora · {safe.businessName}</footer>
    </div>
  );
}
