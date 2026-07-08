import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BRAND, NAV_LINKS, SOCIAL } from "@/lib/constants";

/**
 * Footer global — surface-lowest, border grid 1px, kontak WA/IG dari
 * lib/constants.ts (PLAN Phase 3). Server component, tanpa animasi.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-outline-variant bg-surface-lowest">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-6">
            <p className="type-headline-lg type-metal text-primary">{BRAND.name}</p>
            <p className="type-body-lg mt-4 max-w-sm text-on-surface-variant">
              Streetwear dari {BRAND.location}. Kegelapan sebagai bentuk seni.
            </p>
            <p className="type-label mt-6 text-outline">
              {BRAND.sku} — {BRAND.estCode}
            </p>
          </div>

          {/* Sitemap */}
          <nav aria-label="Footer" className="md:col-span-3">
            <p className="type-meta mb-4 text-outline">Index</p>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="type-meta hover-invert -mx-2 inline-block px-2 py-1 text-on-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak */}
          <div className="md:col-span-3">
            <p className="type-meta mb-4 text-outline">Kontak</p>
            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href={SOCIAL.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-meta hover-invert -mx-2 inline-flex items-center gap-1 px-2 py-1 text-on-surface"
                >
                  WhatsApp <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-meta hover-invert -mx-2 inline-flex items-center gap-1 px-2 py-1 text-on-surface"
                >
                  Instagram <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="mt-16 flex flex-col gap-2 border-t border-outline-variant pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-meta text-outline">
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="type-label text-accent-666">666</p>
        </div>
      </div>
    </footer>
  );
}
