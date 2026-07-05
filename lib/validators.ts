import { z } from "zod";

export const productCreateSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).nullish(),
  price: z.number().int().min(0),
  imageUrl: z.string().url().max(500),
  imageFileId: z.string().max(120).nullish(),
  showOnHome: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export const productUpdateSchema = productCreateSchema.partial();

export const trackSchema = z.object({
  path: z.string().min(1).max(255),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
