import type { Metadata } from "next";
import localFont from "next/font/local";
import { BRAND } from "@/lib/constants";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { TrackVisit } from "@/components/shared/TrackVisit";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import "./globals.css";

/* Self-hosted — brand fonts (FONT.md). Build tidak tergantung font eksternal. */

/* "Voice" brand — blackletter/gothic, khusus headline besar */
const deathStinger = localFont({
  src: "./fonts/death-stinger.otf",
  variable: "--font-death-stinger",
  weight: "400",
  display: "swap",
});

/* Semua sisanya — body, label teknis, price (distressed blackletter) */
const holdMoney = localFont({
  src: "./fonts/hold-money-regular.ttf",
  variable: "--font-hold-money",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Streetwear, ${BRAND.location.split(",")[0]}`,
    template: `%s — ${BRAND.name}`,
  },
  description:
    "Mosh Madness. Streetwear dari Banjarmasin. Kegelapan sebagai bentuk seni — est. 16.05.24.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`dark ${deathStinger.variable} ${holdMoney.variable} h-full`}
    >
      <body className="grain flex min-h-full flex-col">
        <SmoothScrollProvider>
          <TrackVisit />
          <SiteChrome>{children}</SiteChrome>
        </SmoothScrollProvider>
        <SmoothCursor />
      </body>
    </html>
  );
}
