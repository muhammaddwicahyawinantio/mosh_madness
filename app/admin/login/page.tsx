import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="bg-blueprint flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm border border-outline-variant bg-surface-container p-8">
        <p className="type-label text-accent-666">{BRAND.sku} / Admin</p>
        <h1 className="type-headline-md mt-2 text-primary">{BRAND.name}</h1>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
