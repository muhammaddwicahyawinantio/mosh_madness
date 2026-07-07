"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS, SOCIAL } from "@/lib/constants";
import {
  duration,
  easeSharp,
  revealStagger,
  revealUp,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Navbar global — REVISI: POLOS/tanpa background di semua state (tidak
 * lagi berubah jadi solid saat scroll). Cuma scrim gradasi tipis di tepi
 * atas biar teks tetap kebaca di atas konten terang (aksesibilitas), bukan
 * bar solid. Logo display italic center — di mobile dikecilkan + di-track
 * renggang + nowrap biar TIDAK menumpuk dengan burger/Catalog di sampingnya.
 * Links mono kiri, trigger CATALOG kanan. Mobile: overlay fullscreen.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Scroll lock saat overlay kebuka
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Scrim gradasi tipis — bukan background bar; menjaga keterbacaan
            teks nav di atas area terang tanpa bikin navbar keliatan solid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface-lowest/55 via-surface-lowest/15 to-transparent"
        />
        <nav
          aria-label="Utama"
          className="relative mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 md:px-8"
        >
          {/* Kiri: links desktop / burger mobile */}
          <div className="flex items-center gap-1 justify-self-start">
            <button
              type="button"
              className="hover-invert -ml-2 p-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <ul className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "type-label hover-invert block px-3 py-2",
                      pathname === link.href
                        ? "text-primary"
                        : "text-on-surface-variant",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: logo — kecil + renggang + nowrap di mobile, membesar di md */}
          <Link
            href="/"
            className="justify-self-center whitespace-nowrap font-[family-name:var(--font-display)] text-lg uppercase italic leading-none tracking-[0.2em] text-primary md:text-[2rem] md:tracking-[0.06em]"
            aria-label={`${BRAND.name} — beranda`}
          >
            {BRAND.name}
          </Link>

          {/* Kanan: trigger CATALOG */}
          <Link
            href="/product"
            className="type-label hover-invert group flex items-center gap-1 justify-self-end px-3 py-2 text-primary"
          >
            <span className="hidden sm:inline">Catalog</span>
            <span className="sm:hidden">666</span>
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ transitionDuration: `${duration.fast}s` }}
            />
          </Link>
        </nav>
      </header>

      {/* Overlay menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-surface-lowest px-4 pb-10 pt-24 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease: easeSharp }}
          >
            <motion.ul
              variants={revealStagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col border-t border-outline-variant"
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={revealUp}
                  className="border-b border-outline-variant"
                >
                  <Link
                    href={link.href}
                    className="type-headline-lg hover-invert block px-2 py-4 text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex items-end justify-between">
              <p className="type-label text-on-surface-variant">
                {BRAND.sku}
                <br />
                {BRAND.estCode}
              </p>
              <div className="flex gap-4">
                <a
                  href={SOCIAL.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-label hover-invert px-2 py-1 text-primary"
                >
                  WhatsApp
                </a>
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-label hover-invert px-2 py-1 text-primary"
                >
                  Instagram
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
