"use client";

import { useState } from "react";
import { useApp, Service } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Input, Select, Badge } from "@/components/ui";
import { Plus, Scissors, Search, Pencil, Trash2 } from "lucide-react";

export default function ServicesPage() {
  const { t, data, setData } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", category: "Cleaning", price: "0", durationMin: "60", active: true });

  const list = data.services.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  function openAdd() { setEdit(null); setForm({ name: "", category: "Cleaning", price: "0", durationMin: "60", active: true }); setOpen(true); }
  function openEdit(s: Service) { setEdit(s); setForm({ name: s.name, category: s.category, price: String(s.price), durationMin: String(s.durationMin), active: s.active }); setOpen(true); }

  function save() {
    if (!form.name.trim()) return;
    const payload: Service = {
      id: edit?.id || "s" + Date.now(),
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price) || 0,
      durationMin: Number(form.durationMin) || 0,
      active: form.active,
    };
    setData((d) => {
      const exists = d.services.some((s) => s.id === payload.id);
      return {
        ...d,
        services: exists ? d.services.map((s) => (s.id === payload.id ? payload : s)) : [...d.services, payload],
      };
    });
    setOpen(false);
  }

  function remove(id: string) {
    setData((d) => ({ ...d, services: d.services.filter((s) => s.id !== id) }));
  }

  return (
    <ProtectedPage>
      <CardHeader
        title={t.services}
        action={<div className="flex gap-2"><Input value={q} onChange={setQ} placeholder={t.search} className="w-40" /><Button onClick={openAdd}><Plus size={14} /> {t.add}</Button></div>}
      />
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((s) => (
          <Card key={s.id}>
            <CardBody>
              <div className="flex items-center gap-2 mb-1">
                <Scissors size={16} className="text-sky-500" />
                <span className="font-medium">{s.name}</span>
                {!s.active && <Badge>off</Badge>}
              </div>
              <div className="text-sm opacity-70">{s.category} · {s.durationMin}m</div>
              <div className="mt-2 font-semibold">Rp{s.price.toLocaleString()}</div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" onClick={() => openEdit(s)}><Pencil size={14} /> {t.edit}</Button>
                <Button variant="danger" onClick={() => remove(s.id)}><Trash2 size={14} /> {t.delete}</Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {list.length === 0 && <p className="text-sm opacity-60">{t.noData}</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardBody className="space-y-3">
              <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder={t.name} />
              <Select value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={["Cleaning", "Repair", "Beauty", "Wellness", "Other"].map((c) => ({ value: c, label: c }))} />
              <Input type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder={t.price} />
              <Input type="number" value={form.durationMin} onChange={(v) => setForm({ ...form, durationMin: v })} placeholder="Duration (min)" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> {t.status}</label>
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
