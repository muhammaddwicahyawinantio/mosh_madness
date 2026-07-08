"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };

/**
 * Menu admin versi mobile — hamburger + drawer collapsible. Hanya tampil di
 * bawah breakpoint md (di md+ nav horizontal layout.tsx yang dipakai, TIDAK
 * tersentuh). Target tap ≥ 44px, tutup saat item dipilih.
 */
export function AdminMobileMenu({ nav }: { nav: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        aria-label={open ? "Tutup menu admin" : "Buka menu admin"}
        className="hover-invert -ml-2 flex h-11 w-11 items-center justify-center text-on-surface"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <>
          {/* Klik luar menutup */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-40 cursor-default bg-surface-lowest/60"
          />
          <nav
            id="admin-mobile-nav"
            aria-label="Admin"
            className="absolute inset-x-0 top-14 z-50 flex flex-col border-b border-outline-variant bg-surface-container"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "type-meta border-t border-outline-variant px-4 py-3.5",
                  pathname === item.href
                    ? "bg-surface-highest text-on-surface"
                    : "text-on-surface-variant",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="type-meta border-t border-outline-variant px-4 py-3.5 text-on-surface-variant"
            >
              Lihat situs ↗
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
