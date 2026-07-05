import ImageKit from "imagekit";

let instance: ImageKit | null = null;

/** Lazy init — jangan crash saat build kalau env belum ada. */
export function getImageKit(): ImageKit {
  if (instance) return instance;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit env belum lengkap (lihat .env.example)");
  }
  instance = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return instance;
}

export const IMAGEKIT_FOLDER = "/mosh-madness/products";

/**
 * Tambah transformation params ke URL ImageKit untuk delivery optimal.
 * Aman dipanggil dengan URL non-ImageKit (placeholder) — dikembalikan apa adanya.
 */
export function ikTransform(url: string, width: number): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "ik.imagekit.io";
  if (!url.includes("ik.imagekit.io") && !url.includes(endpoint)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=w-${width},q-80,f-auto`;
}
