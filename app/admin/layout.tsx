import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s — Admin ${BRAND.name}` },
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produk", href: "/admin/products" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  // Belum login (halaman /admin/login) → tanpa topbar
  if (!session?.user) return <>{children}</>;

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <header className="border-b border-outline-variant bg-surface-container">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <p className="type-headline-md italic text-primary">
              {BRAND.name}
              <span className="type-label ml-2 align-middle not-italic text-accent-666">
                Admin
              </span>
            </p>
            <nav aria-label="Admin" className="flex items-center gap-1">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="type-label px-3 py-2 text-on-surface-variant hover:bg-surface-highest hover:text-on-surface"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/"
                className="type-label px-3 py-2 text-on-surface-variant hover:bg-surface-highest hover:text-on-surface"
              >
                Lihat situs ↗
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <p className="type-label hidden text-outline sm:block">
              {session.user.email}
            </p>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm" className="type-label">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
