"use client";

import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Input, Button } from "@/components/ui";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { t, data, setData } = useApp();
  return (
    <ProtectedPage>
      <CardHeader title={t.settings} />
      <div className="p-4 space-y-3 max-w-md">
        <Card><CardBody className="space-y-2">
          <label className="text-sm">Business name / Nama bisnis</label>
          <Input value={data.businessName} onChange={(v) => setData((d) => ({ ...d, businessName: v }))} />
          <label className="text-sm pt-2 block">{t.publicPage} slug</label>
          <Input value={data.publicSlug} onChange={(v) => setData((d) => ({ ...d, publicSlug: v.replace(/\s/g, "-").toLowerCase() }))} />
          <label className="text-sm pt-2 block">WAHA URL</label>
          <Input value={data.waha.url} onChange={(v) => setData((d) => ({ ...d, waha: { ...d.waha, url: v } }))} />
        </CardBody></Card>
      </div>
    </ProtectedPage>
  );
}
