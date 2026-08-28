"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui";
import { BarChart3 } from "lucide-react";
import { BarChart, PieChart, XAxis, YAxis, Tooltip, Bar, Pie, Cell } from "recharts";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const { t, data } = useApp();

  const bySource = useMemo(() => {
    const m: Record<string, number> = {};
    data.bookings.forEach((b) => { m[b.source] = (m[b.source] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ name: k, value: v }));
  }, [data]);

  const byCampaign = useMemo(() => {
    const m: Record<string, number> = {};
    data.bookings.forEach((b) => { const c = b.campaign || "(none)"; m[c] = (m[c] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ campaign: k, bookings: v }));
  }, [data]);

  const aov = useMemo(() => {
    const done = data.bookings.filter((b) => b.status === "done");
    return done.length ? Math.round(done.reduce((s, b) => s + b.amount, 0) / done.length) : 0;
  }, [data]);

  const conversion = data.bookings.length ? Math.round((data.bookings.filter((b) => b.status === "done").length / data.bookings.length) * 100) : 0;

  return (
    <ProtectedPage>
      <CardHeader title={t.analytics} />
      <div className="p-4 grid grid-cols-3 gap-3">
        <Card><CardBody><div className="text-xs opacity-60">{t.bookingsBySource}</div><div className="text-lg font-semibold">{data.bookings.length}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs opacity-60">AOV</div><div className="text-lg font-semibold">Rp{aov.toLocaleString()}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs opacity-60">Conversion</div><div className="text-lg font-semibold">{conversion}%</div></CardBody></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card><CardBody><h3 className="text-sm font-medium mb-2">{t.bookingsBySource}</h3><PieChart width={420} height={220} data={bySource}><Pie data={bySource} dataKey="value" nameKey="name" outerRadius={80} label>{bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></CardBody></Card>
        <Card><CardBody><h3 className="text-sm font-medium mb-2">Bookings by campaign</h3><BarChart width={420} height={220} data={byCampaign}><XAxis dataKey="campaign" /><YAxis /><Tooltip /><Bar dataKey="bookings" fill="#6366f1" /></BarChart></CardBody></Card>
      </div>
    </ProtectedPage>
  );
}
