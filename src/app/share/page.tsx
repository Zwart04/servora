"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Input } from "@/components/ui";
import { Share2, Link2, Check } from "lucide-react";

export default function SharePage() {
  const { t, data, setData } = useApp();
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/s/${data.publicSlug}` : `/s/${data.publicSlug}`;

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  return (
    <ProtectedPage>
      <CardHeader title={t.share} />
      <div className="p-4 space-y-4">
        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm opacity-70">{t.publicPage} — {t.viewPublic}</p>
            <div className="flex items-center gap-2">
              <Input value={url} onChange={() => {}} className="flex-1" readOnly />
              <Button onClick={copy}>{copied ? <Check size={14} /> : <Link2 size={14} />} {copied ? "OK" : t.share}</Button>
            </div>
            <Button variant="outline" onClick={() => window.open(url, "_blank")}>{t.viewPublic}</Button>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <label className="text-sm flex items-center gap-2">{t.publicPage} slug</label>
            <Input value={data.publicSlug} onChange={(v) => setData((d) => ({ ...d, publicSlug: v.replace(/\s/g, "-").toLowerCase() }))} className="mt-2" />
          </CardBody>
        </Card>
      </div>
    </ProtectedPage>
  );
}
