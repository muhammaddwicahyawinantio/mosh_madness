import type { Metadata } from "next";
import localFont from "next/font/local";
import { BRAND } from "@/lib/constants";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { TrackVisit } from "@/components/shared/TrackVisit";
import "./globals.css";

/* Self-hosted — brand fonts (FONT.md). Build tidak tergantung font eksternal. */

/* "Voice" brand — blackletter/gothic, khusus headline besar */
const deathStinger = localFont({
  src: "./fonts/death-stinger.otf",
  variable: "--font-death-stinger",
  weight: "400",
  display: "swap",
});

/* Semua sisanya — body, label teknis, price. Keputusan REFACTOR-07 (C):
   Creepster menggantikan Hold Money (yang lisensinya demo/personal-use).
   Self-hosted woff2, TANPA <link> Google Fonts — sesuai arsitektur font. */
const creepster = localFont({
  src: "./fonts/creepster-regular.woff2",
  variable: "--font-creepster",
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
      className={`dark ${deathStinger.variable} ${creepster.variable} h-full`}
    >
      <body className="grain flex min-h-full flex-col">
        <SmoothScrollProvider>
          <TrackVisit />
          <SiteChrome>{children}</SiteChrome>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
