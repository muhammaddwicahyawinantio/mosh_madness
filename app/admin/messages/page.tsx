import type { Metadata } from "next";
import { MessagesClient } from "@/components/admin/MessagesClient";

export const metadata: Metadata = { title: "Pesan" };

export default function AdminMessagesPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Pesan</h1>
      <MessagesClient />
    </main>
  );
}
