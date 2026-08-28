"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Select, Badge } from "@/components/ui";
import { Wallet, FileDown, FileSpreadsheet } from "lucide-react";
import { BarChart, PieChart, XAxis, YAxis, Tooltip, Bar, Pie } from "recharts";

export default function FinancePage() {
  const { t, data } = useApp();

  const totals = useMemo(() => {
    const income = data.journal.filter((j) => j.type === "income").reduce((s, j) => s + j.amount, 0);
    const expense = data.journal.filter((j) => j.type === "expense").reduce((s, j) => s + j.amount, 0);
    return { income, expense, net: income - expense };
  }, [data]);

  const bySource = useMemo(() => {
    const m: Record<string, number> = {};
    data.journal.filter((j) => j.type === "income").forEach((j) => { m[j.source] = (m[j.source] || 0) + j.amount; });
    return Object.entries(m).map(([k, v]) => ({ name: k.replace("auto-job:", ""), value: v }));
  }, [data]);

  const trend = useMemo(() => {
    const m: Record<string, { income: number; expense: number }> = {};
    data.journal.forEach((j) => {
      const k = j.date.slice(0, 7);
      m[k] = m[k] || { income: 0, expense: 0 };
      m[k][j.type] += j.amount;
    });
    return Object.entries(m).map(([k, v]) => ({ month: k, income: v.income, expense: v.expense }));
  }, [data]);

  function exportCsv() {
    const rows = [["date", "type", "amount", "category", "source", "note"], ...data.journal.map((j) => [j.date, j.type, j.amount, j.category, j.source, j.note])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "servora-finance.csv";
    a.click();
  }

  function exportPdf() {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `<h2>${t.finance} — ${data.businessName}</h2>
      <p>${t.income}: Rp${totals.income.toLocaleString()} | ${t.expense}: Rp${totals.expense.toLocaleString()} | ${t.net}: Rp${totals.net.toLocaleString()}</p>
      <table border="1" cellpadding="4" cellspacing="0"><tr><th>${t.date}</th><th>${t.category}</th><th>Type</th><th>${t.price}</th><th>${t.source}</th></tr>
      ${data.journal.slice().sort((a, b) => a.date < b.date ? 1 : -1).map((j) => `<tr><td>${j.date}</td><td>${j.category}</td><td>${j.type}</td><td>Rp${j.amount.toLocaleString()}</td><td>${j.source}</td></tr>`).join("")}
      </table>`;
    w.document.write(html);
    w.document.close();
    w.print();
  }

  return (
    <ProtectedPage>
      <CardHeader title={t.finance} action={<div className="flex gap-2"><Button variant="outline" onClick={exportPdf}><FileDown size={14} /> {t.exportPdf}</Button><Button variant="outline" onClick={exportCsv}><FileSpreadsheet size={14} /> {t.exportExcel}</Button></div>} />
      <div className="p-4 grid grid-cols-3 gap-3">
        <Card><CardBody><div className="text-xs opacity-60">{t.income}</div><div className="text-lg font-semibold text-emerald-600">Rp{totals.income.toLocaleString()}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs opacity-60">{t.expense}</div><div className="text-lg font-semibold text-red-500">Rp{totals.expense.toLocaleString()}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs opacity-60">{t.net}</div><div className="text-lg font-semibold">Rp{totals.net.toLocaleString()}</div></CardBody></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card><CardBody><h3 className="text-sm font-medium mb-2">{t.spendTrend}</h3><BarChart width={420} height={200} data={trend}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="income" fill="#10b981" /><Bar dataKey="expense" fill="#ef4444" /></BarChart></CardBody></Card>
        <Card><CardBody><h3 className="text-sm font-medium mb-2">{t.bookingsBySource}</h3><PieChart width={420} height={200} data={bySource}><Pie data={bySource} dataKey="value" nameKey="name" outerRadius={80} fill="#0ea5e9" /><Tooltip /></PieChart></CardBody></Card>
      </div>
      <Card className="mt-4"><CardBody>
        <table className="w-full text-sm">
          <thead><tr className="text-left opacity-60"><th className="p-1">{t.date}</th><th className="p-1">{t.category}</th><th className="p-1">{t.status}</th><th className="p-1">{t.price}</th><th className="p-1">{t.source}</th></tr></thead>
          <tbody>
            {data.journal.slice().sort((a, b) => a.date < b.date ? 1 : -1).map((j) => (
              <tr key={j.id} className="border-t"><td className="p-1">{j.date}</td><td className="p-1">{j.category}</td><td className="p-1"><Badge>{j.type}</Badge></td><td className="p-1">Rp{j.amount.toLocaleString()}</td><td className="p-1">{j.source}</td></tr>
            ))}
            {data.journal.length === 0 && <tr><td colSpan={5} className="p-2 opacity-60">{t.noData}</td></tr>}
          </tbody>
        </table>
      </CardBody></Card>
    </ProtectedPage>
  );
}
