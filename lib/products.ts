import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AdminProductDTO, ProductDetailDTO, ProductDTO } from "@/types/api";

/** Max produk di ZoomParallax — dijaga server, jangan percaya client. */
export const PARALLAX_MAX = 7;

const primaryImageInclude = {
  images: {
    orderBy: [{ isPrimary: "desc" }, { sort: "asc" }],
    take: 1,
    include: { media: { select: { url: true, alt: true } } },
  },
} satisfies Prisma.ProductInclude;

type ProductWithPrimary = Prisma.ProductGetPayload<{
  include: typeof primaryImageInclude;
}>;

function toProductDTO(p: ProductWithPrimary): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    subtitle: p.description || null,
    price: p.price,
    compareAt: p.compareAt,
    imageUrl: p.images[0]?.media.url ?? "",
  };
}

/**
 * Produk PUBLISHED untuk konsumsi publik. Produk tanpa foto tidak ikut —
 * web ini image-centric, kartu kosong lebih buruk daripada tidak tampil.
 */
export async function getPublishedProducts(opts?: {
  home?: boolean;
  parallax?: boolean;
  category?: string;
}): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      images: { some: {} },
      ...(opts?.home ? { showInHome: true } : {}),
      ...(opts?.parallax ? { showInParallax: true } : {}),
      ...(opts?.category ? { category: opts.category } : {}),
    },
    orderBy: { createdAt: "asc" },
    ...(opts?.parallax ? { take: PARALLAX_MAX } : {}),
    include: primaryImageInclude,
  });
  return products.map(toProductDTO);
}

// ---------- Admin ----------

/** Include standar admin: semua image + media, urut primary dulu. */
export const adminProductInclude = {
  images: {
    orderBy: [{ isPrimary: "desc" }, { sort: "asc" }],
    include: { media: { select: { url: true, alt: true } } },
  },
} satisfies Prisma.ProductInclude;

type AdminProduct = Prisma.ProductGetPayload<{
  include: typeof adminProductInclude;
}>;

export function toAdminProductDTO(p: AdminProduct): AdminProductDTO {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compareAt: p.compareAt,
    category: p.category,
    status: p.status,
    showInHome: p.showInHome,
    showInParallax: p.showInParallax,
    images: p.images.map((img) => ({
      id: img.id,
      mediaId: img.mediaId,
      url: img.media.url,
      alt: img.media.alt,
      isPrimary: img.isPrimary,
      sort: img.sort,
    })),
  };
}

/** Detail produk by slug — semua varian foto, untuk /product & galeri penuh. */
export async function getProductDetail(slug: string): Promise<ProductDetailDTO | null> {
  const p = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sort: "asc" }],
        include: { media: { select: { url: true, alt: true } } },
      },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    subtitle: p.description || null,
    price: p.price,
    compareAt: p.compareAt,
    category: p.category,
    imageUrl: p.images[0]?.media.url ?? "",
    images: p.images.map((img) => ({
      id: img.id,
      url: img.media.url,
      alt: img.media.alt,
      isPrimary: img.isPrimary,
      sort: img.sort,
    })),
  };
}
