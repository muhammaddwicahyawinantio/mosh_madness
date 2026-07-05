import type { Metadata } from "next";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Dashboard</h1>
      <DashboardClient />
    </main>
  );
}
