import { z } from '@hono/zod-openapi'

export const VariantSchema = z.object({
    size: z.number(),
    color: z.string(),
    quantity: z.number().min(0),
    price: z.number().positive(),
    image_url: z.string().url().optional()
})

export const ShoeCreateSchema = z.object({
    name: z.string(),
    description: z.string(),
    base_price: z.number().positive(),
    brand_id: z.number().positive(),
    category_id: z.number().positive(),
    variants: z.record(VariantSchema),
})