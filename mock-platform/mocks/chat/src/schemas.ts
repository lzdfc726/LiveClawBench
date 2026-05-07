/**
 * Zod schemas for chat mock service API routes.
 */

import { z } from "zod";

export const StickerSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  category: z.enum(["recent", "favorite", "custom"]),
  storage_path: z.string(),
  mime_type: z.enum(["image/gif", "image/png", "image/jpeg"]),
  created_at: z.string(),
  sort_order: z.number(),
});

export const ListStickersQuerySchema = z.object({
  category: z.enum(["recent", "favorite", "custom"]).optional(),
});

export const ListStickersResponseSchema = z.object({
  stickers: z.array(StickerSchema),
});

export const StickerIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

