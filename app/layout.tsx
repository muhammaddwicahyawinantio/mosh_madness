import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Bebas_Neue,
  Hanken_Grotesk,
  JetBrains_Mono,
  Metal_Mania,
} from "next/font/google";
import { BRAND } from "@/lib/constants";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { TrackVisit } from "@/components/shared/TrackVisit";
import "./globals.css";

/* Brand fonts (FONT.md). Death Stinger self-hosted; sisanya via next/font/google
   (auto self-hosted saat build — tetap tanpa <link> Google eksternal). */

/* "Voice" brand — blackletter/gothic, KHUSUS display hero-scale + logo navbar */
const deathStinger = localFont({
  src: "./fonts/death-stinger.otf",
  variable: "--font-death-stinger",
  weight: "400",
  display: "swap",
});

/* Headline "biasa" — judul section, footer brand, header admin */
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

/* Body & typewriter About — readable sans, natural case */
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

/* Utility/data — label teknis, counter, nav, price */
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/* Aksen — HANYA marquee + slogan (FONT.md aturan pemakaian) */
const metalMania = Metal_Mania({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-metal-mania",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Streetwear, ${BRAND.location.split(",")[0]}`,
    template: `%s — ${BRAND.name}`,
  },
  description:
    "Mosh Madness. Streetwear dari Banjarmasin. Kegelapan sebagai bentuk seni — est. 17.03.24.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`dark ${deathStinger.variable} ${bebasNeue.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} ${metalMania.variable} h-full`}
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
