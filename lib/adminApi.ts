import type { ApiError } from "@/types/api";

/** Fetch admin API — lempar Error dengan pesan dari server kalau non-2xx. */
export async function adminFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (json as ApiError | null)?.error ?? `Request gagal (${res.status})`;
    throw new Error(message);
  }
  return json as T;
}
