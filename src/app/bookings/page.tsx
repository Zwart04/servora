"use client";

import { useState } from "react";
import { useApp, Booking } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Input, Select, Badge } from "@/components/ui";
import { Plus, CalendarCheck, Search, MapPin, Phone, Route as RouteIcon } from "lucide-react";
import { track } from "@/components/AnalyticsProvider";

const STATUS_KEYS: Booking["status"][] = ["pending", "scheduled", "enroute", "inprogress", "done"];
const SOURCES: Booking["source"][] = ["meta", "google", "tiktok", "direct"];

export default function BookingsPage() {
  const { t, data, setData } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Booking | null>(null);
  const [form, setForm] = useState({
    customer: "", phone: "", serviceId: "", date: "", slot: "09:00", zone: "", technicianId: "", status: "pending" as Booking["status"], amount: "", source: "direct" as Booking["source"], campaign: "", note: "",
  });

  const list = data.bookings.filter((b) => b.customer.toLowerCase().includes(q.toLowerCase()) || b.zone.toLowerCase().includes(q.toLowerCase()));

  function openAdd() {
    setEdit(null);
    setForm({ customer: "", phone: "", serviceId: data.services[0]?.id || "", date: new Date().toISOString().slice(0, 10), slot: "09:00", zone: "", technicianId: "", status: "pending", amount: "", source: "direct", campaign: "", note: "" });
    setOpen(true);
  }
  function openEdit(b: Booking) {
    setEdit(b);
    setForm({ customer: b.customer, phone: b.phone, serviceId: b.serviceId, date: b.date.slice(0, 10), slot: b.slot, zone: b.zone, technicianId: b.technicianId || "", status: b.status, amount: String(b.amount), source: b.source, campaign: b.campaign, note: b.note });
    setOpen(true);
  }

  function save() {
    if (!form.customer.trim() || !form.serviceId) return;
    const svc = data.services.find((s) => s.id === form.serviceId);
    const amount = Number(form.amount) || svc?.price || 0;
    const payload: Booking = {
      id: edit?.id || "b" + Date.now(),
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      serviceId: form.serviceId,
      date: form.date,
      slot: form.slot,
      zone: form.zone.trim(),
      technicianId: form.technicianId || null,
      status: form.status,
      amount,
      source: form.source,
      campaign: form.campaign.trim(),
      note: form.note.trim(),
    };
    setData((d) => {
      const exists = d.bookings.some((b) => b.id === payload.id);
      let bookings = exists ? d.bookings.map((b) => (b.id === payload.id ? payload : b)) : [...d.bookings, payload];
      // auto-journal when marked done with amount>0 and not already journaled
      let journal = d.journal;
      const jid = "j" + payload.id;
      if (payload.status === "done" && amount > 0) {
        if (!journal.some((j) => j.id === jid)) {
          journal = [...journal, { id: jid, date: form.date, type: "income", amount, category: svc?.category || "Service", source: `auto-job:${form.source}`, note: `${payload.customer} — ${svc?.name || ""}` }];
        }
      } else {
        journal = journal.filter((j) => j.id !== jid);
      }
      return { ...d, bookings, journal };
    });
    track("BookingSaved", { source: form.source });
    setOpen(false);
  }

  function advance(b: Booking) {
    const i = STATUS_KEYS.indexOf(b.status);
    const next = STATUS_KEYS[Math.min(i + 1, STATUS_KEYS.length - 1)];
    setData((d) => ({
      ...d,
      bookings: d.bookings.map((x) => (x.id === b.id ? { ...x, status: next } : x)),
      journal: next === "done" && b.amount > 0 && !d.journal.some((j) => j.id === "j" + b.id)
        ? [...d.journal, { id: "j" + b.id, date: b.date, type: "income", amount: b.amount, category: data.services.find((s) => s.id === b.serviceId)?.category || "Service", source: `auto-job:${b.source}`, note: `${b.customer}` }]
        : d.journal,
    }));
  }

  function remove(id: string) { setData((d) => ({ ...d, bookings: d.bookings.filter((b) => b.id !== id), journal: d.journal.filter((j) => j.id !== "j" + id) })); }

  // route board grouped by technician
  const routeByTech = data.technicians
    .map((tech) => ({ tech, jobs: data.bookings.filter((b) => b.technicianId === tech.id && ["scheduled", "enroute", "inprogress"].includes(b.status)).sort((a, b) => (a.slot > b.slot ? 1 : -1)) }));

  return (
    <ProtectedPage>
      <CardHeader
        title={t.bookings}
        action={<div className="flex gap-2"><Input value={q} onChange={setQ} placeholder={t.search} className="w-40" /><Button onClick={openAdd}><Plus size={14} /> {t.add}</Button></div>}
      />
      <div className="p-4 space-y-4">
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="text-left p-2">{t.customer}</th>
                <th className="text-left p-2">{t.date}</th>
                <th className="text-left p-2">{t.zone}</th>
                <th className="text-left p-2">{t.technician}</th>
                <th className="text-left p-2">{t.status}</th>
                <th className="text-left p-2">{t.price}</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const svc = data.services.find((s) => s.id === b.serviceId);
                const tech = data.technicians.find((x) => x.id === b.technicianId);
                return (
                  <tr key={b.id} className="border-t">
                    <td className="p-2">{b.customer}<div className="text-xs opacity-60">{svc?.name}</div></td>
                    <td className="p-2">{b.date} {b.slot}</td>
                    <td className="p-2">{b.zone}</td>
                    <td className="p-2">{tech?.name || "—"}</td>
                    <td className="p-2"><Badge>{t[b.status]}</Badge></td>
                    <td className="p-2">Rp{b.amount.toLocaleString()}</td>
                    <td className="p-2 flex gap-1">
                      <Button variant="ghost" onClick={() => advance(b)}>{t.status} →</Button>
                      <Button variant="outline" onClick={() => openEdit(b)}>E</Button>
                      <Button variant="danger" onClick={() => remove(b.id)}>×</Button>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={7} className="p-4 text-center opacity-60">{t.noData}</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2"><RouteIcon size={16} /> {t.routeBoard}</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {routeByTech.map(({ tech, jobs }) => (
              <Card key={tech.id}>
                <CardBody>
                  <div className="font-medium flex items-center gap-2"><MapPin size={14} /> {tech.name}</div>
                  <div className="text-xs opacity-60 mb-2">{tech.zone}</div>
                  {jobs.length === 0 ? <p className="text-xs opacity-50">{t.noData}</p> : (
                    <ol className="text-sm space-y-1 list-decimal pl-4">
                      {jobs.map((j) => <li key={j.id}>{j.slot} · {j.zone} — {j.customer}</li>)}
                    </ol>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardBody className="space-y-3">
              <Input value={form.customer} onChange={(v) => setForm({ ...form, customer: v })} placeholder={t.customer} />
              <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder={t.phone} />
              <Select value={form.serviceId} onChange={(v) => setForm({ ...form, serviceId: v })} options={data.services.map((s) => ({ value: s.id, label: s.name }))} />
              <div className="flex gap-2">
                <Input type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
                <Input type="time" value={form.slot} onChange={(v) => setForm({ ...form, slot: v })} />
              </div>
              <Input value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} placeholder={t.zone} />
              <Select value={form.technicianId} onChange={(v) => setForm({ ...form, technicianId: v })} options={[{ value: "", label: "—" }, ...data.technicians.map((x) => ({ value: x.id, label: x.name }))]} />
              <div className="flex gap-2">
                <Select value={form.status} onChange={(v) => setForm({ ...form, status: v as Booking["status"] })} options={STATUS_KEYS.map((s) => ({ value: s, label: t[s] }))} />
                <Select value={form.source} onChange={(v) => setForm({ ...form, source: v as Booking["source"] })} options={SOURCES.map((s) => ({ value: s, label: s }))} />
              </div>
              <Input type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder={t.price} />
              <Input value={form.campaign} onChange={(v) => setForm({ ...form, campaign: v })} placeholder={t.source + " campaign"} />
              <Input value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Note" />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
                <Button onClick={save}>{t.save}</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </ProtectedPage>
  );
}
