"use client";

import { useApp } from "@/lib/store";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Card, CardBody, CardHeader, Button, Input, Select, Badge } from "@/components/ui";
import { Star, MessageSquareHeart } from "lucide-react";

export default function ReviewsPage() {
  const { t, data } = useApp();
  const avg = data.reviews.length ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1) : "—";
  return (
    <ProtectedPage>
      <CardHeader title={t.reviews} action={<Badge>{t.rating}: {avg}</Badge>} />
      <div className="p-4 grid sm:grid-cols-2 gap-3">
        {data.reviews.map((r) => {
          const svc = data.services.find((s) => s.id === r.serviceId);
          return (
            <Card key={r.id}>
              <CardBody>
                <div className="flex items-center gap-1 mb-1"><Star size={14} className="text-amber-500" /> {r.rating}/5</div>
                <p className="text-sm">"{r.text}"</p>
                <div className="text-xs opacity-60 mt-2">— {r.customer} · {svc?.name}</div>
              </CardBody>
            </Card>
          );
        })}
        {data.reviews.length === 0 && <p className="text-sm opacity-60"><MessageSquareHeart size={14} /> {t.noData}</p>}
      </div>
    </ProtectedPage>
  );
}
