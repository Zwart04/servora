# Servora — Feature Specification

Local Services Marketplace OS for home-service businesses (cleaning, AC repair, salon, massage, pest control). A truly useful, complex app (not a simple CRUD) with 8 core feature areas.

## Core Features (8)

1. **Public Service Catalog (`/s/[slug]`)** — public, shareable, no-login catalog with gradient hero, listed services (category, duration, price), bilingual EN/ID. Visitors fill a booking form that opens a WhatsApp deep-link to the business. Tracks `PublicCatalogView` + `BookingRequested` events.

2. **Online Booking Flow** — create/edit bookings with customer, phone, service, date, time slot, zone, technician, status, amount, source, campaign. Status lifecycle: pending → scheduled → enroute → inprogress → done. Marking a booking done auto-posts a finance journal income entry (source: `auto-job:<source>`).

3. **Technician Assignment & Route Board** — technician directory (name, zone, rating). Route board groups active jobs per technician, sorted by time slot, for optimized daily routing by zone.

4. **Auto Invoice / Confirmation via WAHA** — WAHA tab: configure `NEXT_PUBLIC_WAHA_URL`, start session, show connection status (connected / qr / disconnected), send templated WhatsApp messages via `POST /api/sendText`. Deep-link `wa.me` fallback when WAHA offline. Send history persisted.

5. **Auto-Journal Finance** — unified ledger. Income auto from done bookings (`auto-job`), manual entries supported. Income/expense, source tagging, PDF export (print) + Excel/CSV export. Recharts trend (income vs expense) + by-source breakdown.

6. **Reviews / Testimonials Page** — public reviews shown on catalog; avg rating on dashboard. Seed reviews + rating per service.

7. **Source & Campaign Attribution (Analytics)** — every booking has `source` (meta/google/tiktok/direct) + `campaign`. Analytics page: bookings by source (pie), by campaign (bar), AOV, conversion rate. Powered by Meta Pixel + GA4 events.

8. **Meta Pixel + Google Ads Tracking** — `AnalyticsProvider` injects `fbq` (NEXT_PUBLIC_META_PIXEL_ID) + `gtag` (NEXT_PUBLIC_GOOGLE_ADS_ID) in root layout. Tracks PageView + custom events (BookingSaved, WahaSendMessage, PublicCatalogView, BookingRequested).

## Cross-Cutting

- **Bilingual EN/ID** — full `t.*` dictionary, header toggle + public page toggle.
- **Professional Auth** — local-first login/register (localStorage `servora_users`/`servora_user`), email/password validation, logout.
- **Light/Dark mode** — theme persistence.
- **Recharts dashboards** — spend trend (bar), bookings by source (pie), service breakdown (bar).
- **Responsive SaaS layout** — sidebar nav, no emoji, lucide icons.

## WAHA Integration Spec

- Endpoint: `NEXT_PUBLIC_WAHA_URL` (default `http://localhost:3000`).
- Flow: Settings/WAHA tab → Start session → status `qr` (scan at `/dashboard`) → `connected`.
- Send: `POST {wahaUrl}/api/sendText` with `{chatId: phone@c.us, text}`.
- Fallback: `wa.me/{phone}?text={encoded}` deep link when session disconnected.

## Pixel / GA Spec

- `NEXT_PUBLIC_META_PIXEL_ID` → `fbq('init')` + `fbq('track','PageView')` + custom events.
- `NEXT_PUBLIC_GOOGLE_ADS_ID` → `gtag('config', ID)` + `gtag('event', ...)`.

## Finance Auto-Journal Spec

- Source tagging: `auto-job:<source>` on done bookings; manual entries free-form.
- PDF export via `window.print()`; Excel/CSV via Blob download.
