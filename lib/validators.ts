import { z } from "zod";

// ---------- Product ----------

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  /** Kosongkan → di-generate server dari name */
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan tanda hubung")
    .max(140)
    .optional(),
  description: z.string().trim().max(2000).default(""),
  price: z.number().int().min(0).default(0),
  compareAt: z.number().int().min(0).nullish(),
  category: z.string().trim().max(80).nullish(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  showInHome: z.boolean().optional(),
  showInParallax: z.boolean().optional(),
});
export const productUpdateSchema = productCreateSchema.partial();

export const productImageCreateSchema = z.object({
  mediaId: z.string().min(1),
  isPrimary: z.boolean().optional().default(false),
  sort: z.number().int().optional().default(0),
});
export const productImageUpdateSchema = z.object({
  isPrimary: z.boolean().optional(),
  sort: z.number().int().optional(),
});

// ---------- Hero ----------

export const heroCreateSchema = z.object({
  variant: z.enum(["BLACK", "WHITE"]),
  mediaId: z.string().min(1),
  sort: z.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
});
export const heroUpdateSchema = heroCreateSchema.partial();

// ---------- Sponsor ----------

export const sponsorCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mediaId: z.string().min(1),
  link: z.string().trim().url().max(500).nullish(),
  sort: z.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
});
export const sponsorUpdateSchema = sponsorCreateSchema.partial();

// ---------- SiteContent ----------

export const contentUpdateSchema = z.object({
  value: z.string().max(5000),
});

/** Key konten: "hero.word", "about.writer", … */
export const contentKeySchema = z
  .string()
  .regex(/^[a-z0-9._-]{1,80}$/, "Key konten tidak valid");

// ---------- Media ----------

export const mediaUpdateSchema = z.object({
  alt: z.string().trim().max(300),
});

// ---------- Contact (form publik) ----------

export const contactCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(120, "Nama maksimal 120 karakter"),
  email: z
    .string()
    .trim()
    .min(5, "Isi email atau nomor WhatsApp yang bisa dibalas")
    .max(160, "Maksimal 160 karakter"),
  subject: z.string().trim().max(160, "Maksimal 160 karakter").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Pesan minimal 10 karakter — teriak yang jelas")
    .max(2000, "Pesan maksimal 2000 karakter"),
  /** Honeypot anti-bot — manusia tidak melihat/mengisi field ini */
  website: z.string().optional(),
});

export const messageUpdateSchema = z.object({
  handled: z.boolean(),
});

// ---------- Analytics (pertahankan) ----------

export const trackSchema = z.object({
  path: z.string().min(1).max(255),
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
