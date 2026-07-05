"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS, SOCIAL } from "@/lib/constants";
import {
  duration,
  easeSharp,
  revealStagger,
  revealUp,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 48;

/**
 * Navbar global — transparan di atas hero, solid #131313 setelah scroll
 * (DESIGN.md §8). Logo Bebas italic center, links mono kiri, trigger
 * CATALOG kanan. Mobile: overlay fullscreen.
 */
export function Navbar() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > SCROLL_THRESHOLD);
  });

  // Scroll lock saat overlay kebuka
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b",
          solid ? "border-outline-variant" : "border-transparent",
        )}
        initial={false}
        animate={{
          backgroundColor: solid ? "rgba(19, 19, 19, 1)" : "rgba(19, 19, 19, 0)",
        }}
        transition={{ duration: duration.fast, ease: easeSharp }}
      >
        <nav
          aria-label="Utama"
          className="mx-auto grid h-16 max-w-[1600px] grid-cols-3 items-center px-4 md:px-8"
        >
          {/* Kiri: links desktop / burger mobile */}
          <div className="flex items-center gap-1">
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

          {/* Center: logo */}
          <Link
            href="/"
            className="type-headline-md justify-self-center italic text-primary"
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
      </motion.header>

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
