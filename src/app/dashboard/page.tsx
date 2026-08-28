"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody } from "@/components/ui";
import { LayoutDashboard, CalendarPlus, Wrench, Wallet } from "lucide-react";
import { BarChart, PieChart, LineChart, XAxis, YAxis, Tooltip, Line, Pie, Bar } from "recharts";

export default function DashboardPage() {
  const { t, data } = useApp();
  const stats = useMemo(() => {
    const newB = data.bookings.filter((b) => b.status === "pending").length;
    const active = data.bookings.filter((b) => ["scheduled", "enroute", "inprogress"].includes(b.status)).length;
    const income = data.journal.filter((j) => j.type === "income").reduce((s, j) => s + j.amount, 0);
    return { newB, active, income };
  }, [data]);

  const bySource = useMemo(() => {
    const m: Record<string, number> = {};
    data.bookings.forEach((b) => { m[b.source] = (m[b.source] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ name: k, value: v }));
  }, [data]);

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    data.bookings.forEach((b) => {
      const s = data.services.find((x) => x.id === b.serviceId);
      const c = s?.category || "Other";
      m[c] = (m[c] || 0) + 1;
    });
    return Object.entries(m).map(([k, v]) => ({ name: k, bookings: v }));
  }, [data, data.services]);

  const trend = useMemo(() => {
    const m: Record<string, number> = {};
    data.journal.filter((j) => j.type === "income").forEach((j) => {
      const k = j.date.slice(0, 7);
      m[k] = (m[k] || 0) + j.amount;
    });
    return Object.entries(m).map(([k, v]) => ({ month: k, income: v }));
  }, [data]);

  return (
    <ProtectedPage>
      <h1 className="text-2xl font-bold mb-4">{t.dashboard}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={CalendarPlus} label={t.newBookings} value={stats.newB} />
        <Stat icon={Wrench} label={t.activeJobs} value={stats.active} />
        <Stat icon={Wallet} label={t.monthlyIncome} value={"Rp" + stats.income.toLocaleString()} />
        <Stat icon={LayoutDashboard} label={t.total} value={data.services.length + " " + t.services.toLowerCase()} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardBody>
            <h3 className="font-medium mb-2 text-sm">{t.spendTrend}</h3>
            <LineChart width={280} height={180} data={trend}>
              <XAxis dataKey="month" /><YAxis /><Tooltip /> <Line dataKey="income" stroke="#38bdf8" />
            </LineChart>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="font-medium mb-2 text-sm">{t.bookingsBySource}</h3>
            <PieChart width={280} height={180} data={bySource}>
              <Pie data={bySource} dataKey="value" nameKey="name" outerRadius={70} fill="#0ea5e9" />
              <Tooltip />
            </PieChart>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="font-medium mb-2 text-sm">{t.categoryBreakdown}</h3>
            <BarChart width={280} height={180} data={byCat}>
              <XAxis dataKey="name" /><YAxis /><Tooltip /> <Bar dataKey="bookings" fill="#6366f1" />
            </BarChart>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <h3 className="font-medium mb-2 text-sm">{t.recentActivity}</h3>
          <ul className="text-sm opacity-80 space-y-1">
            {data.journal.slice(0, 5).map((j) => (
              <li key={j.id}>{j.date} — {j.type === "income" ? t.income : t.expense}: Rp{j.amount.toLocaleString()} ({j.source})</li>
            ))}
            {data.journal.length === 0 && <li>{t.noData}</li>}
          </ul>
        </CardBody>
      </Card>
    </ProtectedPage>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <Icon size={20} className="text-sky-500" />
        <div>
          <div className="text-xs opacity-60">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </CardBody>
    </Card>
  );
}
