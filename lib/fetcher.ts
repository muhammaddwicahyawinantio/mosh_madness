/** Fetcher JSON typed untuk SWR — throw kalau non-2xx supaya SWR masuk state error. */
export async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request gagal (${res.status}): ${url}`);
  }
  return res.json() as Promise<T>;
}
