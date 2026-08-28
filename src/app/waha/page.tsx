"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Input, Badge } from "@/components/ui";
import { MessageCircle, Send, QrCode, Phone } from "lucide-react";
import { track } from "@/components/AnalyticsProvider";

export default function WahaPage() {
  const { t, data, setData } = useApp();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch(`${data.waha.url}/api/sessions/default`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setData((d) => ({ ...d, waha: { ...d.waha, status: j?.status === "WORKING" ? "connected" : "qr" } })))
      .catch(() => setData((d) => ({ ...d, waha: { ...d.waha, status: "disconnected" } })));
  }, []);

  function startSession() {
    setData((d) => ({ ...d, waha: { ...d.waha, status: "connecting" } }));
    fetch(`${data.waha.url}/api/sessions/default/start`, { method: "POST" })
      .then(() => setData((d) => ({ ...d, waha: { ...d.waha, status: "qr" } })))
      .catch(() => setData((d) => ({ ...d, waha: { ...d.waha, status: "disconnected" } })));
  }

  async function send() {
    if (!phone.trim() || !message.trim()) return;
    setStatusMsg("sending...");
    try {
      const res = await fetch(`${data.waha.url}/api/sendText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: `${phone.replace(/\D/g, "")}@c.us`, text: message }),
      });
      if (res.ok) {
        setData((d) => ({ ...d, waha: { ...d.waha, history: [{ phone, message, at: new Date().toISOString() }, ...d.waha.history].slice(0, 10) } }));
        track("WahaSendMessage", { length: message.length });
        setStatusMsg(t.sent);
        setMessage("");
      } else {
        setStatusMsg(`HTTP ${res.status} — wa.me fallback`); window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
      }
    } catch {
      setStatusMsg("wa.me fallback"); window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    }
  }

  const dot = data.waha.status === "connected" ? "bg-emerald-500" : data.waha.status === "connecting" ? "bg-amber-500" : "bg-red-500";

  return (
    <ProtectedPage>
      <CardHeader title={t.waha} action={<Badge><span className={`inline-block w-2 h-2 rounded-full ${dot} mr-1`} />{t[data.waha.status]}</Badge>} />
      <div className="p-4 grid md:grid-cols-2 gap-4">
        <Card>
          <CardBody className="space-y-3">
            <Input value={data.waha.url} onChange={(v) => setData((d) => ({ ...d, waha: { ...d.waha, url: v } }))} placeholder="WAHA URL" />
            {data.waha.status !== "connected" && <Button onClick={startSession}><QrCode size={14} /> {t.startSession}</Button>}
            {data.waha.status === "qr" && <p className="text-xs opacity-60">Scan QR at {data.waha.url}/dashboard</p>}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2"><Phone size={14} /> {t.sendText}</div>
              <Input value={phone} onChange={setPhone} placeholder={t.phone} />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message..." className="w-full border rounded px-3 py-2 text-sm mt-2 bg-white dark:bg-zinc-950" rows={3} />
              <Button onClick={send} className="mt-2"><Send size={14} /> {t.sendText}</Button>
              {statusMsg && <p className="text-xs opacity-70 mt-1">{statusMsg}</p>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="text-sm font-medium mb-2">{t.sent}</h3>
            <ul className="text-sm space-y-1 opacity-80">
              {data.waha.history.map((h, i) => <li key={i}>{h.phone}: {h.message.slice(0, 40)}…</li>)}
              {data.waha.history.length === 0 && <li>{t.noData}</li>}
            </ul>
          </CardBody>
        </Card>
      </div>
    </ProtectedPage>
  );
}
