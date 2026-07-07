"use client";

import { usePathname } from "next/navigation";
import { IntroReveal } from "@/components/intro/IntroReveal";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

/**
 * Chrome brand (Navbar + Footer) disembunyikan di /admin —
 * admin itu tool fungsional, bukan panggung brand (DESIGN.md §5).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <IntroReveal />
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
