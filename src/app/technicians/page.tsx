"use client";

import { useState } from "react";
import { useApp, Technician } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Input, Select, Badge } from "@/components/ui";
import { Plus, Users, Star, Search, Pencil, Trash2 } from "lucide-react";

export default function TechniciansPage() {
  const { t, data, setData } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Technician | null>(null);
  const [form, setForm] = useState({ name: "", zone: "", rating: "4.5", active: true });

  const list = data.technicians.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));

  function openAdd() { setEdit(null); setForm({ name: "", zone: "", rating: "4.5", active: true }); setOpen(true); }
  function openEdit(x: Technician) { setEdit(x); setForm({ name: x.name, zone: x.zone, rating: String(x.rating), active: x.active }); setOpen(true); }

  function save() {
    if (!form.name.trim()) return;
    const payload: Technician = { id: edit?.id || "t" + Date.now(), name: form.name.trim(), zone: form.zone.trim(), rating: Number(form.rating) || 0, active: form.active };
    setData((d) => {
      const exists = d.technicians.some((x) => x.id === payload.id);
      return { ...d, technicians: exists ? d.technicians.map((x) => (x.id === payload.id ? payload : x)) : [...d.technicians, payload] };
    });
    setOpen(false);
  }
  function remove(id: string) { setData((d) => ({ ...d, technicians: d.technicians.filter((x) => x.id !== id) })); }

  return (
    <ProtectedPage>
      <CardHeader title={t.technicians} action={<div className="flex gap-2"><Input value={q} onChange={setQ} placeholder={t.search} className="w-40" /><Button onClick={openAdd}><Plus size={14} /> {t.add}</Button></div>} />
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((x) => (
          <Card key={x.id}>
            <CardBody>
              <div className="flex items-center gap-2 mb-1"><Users size={16} className="text-sky-500" /><span className="font-medium">{x.name}</span>{!x.active && <Badge>off</Badge>}</div>
              <div className="text-sm opacity-70">{t.zone}: {x.zone}</div>
              <div className="text-sm flex items-center gap-1 mt-1"><Star size={14} className="text-amber-500" /> {x.rating}</div>
              <div className="flex gap-2 mt-3"><Button variant="outline" onClick={() => openEdit(x)}><Pencil size={14} /> {t.edit}</Button><Button variant="danger" onClick={() => remove(x.id)}><Trash2 size={14} /> {t.delete}</Button></div>
            </CardBody>
          </Card>
        ))}
        {list.length === 0 && <p className="text-sm opacity-60">{t.noData}</p>}
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <Card className="w-full max-w-sm"><CardBody className="space-y-3">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder={t.name} />
            <Input value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} placeholder={t.zone} />
            <Input type="number" step="0.1" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} placeholder={t.rating} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> {t.status}</label>
            <div className="flex gap-2 justify-end"><Button variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button><Button onClick={save}>{t.save}</Button></div>
          </CardBody></Card>
        </div>
      )}
    </ProtectedPage>
  );
}
