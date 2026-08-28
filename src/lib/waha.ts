export const WAHA_URL =
  (process.env.NEXT_PUBLIC_WAHA_URL as string | undefined) || "http://localhost:3000";

export async function wahaStatus(): Promise<"connected" | "disconnected" | "qr"> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/default`, { cache: "no-store" });
    if (!res.ok) return "disconnected";
    const data = await res.json();
    if (data?.status === "WORKING") return "connected";
    return "qr";
  } catch {
    return "disconnected";
  }
}

export async function wahaSend(phone: string, message: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: `${phone.replace(/\D/g, "")}@c.us`, text: message }),
    });
    if (!res.ok) return { ok: false, error: `status ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
