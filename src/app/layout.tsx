import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Servora — Local Services Marketplace OS",
  description:
    "Local Services Marketplace OS for home-service businesses: public catalog, booking, technician routing, WhatsApp confirmations, finance auto-journal.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AnalyticsProvider>
          <AppProvider>{children}</AppProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
